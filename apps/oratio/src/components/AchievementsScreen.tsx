"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Trophy,
  Flame,
  Mic,
  Star,
  Target,
  Users,
  Clock,
  Zap,
  Award,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Lock,
  CheckCircle,
} from "lucide-react";

interface AchievementsScreenProps {
  onBack: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "practice" | "social" | "milestone" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

// Achievement Card Component
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityColors = {
    common: {
      bg: "from-zinc-600 to-zinc-700",
      border: "border-zinc-500/30",
      glow: "",
      text: "text-zinc-400",
    },
    rare: {
      bg: "from-[#80c0f4] to-[#6db0e4]",
      border: "border-[#80c0f4]/30",
      glow: "shadow-lg shadow-blue-500/20",
      text: "text-[#80c0f4]",
    },
    epic: {
      bg: "from-[#add5f5] to-[#9dc5e5]",
      border: "border-[#add5f5]/30",
      glow: "shadow-lg shadow-purple-500/20",
      text: "text-[#add5f5]",
    },
    legendary: {
      bg: "from-amber-400 to-orange-500",
      border: "border-amber-400/30",
      glow: "shadow-lg shadow-amber-500/30",
      text: "text-amber-400",
    },
  };

  const colors = rarityColors[achievement.rarity];
  const Icon = achievement.icon;
  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-300 group ${achievement.unlocked
          ? `bg-zinc-900/60 ${colors.border} ${colors.glow} hover:scale-[1.02]`
          : "bg-zinc-900/30 border-zinc-800/50 opacity-60"
        }`}
    >
      {/* Rarity Badge */}
      <div className="absolute top-3 right-3">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}
        >
          {achievement.rarity}
        </span>
      </div>

      {/* Icon */}
      <div className="flex items-start gap-4">
        <div
          className={`relative w-14 h-14 rounded-xl flex items-center justify-center ${achievement.unlocked
              ? `bg-gradient-to-br ${colors.bg}`
              : "bg-zinc-800"
            }`}
        >
          {achievement.unlocked ? (
            <Icon className="w-7 h-7 text-white" />
          ) : (
            <Lock className="w-6 h-6 text-zinc-600" />
          )}
          {achievement.unlocked && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold mb-1 ${achievement.unlocked ? "text-white" : "text-zinc-500"
              }`}
          >
            {achievement.title}
          </h3>
          <p className="text-sm text-zinc-500 mb-3 leading-relaxed">
            {achievement.description}
          </p>

          {/* Progress Bar */}
          {!achievement.unlocked && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Progress</span>
                <span className="text-zinc-400 font-medium">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.bg} transition-all duration-500`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlocked Date & XP */}
          {achievement.unlocked && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600">
                {achievement.unlockedAt}
              </span>
              <span className="text-xs font-medium text-emerald-400">
                +{achievement.xpReward} XP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Category Filter Button
function CategoryButton({
  label,
  icon: Icon,
  active,
  onClick,
  count,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active
          ? "bg-[#80c0f4] text-white"
          : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
        }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span
        className={`px-1.5 py-0.5 rounded-md text-xs ${active ? "bg-white/20" : "bg-zinc-700"
          }`}
      >
        {count}
      </span>
    </button>
  );
}

// Stats Overview Component
function StatsOverview({
  totalAchievements,
  unlockedCount,
  totalXP,
}: {
  totalAchievements: number;
  unlockedCount: number;
  totalXP: number;
}) {
  const percentage = Math.round((unlockedCount / totalAchievements) * 100);

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/10 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Progress Circle */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-800"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#80c0f4" />
                  <stop offset="100%" stopColor="#add5f5" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{percentage}%</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              {unlockedCount} / {totalAchievements}
            </h2>
            <p className="text-sm text-zinc-500">Achievements Unlocked</p>
          </div>
        </div>

        {/* XP and Stats */}
        <div className="flex gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-2xl font-bold text-white">{totalXP}</span>
            </div>
            <p className="text-xs text-zinc-500">Total XP Earned</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-[#80c0f4]" />
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <p className="text-xs text-zinc-500">Legendary</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Achievements Screen Component
export default function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "practice" | "social" | "milestone" | "special"
  >("all");

  const achievements: Achievement[] = [
    // Practice Achievements
    {
      id: "first-call",
      title: "First Steps",
      description: "Complete your first speaking practice session",
      icon: Mic,
      category: "practice",
      rarity: "common",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: "Jan 5, 2026",
      xpReward: 50,
    },
    {
      id: "streak-7",
      title: "Week Warrior",
      description: "Maintain a 7-day practice streak",
      icon: Flame,
      category: "practice",
      rarity: "rare",
      progress: 7,
      maxProgress: 7,
      unlocked: true,
      unlockedAt: "Jan 10, 2026",
      xpReward: 150,
    },
    {
      id: "streak-30",
      title: "Monthly Master",
      description: "Maintain a 30-day practice streak",
      icon: Flame,
      category: "practice",
      rarity: "epic",
      progress: 7,
      maxProgress: 30,
      unlocked: false,
      xpReward: 500,
    },
    {
      id: "hours-10",
      title: "Dedicated Speaker",
      description: "Accumulate 10 hours of speaking practice",
      icon: Clock,
      category: "practice",
      rarity: "rare",
      progress: 8,
      maxProgress: 10,
      unlocked: false,
      xpReward: 200,
    },
    // Social Achievements
    {
      id: "partners-10",
      title: "Social Butterfly",
      description: "Practice with 10 different partners",
      icon: Users,
      category: "social",
      rarity: "rare",
      progress: 10,
      maxProgress: 10,
      unlocked: true,
      unlockedAt: "Jan 8, 2026",
      xpReward: 150,
    },
    {
      id: "partners-50",
      title: "Global Speaker",
      description: "Practice with 50 different partners",
      icon: Users,
      category: "social",
      rarity: "epic",
      progress: 24,
      maxProgress: 50,
      unlocked: false,
      xpReward: 400,
    },
    {
      id: "rating-5star",
      title: "Five Star Speaker",
      description: "Receive a 5-star rating from a partner",
      icon: Star,
      category: "social",
      rarity: "rare",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: "Jan 6, 2026",
      xpReward: 100,
    },
    // Milestone Achievements
    {
      id: "band-6",
      title: "Band 6 Achiever",
      description: "Reach an estimated Band 6.0 score",
      icon: Target,
      category: "milestone",
      rarity: "rare",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: "Jan 9, 2026",
      xpReward: 250,
    },
    {
      id: "band-7",
      title: "Band 7 Expert",
      description: "Reach an estimated Band 7.0 score",
      icon: Award,
      category: "milestone",
      rarity: "epic",
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      xpReward: 500,
    },
    {
      id: "topics-20",
      title: "Topic Explorer",
      description: "Discuss 20 different IELTS topics",
      icon: BookOpen,
      category: "milestone",
      rarity: "rare",
      progress: 15,
      maxProgress: 20,
      unlocked: false,
      xpReward: 200,
    },
    // Special Achievements
    {
      id: "early-adopter",
      title: "Early Adopter",
      description: "Join ORATIO in its first month",
      icon: Zap,
      category: "special",
      rarity: "legendary",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: "Jan 1, 2026",
      xpReward: 300,
    },
    {
      id: "perfect-week",
      title: "Perfect Week",
      description: "Complete 7 sessions in one week with 5-star ratings",
      icon: Trophy,
      category: "special",
      rarity: "legendary",
      progress: 4,
      maxProgress: 7,
      unlocked: false,
      xpReward: 750,
    },
    {
      id: "feedback-guru",
      title: "Feedback Guru",
      description: "Give detailed feedback to 25 partners",
      icon: MessageCircle,
      category: "special",
      rarity: "epic",
      progress: 12,
      maxProgress: 25,
      unlocked: false,
      xpReward: 350,
    },
    {
      id: "comeback-king",
      title: "Comeback King",
      description: "Return after 7+ days and complete 3 sessions",
      icon: TrendingUp,
      category: "special",
      rarity: "rare",
      progress: 0,
      maxProgress: 3,
      unlocked: false,
      xpReward: 150,
    },
  ];

  const filteredAchievements =
    activeCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXP = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const categoryStats = {
    all: achievements.length,
    practice: achievements.filter((a) => a.category === "practice").length,
    social: achievements.filter((a) => a.category === "social").length,
    milestone: achievements.filter((a) => a.category === "milestone").length,
    special: achievements.filter((a) => a.category === "special").length,
  };

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#add5f5] to-[#9dc5e5] flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                Achievements
              </h1>
              <p className="text-xs text-zinc-500">Collect badges & rewards</p>
            </div>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </header>

        {/* Stats Overview */}
        <StatsOverview
          totalAchievements={achievements.length}
          unlockedCount={unlockedCount}
          totalXP={totalXP}
        />

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <CategoryButton
            label="All"
            icon={Award}
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            count={categoryStats.all}
          />
          <CategoryButton
            label="Practice"
            icon={Mic}
            active={activeCategory === "practice"}
            onClick={() => setActiveCategory("practice")}
            count={categoryStats.practice}
          />
          <CategoryButton
            label="Social"
            icon={Users}
            active={activeCategory === "social"}
            onClick={() => setActiveCategory("social")}
            count={categoryStats.social}
          />
          <CategoryButton
            label="Milestone"
            icon={Target}
            active={activeCategory === "milestone"}
            onClick={() => setActiveCategory("milestone")}
            count={categoryStats.milestone}
          />
          <CategoryButton
            label="Special"
            icon={Zap}
            active={activeCategory === "special"}
            onClick={() => setActiveCategory("special")}
            count={categoryStats.special}
          />
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </div>
  );
}

