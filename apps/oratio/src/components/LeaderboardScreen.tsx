"use client";

import { useState, useEffect, useCallback } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/actions/leaderboard";
import LoadingSpinner from "./LoadingSpinner";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

interface LeaderboardScreenProps {
  onBack: () => void;
}

type Timeframe = "weekly" | "monthly" | "allTime";

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
      aria-pressed={active}
      className={`px-3 sm:px-4 lg:px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${active
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

function formatMinutes(minutes: number) {
  return `${new Intl.NumberFormat("vi-VN").format(minutes)} phút`;
}

// User Row Component
function UserRow({ user, index }: { user: LeaderboardEntry; index: number }) {
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all ${user.isCurrentUser
          ? "bg-gradient-to-r from-[#80c0f4]/10 to-[#add5f5]/10 border border-[#80c0f4]/30"
          : "bg-zinc-900/40 border border-transparent hover:bg-zinc-900/60"
        }`}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Rank */}
      <div className="shrink-0">
        <RankBadge rank={user.rank} />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-[#80c0f4] to-[#add5f5]">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-semibold text-white truncate">
                {user.username}
                {user.isCurrentUser && (
                  <span className="ml-2 text-xs text-[#80c0f4]">(Bạn)</span>
                )}
              </p>
              {user.current_streak >= 7 && (
                <div className="flex shrink-0 items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/20">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">
                    {user.current_streak}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              Band {user.current_band.toFixed(1)} &bull; {user.sessions} buổi
            </p>
          </div>
        </div>
      </div>

      {/* Minutes */}
      <div className="shrink-0 text-right">
        <p className="text-base sm:text-lg font-bold text-[#80c0f4]">
          {formatMinutes(user.minutes)}
        </p>
      </div>
    </div>
  );
}

// Top 3 Podium Component
function TopThreePodium({ users }: { users: LeaderboardEntry[] }) {
  const [first, second, third] = users;

  return (
    <div className="flex items-end justify-center gap-2 lg:gap-4 mb-8">
      {/* Second Place */}
      <div className="flex flex-col items-center">
        {second && (
          <>
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-lg shadow-zinc-400/20 mb-2">
              {second.username.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-white mb-1 truncate max-w-[80px]">
              {second.username}
            </p>
            <p className="text-xs text-zinc-500 mb-2">Band {second.current_band.toFixed(1)}</p>
          </>
        )}
        <div className="w-[88px] sm:w-20 lg:w-24 h-20 rounded-t-xl bg-gradient-to-b from-zinc-600 to-zinc-700 flex items-center justify-center">
          <div className="text-center">
            <Medal className="w-6 h-6 text-zinc-300 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{second ? formatMinutes(second.minutes) : "—"}</p>
          </div>
        </div>
      </div>

      {/* First Place */}
      <div className="flex flex-col items-center -mt-4">
        {first && (
          <>
            <div className="relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold shadow-lg shadow-amber-500/30 mb-2 ring-4 ring-amber-400/30 mt-6">
                {first.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <p className="text-sm font-semibold text-white mb-1 truncate max-w-[80px]">
              {first.username}
            </p>
            <p className="text-xs text-zinc-500 mb-2">Band {first.current_band.toFixed(1)}</p>
          </>
        )}
        <div className="w-[92px] sm:w-24 lg:w-28 h-28 rounded-t-xl bg-gradient-to-b from-amber-500 to-amber-600 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-8 h-8 text-white mx-auto mb-1" />
            <p className="text-base font-bold text-white">{first ? formatMinutes(first.minutes) : "—"}</p>
          </div>
        </div>
      </div>

      {/* Third Place */}
      <div className="flex flex-col items-center">
        {third && (
          <>
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-lg shadow-amber-700/20 mb-2">
              {third.username.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-white mb-1 truncate max-w-[80px]">
              {third.username}
            </p>
            <p className="text-xs text-zinc-500 mb-2">Band {third.current_band.toFixed(1)}</p>
          </>
        )}
        <div className="w-[88px] sm:w-20 lg:w-24 h-16 rounded-t-xl bg-gradient-to-b from-amber-700 to-amber-800 flex items-center justify-center">
          <div className="text-center">
            <Medal className="w-5 h-5 text-amber-300 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{third ? formatMinutes(third.minutes) : "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Leaderboard Screen Component
export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [activeTab, setActiveTab] = useState<Timeframe>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const changeTab = useCallback((tab: Timeframe) => {
    setIsLoading(true);
    setError(null);
    setActiveTab(tab);
  }, []);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  // Fetch leaderboard data whenever the timeframe changes
  useEffect(() => {
    let cancelled = false;

    async function fetchLeaderboard() {
      try {
        const { data, error: fetchError } = await getLeaderboard(activeTab, 50);
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError);
          setEntries([]);
        } else {
          setEntries(data);
        }
      } catch {
        if (cancelled) return;
        setError("Không thể kết nối. Vui lòng thử lại.");
        setEntries([]);
      }
      setIsLoading(false);
    }

    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [activeTab, reloadKey]);

  const currentUserData = entries.find((u) => u.isCurrentUser);
  const topThree = entries.slice(0, 3);
  const restOfList = entries.slice(3);

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
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                Bảng xếp hạng
              </h1>
              <p className="text-xs text-zinc-500">Xếp theo số phút luyện nói</p>
            </div>
          </div>
          <div className="w-10 sm:w-24 shrink-0" /> {/* Spacer */}
        </header>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <TabButton
            label="Tuần này"
            active={activeTab === "weekly"}
            onClick={() => changeTab("weekly")}
          />
          <TabButton
            label="30 ngày"
            active={activeTab === "monthly"}
            onClick={() => changeTab("monthly")}
          />
          <TabButton
            label="Tất cả"
            active={activeTab === "allTime"}
            onClick={() => changeTab("allTime")}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="md" message="Đang tải bảng xếp hạng..." />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-20" role="alert">
            <p className="text-red-400 mb-2">Không tải được bảng xếp hạng</p>
            <p className="text-sm text-zinc-500 mb-4">{error}</p>
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all text-sm font-medium text-zinc-300 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && entries.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">Chưa ai luyện trong khoảng này.</p>
          </div>
        )}

        {/* Leaderboard Content */}
        {!isLoading && !error && entries.length > 0 && (
          <>
            {/* Your rank summary */}
            <div className="sticky top-2 z-10 mb-6 p-4 rounded-2xl bg-zinc-950/90 backdrop-blur border border-[#80c0f4]/30 text-sm">
              {currentUserData ? (
                <p className="text-white">
                  Hạng của bạn:{" "}
                  <span className="font-bold text-[#80c0f4]">#{currentUserData.rank}</span>
                  <span className="text-zinc-400">
                    {" "}
                    &bull; {formatMinutes(currentUserData.minutes)} &bull; {currentUserData.sessions} buổi
                  </span>
                </p>
              ) : (
                <p className="text-zinc-400">
                  Bạn chưa có mặt trong bảng này – luyện một buổi (ít nhất 1 phút) để lên bảng.
                </p>
              )}
            </div>

            {/* Top 3 Podium */}
            <TopThreePodium users={topThree} />

            {/* Rest of Leaderboard */}
            <div className="space-y-3">
              {restOfList.map((user, index) => (
                <UserRow key={user.id} user={user} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
