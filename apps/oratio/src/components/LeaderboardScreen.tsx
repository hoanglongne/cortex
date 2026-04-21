"use client";

import { useState, useEffect } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/actions/leaderboard";
import { useSupabaseAuth } from "@/hooks/useSupabase";
import LoadingSpinner from "./LoadingSpinner";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Clock,
  Target,
  Mic,
} from "lucide-react";

interface LeaderboardScreenProps {
  onBack: () => void;
}

interface LeaderboardUser {
  rank: number;
  previousRank: number;
  name: string;
  avatar?: string;
  band: string;
  score: number;
  sessions: number;
  streak: number;
  isCurrentUser?: boolean;
}

// Tab Button Component
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 lg:px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${active
          ? "bg-[#80c0f4] text-white"
          : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
        }`}
    >
      {label}
    </button>
  );
}

// Rank Badge Component
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
        <Crown className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 flex items-center justify-center shadow-lg shadow-zinc-400/30">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-700/30">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
      <span className="text-sm font-bold text-zinc-400">{rank}</span>
    </div>
  );
}

// Rank Change Indicator
function RankChange({ current, previous }: { current: number; previous: number }) {
  const diff = previous - current;
  if (diff > 0) {
    return (
      <div className="flex items-center gap-0.5 text-emerald-400">
        <TrendingUp className="w-3 h-3" />
        <span className="text-xs font-medium">{diff}</span>
      </div>
    );
  }
  if (diff < 0) {
    return (
      <div className="flex items-center gap-0.5 text-red-400">
        <TrendingDown className="w-3 h-3" />
        <span className="text-xs font-medium">{Math.abs(diff)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center text-zinc-600">
      <Minus className="w-3 h-3" />
    </div>
  );
}

// User Row Component
function UserRow({ user, index }: { user: LeaderboardUser; index: number }) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${user.isCurrentUser
          ? "bg-gradient-to-r from-[#80c0f4]/10 to-[#add5f5]/10 border border-[#80c0f4]/30"
          : "bg-zinc-900/40 border border-transparent hover:bg-zinc-900/60"
        }`}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Rank */}
      <div className="flex items-center gap-3 w-20">
        <RankBadge rank={user.rank} />
        <RankChange current={user.rank} previous={user.previousRank} />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${user.rank === 1
                ? "bg-gradient-to-br from-amber-400 to-orange-500"
                : user.rank === 2
                  ? "bg-gradient-to-br from-zinc-400 to-zinc-600"
                  : user.rank === 3
                    ? "bg-gradient-to-br from-amber-600 to-amber-800"
                    : "bg-gradient-to-br from-[#80c0f4] to-[#add5f5]"
              }`}
          >
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white truncate">
                {user.name}
                {user.isCurrentUser && (
                  <span className="ml-2 text-xs text-[#80c0f4]">(You)</span>
                )}
              </p>
              {user.streak >= 7 && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/20">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">
                    {user.streak}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500">Band {user.band}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{user.sessions}</p>
          <p className="text-xs text-zinc-500">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#80c0f4]">{user.score}</p>
          <p className="text-xs text-zinc-500">Points</p>
        </div>
      </div>

      {/* Mobile Score */}
      <div className="sm:hidden text-right">
        <p className="text-lg font-bold text-[#80c0f4]">{user.score}</p>
        <p className="text-xs text-zinc-500">pts</p>
      </div>
    </div>
  );
}

// Top 3 Podium Component
function TopThreePodium({ users }: { users: LeaderboardUser[] }) {
  const [first, second, third] = users;

  return (
    <div className="flex items-end justify-center gap-2 lg:gap-4 mb-8">
      {/* Second Place */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-lg shadow-zinc-400/20 mb-2">
          {second?.name.charAt(0)}
        </div>
        <p className="text-sm font-semibold text-white mb-1 truncate max-w-[80px]">
          {second?.name}
        </p>
        <p className="text-xs text-zinc-500 mb-2">Band {second?.band}</p>
        <div className="w-20 lg:w-24 h-20 rounded-t-xl bg-gradient-to-b from-zinc-600 to-zinc-700 flex items-center justify-center">
          <div className="text-center">
            <Medal className="w-6 h-6 text-zinc-300 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{second?.score}</p>
          </div>
        </div>
      </div>

      {/* First Place */}
      <div className="flex flex-col items-center -mt-4">
        <div className="relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold shadow-lg shadow-amber-500/30 mb-2 ring-4 ring-amber-400/30">
            {first?.name.charAt(0)}
          </div>
        </div>
        <p className="text-sm font-semibold text-white mb-1 truncate max-w-[80px]">
          {first?.name}
        </p>
        <p className="text-xs text-zinc-500 mb-2">Band {first?.band}</p>
        <div className="w-24 lg:w-28 h-28 rounded-t-xl bg-gradient-to-b from-amber-500 to-amber-600 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-8 h-8 text-white mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{first?.score}</p>
          </div>
        </div>
      </div>

      {/* Third Place */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-lg shadow-amber-700/20 mb-2">
          {third?.name.charAt(0)}
        </div>
        <p className="text-sm font-semibold text-white mb-1 truncate max-w-[80px]">
          {third?.name}
        </p>
        <p className="text-xs text-zinc-500 mb-2">Band {third?.band}</p>
        <div className="w-20 lg:w-24 h-16 rounded-t-xl bg-gradient-to-b from-amber-700 to-amber-800 flex items-center justify-center">
          <div className="text-center">
            <Medal className="w-5 h-5 text-amber-300 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{third?.score}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Leaderboard Screen Component
export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "allTime">("weekly");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await getLeaderboard(
        activeTab,
        50,
        user?.id
      );

      if (fetchError) {
        setError(fetchError);
        setIsLoading(false);
        return;
      }

      // Convert LeaderboardEntry to LeaderboardUser format
      const formattedData: LeaderboardUser[] = data.map((entry) => ({
        rank: entry.rank,
        previousRank: entry.rank, // TODO: Store historical ranks for real comparison
        name: entry.username,
        avatar: entry.avatar_url || undefined,
        band: entry.current_band.toFixed(1),
        score: entry.score,
        sessions: entry.total_sessions,
        streak: entry.current_streak,
        isCurrentUser: entry.isCurrentUser,
      }));

      setLeaderboardData(formattedData);
      setIsLoading(false);
    }

    fetchLeaderboard();
  }, [activeTab, user?.id]);

  // Get current user's data for stats
  const currentUserData = leaderboardData.find((u) => u.isCurrentUser);
  const nextRank = currentUserData
    ? leaderboardData.find((u) => u.rank === currentUserData.rank - 1)
    : null;
  const pointsToNext = nextRank && currentUserData
    ? nextRank.score - currentUserData.score
    : 0;

  const topThree = leaderboardData.slice(0, 3);
  const restOfList = leaderboardData.slice(3);

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
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                Leaderboard
              </h1>
              <p className="text-xs text-zinc-500">Top IELTS Speakers</p>
            </div>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </header>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <TabButton
            label="This Week"
            active={activeTab === "weekly"}
            onClick={() => setActiveTab("weekly")}
          />
          <TabButton
            label="This Month"
            active={activeTab === "monthly"}
            onClick={() => setActiveTab("monthly")}
          />
          <TabButton
            label="All Time"
            active={activeTab === "allTime"}
            onClick={() => setActiveTab("allTime")}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="md" message="Loading leaderboard..." />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-2">Failed to load leaderboard</p>
            <p className="text-sm text-zinc-500">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && leaderboardData.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 mb-2">No data yet</p>
            <p className="text-sm text-zinc-500">Be the first to practice and climb the ranks!</p>
          </div>
        )}

        {/* Leaderboard Content */}
        {!isLoading && !error && leaderboardData.length > 0 && (
          <>
            {/* Top 3 Podium */}
            <TopThreePodium users={topThree} />

            {/* Your Rank Card (if not in top 10) */}
            <div className="hidden mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#80c0f4]/10 to-[#add5f5]/10 border border-[#80c0f4]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center text-white font-bold">
                    Y
                  </div>
                  <div>
                    <p className="font-semibold text-white">Your Rank</p>
                    <p className="text-sm text-zinc-400">#7 • 2,050 points</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400">To reach #6</p>
                  <p className="text-lg font-bold text-[#80c0f4]">+130 pts</p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            {currentUserData && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-center">
                  <Target className="w-5 h-5 text-[#80c0f4] mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">
                    {currentUserData.rank === 1
                      ? "1st"
                      : currentUserData.rank === 2
                        ? "2nd"
                        : currentUserData.rank === 3
                          ? "3rd"
                          : `${currentUserData.rank}th`}
                  </p>
                  <p className="text-xs text-zinc-500">Your Rank</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-center">
                  <Mic className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{currentUserData.sessions}</p>
                  <p className="text-xs text-zinc-500">Sessions</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-center">
                  <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">
                    {pointsToNext > 0 ? `+${pointsToNext}` : "—"}
                  </p>
                  <p className="text-xs text-zinc-500">To Next Rank</p>
                </div>
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="space-y-3">
              {restOfList.map((user, index) => (
                <UserRow key={user.rank} user={user} index={index} />
              ))}
            </div>

            {/* Load More - Hidden for now since we load all at once */}
            {/* 
        <div className="mt-6 text-center">
          <button className="px-6 py-3 rounded-xl bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all text-sm font-medium">
            Load More
          </button>
        </div>
        */}
          </>
        )}
      </div>
    </div>
  );
}

