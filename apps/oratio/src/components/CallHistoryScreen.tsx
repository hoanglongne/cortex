"use client";

import { useEffect, useMemo, useState, memo } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { listMyAnswers, type MyAnswer } from "@/actions/answers";
import { useCallHistory } from "@/hooks/useCallHistory";
import { Button } from "@/components/ui/button";
import { EmptyState, Label, Notice, Pill } from "@/components/ui/card";
import { BandRange, CriterionRow } from "@/components/ui/band";
import { TabShell, type Tab } from "@/components/ui/shell";
import { cn } from "@/lib/utils";
import { isPositiveTag } from "./RatingScreen";

interface CallHistoryScreenProps {
  onTab: (tab: Tab) => void;
}

interface FeedbackData {
  overallBand: number | null;
  scores: {
    fluency: number;
    vocabulary: number;
    grammar: number;
    pronunciation: number;
  } | null;
  tags: string[];
  comments: string;
  wouldMatchAgain: boolean | null;
}

interface CallSession {
  id: string;
  date: string;
  duration: number;
  questionsCount: number;
  questions: { part: number; text: string }[];
  topic: string | null;
  partner: {
    id: string;
    name: string;
    band: string;
    avatarUrl: string | null;
  };
  myFeedback: FeedbackData | null;
  peerFeedback: FeedbackData | null;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    return `${Math.floor(mins / 60)} giờ ${mins % 60} phút`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return date.toLocaleDateString("vi-VN");
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" });
}

function TagChip({ children }: { children: React.ReactNode }) {
  return <Pill>{children}</Pill>;
}

function FeedbackBlock({ title, subtitle, feedback }: { title: string; subtitle: string; feedback: FeedbackData }) {
  const strengths = feedback.tags.filter((t) => isPositiveTag(t));
  const improvements = feedback.tags.filter((t) => !isPositiveTag(t));

  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Label>{title}</Label>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        {feedback.overallBand !== null && <BandRange low={feedback.overallBand} />}
      </div>

      {feedback.scores && (
        <div className="mt-2 divide-y divide-line">
          <CriterionRow criterion="fluency" value={feedback.scores.fluency} />
          <CriterionRow criterion="vocabulary" value={feedback.scores.vocabulary} />
          <CriterionRow criterion="grammar" value={feedback.scores.grammar} />
          <CriterionRow criterion="pronunciation" value={feedback.scores.pronunciation} />
        </div>
      )}

      {(strengths.length > 0 || improvements.length > 0) && (
        <div className="mt-3 space-y-2">
          {strengths.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-bold text-subtle">Tốt</span>
              {strengths.map((tag) => (
                <TagChip key={tag}>{tag}</TagChip>
              ))}
            </div>
          )}
          {improvements.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-bold text-subtle">Cần luyện</span>
              {improvements.map((tag) => (
                <TagChip key={tag}>{tag}</TagChip>
              ))}
            </div>
          )}
        </div>
      )}

      {feedback.comments && (
        <p className="mt-3 rounded-[var(--radius-control)] bg-surface-2 px-3.5 py-3 text-sm leading-relaxed text-ink-2">
          “{feedback.comments}”
        </p>
      )}
    </section>
  );
}

