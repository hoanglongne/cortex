"use client";

import { useState, useEffect, useCallback } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/actions/leaderboard";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice } from "@/components/ui/card";
import { FlowShell } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

interface LeaderboardScreenProps {
  onBack: () => void;
}

type Timeframe = "weekly" | "monthly" | "allTime";

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: "weekly", label: "Tuần này" },
  { id: "monthly", label: "30 ngày" },
  { id: "allTime", label: "Tất cả" },
];

function formatMinutes(minutes: number) {
  return new Intl.NumberFormat("vi-VN").format(minutes);
}

function UserRow({ user }: { user: LeaderboardEntry }) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-control)] border px-3 py-3",
        user.isCurrentUser ? "border-onair bg-surface" : "border-transparent"
      )}
    >
      <span className="w-7 shrink-0 text-right font-mono text-sm tabular text-muted">{user.rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-ink">
          {user.username}
          {user.isCurrentUser && <span className="ml-2 text-xs text-onair">Bạn</span>}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs tabular text-subtle">
          Band {user.current_band.toFixed(1)} · {user.sessions} buổi
        </p>
      </div>
      <p className="shrink-0 text-right font-mono text-lg tabular text-ink">
        {formatMinutes(user.minutes)}
        <span className="ml-1 text-xs text-muted">phút</span>
      </p>
    </li>
  );
}

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

  return (
    <FlowShell title="Bảng giờ nói" onBack={onBack}>
      <div role="group" aria-label="Khoảng thời gian" className="grid grid-cols-3 rounded-[var(--radius-control)] border border-line-strong bg-surface p-0.5">
        {TIMEFRAMES.map((t) => (
          <button
            key={t.id}
            onClick={() => changeTab(t.id)}
            aria-pressed={activeTab === t.id}
            className={cn(
              "h-9 rounded-[8px] text-sm transition-colors",
              activeTab === t.id ? "bg-surface-3 text-ink" : "text-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mt-6 space-y-2" aria-busy>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-[var(--radius-control)] bg-surface" />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <Notice tone="error" className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <span>Không tải được bảng. {error}</span>
            <Button variant="secondary" size="sm" onClick={retry}>
              Thử lại
            </Button>
          </div>
        </Notice>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <div className="mt-6">
          <EmptyState title="Chưa ai luyện trong khoảng này" />
        </div>
      )}

      {!isLoading && !error && entries.length > 0 && (
        <>
          <div className="sticky top-0 z-10 mt-4 border-b border-line bg-bg py-3 text-sm">
            {currentUserData ? (
              <p className="text-muted">
                Hạng của bạn <span className="ml-1 font-mono tabular text-onair">#{currentUserData.rank}</span>
                <span className="font-mono tabular">
                  {" "}
                  · {formatMinutes(currentUserData.minutes)} phút · {currentUserData.sessions} buổi
                </span>
              </p>
            ) : (
              <p className="text-muted">Bạn chưa có mặt trong bảng này. Luyện ít nhất 1 phút để lên bảng.</p>
            )}
          </div>
          <ol className="mt-2 space-y-1">
            {entries.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </ol>
        </>
      )}
    </FlowShell>
  );
}
