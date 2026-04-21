"use client";

import { useState } from "react";
import { prefetchCallHistory } from "@/hooks/useCallHistory";
import type { Profile } from "@/lib/types/database";
import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  User as UserIcon,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Edit3,
  Globe,
  Volume2,
  Moon,
  Smartphone,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Mic,
  Award,
  Flame,
  Star,
  BookOpen,
} from "lucide-react";

interface ProfileScreenProps {
  profile: Profile | null;
  user: User | null;
  onBack: () => void;
  onNavigate?: (screen: "history" | "settings") => void;
  onSignOut?: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  currentBand: number;
  targetBand: number;
  joinedDate: string;
  country: string;
  nativeLanguage: string;
  totalSessions: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
}

// Band Score Display Component
function BandScoreDisplay({
  currentBand,
  targetBand,
}: {
  currentBand: number;
  targetBand: number;
}) {
  const progress = (currentBand / targetBand) * 100;

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-zinc-500 mb-1">Current Band Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">{currentBand}</span>
            <span className="text-lg text-zinc-500">/ 9</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500 mb-1">Target</p>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#80c0f4]" />
            <span className="text-2xl font-bold text-[#80c0f4]">{targetBand}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Progress to target</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#80c0f4] to-[#add5f5] transition-all duration-1000"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          {targetBand - currentBand > 0
            ? `${(targetBand - currentBand).toFixed(1)} bands to go!`
            : "You've reached your target! 🎉"}
        </p>
      </div>
    </div>
  );
}

// Stats Card Component
function ProfileStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  color?: "blue" | "purple" | "amber" | "emerald";
}) {
  const colorClasses = {
    blue: "from-[#80c0f4]/20 to-[#80c0f4]/5 text-[#80c0f4]",
    purple: "from-[#add5f5]/20 to-[#add5f5]/5 text-[#add5f5]",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400",
  };

  return (
    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-3`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-zinc-500">{label}</p>
      {subtext && <p className="text-xs text-zinc-600 mt-1">{subtext}</p>}
    </div>
  );
}

// Menu Item Component
function MenuItem({
  icon: Icon,
  label,
  description,
  onClick,
  onMouseEnter,
  badge,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  badge?: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${danger
          ? "hover:bg-red-500/10 text-red-400"
          : "hover:bg-zinc-800/50 text-zinc-300"
        }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? "bg-red-500/10" : "bg-zinc-800"
          }`}
      >
        <Icon className={`w-5 h-5 ${danger ? "text-red-400" : "text-zinc-400"}`} />
      </div>
      <div className="flex-1 text-left">
        <p className={`font-medium ${danger ? "text-red-400" : "text-white"}`}>
          {label}
        </p>
        {description && (
          <p className="text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {badge && (
        <span className="px-2 py-1 rounded-full bg-[#80c0f4]/20 text-[#80c0f4] text-xs font-medium">
          {badge}
        </span>
      )}
      <ChevronRight className="w-5 h-5 text-zinc-600" />
    </button>
  );
}

