"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { listMyAnswers, type MyAnswer } from "@/actions/answers";
import { getReviewStatus, type ReviewStatus } from "@/actions/reviews";
import { lexicaUsed, milestones, weeklyPoints, type WeekPoint } from "@/lib/answer-trends";
import { getBandHistory, getMyFeedbackSummary, type BandPoint } from "@/actions/stats";
import type { Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Label, Notice, Pill, Stat } from "@/components/ui/card";
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

/** Weekly machine metric as a hand-drawn line. Never a band. */
function TrendChart({
  points,
  pick,
  unit,
  digits = 0,
}: {
  points: WeekPoint[];
  pick: (p: WeekPoint) => number | null;
  unit: string;
  digits?: number;
}) {
  const data = points.map((p) => ({ start: p.start, v: pick(p) })).filter((d): d is { start: string; v: number } => d.v !== null);
  if (data.length === 0) return <p className="py-6 text-sm text-muted">Chưa có số liệu.</p>;

  const W = 300;
  const H = 110;
  const pad = { l: 8, r: 8, t: 10, b: 22 };
  const lo = Math.min(...data.map((d) => d.v));
  const hi = Math.max(...data.map((d) => d.v));
  const range = hi - lo || 1;
  const x = (i: number) => (data.length === 1 ? W / 2 : pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => (hi === lo ? (H - pad.b + pad.t) / 2 : pad.t + (1 - (v - lo) / range) * (H - pad.t - pad.b));
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(d.v).toFixed(1)}`).join(" ");
  const fmtDay = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${Number(d)}/${Number(m)}`;
  };
  const last = data[data.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${unit} theo tuần, ${data.length} tuần, mới nhất ${last.v.toFixed(digits)}`}
    >
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} className="stroke-line" strokeWidth={1} />
      {data.length > 1 && (
        <path d={path} fill="none" className="stroke-listen" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {data.map((d, i) => (
        <circle key={d.start} cx={x(i)} cy={y(d.v)} r={i === data.length - 1 ? 4.5 : 3} className="fill-listen stroke-surface" strokeWidth={2}>
          <title>{`Tuần ${fmtDay(d.start)}: ${d.v.toFixed(digits)} ${unit}`}</title>
        </circle>
      ))}
      <text x={pad.l} y={H - 6} className="fill-subtle text-[10px] font-bold">
        {fmtDay(data[0].start)}
      </text>
      {data.length > 1 && (
        <text x={W - pad.r} y={H - 6} textAnchor="end" className="fill-subtle text-[10px] font-bold">
          {fmtDay(last.start)}
        </text>
      )}
    </svg>
  );
}

function MetricCard({
  title,
  explain,
  latest,
  children,
}: {
  title: string;
  explain: string;
  latest: string | null;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Label>{title}</Label>
        {latest && <span className="text-lg font-extrabold tabular text-ink">{latest}</span>}
      </div>
      <p className="mt-1 text-[13px] leading-snug text-muted">{explain}</p>
      <div className="mt-2">{children}</div>
    </Card>
  );
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" });

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
  const [answers, setAnswers] = useState<MyAnswer[]>([]);
  const [reviewer, setReviewer] = useState<ReviewStatus | null>(null);
  const { enabled: characterOn } = useCharacterEnabled();

  useEffect(() => {
    let cancelled = false;
    // Demo mode and signed-out users get empty results, never a throw
    listMyAnswers({ limit: 200 })
      .then((res) => {
        if (!cancelled) setAnswers(res.answers);
      })
      .catch(() => {});
    getReviewStatus()
      .then((res) => {
        if (!cancelled) setReviewer(res.status);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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

  const weeks = useMemo(() => weeklyPoints(answers), [answers]);
  const lexica = useMemo(() => lexicaUsed(answers), [answers]);
  const timeline = useMemo(() => {
    const all = milestones(answers, { reliable: reviewer?.trusted });
    const done = all.filter((m) => m.date !== null);
    const next = all.find((m) => m.date === null);
    return { done, next };
  }, [answers, reviewer]);
  const totalMinutes = weeks.reduce((sum, w) => sum + w.minutesSpoken, 0);
  const lastWeek = weeks[weeks.length - 1];

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

      {/* Machine metrics */}
      <section className="mt-8">
        <Label>Máy đo</Label>
        <p className="mt-1 text-sm text-muted">Đo trên máy từ các câu tập của bạn. Máy chỉ đếm, không chấm band.</p>
        {weeks.length === 0 ? (
          <Card className="mt-3 text-sm text-muted">Tập một câu ở tab Luyện, các số đo theo tuần sẽ hiện ở đây.</Card>
        ) : (
          <>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <MetricCard
                title="Từ mỗi phút"
                explain="Tốc độ nói, tính trên các câu đã chép lời. Nói tự nhiên thường quanh 100–150."
                latest={lastWeek?.wpm != null ? `${Math.round(lastWeek.wpm)}` : null}
              >
                <TrendChart points={weeks} pick={(p) => p.wpm} unit="từ/phút" />
              </MetricCard>
              <MetricCard
                title="Ngừng dài mỗi phút"
                explain="Số lần im hơn 1 giây trong mỗi phút ghi âm. Càng ít thì càng liền mạch."
                latest={lastWeek?.pausesPerMin != null ? lastWeek.pausesPerMin.toFixed(1) : null}
              >
                <TrendChart points={weeks} pick={(p) => p.pausesPerMin} unit="lần/phút" digits={1} />
              </MetricCard>
            </div>
            <Card className="mt-3 grid grid-cols-2 gap-4">
              <Stat value={Math.round(totalMinutes * 10) / 10} unit="phút" label="đã nói ở tab Luyện" />
              <Stat value={answers.length} unit="câu" label="đã ghi lại" />
            </Card>
          </>
        )}
        <div className="mt-3">
          <Card>
            <Label>Từ Lexica bạn đã nói</Label>
            {lexica.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Khi bạn nói một từ trong Lexica lúc trả lời, từ đó hiện ở đây.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lexica.slice(0, 60).map((w) => (
                  <Pill key={w.word} tone="listen">
                    {w.word}
                    {w.count > 1 && <span className="ml-1 tabular opacity-70">×{w.count}</span>}
                  </Pill>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Reviewer profile */}
      {reviewer && (
        <section className="mt-8">
          <Label>Hồ sơ người chấm</Label>
          <Card className="mt-3 grid grid-cols-2 items-start gap-4 sm:grid-cols-3">
            <Stat value={reviewer.reviewsGiven} unit="lượt" label="bạn đã chấm" />
            <Stat
              value={reviewer.reliability !== null ? `${Math.round(reviewer.reliability * 100)}%` : "–"}
              label={reviewer.reliability !== null ? "độ chuẩn" : "độ chuẩn: chưa đủ dữ liệu"}
            />
            <div className="col-span-2 sm:col-span-1">
              {reviewer.trusted ? <Pill tone="good">Tin cậy</Pill> : <Pill>Chưa đủ để gắn nhãn Tin cậy</Pill>}
            </div>
          </Card>
        </section>
      )}

      {/* Milestones */}
      <section className="mt-8">
        <Label>Cột mốc</Label>
        <ol className="mt-3 divide-y divide-line border-y border-line">
          {timeline.done.map((m) => (
            <li key={m.key} className="flex items-center gap-3 py-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-good-soft" aria-hidden>
                <Check className="size-3.5 text-good-edge dark:text-good" />
              </span>
              <span className="min-w-0 flex-1 text-sm font-bold text-ink">
                {m.label}
                <span className="sr-only"> (đã đạt)</span>
              </span>
              {m.date && <span className="text-xs font-bold tabular text-subtle">{fmtDate(m.date)}</span>}
            </li>
          ))}
          {timeline.next && (
            <li className="flex items-center gap-3 py-3">
              <span className="size-5 shrink-0 rounded-full border-2 border-dashed border-line-strong" aria-hidden />
              <span className="min-w-0 flex-1 text-sm text-subtle">
                {timeline.next.label}
                <span className="sr-only"> (cột mốc tiếp theo)</span>
              </span>
            </li>
          )}
        </ol>
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
