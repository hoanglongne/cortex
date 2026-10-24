import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  boostFor,
  decideLifecycle,
  feedbackBoosts,
  type CardMetrics,
} from './feedback';
import {
  parseGoogleTrends,
  parseRss,
  parseYoutube,
  type RawSignal,
} from './sources';
import { CAPTURE_PLACEHOLDER } from './capture';
import { QuotesService } from './quotes.service';
import { PassagesService } from './passages.service';
import { StudioService } from './studio.service';
import type { BlockRule, CardRow, Lifecycle, TrendRow } from './studio.types';
import {
  clusterSignals,
  hotness,
  isUsefulPhrase,
  LIVE_DAYS,
  type SignalLite,
} from './trends-engine';
import { normalize, validateDraft } from './validator';

type Db = SupabaseClient<any, any, any>;
type Res = { data: unknown; error: { message: string } | null };

export type JobName =
  | 'collect'
  | 'cluster'
  | 'score'
  | 'generate'
  | 'lifecycle'
  | 'quotes'
  | 'passages';
export const JOBS: JobName[] = [
  'collect',
  'cluster',
  'score',
  'generate',
  'lifecycle',
  'quotes',
  'passages',
];

const DAY_MS = 86_400_000;
const QUEUE_TOP_N = 15;

interface SourceRow {
  id: string;
  kind: 'google_trends' | 'rss' | 'youtube' | 'manual' | 'capture';
  label: string;
  enabled: boolean;
  weight: number;
  config: Record<string, unknown>;
}

function rows<T>(res: Res): T[] {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T[];
}

function check(res: { error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
}

export type Fetcher = (url: string) => Promise<string>;

const defaultFetcher: Fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LexicaStudio/1.0 (+trend collector)' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
};

/**
 * Phases 2–3 of the Studio pipeline (spec §5): collect → cluster → score →
 * generate, and the daily lifecycle pass. Each step can be run from Studio
 * (as the editor) or by the scheduler (service role).
 */
