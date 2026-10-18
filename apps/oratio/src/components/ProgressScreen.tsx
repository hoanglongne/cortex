"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getMyFeedbackSummary } from "@/actions/stats";
import type { Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { EmptyState, Label, Notice, Stat } from "@/components/ui/card";
import { BandRange, CriterionRow } from "@/components/ui/band";
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

function formatValue(n: number, unit: string) {
  return unit === "band" ? n.toFixed(1) : String(Math.round(n));
}

export default function ProgressScreen({ profile, onTab, onOpenLeaderboard }: ProgressScreenProps) {
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

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
    <TabShell tab="progress" onTab={onTab} title="Tiến bộ">
      {/* Current band */}
      <section>
        <Label>Band hiện tại</Label>
        {loading ? (
          <div className="mt-3 h-40 animate-pulse rounded-[var(--radius-card)] bg-surface" aria-busy />
        ) : failed && !summary ? (
          <Notice tone="error" className="mt-3">
            Không tải được điểm được chấm. Vui lòng thử lại sau.
          </Notice>
        ) : !summary || summary.count === 0 || !summary.averages ? (
          <div className="mt-3">
            <EmptyState title="Chưa có lượt chấm nào">
              Sau buổi thi với người thật, điểm bạn được chấm sẽ hiện ở đây theo từng tiêu chí.
            </EmptyState>
          </div>
        ) : (
          <div className="mt-3">
            <BandRange low={summary.overall} size="lg" />
            <p className="mt-1 text-sm text-muted">
              dựa trên <span className="font-mono tabular text-ink-2">{summary.count}</span> lượt chấm gần nhất
            </p>
            <div className="mt-4 divide-y divide-line border-y border-line">
              <CriterionRow criterion="fluency" value={summary.averages.fluency} />
              <CriterionRow criterion="vocabulary" value={summary.averages.vocabulary} />
              <CriterionRow criterion="grammar" value={summary.averages.grammar} />
              <CriterionRow criterion="pronunciation" value={summary.averages.pronunciation} />
            </div>
          </div>
        )}
      </section>

      {/* Stats */}
      {profile && (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
          <Stat value={profile.total_sessions ?? 0} label="buổi thi" />
          <Stat value={profile.total_minutes ?? 0} unit="phút" label="đã nói" />
          <Stat value={profile.current_streak ?? 0} unit="ngày" label="chuỗi ngày" />
          <Stat value={profile.longest_streak ?? 0} unit="ngày" label="dài nhất" />
        </div>
      )}

      {/* Milestones */}
      <section className="mt-10">
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
                <span className="font-mono text-xs tabular text-subtle">
                  {formatValue(m.current, m.unit)}/{m.target}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Common tags */}
      {summary && summary.topTags.length > 0 && (
        <section className="mt-10">
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

      <div className="mt-10">
        <Button variant="secondary" block onClick={onOpenLeaderboard}>
          Bảng giờ nói tuần này
        </Button>
      </div>
    </TabShell>
  );
}
