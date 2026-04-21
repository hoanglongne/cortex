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
  wouldMatchAgain?: boolean | null;
}

interface CallSession {
  id: string;
  date: string;
  duration: number;
  questionsCount: number;
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

const positiveTags = [
  "Speaks naturally", "Good use of fillers", "Well-organized ideas",
  "Rich vocabulary", "Good collocations", "Uses idioms well",
  "Varied structures", "Good complex sentences", "Accurate tenses",
  "Clear speech", "Good intonation", "Natural stress patterns",
];

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
    return `${hours}h ${remainingMins}m`;
  }
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

// Format date relative
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
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
          <Icon className="w-3 h-3 text-zinc-500" />
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
  const strengths = feedback.tags.filter((t) => positiveTags.includes(t));
  const improvements = feedback.tags.filter((t) => !positiveTags.includes(t));
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
          <p className="text-xs text-zinc-500">{subtitle}</p>
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
          <ScoreBar icon={BookOpen} label="Lexical Resource" score={feedback.scores.vocabulary} />
          <ScoreBar icon={Brain} label="Grammar Range" score={feedback.scores.grammar} />
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

  return (
    <div
      className={`rounded-2xl border transition-all ${isExpanded
          ? "bg-zinc-900/80 border-blue-500/30"
          : "bg-zinc-900/40 border-white/5 hover:border-white/10"
        }`}
    >
      {/* Main Row */}
      <div className="flex items-center gap-3 sm:gap-4 p-4 cursor-pointer" onClick={onToggle}>
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
            <div className="flex items-center gap-2">
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
            <span className="px-2 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-500">
              Chờ đánh giá
            </span>
          )}
        </div>

        {/* Expand Icon */}
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-4">
          {/* Quick info */}
          <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(session.duration)}
            </span>
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
              title="Đánh giá từ đối tác"
              subtitle={`${session.partner.name} đã đánh giá bạn`}
              feedback={session.peerFeedback}
              accentColor="emerald"
            />
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 border border-white/5">
              <Inbox className="w-5 h-5 text-zinc-600 shrink-0" />
              <p className="text-sm text-zinc-500">
                {session.partner.name} chưa gửi đánh giá cho bạn.
              </p>
            </div>
          )}

          {/* My Feedback (what I gave to partner) */}
          {session.myFeedback ? (
            <FeedbackBlock
              title="Đánh giá bạn đã gửi"
              subtitle={`Bạn đã đánh giá ${session.partner.name}`}
              feedback={session.myFeedback}
              accentColor="blue"
            />
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 border border-white/5">
              <Tag className="w-5 h-5 text-zinc-600 shrink-0" />
              <p className="text-sm text-zinc-500">Bạn đã bỏ qua đánh giá cho phiên này.</p>
            </div>
          )}
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
    <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
      <div className="text-center">
        <p className="text-2xl font-bold text-white">{sessions.length}</p>
        <p className="text-xs text-zinc-500">Phiên luyện</p>
      </div>
      <div className="text-center border-x border-white/5">
        <p className="text-2xl font-bold text-white">
          {totalDuration >= 3600
            ? `${(totalDuration / 3600).toFixed(1)}h`
            : `${Math.floor(totalDuration / 60)}m`}
        </p>
        <p className="text-xs text-zinc-500">Tổng thời gian</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-400">
          {avgScore > 0 ? avgScore.toFixed(1) : "—"}
        </p>
        <p className="text-xs text-zinc-500">Band TB</p>
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
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Quay lại</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">Lịch sử luyện tập</h1>
              <p className="text-xs text-zinc-500">
                {sessions.length} phiên đã hoàn thành
              </p>
            </div>
          </div>
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
            <p className="text-sm text-zinc-500">Đang tải lịch sử...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={() => refresh()}
              className="text-sm text-blue-400 hover:underline"
            >
              Thử lại
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">Chưa có phiên luyện tập nào</p>
            <p className="text-sm text-zinc-600 mt-1">
              Bắt đầu luyện tập để thấy lịch sử ở đây!
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
                  <p className="text-zinc-500">Không tìm thấy phiên nào</p>
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