@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);
  fetcher: Fetcher = defaultFetcher;

  constructor(
    private readonly studio: StudioService,
    private readonly config: ConfigService,
    @Optional() private readonly quotes?: QuotesService,
    @Optional() private readonly passages?: PassagesService,
  ) {}

  /**
   * "Đọc": writes the next passages the 100-passage plan is missing
   * (docs/LEXICA_READING_PLAN.md), up to STUDIO_PASSAGES_PER_RUN (default 5),
   * within the daily generation cap. They wait in Studio for review.
   */
  private async runPassages(db: Db): Promise<Record<string, unknown>> {
    if (!this.passages) return { skipped: 'passages service missing' };
    const count = Number(this.config.get('STUDIO_PASSAGES_PER_RUN') ?? 5);
    const r = await this.passages.generateFromPlan(db, null, count);
    return {
      saved: r.saved,
      failed: r.results.length - r.saved,
      ...(r.stopped ? { stopped: r.stopped } : {}),
    };
  }

  async run(
    db: Db,
    job: JobName,
    userId: string | null,
  ): Promise<Record<string, unknown>> {
    // `generate` records one run per trend itself.
    if (job === 'generate') return this.autoGenerate(db, userId);

    const run = rows<{ id: number }>(
      await db
        .from('studio_job_runs')
        .insert({ job, created_by: userId })
        .select('id'),
    )[0];
    try {
      const stats =
        job === 'collect'
          ? await this.collect(db)
          : job === 'cluster'
            ? await this.cluster(db)
            : job === 'score'
              ? await this.score(db)
              : job === 'quotes'
                ? await this.runQuotes(db)
                : job === 'passages'
                  ? await this.runPassages(db)
                  : await this.lifecycle(db, userId);
      await db
        .from('studio_job_runs')
        .update({ finished_at: new Date().toISOString(), ok: true, stats })
        .eq('id', run?.id);
      return stats;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await db
        .from('studio_job_runs')
        .update({
          finished_at: new Date().toISOString(),
          ok: false,
          error: message,
        })
        .eq('id', run?.id);
      await this.alert(`Studio job "${job}" failed: ${message}`);
      throw err;
    }
  }

  /** "Ngoài đời": a few more corpus books, then a quote search pass. */
  private runQuotes(db: Db): Promise<Record<string, unknown>> {
    if (!this.quotes) throw new Error('QuotesService is not available');
    return this.quotes.nightly(db);
  }

  // ------------------------------------------------------------- collect

  private async fetchSource(source: SourceRow): Promise<RawSignal[]> {
    const cfg = source.config;
    switch (source.kind) {
      case 'google_trends':
        return parseGoogleTrends(
          await this.fetcher(
            typeof cfg.url === 'string'
              ? cfg.url
              : 'https://trends.google.com/trending/rss?geo=VN',
          ),
        );
      case 'rss': {
        const feeds = Array.isArray(cfg.feeds)
          ? cfg.feeds.filter((f): f is string => typeof f === 'string')
          : [];
        const results = await Promise.allSettled(
          feeds.map(async (f) => parseRss(await this.fetcher(f))),
        );
        const ok = results.flatMap((r) =>
          r.status === 'fulfilled' ? r.value : [],
        );
        const failed = results.find(
          (r): r is PromiseRejectedResult => r.status === 'rejected',
        );
        if (ok.length === 0 && failed) throw failed.reason;
        return ok;
      }
      case 'youtube': {
        const key = this.config.get<string>('YOUTUBE_API_KEY');
        if (!key) throw new Error('YOUTUBE_API_KEY is not set');
        const region =
          typeof cfg.regionCode === 'string' ? cfg.regionCode : 'VN';
        const max = typeof cfg.maxResults === 'number' ? cfg.maxResults : 50;
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&maxResults=${max}&key=${key}`;
        return parseYoutube(JSON.parse(await this.fetcher(url)) as unknown);
      }
      default:
        return [];
    }
  }

  async collect(db: Db): Promise<Record<string, unknown>> {
    const sources = rows<SourceRow>(
      await db.from('studio_sources').select('*').eq('enabled', true),
    ).filter((s) => s.kind !== 'manual' && s.kind !== 'capture');
    const since = new Date(Date.now() - DAY_MS).toISOString();
    const stats: Record<string, unknown> = {};

    for (const source of sources) {
      try {
        const recent = new Set(
          rows<{ phrase: string }>(
            await db
              .from('studio_signals')
              .select('phrase')
              .eq('source_id', source.id)
              .gte('seen_at', since),
          ).map((r) => normalize(r.phrase)),
        );
        const fresh: RawSignal[] = [];
        for (const s of await this.fetchSource(source)) {
          const key = normalize(s.phrase);
          if (!isUsefulPhrase(s.phrase) || recent.has(key)) continue;
          recent.add(key);
          fresh.push(s);
        }
        if (fresh.length) {
          check(
            await db.from('studio_signals').insert(
              fresh.map((s) => ({
                source_id: source.id,
                phrase: s.phrase,
                context: s.context ?? null,
                url: s.url ?? null,
                metric: s.metric,
              })),
            ),
          );
        }
        await db
          .from('studio_sources')
          .update({ last_run_at: new Date().toISOString(), last_error: null })
          .eq('id', source.id);
        stats[source.id] = fresh.length;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Collector ${source.id} failed: ${message}`);
        await db
          .from('studio_sources')
          .update({
            last_run_at: new Date().toISOString(),
            last_error: message.slice(0, 500),
          })
          .eq('id', source.id);
        stats[source.id] = `error: ${message}`;
      }
    }
    return stats;
  }

  // ------------------------------------------------------------- cluster

  async cluster(db: Db): Promise<Record<string, unknown>> {
    const since = new Date(Date.now() - 2 * DAY_MS).toISOString();
    const signals = rows<SignalLite>(
      await db
        .from('studio_signals')
        .select('id, source_id, phrase, metric, seen_at')
        .gte('seen_at', since)
        .eq('dismissed', false)
        .order('seen_at', { ascending: true })
        .limit(2000),
    ).filter((s) => s.phrase !== CAPTURE_PLACEHOLDER);
    if (signals.length === 0) return { attached: 0, created: 0 };

    const assigned = new Set(
      rows<{ signal_id: number }>(
        await db
          .from('studio_trend_signals')
          .select('signal_id')
          .in(
            'signal_id',
            signals.map((s) => s.id),
          ),
      ).map((r) => r.signal_id),
    );
    const pending = signals.filter((s) => !assigned.has(s.id));
    if (pending.length === 0) return { attached: 0, created: 0 };

    const liveSince = new Date(Date.now() - LIVE_DAYS * DAY_MS).toISOString();
    const live = rows<Pick<TrendRow, 'id' | 'label'>>(
      await db
        .from('studio_trends')
        .select('id, label')
        .gte('last_seen_at', liveSince),
    );
    const blocklist = rows<BlockRule>(
      await db.from('studio_blocklist').select('pattern, kind'),
    );
    const plan = clusterSignals(pending, live);
    const byId = new Map(pending.map((s) => [s.id, s]));
    const touched = new Set<string>();

    for (const group of plan.create) {
      const members = group.signalIds.map((id) => byId.get(id)!);
      // Reuse the draft blocklist check on the trend label itself.
      const report = validateDraft(
        { word: '', scenario: group.label },
        {
          lexicon: new Set(),
          blocklist,
          existingScenarios: new Set(),
          sameWordScenarios: [],
          recentWords: new Set(),
        },
      );
      const blocked = !report.rules.blocklist.pass;
      const created = rows<{ id: string }>(
        await db
          .from('studio_trends')
          .insert({
            label: group.label,
            source: members[0].source_id,
            status: blocked ? 'blocked' : 'new',
            first_seen_at: members[0].seen_at,
            last_seen_at: members[members.length - 1].seen_at,
          })
          .select('id'),
      )[0];
      if (!created) continue;
      plan.attach.push({ trendId: created.id, signalIds: group.signalIds });
    }

    for (const { trendId, signalIds } of plan.attach) {
      check(
        await db.from('studio_trend_signals').upsert(
          signalIds.map((signal_id) => ({ trend_id: trendId, signal_id })),
          { onConflict: 'trend_id,signal_id', ignoreDuplicates: true },
        ),
      );
      touched.add(trendId);
    }
    await this.refreshCounts(db, [...touched]);
    return {
      attached: plan.attach.length - plan.create.length,
      created: plan.create.length,
      signals: pending.length,
    };
  }

  private async refreshCounts(db: Db, trendIds: string[]) {
    for (const id of trendIds) {
      const sigs = rows<{
        studio_signals: { source_id: string; seen_at: string };
      }>(
        await db
          .from('studio_trend_signals')
          .select('studio_signals(source_id, seen_at)')
          .eq('trend_id', id),
      ).map((r) => r.studio_signals);
      if (sigs.length === 0) continue;
      const last = sigs.map((s) => s.seen_at).sort()[sigs.length - 1];
      check(
        await db
          .from('studio_trends')
          .update({
            signal_count: sigs.length,
            source_count: new Set(sigs.map((s) => s.source_id)).size,
            last_seen_at: last,
          })
          .eq('id', id),
      );
    }
  }

  // --------------------------------------------------------------- score

  private async loadBoosts(db: Db): Promise<Record<string, number>> {
    const since = new Date(Date.now() - 30 * DAY_MS).toISOString();
    const cards = rows<{ tags: string[]; studio_card_metrics: unknown }>(
      await db
        .from('studio_cards')
        .select('tags, studio_card_metrics(*)')
        .gte('created_at', since),
    );
    return feedbackBoosts(
      cards
        .map((c) => ({
          tags: c.tags,
          metrics: (Array.isArray(c.studio_card_metrics)
            ? c.studio_card_metrics[0]
            : c.studio_card_metrics) as CardMetrics | null,
        }))
        .filter((c): c is { tags: string[]; metrics: CardMetrics } =>
          Boolean(c.metrics),
        ),
    );
  }

  async score(db: Db): Promise<Record<string, unknown>> {
    const liveSince = new Date(Date.now() - LIVE_DAYS * DAY_MS).toISOString();
    const trends = rows<TrendRow & { first_seen_at: string }>(
      await db
        .from('studio_trends')
        .select('*')
        .in('status', ['new', 'queued'])
        .gte('last_seen_at', liveSince),
    );
    const weights = Object.fromEntries(
      rows<{ id: string; weight: number }>(
        await db.from('studio_sources').select('id, weight'),
      ).map((s) => [s.id, s.weight]),
    );
    const boosts = await this.loadBoosts(db);
    const now = Date.now();

    const scored: { id: string; status: string; hot: number }[] = [];
    for (const t of trends) {
      const signals = rows<{
        studio_signals: { source_id: string; metric: number; seen_at: string };
      }>(
        await db
          .from('studio_trend_signals')
          .select('studio_signals(source_id, metric, seen_at)')
          .eq('trend_id', t.id),
      ).map((r) => r.studio_signals);
      const hot = hotness({
        signals,
        firstSeenAt: t.first_seen_at,
        sourceWeights: weights,
        feedbackBoost: boostFor(t.tags, boosts),
        now,
      });
      scored.push({ id: t.id, status: t.status, hot });
      check(
        await db
          .from('studio_trends')
          .update({ hotness: Math.round(hot * 1000) / 1000 })
          .eq('id', t.id),
      );
    }

    const toQueue = scored
      .filter((s) => s.status === 'new' && s.hot > 0)
      .sort((a, b) => b.hot - a.hot)
      .slice(0, QUEUE_TOP_N)
      .map((s) => s.id);
    if (toQueue.length) {
      check(
        await db
          .from('studio_trends')
          .update({ status: 'queued' })
          .in('id', toQueue),
      );
    }
    return { scored: scored.length, queued: toQueue.length };
  }

  // ------------------------------------------------------------ generate

  async autoGenerate(
    db: Db,
    userId: string | null,
  ): Promise<Record<string, unknown>> {
    const perRun = Number(
      this.config.get('STUDIO_AUTO_GENERATE_PER_RUN') ?? 10,
    );
    const queued = rows<{ id: string; label: string }>(
      await db
        .from('studio_trends')
        .select('id, label')
        .eq('status', 'queued')
        .order('hotness', { ascending: false })
        .limit(perRun),
    );
    let created = 0;
    const errors: string[] = [];
    for (const t of queued) {
      try {
        created += (await this.studio.generateForTrend(db, userId, t.id))
          .created;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${t.label}: ${message}`);
        // Budget reached: stop instead of failing every remaining trend.
        if (message.includes('trần')) break;
      }
    }
    if (errors.length) await this.alert(`Studio generate: ${errors[0]}`);
    return { trends: queued.length, created, errors };
  }

  // ----------------------------------------------------------- lifecycle

  async lifecycle(
    db: Db,
    userId: string | null,
  ): Promise<Record<string, unknown>> {
    const cards = rows<
      CardRow & {
        flags: string[];
        studio_card_metrics: CardMetrics | CardMetrics[] | null;
        studio_drop_cards: {
          studio_drops: { status: string; expires_at: string | null } | null;
        }[];
      }
    >(
      await db
        .from('studio_cards')
        .select(
          'id, lifecycle, flags, studio_card_metrics(*), studio_drop_cards(studio_drops(status, expires_at))',
        ),
    );
    const now = Date.now();
    let changed = 0;
    const counts: Record<string, number> = {};

    for (const c of cards) {
      const drops = c.studio_drop_cards
        .map((d) => d.studio_drops)
        .filter((d): d is { status: string; expires_at: string | null } =>
          Boolean(d && d.status !== 'draft'),
        );
      const dropExpired =
        drops.length > 0 &&
        drops.every((d) => d.expires_at && Date.parse(d.expires_at) < now);
      const metrics = Array.isArray(c.studio_card_metrics)
        ? c.studio_card_metrics[0]
        : (c.studio_card_metrics ?? undefined);
      const decision = decideLifecycle(
        { id: c.id, lifecycle: c.lifecycle, flags: c.flags ?? [], dropExpired },
        metrics,
      );
      if (!decision) continue;
      const update: { lifecycle?: Lifecycle; flags?: string[] } = {};
      if (decision.lifecycle) {
        update.lifecycle = decision.lifecycle;
        counts[decision.lifecycle] = (counts[decision.lifecycle] ?? 0) + 1;
      }
      if (decision.addFlags.length) {
        update.flags = [...(c.flags ?? []), ...decision.addFlags];
        for (const f of decision.addFlags) counts[f] = (counts[f] ?? 0) + 1;
      }
      check(
        await db
          .from('studio_cards')
          .update({ ...update, updated_at: new Date().toISOString() })
          .eq('id', c.id),
      );
      changed++;
    }

    // Changes only reach learners through a publish: refresh the live drop.
    let republished: string | null = null;
    if (changed > 0) {
      const live = rows<{ id: string }>(
        await db
          .from('studio_drops')
          .select('id')
          .eq('status', 'published')
          .limit(1),
      )[0];
      if (live) {
        await this.studio.publishDrop(db, userId, live.id);
        republished = live.id;
      }
    }
    return { cards: cards.length, changed, ...counts, republished };
  }

  // ---------------------------------------------------------------- misc

  /** Optional Discord/Slack-compatible webhook (STUDIO_ALERT_WEBHOOK). */
  async alert(text: string): Promise<void> {
    const url = this.config.get<string>('STUDIO_ALERT_WEBHOOK');
    if (!url) return;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, text }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      this.logger.warn(`Alert webhook failed: ${String(err)}`);
    }
  }
}
