"use client";

import { useState } from "react";
import { ArrowRight, Flame, GraduationCap, Mic, Users } from "lucide-react";
import { useCallHistory } from "@/hooks/useCallHistory";
import { useOnlineCount } from "@/hooks/useOnlineCount";
import { examHourStatus } from "@/lib/exam-hours";
import { practiceLine } from "@/lib/character-lines";
import { useCharacterEnabled } from "@/lib/client/theme";
import type { Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Label, Notice, Stat } from "@/components/ui/card";
import { CharacterSays } from "@/components/ui/character";
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

const SOLO_PLAN = [
  { part: 1, label: "Part 1 · Làm quen", detail: "4 câu ngắn về bạn" },
  { part: 2, label: "Part 2 · Kể chuyện", detail: "1 thẻ đề, nói 2 phút" },
  { part: 3, label: "Part 3 · Thảo luận", detail: "3 câu nêu quan điểm" },
];

/**
 * The "Luyện" tab: Ơ says one real thing, then practise alone (always
 * there) or enter the exam room (live, best during Giờ thi).
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
  const { enabled: characterOn } = useCharacterEnabled();
  const [now] = useState(() => new Date());
  const examHour = examHourStatus(now);
  const lastComment = sessions.find((s) => s.peerFeedback?.comments)?.peerFeedback?.comments ?? null;
  const line = practiceLine({
    name: profile?.username ?? null,
    examLive: examHour.live,
    waiting: count,
    sessions: profile?.total_sessions ?? 0,
    streak: profile?.current_streak ?? 0,
    lastComment,
    hour: now.getHours(),
  });
  const recent = sessions.filter((s) => s.peerFeedback).slice(0, 3);

  const streak = (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-[12px] border border-line bg-surface px-3 text-sm font-bold">
      <Flame className="size-4 fill-streak text-streak" /> {profile?.current_streak ?? 0} ngày
    </span>
  );

  return (
    <TabShell tab="practice" onTab={onTab} action={streak} wide>
      {notice && (
        <Notice onDismiss={onDismissNotice} className="mb-6">
          {notice}
        </Notice>
      )}

      <p className="text-[15px] text-subtle">
        {now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" })}
      </p>
      <h1 className="mt-1 text-[28px] font-extrabold leading-tight tracking-[-0.035em] md:text-[34px]">
        {profile?.username ? `Chào ${profile.username}, hôm nay nói gì nào?` : "Hôm nay nói gì nào?"}
      </h1>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.15fr_1fr]">
        {/* Practise alone */}
        <Card className="flex flex-col gap-4 md:p-6">
          <CharacterSays mood={line.mood} enabled={characterOn}>
            {line.text}
          </CharacterSays>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-extrabold tracking-[-0.03em]">Tập một mình</h2>
            <span className="text-sm text-subtle">8 câu · khoảng 10 phút</span>
          </div>
          <ol className="flex flex-col gap-2">
            {SOLO_PLAN.map((p) => (
              <li key={p.part} className="flex items-center gap-3 rounded-[14px] border border-line px-3.5 py-3">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-extrabold",
                    p.part === 1 ? "bg-voice text-on-voice" : "bg-surface-2 text-subtle"
                  )}
                >
                  {p.part}
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-bold">{p.label}</span>
                  <span className="block text-[13px] text-subtle">{p.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] text-subtle">Ghi âm và nghe lại ngay. Bản ghi chỉ nằm trên máy bạn.</p>
          <Button variant="primary" size="lg" block onClick={onStartSolo} className="mt-auto">
            <Mic /> Bắt đầu nói
          </Button>
        </Card>

        {/* The exam room, always dark */}
        <div data-theme="dark" className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-bg p-5 text-ink md:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-listen-ink">
              <span className={cn("size-2 rounded-full", examHour.live ? "bg-good shadow-[0_0_0_4px_rgb(43_196_138/0.2)]" : "bg-surface-3")} />
              {examHour.live ? "Phòng thi đang mở" : "Phòng thi"}
            </span>
            <span className="text-[13px] text-subtle">
              {examHour.live ? `tới ${examHour.endsAt}` : examHour.label.replace("Giờ thi tiếp theo: ", "mở lúc ")}
            </span>
          </div>
          <h2 className="text-[22px] font-extrabold leading-tight tracking-[-0.03em]">Thi thử với người thật, đổi vai giám khảo</h2>
          <p className="text-sm text-muted">
            {count > 0 ? `${count} người đang chờ ghép.` : "Chưa có ai đang chờ."}{" "}
            {examHour.live ? "" : "Giờ thi đông người nhất: 20:30–22:00."}
          </p>
          <fieldset>
            <legend className="mb-2 text-xs font-bold text-subtle">Luyện với bạn band</legend>
            <div className="flex flex-wrap gap-1.5">
              {BAND_OPTIONS.map((opt) => {
                const active = bandRange.min === opt.min && bandRange.max === opt.max;
                return (
                  <button
                    key={opt.label}
                    onClick={() => onBandRangeChange({ min: opt.min, max: opt.max })}
                    aria-pressed={active}
                    className={cn(
                      "h-9 rounded-full border px-3.5 text-[13px] font-bold transition-colors",
                      active ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:border-muted"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <Button variant={examHour.live ? "primary" : "secondary"} size="lg" block onClick={onStartMatching} className="mt-auto">
            <Users /> Vào phòng thi
          </Button>
        </div>
      </div>

      {/* Stats */}
      {profile && (
        <Card className="mt-4 grid grid-cols-3 gap-4">
          <Stat value={profile.total_sessions ?? 0} label="buổi thi" />
          <Stat value={profile.total_minutes ?? 0} unit="phút" label="đã nói" />
          <Stat value={Number(profile.current_band).toFixed(1)} label="band hiện tại" />
        </Card>
      )}

      <button
        onClick={onOpenClasses}
        className="mt-4 flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3.5 text-left hover:bg-surface-2"
      >
        <GraduationCap className="size-5 text-muted" aria-hidden />
        <span className="flex-1">
          <span className="block text-ink">Lớp học</span>
          <span className="block text-xs text-muted">Bài giáo viên giao, vào lớp bằng mã</span>
        </span>
        <ArrowRight className="size-4 text-subtle" aria-hidden />
      </button>

      {/* Recent feedback */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <Label>Nhận xét gần đây</Label>
          {sessions.length > 0 && (
            <button onClick={() => onTab("history")} className="text-sm font-bold text-voice hover:underline">
              Xem lịch sử
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-3" aria-busy>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState title="Chưa có nhận xét nào">Sau buổi thi đầu tiên, lời nhận xét của bạn luyện cùng sẽ hiện ở đây.</EmptyState>
        ) : (
          <ul className="grid gap-3 md:grid-cols-3">
            {recent.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => onTab("history")}
                  className="flex h-full w-full flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 text-left hover:border-line-strong"
                >
                  <span className="flex w-full items-center justify-between text-[13px] text-subtle">
                    <span className="truncate">
                      {s.partner.name} · {new Date(s.date).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
                    </span>
                    <span className="font-extrabold text-ink tabular">
                      {s.peerFeedback?.overallBand != null ? Number(s.peerFeedback.overallBand).toFixed(1) : "–"}
                    </span>
                  </span>
                  <span className="line-clamp-3 text-sm leading-relaxed text-ink-2">
                    {s.peerFeedback?.comments ? `“${s.peerFeedback.comments}”` : `${formatClock(s.duration)} · ${s.questionsCount} câu`}
                  </span>
                  <ArrowRight className="mt-auto size-4 self-end text-subtle" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </TabShell>
  );
}
