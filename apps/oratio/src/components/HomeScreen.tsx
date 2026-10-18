"use client";

import { prefetchCallHistory, useCallHistory } from "@/hooks/useCallHistory";
import { useOnlineCount } from "@/hooks/useOnlineCount";
import type { Profile } from "@/lib/types/database";
import {
  Mic,
  Users,
  Trophy,
  Settings,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Award,
  History,
  ChevronRight,
  Home,
  User as UserIcon,
  X,
} from "lucide-react";

type CallSession = ReturnType<typeof useCallHistory>["sessions"][number];
type Screen = "leaderboard" | "achievements" | "partners" | "profile" | "history";

interface HomeScreenProps {
  profile: Profile | null;
  onStartMatching: () => void;
  onStartSolo: () => void;
  onNavigate: (screen: Screen) => void;
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

// Enhanced Stat Card with subtle accent
function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  accentColor,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: React.ElementType;
  accentColor?: string;
}) {
  return (
    <div className="group relative min-w-0">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {label}
          </div>
          {Icon && (
            <div className={`p-1.5 rounded-md bg-gradient-to-br ${accentColor || 'from-[#80c0f4]/10 to-[#add5f5]/10'} transition-transform duration-300`}>
              <Icon className="w-3.5 h-3.5 text-[#80c0f4]" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#fffcff] tabular-nums">{value}</span>
          {unit && <span className="text-sm text-zinc-500">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// Recent Session Row with colored accent
function SessionRow({
  topic,
  duration,
  score,
  date,
}: {
  topic: string;
  duration: string;
  score: number | null;
  date: string;
}) {
  const getScoreColor = (s: number) => {
    if (s >= 7) return "text-emerald-400";
    if (s >= 6) return "text-[#80c0f4]";
    return "text-amber-400";
  };

  return (
    <div className="group relative flex items-center justify-between gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.05] rounded-lg transition-all duration-300">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#80c0f4] to-[#add5f5] rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-300 truncate group-hover:text-[#fffcff] transition-colors duration-200">
          {topic}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
          <span className="text-xs text-zinc-500">{date}</span>
          <span className="text-xs text-zinc-500" aria-hidden="true">·</span>
          <span className="text-xs text-zinc-500">{duration}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        {score !== null ? (
          <>
            <div className="flex items-baseline justify-end gap-1">
              <span className={`text-sm font-semibold ${getScoreColor(score)} tabular-nums`}>{score}</span>
              <span className="text-xs text-zinc-500">/9</span>
            </div>
            <p className="text-xs text-zinc-500">Bạn được chấm</p>
          </>
        ) : (
          <p className="text-xs text-zinc-400">Chờ đánh giá</p>
        )}
      </div>
    </div>
  );
}

// Navigation Link with colored icon
function NavLink({
  icon: Icon,
  label,
  onClick,
  onMouseEnter,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  onMouseEnter?: () => void;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-300 group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg || 'bg-zinc-800/50'} transition-all duration-300`}>
          <Icon className={`w-4 h-4 ${iconColor || 'text-zinc-500'}`} aria-hidden="true" />
        </div>
        <span className="text-sm font-medium text-zinc-400 group-hover:text-[#fffcff] transition-colors duration-200">
          {label}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#80c0f4] group-hover:translate-x-0.5 transition-all duration-300" aria-hidden="true" />
    </button>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
}

function formatDuration(seconds: number) {
  return `${Math.max(1, Math.round(seconds / 60))} phút`;
}

// Main Home Screen Component
export default function HomeScreen({
  profile,
  onStartMatching,
  onStartSolo,
  onNavigate,
  bandRange,
  onBandRangeChange,
  notice,
  onDismissNotice,
}: HomeScreenProps) {
  const { sessions, isLoading: sessionsLoading } = useCallHistory();
  const { count: onlineCount } = useOnlineCount();

  const totalSessions = profile?.total_sessions || 0;
  const currentBand = profile?.current_band || 0;
  const totalMinutes = profile?.total_minutes || 0;
  const currentStreak = profile?.current_streak || 0;

  const recentSessions = sessions.slice(0, 3);

  const mobileNav: { key: Screen; label: string; icon: React.ElementType }[] = [
    { key: "history", label: "Lịch sử", icon: Clock },
    { key: "leaderboard", label: "Xếp hạng", icon: Trophy },
    { key: "achievements", label: "Thành tích", icon: Award },
    { key: "partners", label: "Bạn luyện", icon: Users },
    { key: "profile", label: "Hồ sơ", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8 lg:py-12 pb-32 lg:pb-12">

        {notice && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 mb-6 px-4 py-3 rounded-xl bg-[#80c0f4]/10 border border-[#80c0f4]/30"
          >
            <p className="text-sm text-[#fffcff]">{notice}</p>
            {onDismissNotice && (
              <button
                onClick={onDismissNotice}
                aria-label="Đóng thông báo"
                className="p-1 -m-1 rounded-md text-zinc-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between gap-3 mb-10 lg:mb-16 animate-[fade-in_0.5s_ease-out]">
          <div className="min-w-0">
            <h1 className="text-3xl lg:text-4xl font-[family-name:var(--font-gugi)] text-[#fffcff] tracking-wide">
              ORATIO
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Luyện IELTS Speaking với bạn thật</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate("profile")}
              aria-label="Hồ sơ"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Settings className="w-5 h-5 text-zinc-400" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column - Primary Action */}
          <div className="lg:col-span-7 space-y-8">

            {/* Start Practice Section */}
            <div className="space-y-6 p-5 sm:p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-sm border border-white/15 relative animate-[slide-up_0.5s_ease-out_0.05s_both]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div>
                <h2 className="text-2xl lg:text-3xl font-semibold text-[#fffcff] mb-2">
                  Luyện nói
                </h2>
                <p className="text-zinc-400 text-base">
                  Ghép cặp với một người học khác để luyện IELTS Speaking theo lượt
                </p>
              </div>

              {/* Band Range Selector */}
              <div className="space-y-3" role="group" aria-labelledby="partner-band-label">
                <span id="partner-band-label" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Muốn luyện với bạn band
                </span>
                <div className="flex flex-wrap gap-2">
                  {BAND_OPTIONS.map((opt) => {
                    const selected = bandRange.min === opt.min && bandRange.max === opt.max;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => onBandRangeChange({ min: opt.min, max: opt.max })}
                        aria-pressed={selected}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selected
                          ? "bg-gradient-to-br from-[#80c0f4] to-[#add5f5] text-[#050505] shadow-lg shadow-[#80c0f4]/20"
                          : "bg-zinc-900/80 backdrop-blur-sm text-zinc-400 hover:bg-zinc-800 border border-white/15 hover:border-white/20"
                          }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-zinc-500">Chờ lâu thì app sẽ ghép với bạn band khác.</p>
              </div>

              {/* Start Button */}
              <button
                onClick={onStartMatching}
                className="relative w-full group overflow-hidden rounded-xl shadow-lg shadow-[#80c0f4]/20 hover:shadow-xl hover:shadow-[#80c0f4]/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#80c0f4] to-[#add5f5] transition-transform group-hover:scale-105 duration-300" />
                <div className="relative flex items-center justify-center gap-3 px-6 py-4 font-semibold text-base text-[#050505]">
                  <Mic className="w-5 h-5" aria-hidden="true" />
                  <span>Bắt đầu ghép cặp</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </button>

              {/* Online Status */}
              <div className="flex items-center gap-2 text-sm text-zinc-400 justify-center text-center">
                <div className="relative shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span>
                  {onlineCount > 0
                    ? `${onlineCount} người đang chờ ghép`
                    : "Chưa có ai đang chờ – bạn có thể luyện một mình trước"}
                </span>
              </div>

              {/* Solo practice */}
              <button
                onClick={onStartSolo}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-900/80 border border-white/15 hover:bg-zinc-800 hover:border-white/25 transition-all duration-300 text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#fffcff]">Luyện một mình</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Tự luyện 8 câu, ghi âm và nghe lại</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" aria-hidden="true" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Recent Sessions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Buổi luyện gần đây
                </h3>
                <button
                  onClick={() => onNavigate("history")}
                  onMouseEnter={() => prefetchCallHistory()}
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="space-y-1 p-3 rounded-2xl bg-zinc-900/75 backdrop-blur-sm border border-white/15 shadow-xl shadow-black/20 relative animate-[slide-up_0.5s_ease-out_0.15s_both]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                {sessionsLoading ? (
                  <div className="py-8 text-center text-sm text-zinc-400">
                    Đang tải...
                  </div>
                ) : recentSessions.length > 0 ? (
                  recentSessions.map((session: CallSession) => (
                    <SessionRow
                      key={session.id}
                      topic={session.topic || `Luyện cùng ${session.partner.name}`}
                      duration={formatDuration(session.duration)}
                      score={session.peerFeedback?.overallBand ?? null}
                      date={formatDate(session.date)}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-zinc-400 mb-1">Chưa có buổi luyện nào</p>
                    <p className="text-xs text-zinc-500">Bắt đầu luyện để xem lịch sử ở đây.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Navigation */}
          <div className="lg:col-span-5 space-y-8">

            {/* Stats Grid */}
            <div className="relative grid grid-cols-2 gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 backdrop-blur-sm border border-white/15 shadow-2xl shadow-black/30 animate-[slide-up_0.5s_ease-out_0.1s_both]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <StatCard
                label="Buổi luyện"
                value={totalSessions.toString()}
                icon={Clock}
                accentColor="from-[#80c0f4]/10 to-[#add5f5]/10"
              />
              <StatCard
                label="Thời gian"
                value={totalMinutes >= 60 ? (Math.round((totalMinutes / 60) * 10) / 10).toString() : totalMinutes.toString()}
                unit={totalMinutes >= 60 ? "giờ" : "phút"}
                icon={TrendingUp}
                accentColor="from-amber-500/10 to-orange-500/10"
              />
              <StatCard
                label="Chuỗi ngày"
                value={currentStreak.toString()}
                unit="ngày"
                icon={Award}
                accentColor="from-violet-500/10 to-purple-500/10"
              />
            </div>

            {/* Current Band */}
            <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-zinc-900/90 backdrop-blur-sm border border-white/15 shadow-2xl shadow-black/30 animate-[scale-in_0.5s_ease-out_0.2s_both]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div
                className="absolute top-0 right-0 w-48 h-48 blur-2xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(128, 192, 244, 0.1) 0%, transparent 70%)'
                }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Band hiện tại
                  </div>
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-[#80c0f4]/10 to-[#add5f5]/10">
                    <Target className="w-4 h-4 text-[#80c0f4]" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#fffcff] tabular-nums">{currentBand.toFixed(1)}</span>
                  <span className="text-lg text-zinc-500">/9.0</span>
                </div>
                <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#80c0f4] to-[#add5f5] rounded-full shadow-lg shadow-[#80c0f4]/30 transition-all duration-1000 ease-out"
                    style={{ width: `${(currentBand / 9) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation (desktop) */}
            <div className="hidden lg:block space-y-0.5 p-3 rounded-2xl bg-zinc-900/75 backdrop-blur-sm border border-white/15 shadow-xl shadow-black/20 relative animate-[fade-in_0.5s_ease-out_0.3s_both]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <NavLink
                icon={History}
                label="Lịch sử"
                onClick={() => onNavigate("history")}
                onMouseEnter={() => prefetchCallHistory()}
                iconBg="bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
                iconColor="text-emerald-400"
              />
              <NavLink
                icon={Trophy}
                label="Xếp hạng"
                onClick={() => onNavigate("leaderboard")}
                iconBg="bg-gradient-to-br from-amber-500/10 to-orange-500/10"
                iconColor="text-amber-400"
              />
              <NavLink
                icon={Award}
                label="Thành tích"
                onClick={() => onNavigate("achievements")}
                iconBg="bg-gradient-to-br from-violet-500/10 to-purple-500/10"
                iconColor="text-violet-400"
              />
              <NavLink
                icon={Users}
                label="Bạn luyện cùng"
                onClick={() => onNavigate("partners")}
                iconBg="bg-gradient-to-br from-[#80c0f4]/10 to-[#add5f5]/10"
                iconColor="text-[#80c0f4]"
              />
              <NavLink
                icon={UserIcon}
                label="Hồ sơ"
                onClick={() => onNavigate("profile")}
                iconBg="bg-gradient-to-br from-pink-500/10 to-rose-500/10"
                iconColor="text-pink-400"
              />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav
          aria-label="Điều hướng"
          className="fixed bottom-0 left-0 right-0 lg:hidden px-4 pb-6 pt-4 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent"
        >
          <div className="flex items-center justify-around gap-0.5 py-3 px-1 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10">
            <div aria-current="page" className="flex flex-col items-center gap-1 px-1 py-2 min-w-0 flex-1">
              <Home className="w-5 h-5 text-[#fffcff]" aria-hidden="true" />
              <span className="text-[11px] font-medium text-[#fffcff]">Home</span>
            </div>
            {mobileNav.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                onMouseEnter={key === "history" ? () => prefetchCallHistory() : undefined}
                className="flex flex-col items-center gap-1 px-1 py-2 min-w-0 flex-1"
              >
                <Icon className="w-5 h-5 text-zinc-400" aria-hidden="true" />
                <span className="text-[11px] font-medium text-zinc-400 truncate max-w-full">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
