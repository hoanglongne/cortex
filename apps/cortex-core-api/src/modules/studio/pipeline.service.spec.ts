import { ConfigService } from '@nestjs/config';
import { fakeDb } from './__testkit__/fake-db';
import { PipelineService } from './pipeline.service';
import type { StudioService } from './studio.service';

const RSS = `<rss><channel>
<item><title>Giới trẻ săn deal 10.10 vỡ ví</title><link>https://a</link></item>
<item><title>2027</title></item>
<item><title>Đã thấy hôm qua rồi nha</title></item>
</channel></rss>`;

describe('PipelineService', () => {
  const config = new ConfigService({});

  it('collects new, useful signals and records source errors', async () => {
    const { db, calls } = fakeDb((c) => {
      if (c.table === 'studio_sources' && c.op === 'select') {
        return {
          data: [
            {
              id: 'news_rss',
              kind: 'rss',
              enabled: true,
              weight: 0.6,
              config: { feeds: ['https://feed'] },
            },
            {
              id: 'yt',
              kind: 'youtube',
              enabled: true,
              weight: 0.8,
              config: {},
            },
            {
              id: 'manual',
              kind: 'manual',
              enabled: true,
              weight: 1,
              config: {},
            },
          ],
        };
      }
      if (c.table === 'studio_signals' && c.op === 'select')
        return { data: [{ phrase: 'Đã thấy hôm qua rồi nha' }] };
      return { data: [] };
    });
    const pipeline = new PipelineService({} as StudioService, config);
    pipeline.fetcher = () => Promise.resolve(RSS);

    const stats = await pipeline.collect(db);
    expect(stats.news_rss).toBe(1);
    expect(stats.yt).toBe('error: YOUTUBE_API_KEY is not set');
    expect(stats.manual).toBeUndefined();

    const insert = calls.find(
      (c) => c.table === 'studio_signals' && c.op === 'insert',
    )!;
    expect(insert.payload).toEqual([
      expect.objectContaining({
        source_id: 'news_rss',
        phrase: 'Giới trẻ săn deal 10.10 vỡ ví',
        url: 'https://a',
      }),
    ]);
    const sourceUpdates = calls.filter(
      (c) => c.table === 'studio_sources' && c.op === 'update',
    );
    expect(
      sourceUpdates.map(
        (c) => (c.payload as { last_error: string | null }).last_error,
      ),
    ).toEqual([null, 'YOUTUBE_API_KEY is not set']);
  });

  it('clusters unassigned signals into new trends, blocking banned topics', async () => {
    let trendId = 0;
    const { db, calls } = fakeDb((c) => {
      if (c.table === 'studio_signals') {
        return {
          data: [
            {
              id: 1,
              source_id: 'news_rss',
              phrase: 'săn deal 10.10 vỡ ví',
              metric: 0.8,
              seen_at: '2026-10-10T01:00:00Z',
            },
            {
              id: 2,
              source_id: 'g',
              phrase: 'chuyện chính trị nóng hổi',
              metric: 0.8,
              seen_at: '2026-10-10T02:00:00Z',
            },
          ],
        };
      }
      if (c.table === 'studio_trend_signals' && c.op === 'select')
        return { data: [] };
      if (c.table === 'studio_trends' && c.op === 'select') return { data: [] };
      if (c.table === 'studio_blocklist')
        return { data: [{ pattern: 'chính trị', kind: 'topic' }] };
      if (c.table === 'studio_trends' && c.op === 'insert')
        return { data: [{ id: `tr${++trendId}` }] };
      return { data: [] };
    });
    const stats = await new PipelineService(
      {} as StudioService,
      config,
    ).cluster(db);
    expect(stats).toMatchObject({ created: 2, signals: 2 });
    const inserted = calls
      .filter((c) => c.table === 'studio_trends' && c.op === 'insert')
      .map((c) => c.payload as { label: string; status: string });
    expect(inserted.map((t) => [t.label, t.status])).toEqual([
      ['săn deal 10.10 vỡ ví', 'new'],
      ['chuyện chính trị nóng hổi', 'blocked'],
    ]);
  });

  it('applies lifecycle decisions and republishes the live drop', async () => {
    const publishDrop = jest.fn().mockResolvedValue({});
    const { db, calls } = fakeDb((c) => {
      if (c.table === 'studio_cards' && c.op === 'select') {
        return {
          data: [
            {
              id: 't1',
              lifecycle: 'trend',
              flags: [],
              studio_card_metrics: {
                card_id: 't1',
                impressions: 400,
                shares: 20,
                reveals: 0,
                known: 0,
                unknown: 0,
                reports: 0,
                review_correct: 0,
                review_wrong: 0,
              },
              studio_drop_cards: [
                {
                  studio_drops: {
                    status: 'published',
                    expires_at: '2099-01-01T00:00:00Z',
                  },
                },
              ],
            },
            {
              id: 't2',
              lifecycle: 'trend',
              flags: [],
              studio_card_metrics: null,
              studio_drop_cards: [
                {
                  studio_drops: {
                    status: 'archived',
                    expires_at: '2000-01-01T00:00:00Z',
                  },
                },
              ],
            },
            {
              id: 't3',
              lifecycle: 'trend',
              flags: [],
              studio_card_metrics: null,
              studio_drop_cards: [],
            },
          ],
        };
      }
      if (c.table === 'studio_drops') return { data: [{ id: 'drop-live' }] };
      return { data: [] };
    });
    const stats = await new PipelineService(
      { publishDrop } as unknown as StudioService,
      config,
    ).lifecycle(db, null);
    expect(stats).toMatchObject({
      changed: 2,
      evergreen: 1,
      retired: 1,
      republished: 'drop-live',
    });
    const updates = calls
      .filter((c) => c.table === 'studio_cards' && c.op === 'update')
      .map((c) => c.payload as { lifecycle: string });
    expect(updates.map((u) => u.lifecycle)).toEqual(['evergreen', 'retired']);
    expect(publishDrop).toHaveBeenCalledWith(db, null, 'drop-live');
  });
});