// Score Breakdown Mini Component
function ScoreBreakdownMini({
  scores,
}: {
  scores: { label: string; score: number }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {scores.map((item) => (
        <div
          key={item.label}
          className="p-3 rounded-xl bg-zinc-800/50 border border-white/5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">{item.label}</span>
            <span className="text-sm font-semibold text-white">
              {item.score.toFixed(1)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#80c0f4] to-[#add5f5]"
              style={{ width: `${(item.score / 9) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Profile Screen Component
export default function ProfileScreen({ profile, user, onBack, onNavigate, onSignOut }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");

  // Use real profile data with fallbacks
  const userData: UserProfile = {
    name: profile?.username || "User",
    email: user?.email || "No email",
    avatar: profile?.avatar_url || undefined,
    currentBand: profile?.current_band || 5.0,
    targetBand: profile?.target_band || 7.0,
    joinedDate: profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : "Recently",
    country: profile?.country || "Unknown",
    nativeLanguage: profile?.native_language || "Unknown",
    totalSessions: profile?.total_sessions || 0,
    totalHours: profile?.total_minutes ? Math.round((profile.total_minutes / 60) * 10) / 10 : 0,
    currentStreak: profile?.current_streak || 0,
    longestStreak: profile?.longest_streak || 0,
    averageScore: profile?.current_band || 5.0,
  };

  // Calculate score breakdown based on current band with some variation
  const baseScore = userData.currentBand;
  const scoreBreakdown = [
    { label: "Fluency", score: Math.min(9, baseScore + 0.3) },
    { label: "Vocabulary", score: Math.max(4, baseScore - 0.2) },
    { label: "Grammar", score: Math.max(4, baseScore - 0.5) },
    { label: "Pronunciation", score: Math.min(9, baseScore + 0.2) },
  ];

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
          <h1 className="text-xl lg:text-2xl font-bold text-white">Profile</h1>
          <div className="w-20" /> {/* Spacer */}
        </header>

        {/* Profile Header Card */}
        <div className="relative p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/10 mb-6">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#80c0f4]/10 to-[#add5f5]/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center text-white text-3xl lg:text-4xl font-bold">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <Camera className="w-4 h-4 text-zinc-300" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <Edit3 className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
              <p className="text-zinc-500 mb-3">{userData.email}</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800">
                  <Globe className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-300">{userData.country}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-300">Joined {userData.joinedDate}</span>
                </div>
                {userData.currentStreak > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">
                      {userData.currentStreak} day streak
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "overview"
                ? "bg-[#80c0f4] text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "settings"
                ? "bg-[#80c0f4] text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
              }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Band Score */}
              <BandScoreDisplay
                currentBand={userData.currentBand}
                targetBand={userData.targetBand}
              />

              {/* Score Breakdown */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Average Scores
                  </h3>
                  <button className="text-sm text-[#80c0f4] hover:text-[#9dcce4] transition-colors">
                    View details
                  </button>
                </div>
                <ScoreBreakdownMini scores={scoreBreakdown} />
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <MenuItem
                    icon={Clock}
                    label="Call History"
                    description="View all your practice sessions"
                    onClick={() => onNavigate?.("history")}
                    onMouseEnter={() => prefetchCallHistory()}
                  />
                  <MenuItem
                    icon={BookOpen}
                    label="Saved Topics"
                    description="Topics you've bookmarked"
                  />
                  <MenuItem
                    icon={Star}
                    label="Favorite Partners"
                    description="Partners you'd like to practice with again"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <ProfileStatCard
                  icon={Mic}
                  label="Sessions"
                  value={userData.totalSessions.toString()}
                  color="blue"
                />
                <ProfileStatCard
                  icon={Clock}
                  label="Hours"
                  value={userData.totalHours.toString()}
                  color="purple"
                />
                <ProfileStatCard
                  icon={Flame}
                  label="Streak"
                  value={`${userData.currentStreak} days`}
                  subtext={userData.longestStreak > 0 ? `Best: ${userData.longestStreak}` : undefined}
                  color="amber"
                />
                <ProfileStatCard
                  icon={TrendingUp}
                  label="Avg Score"
                  value={userData.averageScore.toFixed(1)}
                  color="emerald"
                />
              </div>

              {/* Achievements Preview */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#add5f5]/10 to-purple-500/5 border border-[#add5f5]/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-[#add5f5]" />
                    <h3 className="text-lg font-semibold text-white">
                      Achievements
                    </h3>
                  </div>
                  <span className="text-sm text-zinc-400">6/14</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {["🔥", "⭐", "🎯", "🏆", "📚", "💬"].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-lg"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <button className="w-full py-2.5 rounded-xl bg-[#add5f5]/20 text-[#add5f5] text-sm font-medium hover:bg-[#add5f5]/30 transition-colors">
                  View All Achievements
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Account Settings */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
              <div className="space-y-2">
                <MenuItem
                  icon={UserIcon}
                  label="Edit Profile"
                  description="Update your name, photo, and bio"
                />
                <MenuItem
                  icon={Mail}
                  label="Email & Password"
                  description="Manage your login credentials"
                />
                <MenuItem
                  icon={Target}
                  label="Learning Goals"
                  description="Set your target band score"
                  badge={`Band ${userData.targetBand.toFixed(1)}`}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
              <div className="space-y-2">
                <MenuItem
                  icon={Bell}
                  label="Notifications"
                  description="Push, email, and reminder settings"
                />
                <MenuItem
                  icon={Volume2}
                  label="Audio Settings"
                  description="Microphone and speaker preferences"
                />
                <MenuItem
                  icon={Globe}
                  label="Language & Region"
                  description="English (US)"
                />
                <MenuItem
                  icon={Moon}
                  label="Appearance"
                  description="Dark mode is enabled"
                />
              </div>
            </div>

            {/* Privacy & Support */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Privacy & Support
              </h3>
              <div className="space-y-2">
                <MenuItem
                  icon={Shield}
                  label="Privacy Settings"
                  description="Control who can see your profile"
                />
                <MenuItem
                  icon={Smartphone}
                  label="Connected Devices"
                  description="Manage logged-in devices"
                />
                <MenuItem
                  icon={HelpCircle}
                  label="Help & Support"
                  description="FAQs and contact support"
                />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-red-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
              <MenuItem
                icon={LogOut}
                label="Log Out"
                description="Sign out of your account"
                onClick={onSignOut}
                danger
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