function SessionCard({ session, isExpanded, onToggle }: { session: CallSession; isExpanded: boolean; onToggle: () => void }) {
  const peerBand = session.peerFeedback?.overallBand ?? null;
  const panelId = `session-${session.id}`;
  const questionsByPart = [1, 2, 3]
    .map((part) => ({
      part,
      items: (session.questions ?? []).filter((q) => q.part === part),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <li className={cn("rounded-[var(--radius-card)] border bg-surface", isExpanded ? "border-line-strong" : "border-line")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 rounded-[var(--radius-card)] px-4 py-3.5 text-left hover:bg-surface-2"
      >
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-voice-soft text-sm font-extrabold text-voice"
        >
          {session.partner.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">
            {session.partner.name} <span className="ml-1 text-xs font-semibold tabular text-subtle">Band {session.partner.band}</span>
          </p>
          <p className="mt-0.5 truncate text-[13px] text-subtle">
            {formatDate(session.date)} · <span className="tabular">{formatDuration(session.duration)}</span>
            {session.questionsCount > 0 && ` · ${session.questionsCount} câu`}
          </p>
          {session.peerFeedback?.comments && !isExpanded && (
            <p className="mt-1 truncate text-sm text-ink-2">“{session.peerFeedback.comments}”</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {peerBand !== null ? <BandRange low={peerBand} /> : <Pill tone="pending">Chờ chấm</Pill>}
        </div>
        <ChevronDown className={cn("size-4 shrink-0 text-subtle transition-transform", isExpanded && "rotate-180")} aria-hidden />
      </button>

      {isExpanded && (
        <div id={panelId} className="animate-enter space-y-6 border-t border-line px-4 pb-5 pt-4">
          {(session.topic || session.questionsCount > 0) && (
            <p className="text-xs text-muted">
              {session.topic}
              {session.topic && session.questionsCount > 0 && " · "}
              {session.questionsCount > 0 && `${session.questionsCount} câu hỏi`}
            </p>
          )}

          {session.peerFeedback ? (
            <FeedbackBlock title="Bạn được chấm" subtitle={`${session.partner.name} đã chấm bạn`} feedback={session.peerFeedback} />
          ) : (
            <p className="text-sm text-muted">{session.partner.name} chưa gửi đánh giá cho bạn.</p>
          )}

          {session.myFeedback ? (
            <FeedbackBlock title="Bạn đã chấm" subtitle={`Điểm bạn dành cho ${session.partner.name}`} feedback={session.myFeedback} />
          ) : (
            <p className="text-sm text-muted">Bạn đã bỏ qua phần chấm điểm cho buổi này.</p>
          )}

          <section>
            <Label>Câu hỏi đã luyện</Label>
            {questionsByPart.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Không có thông tin câu hỏi cho buổi này.</p>
            ) : (
              <div className="mt-3 space-y-4">
                {questionsByPart.map((group) => (
                  <div key={group.part}>
                    <Label className="mb-1.5">Part {group.part}</Label>
                    <ul className="space-y-2">
                      {group.items.map((q, i) => (
                        <li key={i} className="break-words text-[15px] leading-snug text-ink">
                          {q.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </li>
  );
}

type Filter = "all" | "room" | "solo";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "room", label: "Phòng thi" },
  { id: "solo", label: "Tập một mình" },
];

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const secs = (ms: number) => formatDuration(Math.round(ms / 1000));

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[12px] bg-surface-2 px-3 py-2">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-subtle">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold tabular text-ink">{value}</p>
    </div>
  );
}

function AnswerCard({ answer, isExpanded, onToggle }: { answer: MyAnswer; isExpanded: boolean; onToggle: () => void }) {
  const panelId = `answer-${answer.id}`;
  return (
    <li className={cn("rounded-[var(--radius-card)] border bg-surface", isExpanded ? "border-line-strong" : "border-line")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 rounded-[var(--radius-card)] px-4 py-3.5 text-left hover:bg-surface-2"
      >
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-listen-soft text-xs font-extrabold text-listen-ink"
        >
          P{answer.part}
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 break-words font-bold leading-snug text-ink">{answer.questionText}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-subtle">
            <span>Part {answer.part}</span>
            <span aria-hidden>·</span>
            <span className="tabular">{secs(answer.durationMs)}</span>
            {answer.retakeOf && <Pill tone="voice">Nói lại</Pill>}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {answer.band ? (
            <BandRange low={answer.band.low} high={answer.band.high} />
          ) : answer.submittedAt ? (
            <Pill tone="pending">Đang chờ chấm</Pill>
          ) : null}
        </div>
        <ChevronDown className={cn("size-4 shrink-0 text-subtle transition-transform", isExpanded && "rotate-180")} aria-hidden />
      </button>

      {isExpanded && (
        <div id={panelId} className="animate-enter space-y-4 border-t border-line px-4 pb-5 pt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Thời gian nói" value={secs(answer.speakingMs)} />
            <Metric label="Ngừng dài" value={answer.longPauses} />
            {answer.wpm !== null && <Metric label="Từ/phút" value={Math.round(answer.wpm)} />}
            {answer.meanRunWords !== null && <Metric label="Từ mỗi mạch" value={answer.meanRunWords.toFixed(1)} />}
          </div>

          {answer.lexicaWords.length > 0 && (
            <section>
              <Label className="mb-1.5">Từ Lexica bạn đã nói</Label>
              <div className="flex flex-wrap gap-1.5">
                {answer.lexicaWords.map((w) => (
                  <Pill key={w} tone="listen">
                    {w}
                  </Pill>
                ))}
              </div>
            </section>
          )}

          {answer.band && (
            <section>
              <Label>Người chấm cho bạn</Label>
              <p className="mt-1 text-sm text-muted">
                <span className="tabular">{answer.band.raters}</span> lượt chấm, ẩn danh.
              </p>
              <div className="mt-2 divide-y divide-line">
                <CriterionRow criterion="fluency" value={answer.band.criteria.fluency} />
                <CriterionRow criterion="vocabulary" value={answer.band.criteria.vocabulary} />
                <CriterionRow criterion="grammar" value={answer.band.criteria.grammar} />
                <CriterionRow criterion="pronunciation" value={answer.band.criteria.pronunciation} />
              </div>
            </section>
          )}

          <section>
            <Label className="mb-1.5">Lời bạn nói</Label>
            {answer.transcript ? (
              <p className="break-words rounded-[var(--radius-control)] bg-surface-2 px-3.5 py-3 text-sm leading-relaxed text-ink-2">
                {answer.transcript}
              </p>
            ) : (
              <p className="text-sm text-muted">Câu này chưa có bản chép lời.</p>
            )}
          </section>
        </div>
      )}
    </li>
  );
}

type Entry = { kind: "room"; date: string; session: CallSession } | { kind: "solo"; date: string; answer: MyAnswer };

function CallHistoryScreenComponent({ onTab }: CallHistoryScreenProps) {
  const { sessions, error, isLoading, refresh } = useCallHistory();
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<MyAnswer[]>([]);
  const [answersLoading, setAnswersLoading] = useState(true);
  const [answersFailed, setAnswersFailed] = useState(false);

  const fetchAnswers = () =>
    listMyAnswers({ limit: 100 })
      .then((res) => {
        // "Not authenticated" in demo/signed-out just means nothing to show
        setAnswers(res.answers.filter((a) => a.mode === "solo"));
        setAnswersFailed(Boolean(res.error) && res.error !== "Not authenticated");
      })
      .catch(() => setAnswersFailed(true))
      .finally(() => setAnswersLoading(false));

  const loadAnswers = () => {
    setAnswersLoading(true);
    setAnswersFailed(false);
    void fetchAnswers();
  };

  useEffect(() => {
    void fetchAnswers();
  }, []);

  const showRoom = filter !== "solo";
  const showSolo = filter !== "room";

  const roomSessions = useMemo(
    () =>
      sessions.filter((session: CallSession) => {
        if (!searchQuery) return true;
        return session.partner.name.toLowerCase().includes(searchQuery.toLowerCase());
      }),
    [sessions, searchQuery]
  );

  // One timeline: newest first, grouped by day
  const days = useMemo(() => {
    const entries: Entry[] = [
      ...(showRoom ? roomSessions.map((session: CallSession): Entry => ({ kind: "room", date: session.date, session })) : []),
      ...(showSolo ? answers.map((answer): Entry => ({ kind: "solo", date: answer.createdAt, answer })) : []),
    ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const groups: { key: string; date: string; items: Entry[] }[] = [];
    for (const e of entries) {
      const key = dayKey(e.date);
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.items.push(e);
      else groups.push({ key, date: e.date, items: [e] });
    }
    return groups;
  }, [roomSessions, answers, showRoom, showSolo]);

  const loading = (showRoom && isLoading) || (showSolo && answersLoading);
  // Signed out (demo) is an empty history, not an error; server messages are English
  const roomError = showRoom && error && error !== "Not authenticated" ? "Không tải được lịch sử phòng thi." : null;
  const soloError = showSolo && answersFailed ? "Không tải được các câu tập một mình." : null;
  const hasAnything = (showRoom && sessions.length > 0) || (showSolo && answers.length > 0);

  return (
    <TabShell
      tab="history"
      onTab={onTab}
      title="Lịch sử"
      action={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            refresh();
            loadAnswers();
          }}
          disabled={isLoading || answersLoading}
          aria-label="Tải lại lịch sử"
        >
          <RefreshCw className={cn((isLoading || answersLoading) && "animate-spin")} />
        </Button>
      }
    >
      <div role="group" aria-label="Lọc lịch sử" className="mb-4 flex gap-1 rounded-full bg-surface-2 p-1 md:max-w-md">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => {
              setFilter(f.id);
              setExpandedId(null);
            }}
            className={cn(
              "h-9 flex-1 rounded-full border border-transparent px-3 text-[13px] font-extrabold transition-colors",
              filter === f.id ? "border border-line-strong bg-surface text-ink" : "text-muted hover:text-ink"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {(roomError || soloError) && (
        <Notice tone="error">
          <div className="flex items-center justify-between gap-3">
            <span>{roomError ?? soloError}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                refresh();
                loadAnswers();
              }}
            >
              Thử lại
            </Button>
          </div>
        </Notice>
      )}

      {loading ? (
        <div className="space-y-2" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[var(--radius-card)] bg-surface" />
          ))}
        </div>
      ) : !hasAnything ? (
        !roomError && !soloError && (
          <EmptyState title={filter === "solo" ? "Chưa có câu tập nào" : filter === "room" ? "Chưa có buổi thi nào" : "Chưa có gì ở đây"}>
            {filter === "solo"
              ? "Tập một câu ở tab Luyện, câu trả lời của bạn sẽ được lưu ở đây."
              : filter === "room"
                ? "Hoàn thành một buổi thi với người thật để xem lịch sử ở đây."
                : "Tập một câu hoặc thi với người thật, lịch sử sẽ hiện ở đây."}
          </EmptyState>
        )
      ) : (
        <>
          {filter === "room" && (
            <input
              type="text"
              aria-label="Tìm theo tên đối tác"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên"
              className="mb-4 h-11 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-4 text-ink placeholder:text-subtle focus:border-voice focus:outline-none"
            />
          )}
          {days.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Không tìm thấy buổi nào.</p>
          ) : (
            <div className="space-y-5">
              {days.map((day) => (
                <section key={day.key + day.date}>
                  <Label className="mb-2">{formatDate(day.date)}</Label>
                  <ul className="space-y-2">
                    {day.items.map((e) => {
                      const id = e.kind === "room" ? `room-${e.session.id}` : `solo-${e.answer.id}`;
                      const toggle = () => setExpandedId(expandedId === id ? null : id);
                      return e.kind === "room" ? (
                        <SessionCard key={id} session={e.session} isExpanded={expandedId === id} onToggle={toggle} />
                      ) : (
                        <AnswerCard key={id} answer={e.answer} isExpanded={expandedId === id} onToggle={toggle} />
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </TabShell>
  );
}

export default memo(CallHistoryScreenComponent);
