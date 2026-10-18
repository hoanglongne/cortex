"use client";

import { useState, memo } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useCallHistory } from "@/hooks/useCallHistory";
import { Button } from "@/components/ui/button";
import { EmptyState, Label, Notice } from "@/components/ui/card";
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
  return <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-ink-2">{children}</span>;
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
              <span className="mr-1 text-xs text-subtle">Tốt</span>
              {strengths.map((tag) => (
                <TagChip key={tag}>{tag}</TagChip>
              ))}
            </div>
          )}
          {improvements.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs text-subtle">Cần luyện</span>
              {improvements.map((tag) => (
                <TagChip key={tag}>{tag}</TagChip>
              ))}
            </div>
          )}
        </div>
      )}

      {feedback.comments && (
        <p className="mt-3 border-l-2 border-line-strong pl-3 font-serif text-sm leading-relaxed text-ink-2">
          {feedback.comments}
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
        <div className="min-w-0 flex-1">
          <p className="truncate text-ink">
            {session.partner.name} <span className="ml-1 font-mono text-xs text-subtle">Band {session.partner.band}</span>
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {formatDate(session.date)} · <span className="font-mono tabular">{formatDuration(session.duration)}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          {peerBand !== null ? <BandRange low={peerBand} /> : <span className="text-xs text-subtle">Chờ chấm</span>}
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
                    <p className="mb-1.5 font-mono text-xs text-subtle">PART {group.part}</p>
                    <ul className="space-y-2">
                      {group.items.map((q, i) => (
                        <li key={i} className="break-words font-serif text-[15px] leading-snug text-ink">
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

function CallHistoryScreenComponent({ onTab }: CallHistoryScreenProps) {
  const { sessions, error, isLoading, refresh } = useCallHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSessions = sessions.filter((session: CallSession) => {
    if (!searchQuery) return true;
    return session.partner.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <TabShell
      tab="history"
      onTab={onTab}
      title="Lịch sử"
      action={
        <Button variant="ghost" size="icon" onClick={() => refresh()} disabled={isLoading} aria-label="Tải lại lịch sử">
          <RefreshCw className={cn(isLoading && "animate-spin")} />
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-2" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[var(--radius-card)] bg-surface" />
          ))}
        </div>
      ) : error ? (
        <Notice tone="error">
          <div className="flex items-center justify-between gap-3">
            <span>{typeof error === "string" ? error : "Không tải được lịch sử."}</span>
            <Button variant="secondary" size="sm" onClick={() => refresh()}>
              Thử lại
            </Button>
          </div>
        </Notice>
      ) : sessions.length === 0 ? (
        <EmptyState title="Chưa có buổi thi nào">Hoàn thành một buổi thi với người thật để xem lịch sử ở đây.</EmptyState>
      ) : (
        <>
          <input
            type="text"
            aria-label="Tìm theo tên đối tác"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên"
            className="mb-4 h-11 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-4 text-ink placeholder:text-subtle"
          />
          {filteredSessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Không tìm thấy buổi nào.</p>
          ) : (
            <ul className="space-y-2">
              {filteredSessions.map((session: CallSession) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isExpanded={expandedId === session.id}
                  onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </TabShell>
  );
}

export default memo(CallHistoryScreenComponent);
