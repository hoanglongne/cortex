"use client";

import type { Profile } from "@/lib/types/database";
import {
  ArrowLeft,
  Award,
  Clock,
  Flame,
  Mic,
  Star,
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";

interface AchievementsScreenProps {
  profile: Profile | null;
  onBack: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  target: number;
  unit: string;
  value: (p: Profile) => number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-session",
    title: "Buổi đầu tiên",
    description: "Hoàn thành buổi luyện đầu tiên",
    icon: Mic,
    target: 1,
    unit: "buổi",
    value: (p) => p.total_sessions,
  },
  {
    id: "sessions-5",
    title: "Làm quen",
    description: "Hoàn thành 5 buổi luyện",
    icon: Zap,
    target: 5,
    unit: "buổi",
    value: (p) => p.total_sessions,
  },
  {
    id: "sessions-20",
    title: "Đều đặn",
    description: "Hoàn thành 20 buổi luyện",
    icon: Trophy,
    target: 20,
    unit: "buổi",
    value: (p) => p.total_sessions,
  },
  {
    id: "sessions-50",
    title: "Chăm chỉ",
    description: "Hoàn thành 50 buổi luyện",
    icon: Award,
    target: 50,
    unit: "buổi",
    value: (p) => p.total_sessions,
  },
  {
    id: "minutes-60",
    title: "Một giờ nói",
    description: "Luyện tổng cộng 60 phút",
    icon: Clock,
    target: 60,
    unit: "phút",
    value: (p) => p.total_minutes,
  },
  {
    id: "minutes-300",
    title: "Năm giờ nói",
    description: "Luyện tổng cộng 300 phút",
    icon: Timer,
    target: 300,
    unit: "phút",
    value: (p) => p.total_minutes,
  },
  {
    id: "minutes-1000",
    title: "Bền bỉ",
    description: "Luyện tổng cộng 1000 phút",
    icon: Timer,
    target: 1000,
    unit: "phút",
    value: (p) => p.total_minutes,
  },
  {
    id: "streak-3",
    title: "Chuỗi 3 ngày",
    description: "Luyện 3 ngày liên tiếp",
    icon: Flame,
    target: 3,
    unit: "ngày",
    value: (p) => p.longest_streak,
  },
  {
    id: "streak-7",
    title: "Chuỗi 7 ngày",
    description: "Luyện 7 ngày liên tiếp",
    icon: Flame,
    target: 7,
    unit: "ngày",
    value: (p) => p.longest_streak,
  },
  {
    id: "band-6",
    title: "Band 6.0",
    description: "Đạt band hiện tại 6.0",
    icon: Target,
    target: 6,
    unit: "band",
    value: (p) => p.current_band,
  },
  {
    id: "band-7",
    title: "Band 7.0",
    description: "Đạt band hiện tại 7.0",
    icon: Star,
    target: 7,
    unit: "band",
    value: (p) => p.current_band,
  },
];

function formatValue(n: number, unit: string) {
  return unit === "band" ? n.toFixed(1) : String(Math.round(n));
}

export default function AchievementsScreen({ profile, onBack }: AchievementsScreenProps) {
  const items = ACHIEVEMENTS.map((a) => {
    const value = profile ? a.value(profile) || 0 : 0;
    return { ...a, current: value, unlocked: value >= a.target };
  });
  const unlockedCount = items.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-12">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-[#fffcff]">Thành tích</h1>
            <p className="text-sm text-zinc-400">
              {unlockedCount}/{items.length} đã mở
            </p>
          </div>
        </header>

        <div className="mb-6 h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#80c0f4] to-[#add5f5] transition-all duration-700"
            style={{ width: `${(unlockedCount / items.length) * 100}%` }}
          />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((a) => {
            const Icon = a.icon;
            const pct = Math.min(100, (a.current / a.target) * 100);
            return (
              <li
                key={a.id}
                className={`p-4 rounded-2xl border ${a.unlocked
                  ? "bg-zinc-900/80 border-[#80c0f4]/30"
                  : "bg-zinc-900/50 border-white/10"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.unlocked
                      ? "bg-gradient-to-br from-[#80c0f4] to-[#add5f5]"
                      : "bg-zinc-800"
                      }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${a.unlocked ? "text-[#050505]" : "text-zinc-400"}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-2">
                      <h2 className={`text-sm font-semibold ${a.unlocked ? "text-[#fffcff]" : "text-zinc-300"}`}>
                        {a.title}
                      </h2>
                      {a.unlocked && (
                        <span className="text-xs font-medium text-emerald-400">Đã mở</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{a.description}</p>
                  </div>
                </div>
                {!a.unlocked && (
                  <div className="mt-3">
                    <div
                      className="h-1.5 rounded-full bg-zinc-800 overflow-hidden"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={a.target}
                      aria-valuenow={Math.min(a.current, a.target)}
                      aria-label={`Tiến độ ${a.title}`}
                    >
                      <div
                        className="h-full rounded-full bg-[#80c0f4]/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 tabular-nums">
                      {formatValue(a.current, a.unit)}/{formatValue(a.target, a.unit)} {a.unit !== "band" ? a.unit : ""}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
