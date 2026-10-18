"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getBandHistory, getMyFeedbackSummary, type BandPoint } from "@/actions/stats";
import type { Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Label, Notice, Stat } from "@/components/ui/card";
import { BandRange, CRITERION_LABELS, CriterionRow } from "@/components/ui/band";
import { CharacterSays } from "@/components/ui/character";
import { useCharacterEnabled } from "@/lib/client/theme";
import { CRITERIA, type Criterion } from "@/lib/feedback";
import { TabShell, type Tab } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

interface ProgressScreenProps {
  profile: Profile | null;
  onTab: (tab: Tab) => void;
  onOpenLeaderboard: () => void;
}

type FeedbackSummary = NonNullable<Awaited<ReturnType<typeof getMyFeedbackSummary>>["summary"]>;

interface Milestone {
  id: string;
  title: string;
  target: number;
  unit: string;
  value: (p: Profile) => number;
}

const MILESTONES: Milestone[] = [
  { id: "first-session", title: "Buổi thi đầu tiên", target: 1, unit: "buổi", value: (p) => p.total_sessions },
  { id: "sessions-5", title: "5 buổi thi", target: 5, unit: "buổi", value: (p) => p.total_sessions },
  { id: "sessions-20", title: "20 buổi thi", target: 20, unit: "buổi", value: (p) => p.total_sessions },
  { id: "sessions-50", title: "50 buổi thi", target: 50, unit: "buổi", value: (p) => p.total_sessions },
  { id: "minutes-60", title: "Một giờ nói", target: 60, unit: "phút", value: (p) => p.total_minutes },
  { id: "minutes-300", title: "Năm giờ nói", target: 300, unit: "phút", value: (p) => p.total_minutes },
  { id: "minutes-1000", title: "1000 phút nói", target: 1000, unit: "phút", value: (p) => p.total_minutes },
  { id: "streak-3", title: "Chuỗi 3 ngày", target: 3, unit: "ngày", value: (p) => p.longest_streak },
  { id: "streak-7", title: "Chuỗi 7 ngày", target: 7, unit: "ngày", value: (p) => p.longest_streak },
  { id: "band-6", title: "Band 6.0", target: 6, unit: "band", value: (p) => p.current_band },
  { id: "band-7", title: "Band 7.0", target: 7, unit: "band", value: (p) => p.current_band },
];

type Series = "overall" | Criterion;

/** Band over time, drawn by hand: one line, the dots are real ratings. */
function BandChart({ points, series }: { points: BandPoint[]; series: Series }) {
  const data = points
    .map((p) => ({ t: new Date(p.date).getTime(), v: p[series] }))
    .filter((d): d is { t: number; v: number } => d.v !== null);
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">Chưa có điểm cho tiêu chí này.</p>;
  }

  const W = 600;
  const H = 220;
  const pad = { l: 28, r: 12, t: 12, b: 24 };
  const lo = Math.max(1, Math.floor(Math.min(...data.map((d) => d.v))) - 1);
  const hi = Math.min(9, Math.ceil(Math.max(...data.map((d) => d.v))) + 1);
  const t0 = data[0].t;
  const span = data[data.length - 1].t - t0;
  const x = (t: number) => (span === 0 ? (pad.l + W - pad.r) / 2 : pad.l + ((t - t0) / span) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.t).toFixed(1)} ${y(d.v).toFixed(1)}`).join(" ");
  const fmtDay = (t: number) => new Date(t).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
  const last = data[data.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Band theo thời gian, ${data.length} lượt chấm, mới nhất ${last.v.toFixed(1)}`}
    >
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-line" strokeWidth={1} />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="fill-subtle text-[11px] font-bold">
            {v}
          </text>
        </g>
      ))}
      {data.length > 1 && (
        <path d={path} fill="none" className="stroke-voice" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {data.map((d, i) => (
        <circle key={i} cx={x(d.t)} cy={y(d.v)} r={i === data.length - 1 ? 5 : 3.5} className="fill-voice stroke-surface" strokeWidth={2}>
          <title>{`${fmtDay(d.t)}: ${d.v.toFixed(1)}`}</title>
        </circle>
      ))}
      <text x={pad.l} y={H - 4} className="fill-subtle text-[11px] font-bold">
        {fmtDay(t0)}
      </text>
      {data.length > 1 && (
        <text x={W - pad.r} y={H - 4} textAnchor="end" className="fill-subtle text-[11px] font-bold">
          {fmtDay(last.t)}
        </text>
      )}
    </svg>
  );
}

function formatValue(n: number, unit: string) {
  return unit === "band" ? n.toFixed(1) : String(Math.round(n));
}

