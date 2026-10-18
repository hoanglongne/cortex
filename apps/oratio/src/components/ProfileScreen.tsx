"use client";

import { useEffect, useState } from "react";
import { getMyFeedbackSummary } from "@/actions/stats";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";
import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  LogOut,
  Pencil,
  Target,
  Clock,
  Mic,
  Flame,
  Award,
  Loader2,
} from "lucide-react";

interface ProfileScreenProps {
  profile: Profile | null;
  user: User | null;
  onBack: () => void;
  onNavigate: (screen: "history" | "achievements") => void;
  onSignOut: () => void;
  onProfileUpdated: () => void;
}

type FeedbackSummary = NonNullable<Awaited<ReturnType<typeof getMyFeedbackSummary>>["summary"]>;

const TARGET_BANDS = Array.from({ length: 11 }, (_, i) => 4 + i * 0.5);

const CRITERIA: { key: "fluency" | "vocabulary" | "grammar" | "pronunciation"; label: string }[] = [
  { key: "fluency", label: "Fluency" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "grammar", label: "Grammar" },
  { key: "pronunciation", label: "Pronunciation" },
];

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 min-w-0">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#80c0f4]/20 to-[#80c0f4]/5 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-[#80c0f4]" aria-hidden="true" />
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

export default function ProfileScreen({
  profile,
  user,
  onBack,
  onNavigate,
  onSignOut,
  onProfileUpdated,
}: ProfileScreenProps) {
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [targetBand, setTargetBand] = useState(7);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyFeedbackSummary()
      .then((res) => {
        if (cancelled) return;
        if (res.error) setSummaryError(true);
        setSummary(res.summary);
      })
      .catch(() => {
        if (!cancelled) setSummaryError(true);
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startEditing = () => {
    if (!profile) return;
    setUsername(profile.username);
    setTargetBand(profile.target_band);
    setSaveError(null);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const trimmed = username.trim();
    if (trimmed.length < 1 || trimmed.length > 40) {
      setSaveError("Tên hiển thị cần từ 1 đến 40 ký tự.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      // The hand-written Database type lacks Relationships, so update() infers `never`.
      const profiles = getSupabaseClient().from("profiles") as unknown as {
        update: (values: { username: string; target_band: number }) => {
          eq: (column: string, value: string) => PromiseLike<{ error: unknown }>;
        };
      };
      const { error } = await profiles
        .update({ username: trimmed, target_band: targetBand })
        .eq("id", profile.id);
      if (error) {
        setSaveError("Không lưu được. Vui lòng thử lại.");
        return;
      }
      setEditing(false);
      onProfileUpdated();
    } catch {
      setSaveError("Không lưu được. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const name = profile?.username || "Người học";
  const email = user?.email || profile?.email || "";
  const currentBand = profile?.current_band || 0;
  const target = profile?.target_band || 0;
  const progress = target > 0 ? Math.min(100, (currentBand / target) * 100) : 0;
  const minutes = profile?.total_minutes || 0;
  const timeValue =
    minutes >= 60 ? `${Math.round((minutes / 60) * 10) / 10} giờ` : `${minutes} phút`;

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
          <h1 className="text-xl font-semibold text-[#fffcff]">Hồ sơ</h1>
        </header>

        <div className="space-y-6">
          {/* Identity */}
          <section className="p-5 rounded-3xl bg-zinc-900/70 border border-white/10">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center text-2xl font-bold text-[#050505] shrink-0"
                aria-hidden="true"
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-white truncate">{name}</h2>
                {email && <p className="text-sm text-zinc-400 truncate">{email}</p>}
              </div>
              {!editing && profile && (
                <button
                  onClick={startEditing}
                  aria-label="Sửa hồ sơ"
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                >
                  <Pencil className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                </button>
              )}
            </div>

            {editing && (
              <form onSubmit={handleSave} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="profile-username" className="block text-sm font-medium text-zinc-400 mb-2">
                    Tên hiển thị
                  </label>
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    maxLength={40}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#80c0f4]/50 focus:ring-2 focus:ring-[#80c0f4]/20 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="profile-target" className="block text-sm font-medium text-zinc-400 mb-2">
                    Band mục tiêu
                  </label>
                  <select
                    id="profile-target"
                    value={targetBand}
                    onChange={(e) => setTargetBand(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-white focus:outline-none focus:border-[#80c0f4]/50 focus:ring-2 focus:ring-[#80c0f4]/20 transition-all"
                  >
                    {TARGET_BANDS.map((b) => (
                      <option key={b} value={b}>
                        {b.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {saveError && (
                  <p role="alert" className="text-sm text-red-400">
                    {saveError}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#80c0f4] to-[#add5f5] text-[#050505] text-sm font-semibold disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Band */}
          <section className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Band hiện tại</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white tabular-nums">{currentBand.toFixed(1)}</span>
                  <span className="text-lg text-zinc-500">/ 9</span>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-zinc-400 mb-1">Mục tiêu</p>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#80c0f4]" aria-hidden="true" />
                  <span className="text-2xl font-bold text-[#80c0f4] tabular-nums">{target.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#80c0f4] to-[#add5f5] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              Trung bình điểm bạn luyện cùng chấm (cần 3 người chấm)
            </p>
          </section>

          {/* Stats */}
          <section aria-label="Thống kê" className="grid grid-cols-2 gap-3">
            <StatCard icon={Mic} label="Buổi luyện" value={String(profile?.total_sessions || 0)} />
            <StatCard icon={Clock} label="Thời gian luyện" value={timeValue} />
            <StatCard icon={Flame} label="Chuỗi hiện tại" value={`${profile?.current_streak || 0} ngày`} />
            <StatCard icon={Award} label="Chuỗi dài nhất" value={`${profile?.longest_streak || 0} ngày`} />
          </section>

          {/* Feedback summary */}
          <section className="p-5 rounded-3xl bg-zinc-900/70 border border-white/10">
            <h2 className="text-base font-semibold text-white mb-4">Điểm bạn luyện cùng chấm</h2>
            {summaryLoading ? (
              <p className="text-sm text-zinc-400">Đang tải...</p>
            ) : summaryError && !summary ? (
              <p className="text-sm text-red-400">Không tải được điểm đánh giá.</p>
            ) : !summary || summary.count === 0 || !summary.averages ? (
              <p className="text-sm text-zinc-400">
                Chưa có ai chấm bạn. Sau buổi luyện đầu tiên, điểm bạn luyện cùng chấm sẽ hiện ở đây.
              </p>
            ) : (
              <div className="space-y-4">
                {summary.overall !== null && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tabular-nums">{summary.overall.toFixed(1)}</span>
                    <span className="text-sm text-zinc-400">Band tổng</span>
                  </div>
                )}
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                  {CRITERIA.map(({ key, label }) => (
                    <div key={key} className="p-3 rounded-xl bg-zinc-800/60">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">{label}</span>
                        <span className="font-semibold text-white tabular-nums">
                          {summary.averages![key].toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#80c0f4]"
                          style={{ width: `${(summary.averages![key] / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-500">
                  Dựa trên {summary.count} lượt đánh giá gần nhất
                </p>
                {summary.topTags.length > 0 && (
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Bạn luyện cùng hay nhận xét</p>
                    <div className="flex flex-wrap gap-2">
                      {summary.topTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-[#80c0f4]/10 border border-[#80c0f4]/20 text-xs text-[#add5f5]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("achievements")}
              className="flex-1 min-w-[10rem] px-4 py-3 rounded-xl bg-zinc-900/70 border border-white/10 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Xem thành tích
            </button>
            <button
              onClick={() => onNavigate("history")}
              className="flex-1 min-w-[10rem] px-4 py-3 rounded-xl bg-zinc-900/70 border border-white/10 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Lịch sử luyện tập
            </button>
          </div>

          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
