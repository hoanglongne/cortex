"use client";

import { useState } from "react";
import { ArrowRight, GraduationCap, Mic, Users } from "lucide-react";
import { useCallHistory } from "@/hooks/useCallHistory";
import { useOnlineCount } from "@/hooks/useOnlineCount";
import { examHourStatus } from "@/lib/exam-hours";
import type { Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Label, Notice, Stat } from "@/components/ui/card";
import { BandRange } from "@/components/ui/band";
import { TabShell, type Tab } from "@/components/ui/shell";
import { formatClock } from "@/components/ui/timer";
import { cn } from "@/lib/utils";

interface HomeScreenProps {
  profile: Profile | null;
  onTab: (tab: Tab) => void;
  onStartMatching: () => void;
  onStartSolo: () => void;
  onOpenClasses: () => void;
  bandRange: { min: number; max: number };
  onBandRangeChange: (range: { min: number; max: number }) => void;
  notice?: string | null;
  onDismissNotice?: () => void;
}

const BAND_OPTIONS = [
  { label: "Bất kỳ", min: 1, max: 9 },
  { label: "5.0–6.0", min: 5, max: 6 },
  { label: "6.0–7.0", min: 6, max: 7 },
  { label: "7.0+", min: 7, max: 9 },
];

/**
 * The "Luyện" tab: practise alone (always there), or enter the exam room
 * (live, best during Giờ thi). Recent sessions below. Nothing else.
 */
export default function HomeScreen({
  profile,
  onTab,
  onStartMatching,
  onStartSolo,
  onOpenClasses,
  bandRange,
  onBandRangeChange,
  notice,
  onDismissNotice,
}: HomeScreenProps) {
  const { sessions, isLoading } = useCallHistory();
  const { count } = useOnlineCount();
  const [examHour] = useState(() => examHourStatus());
  const name = profile?.username ?? "";

  return (
    <TabShell
      tab="practice"
      onTab={onTab}
      action={
        profile && (
          <span className="flex items-baseline gap-1.5 text-sm text-muted">
            Band <span className="font-mono text-ink">{Number(profile.current_band).toFixed(1)}</span>
          </span>
        )
      }
    >
      {notice && (
        <Notice onDismiss={onDismissNotice} className="mb-6">
          {notice}
        </Notice>
      )}

      <p className="text-muted">{name ? `Chào ${name},` : "Chào bạn,"}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Hôm nay nói gì?</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Practise alone: always available */}
        <Card className="flex flex-col">
          <Label>Tập một mình</Label>
          <p className="mt-3 font-serif text-xl leading-snug text-ink">8 câu Part 1–2–3. Ghi âm, nghe lại, nói lại.</p>
          <p className="mt-2 text-sm text-muted">Không cần ai online. Bản ghi chỉ nằm trên máy bạn.</p>
          <div className="mt-auto pt-6">
            <Button variant="primary" size="lg" block onClick={onStartSolo}>
              <Mic /> Bắt đầu tập
            </Button>
          </div>
        </Card>

        {/* The exam room: live with a real person */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <Label>Phòng thi</Label>
            <span className={cn("font-mono text-[11px]", examHour.live ? "text-onair" : "text-subtle")}>
              {examHour.live ? "● Đang mở" : examHour.label.replace("Giờ thi tiếp theo: ", "Mở lúc ")}
            </span>
          </div>
          <p className="mt-3 font-serif text-xl leading-snug text-ink">Thi thử với người thật, đổi vai giám khảo, chấm nhau.</p>
          <p className="mt-2 text-sm text-muted">
            {count > 0 ? `${count} người đang chờ ghép.` : "Chưa có ai đang chờ."}{" "}
            {examHour.live ? examHour.label + "." : "Giờ thi đông người nhất: 20:30–22:00."}
          </p>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs text-muted">Luyện với bạn band</legend>
            <div className="flex flex-wrap gap-1.5">
              {BAND_OPTIONS.map((opt) => {
                const active = bandRange.min === opt.min && bandRange.max === opt.max;
                return (
                  <button
                    key={opt.label}
                    onClick={() => onBandRangeChange({ min: opt.min, max: opt.max })}
                    aria-pressed={active}
                    className={cn(
                      "h-9 rounded-full border px-3.5 font-mono text-xs transition-colors",
                      active ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:border-muted"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-auto pt-6">
            <Button variant={examHour.live ? "primary" : "secondary"} size="lg" block onClick={onStartMatching}>
              <Users /> Vào phòng thi
            </Button>
          </div>
        </Card>
      </div>

      {/* Stats, one quiet line */}
      {profile && (
        <div className="mt-10 grid grid-cols-3 gap-4 border-y border-line py-5">
          <Stat value={profile.total_sessions ?? 0} label="buổi thi" />
          <Stat value={profile.total_minutes ?? 0} unit="phút" label="đã nói" />
          <Stat value={profile.current_streak ?? 0} unit="ngày" label="liên tiếp" />
        </div>
      )}

      <button
        onClick={onOpenClasses}
        className="mt-6 flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3.5 text-left hover:bg-surface-2"
      >
        <GraduationCap className="size-5 text-muted" aria-hidden />
        <span className="flex-1">
          <span className="block text-ink">Lớp học</span>
          <span className="block text-xs text-muted">Bài giáo viên giao, vào lớp bằng mã</span>
        </span>
        <ArrowRight className="size-4 text-subtle" aria-hidden />
      </button>

      {/* Recent sessions */}
      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <Label>Gần đây</Label>
          {sessions.length > 0 && (
            <button onClick={() => onTab("history")} className="text-sm text-muted hover:text-ink">
              Xem tất cả
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2" aria-busy>
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[var(--radius-card)] bg-surface" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState title="Chưa có buổi thi nào">Buổi thi đầu tiên với người thật sẽ hiện ở đây, kèm điểm bạn được chấm.</EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
            {sessions.slice(0, 3).map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => onTab("history")}
                  className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">{s.partner.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {new Date(s.date).toLocaleDateString("vi-VN", { day: "numeric", month: "short" })} ·{" "}
                      {formatClock(s.duration)} · {s.questionsCount} câu
                    </p>
                  </div>
                  <div className="text-right">
                    {s.peerFeedback?.overallBand != null ? (
                      <BandRange low={s.peerFeedback.overallBand} />
                    ) : (
                      <span className="text-xs text-subtle">Chờ chấm</span>
                    )}
                  </div>
                  <ArrowRight className="size-4 text-subtle" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </TabShell>
  );
}
