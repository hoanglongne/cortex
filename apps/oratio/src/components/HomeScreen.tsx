"use client";

import { useState } from "react";
import { prefetchCallHistory, useCallHistory } from "@/hooks/useCallHistory";
import { useOnlineCount } from "@/hooks/useOnlineCount";
import type { Profile } from "@/lib/types/database";
import {
  Mic,
  Users,
  BookOpen,
  Trophy,
  Settings,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Award,
  History,
  ChevronRight,
} from "lucide-react";

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

interface HomeScreenProps {
  profile: Profile | null;
  onStartMatching: () => void;
  onNavigate?: (screen: "leaderboard" | "achievements" | "friends" | "profile" | "history") => void;
  onBandRangeChange?: (range: string) => void;
}

// Enhanced Stat Card with subtle accent
function StatCard({
  label,
  value,
  unit,
  trend,
  icon: Icon,
  accentColor,
}: {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  icon?: React.ElementType;
  accentColor?: string;
}) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {label}
          </div>
          {Icon && (
            <div className={`p-1.5 rounded-md bg-gradient-to-br ${accentColor || 'from-[#80c0f4]/10 to-[#add5f5]/10'} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-3.5 h-3.5 text-[#80c0f4]" />
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#fffcff] tabular-nums group-hover:scale-105 transition-transform duration-300">{value}</span>
          {unit && <span className="text-sm text-zinc-600">{unit}</span>}
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
            <TrendingUp className="w-3 h-3 group-hover:translate-y-[-2px] transition-transform duration-300" />
            <span>{trend}</span>
          </div>
        )}
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
  score: number;
  date: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-emerald-400";
    if (score >= 6) return "text-[#80c0f4]";
    return "text-amber-400";
  };

  return (
    <div className="group relative flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.05] rounded-lg transition-all duration-300">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#80c0f4] to-[#add5f5] rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-300 truncate group-hover:text-[#fffcff] transition-colors duration-200">
          {topic}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors duration-200">{date}</span>
          <span className="text-xs text-zinc-600">·</span>
          <span className="text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors duration-200">{duration}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${getScoreColor(score)} tabular-nums group-hover:scale-110 transition-transform duration-200`}>{score}</span>
        <span className="text-xs text-zinc-600">/9</span>
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
  onClick?: () => void;
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
        <div className={`p-2 rounded-lg ${iconBg || 'bg-zinc-800/50'} group-hover:scale-105 transition-all duration-300`}>
          <Icon className={`w-4 h-4 ${iconColor || 'text-zinc-500'} group-hover:rotate-12 transition-transform duration-300`} />
        </div>
        <span className="text-sm font-medium text-zinc-400 group-hover:text-[#fffcff] transition-colors duration-200">
          {label}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-[#80c0f4] group-hover:translate-x-0.5 transition-all duration-300" />
    </button>
  );
}

// Main Home Screen Component
export default function HomeScreen({ profile, onStartMatching, onNavigate, onBandRangeChange }: HomeScreenProps) {
  const [selectedBandRange, setSelectedBandRange] = useState("5.5-6.5");
  const { sessions, isLoading: sessionsLoading } = useCallHistory();
  const { count: onlineCount } = useOnlineCount();

  const handleBandRangeChange = (range: string) => {
    setSelectedBandRange(range);
    onBandRangeChange?.(range);
  };

  const bandRanges = ["5.0-5.5", "5.5-6.5", "6.5-7.5", "7.5+"];

  // Extract stats from profile with fallbacks
  const totalSessions = profile?.total_sessions || 0;
  const avgBand = profile?.current_band || 0;
  const totalHours = profile?.total_minutes ? Math.round((profile.total_minutes / 60) * 10) / 10 : 0;
  const currentStreak = profile?.current_streak || 0;
  const currentBand = profile?.current_band || 0;

  // Get recent 3 sessions
  const recentSessions = sessions.slice(0, 3);

  // Format date helper
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format duration from seconds to readable string
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8 lg:py-12 pb-32 lg:pb-12">

        {/* Header */}
        <header className="flex items-center justify-between mb-12 lg:mb-16 animate-[fade-in_0.5s_ease-out]">
          <div>
            <h1 className="text-3xl lg:text-4xl font-[family-name:var(--font-gugi)] text-[#fffcff] tracking-wide">
              ORATIO
            </h1>
            <p className="text-sm text-zinc-600 mt-1">Master IELTS Speaking with peers worldwide</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.("profile")}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors hover:rotate-90 duration-300"
            >
              <Settings className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column - Primary Action */}
          <div className="lg:col-span-7 space-y-8">

            {/* Start Practice Section */}
            <div className="space-y-6 p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-sm border border-white/15 relative animate-[slide-up_0.5s_ease-out_0.05s_both]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div>
                <h2 className="text-2xl lg:text-3xl font-semibold text-[#fffcff] mb-2">
                  Practice Speaking
                </h2>
                <p className="text-zinc-500 text-base">
                  Match with learners worldwide for real IELTS practice
                </p>
              </div>

              {/* Band Range Selector */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  Target Band Range
                </label>
                <div className="flex gap-2">
                  {bandRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => handleBandRangeChange(range)}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedBandRange === range
                        ? "bg-gradient-to-br from-[#80c0f4] to-[#add5f5] text-[#050505] shadow-lg shadow-[#80c0f4]/20 scale-105"
                        : "bg-zinc-900/80 backdrop-blur-sm text-zinc-500 hover:bg-zinc-800 border border-white/15 hover:border-white/20 hover:scale-105"
                        }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={onStartMatching}
                className="relative w-full group overflow-hidden rounded-xl shadow-lg shadow-[#80c0f4]/20 hover:shadow-xl hover:shadow-[#80c0f4]/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#80c0f4] to-[#add5f5] transition-transform group-hover:scale-105 duration-300" />
                <div className="relative flex items-center justify-center gap-3 px-6 py-4 font-semibold text-base text-[#050505]">
                  <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Start Matching</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Online Status */}
              <div className="flex items-center gap-2 text-sm text-zinc-600 justify-center">
                <div className="relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span>{onlineCount > 0 ? `${onlineCount} learner${onlineCount !== 1 ? 's' : ''} waiting for match` : 'No one waiting'}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Recent Sessions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  Recent Sessions
                </h3>
                <button
                  onClick={() => onNavigate?.("history")}
                  onMouseEnter={() => prefetchCallHistory()}
                  className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  View all
                </button>
              </div>
              <div className="space-y-1 p-3 rounded-2xl bg-zinc-900/75 backdrop-blur-sm border border-white/15 shadow-xl shadow-black/20 relative animate-[slide-up_0.5s_ease-out_0.15s_both]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                {sessionsLoading ? (
                  <div className="py-8 text-center text-sm text-zinc-600">
                    Loading sessions...
                  </div>
                ) : recentSessions.length > 0 ? (
                  recentSessions.map((session: CallSession) => (
                    <SessionRow
                      key={session.id}
                      topic={session.topic || "IELTS Practice Session"}
                      duration={formatDuration(session.duration)}
                      score={session.myFeedback?.overallBand || 0}
                      date={formatDate(session.date)}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-zinc-600 mb-1">No sessions yet</p>
                    <p className="text-xs text-zinc-700">Start practicing to see your history!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Navigation */}
          <div className="lg:col-span-5 space-y-8">

            {/* Stats Grid */}
            <div className="relative grid grid-cols-2 gap-6 p-6 rounded-2xl bg-zinc-900/90 backdrop-blur-sm border border-white/15 shadow-2xl shadow-black/30 animate-[slide-up_0.5s_ease-out_0.1s_both]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <StatCard
                label="Sessions"
                value={totalSessions.toString()}
                icon={Clock}
                accentColor="from-[#80c0f4]/10 to-[#add5f5]/10"
              />
              <StatCard
                label="Current Band"
                value={avgBand.toFixed(1)}
                unit="/9"
                icon={Target}
                accentColor="from-emerald-500/10 to-teal-500/10"
              />
              <StatCard
                label="Hours"
                value={totalHours.toString()}
                unit="h"
                icon={TrendingUp}
                accentColor="from-amber-500/10 to-orange-500/10"
              />
              <StatCard
                label="Streak"
                value={currentStreak.toString()}
                unit="days"
                icon={Award}
                accentColor="from-violet-500/10 to-purple-500/10"
              />
            </div>

            {/* Current Band */}
            <div className="relative overflow-hidden p-6 rounded-2xl bg-zinc-900/90 backdrop-blur-sm border border-white/15 shadow-2xl shadow-black/30 animate-[scale-in_0.5s_ease-out_0.2s_both]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div
                className="absolute top-0 right-0 w-48 h-48 blur-2xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(128, 192, 244, 0.1) 0%, transparent 70%)'
                }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    Current Band
                  </div>
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-[#80c0f4]/10 to-[#add5f5]/10 hover:scale-110 transition-transform duration-300">
                    <Target className="w-4 h-4 text-[#80c0f4]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#fffcff] tabular-nums">{currentBand.toFixed(1)}</span>
                  <span className="text-lg text-zinc-600">/9.0</span>
                </div>
                <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#80c0f4] to-[#add5f5] rounded-full shadow-lg shadow-[#80c0f4]/30 transition-all duration-1000 ease-out"
                    style={{ width: `${(currentBand / 9) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-0.5 p-3 rounded-2xl bg-zinc-900/75 backdrop-blur-sm border border-white/15 shadow-xl shadow-black/20 relative animate-[fade-in_0.5s_ease-out_0.3s_both]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <NavLink
                icon={Trophy}
                label="Leaderboard"
                onClick={() => onNavigate?.("leaderboard")}
                iconBg="bg-gradient-to-br from-amber-500/10 to-orange-500/10"
                iconColor="text-amber-400"
              />
              <NavLink
                icon={Award}
                label="Achievements"
                onClick={() => onNavigate?.("achievements")}
                iconBg="bg-gradient-to-br from-violet-500/10 to-purple-500/10"
                iconColor="text-violet-400"
              />
              <NavLink
                icon={Users}
                label="Friends"
                onClick={() => onNavigate?.("friends")}
                iconBg="bg-gradient-to-br from-[#80c0f4]/10 to-[#add5f5]/10"
                iconColor="text-[#80c0f4]"
              />
              <NavLink
                icon={History}
                label="Call History"
                onClick={() => onNavigate?.("history")}
                onMouseEnter={() => prefetchCallHistory()}
                iconBg="bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
                iconColor="text-emerald-400"
              />
              <NavLink
                icon={BookOpen}
                label="Topic Library"
                iconBg="bg-gradient-to-br from-pink-500/10 to-rose-500/10"
                iconColor="text-pink-400"
              />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden px-4 pb-6 pt-4 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent">
          <div className="flex items-center justify-around py-3 px-4 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10">
            <button className="flex flex-col items-center gap-1 px-3 py-2">
              <Mic className="w-5 h-5 text-[#fffcff]" />
              <span className="text-xs font-medium text-[#fffcff]">Home</span>
            </button>
            <button
              onClick={() => onNavigate?.("leaderboard")}
              className="flex flex-col items-center gap-1 px-3 py-2"
            >
              <Trophy className="w-5 h-5 text-zinc-600" />
              <span className="text-xs font-medium text-zinc-600">Ranking</span>
            </button>
            <button
              onClick={() => onNavigate?.("friends")}
              className="flex flex-col items-center gap-1 px-3 py-2"
            >
              <Users className="w-5 h-5 text-zinc-600" />
              <span className="text-xs font-medium text-zinc-600">Friends</span>
            </button>
            <button
              onClick={() => onNavigate?.("history")}
              onMouseEnter={() => prefetchCallHistory()}
              className="flex flex-col items-center gap-1 px-3 py-2"
            >
              <Clock className="w-5 h-5 text-zinc-600" />
              <span className="text-xs font-medium text-zinc-600">History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
