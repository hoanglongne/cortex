"use client";

import { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, Label } from "@/components/ui/card";
import { InstallButton } from "@/components/ui/install";
import { ExamReminder } from "@/components/ui/reminder";
import { useTranscribeChoice } from "@/lib/client/whisper";
import { useCharacterEnabled, useTheme, type ThemeChoice } from "@/lib/client/theme";
import { cn } from "@/lib/utils";
import { TabShell, type Tab } from "@/components/ui/shell";

interface MeScreenProps {
  profile: Profile | null;
  user: User | null;
  onTab: (tab: Tab) => void;
  onSignOut: () => void;
  onProfileUpdated: () => void;
  onOpenPartners: () => void;
  onOpenLeaderboard?: () => void;
  onOpenClasses: () => void;
}

const THEMES: { id: ThemeChoice; label: string }[] = [
  { id: "light", label: "Sáng" },
  { id: "dark", label: "Tối" },
  { id: "system", label: "Theo máy" },
];

const TARGET_BANDS = Array.from({ length: 11 }, (_, i) => 4 + i * 0.5);

const FIELD =
  "h-11 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-4 text-ink placeholder:text-subtle";

export default function MeScreen({ profile, user, onTab, onSignOut, onProfileUpdated, onOpenPartners, onOpenLeaderboard, onOpenClasses }: MeScreenProps) {
  const { choice, setTheme } = useTheme();
  const { enabled: characterOn, setEnabled: setCharacterOn } = useCharacterEnabled();
  const { choice: transcribeChoice, setChoice: setTranscribeChoice } = useTranscribeChoice();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [targetBand, setTargetBand] = useState(7);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      const { error } = await profiles.update({ username: trimmed, target_band: targetBand }).eq("id", profile.id);
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

  return (
    <TabShell tab="me" onTab={onTab} title="Tôi">
      <Card>
        {!editing ? (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold tracking-[-0.02em] text-ink">{name}</p>
              {email && <p className="mt-0.5 truncate text-sm text-muted">{email}</p>}
              {profile && (
                <p className="mt-3 text-sm text-muted">
                  Band hiện tại <span className="font-extrabold tabular text-ink">{Number(profile.current_band).toFixed(1)}</span>
                  {" · "}mục tiêu <span className="font-extrabold tabular text-ink">{Number(profile.target_band).toFixed(1)}</span>
                </p>
              )}
            </div>
            {profile && (
              <Button variant="secondary" size="sm" onClick={startEditing}>
                Sửa
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="profile-email" className="mb-2 block text-sm font-bold text-muted">
                Email
              </label>
              <input id="profile-email" type="email" value={email} readOnly aria-readonly className={`${FIELD} text-muted`} />
            </div>
            <div>
              <label htmlFor="profile-username" className="mb-2 block text-sm font-bold text-muted">
                Tên hiển thị
              </label>
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={40}
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="profile-target" className="mb-2 block text-sm font-bold text-muted">
                Band mục tiêu
              </label>
              <select
                id="profile-target"
                value={targetBand}
                onChange={(e) => setTargetBand(Number(e.target.value))}
                className={`${FIELD} `}
              >
                {TARGET_BANDS.map((b) => (
                  <option key={b} value={b}>
                    {b.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>
            {saveError && (
              <p role="alert" className="text-sm text-danger">
                {saveError}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" disabled={saving}>
                {saving && <Loader2 className="animate-spin" aria-hidden />}
                {saving ? "Đang lưu" : "Lưu"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Hủy
              </Button>
            </div>
          </form>
        )}
      </Card>

      <section className="mt-8">
        <Label>Cộng đồng</Label>
        <div className="mt-3 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
          <button onClick={onOpenPartners} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-bold text-ink hover:bg-surface-2">
            Bạn luyện cùng
            <ChevronRight className="size-4 text-subtle" aria-hidden />
          </button>
          {onOpenLeaderboard && (
            <button onClick={onOpenLeaderboard} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-bold text-ink hover:bg-surface-2">
              Bảng giờ nói
              <ChevronRight className="size-4 text-subtle" aria-hidden />
            </button>
          )}
          <button onClick={onOpenClasses} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-bold text-ink hover:bg-surface-2">
            Lớp học
            <ChevronRight className="size-4 text-subtle" aria-hidden />
          </button>
        </div>
      </section>

      <section className="mt-8">
        <Label>Giao diện</Label>
        <div className="mt-3 space-y-3">
          <div
            role="group"
            aria-label="Màu giao diện"
            className="grid grid-cols-3 rounded-[var(--radius-control)] border border-line-strong bg-surface p-0.5"
          >
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                aria-pressed={choice === t.id}
                className={cn(
                  "h-10 rounded-[10px] text-sm font-bold transition-colors",
                  choice === t.id ? "bg-voice-soft text-ink" : "text-muted hover:text-ink"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3">
            <div className="min-w-0">
              <p id="character-toggle-label" className="font-bold text-ink">
                Ơ nói chuyện với tôi
              </p>
              <p className="text-[13px] text-subtle">Ơ chỉ nói những điều có thật trong dữ liệu của bạn.</p>
            </div>
            <button
              role="switch"
              aria-checked={characterOn}
              aria-labelledby="character-toggle-label"
              onClick={() => setCharacterOn(!characterOn)}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                characterOn ? "bg-good" : "bg-surface-3"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0.5 top-0.5 size-6 rounded-full bg-surface shadow-sm transition-transform",
                  characterOn && "translate-x-5"
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3">
            <div className="min-w-0">
              <p id="transcribe-toggle-label" className="font-bold text-ink">
                Chép lời trên máy
              </p>
              <p className="text-[13px] text-subtle">
                Tải khoảng 40 MB một lần, chạy ngay trên máy bạn, âm thanh không bị tải lên. Cho ra thêm từ/phút, từ đệm và từ Lexica đã dùng.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={transcribeChoice === "on"}
              aria-labelledby="transcribe-toggle-label"
              onClick={() => setTranscribeChoice(transcribeChoice === "on" ? "off" : "on")}
              className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", transcribeChoice === "on" ? "bg-good" : "bg-surface-3")}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0.5 top-0.5 size-6 rounded-full bg-surface shadow-sm transition-transform",
                  transcribeChoice === "on" && "translate-x-5"
                )}
              />
            </button>
          </div>
          <ExamReminder />
          <InstallButton />
        </div>
      </section>

      <div className="mt-12 border-t border-line pt-6">
        <button
          onClick={onSignOut}
          className="h-11 rounded-[var(--radius-control)] px-3 text-sm font-bold text-danger hover:bg-danger-soft"
        >
          Đăng xuất
        </button>
      </div>
    </TabShell>
  );
}
