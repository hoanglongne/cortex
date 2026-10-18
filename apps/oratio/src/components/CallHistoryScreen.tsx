"use client";

import { useState, memo } from "react";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  Mic,
  MessageCircle,
  TrendingUp,
  BookOpen,
  Volume2,
  Brain,
  Tag,
  Inbox,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCallHistory } from "@/hooks/useCallHistory";
import { isPositiveTag } from "./RatingScreen";

interface CallHistoryScreenProps {
  onBack: () => void;
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

// Score color helper
function getScoreColor(score: number) {
  if (score >= 7) return "text-emerald-400";
  if (score >= 6) return "text-blue-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
}

function getBarColor(score: number) {
  if (score >= 7) return "from-emerald-500 to-emerald-400";
  if (score >= 6) return "from-blue-500 to-blue-400";
  if (score >= 5) return "from-amber-500 to-amber-400";
  return "from-red-500 to-red-400";
}

// Format duration
function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours} giờ ${remainingMins} phút`;
  }
  return `${mins} phút ${secs.toString().padStart(2, "0")} giây`;
}

// Format date relative
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return date.toLocaleDateString("vi-VN");
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Score Bar Component
function ScoreBar({ label, icon: Icon, score }: { label: string; icon: React.ElementType; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-zinc-400" />
          <span className="text-xs text-zinc-400">{label}</span>
        </div>
        <span className={`text-xs font-semibold ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor(score)}`}
          style={{ width: `${(score / 9) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Feedback Block Component
function FeedbackBlock({
  title,
  subtitle,
  feedback,
  accentColor,
}: {
  title: string;
  subtitle: string;
  feedback: FeedbackData;
  accentColor: "blue" | "emerald";
}) {
  const strengths = feedback.tags.filter((t) => isPositiveTag(t));
  const improvements = feedback.tags.filter((t) => !isPositiveTag(t));
  const borderColor = accentColor === "blue" ? "border-blue-500/20" : "border-emerald-500/20";
  const iconBg = accentColor === "blue" ? "bg-blue-500/10" : "bg-emerald-500/10";
  const iconColor = accentColor === "blue" ? "text-blue-400" : "text-emerald-400";

  return (
    <div className={`rounded-xl border ${borderColor} bg-zinc-900/40 overflow-hidden`}>
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          {accentColor === "emerald" ? (
            <Inbox className={`w-4 h-4 ${iconColor}`} />
          ) : (
            <TrendingUp className={`w-4 h-4 ${iconColor}`} />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-zinc-400">{subtitle}</p>
        </div>
        {feedback.overallBand !== null && (
          <span className={`ml-auto text-lg font-bold ${getScoreColor(feedback.overallBand)}`}>
            {feedback.overallBand.toFixed(1)}
          </span>
        )}
      </div>

      {feedback.scores && (
        <div className="p-4 space-y-2.5">
          <ScoreBar icon={Mic} label="Fluency & Coherence" score={feedback.scores.fluency} />
          <ScoreBar icon={BookOpen} label="Lexical Resource (Vocabulary)" score={feedback.scores.vocabulary} />
          <ScoreBar icon={Brain} label="Grammatical Range & Accuracy" score={feedback.scores.grammar} />
          <ScoreBar icon={Volume2} label="Pronunciation" score={feedback.scores.pronunciation} />
        </div>
      )}

      {(strengths.length > 0 || improvements.length > 0) && (
        <div className="px-4 pb-3 space-y-2">
          {strengths.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {strengths.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[11px] text-emerald-400 border border-emerald-500/20">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {improvements.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {improvements.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[11px] text-amber-400 border border-amber-500/20">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {feedback.comments && (
        <div className="px-4 pb-4">
          <p className="text-xs text-zinc-400 italic">&ldquo;{feedback.comments}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

// Session Card Component
function SessionCard({
  session,
  isExpanded,
  onToggle,
}: {
  session: CallSession;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasPeerFeedback = session.peerFeedback !== null;
  const questionsByPart = [1, 2, 3]
    .map((part) => ({
      part,
      items: (session.questions ?? []).filter((q) => q.part === part),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div
      className={`rounded-2xl border transition-all ${isExpanded
          ? "bg-zinc-900/80 border-blue-500/30"
          : "bg-zinc-900/40 border-white/5 hover:border-white/10"
        }`}
    >
      {/* Main Row */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full text-left flex items-center gap-3 sm:gap-4 p-4 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      >
        {/* Date & Time */}
        <div className="hidden sm:block w-24 shrink-0">
          <p className="text-sm font-medium text-white">{formatDate(session.date)}</p>
          <p className="text-xs text-zinc-500">{formatTime(session.date)}</p>
        </div>

        {/* Partner Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-semibold shrink-0 text-sm">
            {session.partner.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-medium text-white truncate">{session.partner.name}</p>
              <span className="text-xs text-zinc-500 shrink-0">Band {session.partner.band}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 sm:hidden">
              <span>{formatDate(session.date)}</span>
              <span>•</span>
              <span>{formatDuration(session.duration)}</span>
            </div>
          </div>
        </div>

        {/* Duration - Desktop */}
        <div className="hidden sm:flex items-center gap-2 text-zinc-400 shrink-0">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{formatDuration(session.duration)}</span>
        </div>

        {/* Peer score or pending badge */}
        <div className="shrink-0">
          {hasPeerFeedback && session.peerFeedback!.overallBand !== null ? (
            <span className={`text-lg font-bold ${getScoreColor(session.peerFeedback!.overallBand!)}`}>
              {session.peerFeedback!.overallBand!.toFixed(1)}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-400">
              Chờ đánh giá
            </span>
          )}
        </div>

        {/* Expand Icon */}
        <div className="shrink-0" aria-hidden="true">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-4">
          {/* Quick info */}
          <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(session.duration)}
            </span>
            {session.topic && <span className="text-zinc-400">{session.topic}</span>}
            {session.questionsCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {session.questionsCount} câu hỏi
              </span>
            )}
          </div>

          {/* Peer Feedback (what partner gave to me) */}
          {session.peerFeedback ? (
            <FeedbackBlock
              title="Bạn được chấm"
              subtitle={`${session.partner.name} đã chấm điểm bạn`}
              feedback={session.peerFeedback}
              accentColor="emerald"
            />
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 border border-white/5">
              <Inbox className="w-5 h-5 text-zinc-500 shrink-0" />
              <p className="text-sm text-zinc-400">
                {session.partner.name} chưa gửi đánh giá cho bạn.
              </p>
            </div>
          )}

          {/* My Feedback (what I gave to partner) */}
          {session.myFeedback ? (
            <FeedbackBlock
              title="Bạn đã chấm"
              subtitle={`Điểm bạn dành cho ${session.partner.name}`}
              feedback={session.myFeedback}
              accentColor="blue"
            />
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 border border-white/5">
              <Tag className="w-5 h-5 text-zinc-500 shrink-0" />
              <p className="text-sm text-zinc-400">Bạn đã bỏ qua phần chấm điểm cho buổi này.</p>
            </div>
          )}

          {/* Questions asked */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4">
            <p className="text-sm font-semibold text-white mb-3">Câu hỏi đã luyện</p>
            {questionsByPart.length === 0 ? (
              <p className="text-sm text-zinc-400">Không có thông tin câu hỏi cho buổi này.</p>
            ) : (
              <div className="space-y-4">
                {questionsByPart.map((group) => (
                  <div key={group.part}>
                    <p className="text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Part {group.part}
                    </p>
                    <ul className="space-y-1.5">
                      {group.items.map((q, i) => (
                        <li key={i} className="text-sm text-zinc-300 break-words">
                          {q.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Stats Summary Component
function StatsSummary({ sessions }: { sessions: CallSession[] }) {
  const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
  const sessionsWithPeerScore = sessions.filter(
    (s) => s.peerFeedback?.overallBand != null
  );
  const avgScore =
    sessionsWithPeerScore.length > 0
      ? sessionsWithPeerScore.reduce((acc, s) => acc + s.peerFeedback!.overallBand!, 0) /
      sessionsWithPeerScore.length
      : 0;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
      <div className="text-center">
        <p className="text-2xl font-bold text-white">{sessions.length}</p>
        <p className="text-xs text-zinc-400">Buổi luyện</p>
      </div>
      <div className="text-center border-x border-white/5">
        <p className="text-2xl font-bold text-white">
          {totalDuration >= 3600
            ? `${(totalDuration / 3600).toFixed(1)} giờ`
            : `${Math.floor(totalDuration / 60)} phút`}
        </p>
        <p className="text-xs text-zinc-400">Tổng thời gian</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-400">
          {avgScore > 0 ? avgScore.toFixed(1) : "—"}
        </p>
        <p className="text-xs text-zinc-400">Band trung bình (được chấm)</p>
      </div>
    </div>
  );
}

// Main Call History Screen Component
function CallHistoryScreenComponent({ onBack }: CallHistoryScreenProps) {
  const { sessions, error, isLoading, refresh } = useCallHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSessions = sessions.filter((session: CallSession) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return session.partner.name.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-2 mb-8">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Quay lại</span>
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">Lịch sử</h1>
              <p className="text-xs text-zinc-400">
                {sessions.length} buổi đã hoàn thành
              </p>
            </div>
          </div>
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            aria-label="Tải lại lịch sử"
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
            <p className="text-sm text-zinc-400">Đang tải lịch sử...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-2" role="alert">
              {typeof error === "string" ? error : "Không tải được lịch sử. Vui lòng thử lại."}
            </p>
            <button
              onClick={() => refresh()}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-blue-400 hover:bg-zinc-800"
            >
              Thử lại
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-zinc-400 font-medium">Chưa có buổi luyện nào</p>
            <p className="text-sm text-zinc-500 mt-1">
              Hoàn thành một buổi luyện để xem lịch sử ở đây.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <StatsSummary sessions={sessions} />

            {/* Search */}
            <div className="mt-6 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  aria-label="Tìm theo tên đối tác"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên đối tác..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Session List */}
            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-400">Không tìm thấy buổi luyện nào</p>
                </div>
              ) : (
                filteredSessions.map((session: CallSession) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isExpanded={expandedId === session.id}
                    onToggle={() =>
                      setExpandedId(expandedId === session.id ? null : session.id)
                    }
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Export memoized component for performance
export default memo(CallHistoryScreenComponent);