/** Ơ names the lowest criterion, from the real averages only. */
function WeakestTip({ averages, enabled }: { averages: Record<Criterion, number>; enabled: boolean }) {
  const weakest = CRITERIA.reduce((w, c) => (averages[c] < averages[w] ? c : w), CRITERIA[0]);
  const { short, hint } = CRITERION_LABELS[weakest];
  return (
    <CharacterSays mood="idle" size={56} enabled={enabled} className="mt-auto">
      {short} đang thấp nhất, trung bình {averages[weakest].toFixed(1)}. Gợi ý của mình: {hint.charAt(0).toLowerCase() + hint.slice(1)}.
    </CharacterSays>
  );
}

export default function ProgressScreen({ profile, onTab, onOpenLeaderboard }: ProgressScreenProps) {
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [history, setHistory] = useState<BandPoint[]>([]);
  const [series, setSeries] = useState<Series>("overall");
  const { enabled: characterOn } = useCharacterEnabled();

  useEffect(() => {
    let cancelled = false;
    getBandHistory()
      .then((rows) => {
        if (!cancelled) setHistory(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMyFeedbackSummary()
      .then((res) => {
        if (cancelled) return;
        if (res.error) setFailed(true);
        setSummary(res.summary);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = MILESTONES.map((m) => {
    const current = profile ? m.value(profile) || 0 : 0;
    return { ...m, current, done: current >= m.target };
  });

  return (
    <TabShell tab="progress" onTab={onTab} title="Tiến bộ" wide>
      {loading ? (
        <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-surface" aria-busy />
      ) : failed && !summary ? (
        <Notice tone="error">Không tải được điểm được chấm. Vui lòng thử lại sau.</Notice>
      ) : !summary || summary.count === 0 || !summary.averages ? (
        <EmptyState title="Chưa có lượt chấm nào">
          Sau buổi thi với người thật, điểm bạn được chấm sẽ hiện ở đây theo từng tiêu chí.
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <Card className="md:p-6">
            <Label>Band hiện tại</Label>
            <div className="mt-2">
              <BandRange low={summary.overall} size="lg" />
              <p className="mt-2 text-sm text-muted">
                dựa trên <span className="font-bold tabular text-ink-2">{summary.count}</span> lượt chấm gần nhất
              </p>
            </div>
            {history.length > 0 && (
              <div className="mt-5">
                <div role="group" aria-label="Chọn tiêu chí cho biểu đồ" className="mb-3 flex flex-wrap gap-1.5">
                  {(["overall", ...CRITERIA] as Series[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeries(s)}
                      aria-pressed={series === s}
                      className={cn(
                        "h-8 rounded-full border px-3 text-xs font-bold transition-colors",
                        series === s ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:border-muted"
                      )}
                    >
                      {s === "overall" ? "Tổng" : CRITERION_LABELS[s].short}
                    </button>
                  ))}
                </div>
                <BandChart points={history} series={series} />
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4 md:p-6">
            <Label>4 tiêu chí</Label>
            <div className="space-y-3">
              {CRITERIA.map((c) => (
                <CriterionRow key={c} criterion={c} value={summary.averages![c]} />
              ))}
            </div>
            <WeakestTip averages={summary.averages} enabled={characterOn} />
          </Card>
        </div>
      )}

      {/* Stats */}
      {profile && (
        <Card className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value={profile.total_sessions ?? 0} label="buổi thi" />
          <Stat value={profile.total_minutes ?? 0} unit="phút" label="đã nói" />
          <Stat value={profile.current_streak ?? 0} unit="ngày" label="chuỗi ngày" />
          <Stat value={profile.longest_streak ?? 0} unit="ngày" label="dài nhất" />
        </Card>
      )}

      {/* Milestones */}
      <section className="mt-8">
        <Label>Cột mốc</Label>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {items.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden>
                {m.done && <Check className="size-4 text-ink" />}
              </span>
              <span className={cn("min-w-0 flex-1 text-sm", m.done ? "text-ink" : "text-muted")}>
                {m.title}
                <span className="sr-only">{m.done ? " (đã đạt)" : " (chưa đạt)"}</span>
              </span>
              {!m.done && (
                <span className="text-xs font-bold tabular text-subtle">
                  {formatValue(m.current, m.unit)}/{m.target}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Common tags */}
      {summary && summary.topTags.length > 0 && (
        <section className="mt-8">
          <Label>Partners hay nhận xét</Label>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {summary.topTags.map((tag) => (
              <span key={tag} className="rounded-full border border-line-strong px-3 py-1 text-sm text-ink-2">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 md:max-w-sm">
        <Button variant="secondary" block onClick={onOpenLeaderboard}>
          Bảng giờ nói tuần này
        </Button>
      </div>
    </TabShell>
  );
}
