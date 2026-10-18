"use client";

import { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/card";
import { TabShell, type Tab } from "@/components/ui/shell";

interface MeScreenProps {
  profile: Profile | null;
  user: User | null;
  onTab: (tab: Tab) => void;
  onSignOut: () => void;
  onProfileUpdated: () => void;
  onOpenPartners: () => void;
  onOpenClasses: () => void;
}

const TARGET_BANDS = Array.from({ length: 11 }, (_, i) => 4 + i * 0.5);

const FIELD =
  "h-11 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-4 text-ink placeholder:text-subtle";

export default function MeScreen({ profile, user, onTab, onSignOut, onProfileUpdated, onOpenPartners, onOpenClasses }: MeScreenProps) {
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
      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
        {!editing ? (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-lg text-ink">{name}</p>
              {email && <p className="mt-0.5 truncate text-sm text-muted">{email}</p>}
              {profile && (
                <p className="mt-3 text-sm text-muted">
                  Band hiện tại <span className="font-mono tabular text-ink">{Number(profile.current_band).toFixed(1)}</span>
                  {" · "}mục tiêu <span className="font-mono tabular text-ink">{Number(profile.target_band).toFixed(1)}</span>
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
              <label htmlFor="profile-email" className="mb-2 block text-sm text-muted">
                Email
              </label>
              <input id="profile-email" type="email" value={email} readOnly aria-readonly className={`${FIELD} text-muted`} />
            </div>
            <div>
              <label htmlFor="profile-username" className="mb-2 block text-sm text-muted">
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
              <label htmlFor="profile-target" className="mb-2 block text-sm text-muted">
                Band mục tiêu
              </label>
              <select
                id="profile-target"
                value={targetBand}
                onChange={(e) => setTargetBand(Number(e.target.value))}
                className={`${FIELD} font-mono`}
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
      </section>

      <section className="mt-8">
        <Label>Cộng đồng</Label>
        <button
          onClick={onOpenPartners}
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3.5 text-left text-ink hover:bg-surface-2"
        >
          Bạn luyện cùng
          <ChevronRight className="size-4 text-subtle" aria-hidden />
        </button>
        <button
          onClick={onOpenClasses}
          className="mt-2 flex w-full items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3.5 text-left text-ink hover:bg-surface-2"
        >
          Lớp học
          <ChevronRight className="size-4 text-subtle" aria-hidden />
        </button>
      </section>

      <div className="mt-12 border-t border-line pt-6">
        <button
          onClick={onSignOut}
          className="h-11 rounded-[var(--radius-control)] px-3 text-sm text-danger hover:bg-danger-soft"
        >
          Đăng xuất
        </button>
      </div>
    </TabShell>
  );
}
