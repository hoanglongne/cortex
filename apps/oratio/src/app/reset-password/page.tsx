"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/card";
import { Character } from "@/components/ui/character";
import { Wordmark } from "@/components/ui/shell";
import { useCharacterEnabled } from "@/lib/client/theme";
import { getSupabaseClient } from "@/lib/supabase/client";

const inputClass =
  "h-12 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface-2 px-4 text-base text-ink placeholder:text-subtle focus-visible:border-voice focus-visible:outline-2 focus-visible:outline-voice";

const labelClass = "mb-2 block text-[13px] font-bold text-muted";

export default function ResetPasswordPage() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enabled: characterOn } = useCharacterEnabled();

  useEffect(() => {
    let cancelled = false;
    getSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!cancelled) setHasSession(!!data.session);
      })
      .catch(() => {
        if (!cancelled) setHasSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error: updateError } = await getSupabaseClient().auth.updateUser({ password });
      if (updateError) {
        setError(
          updateError.message.toLowerCase().includes("password")
            ? "Mật khẩu không hợp lệ hoặc trùng mật khẩu cũ."
            : "Không đổi được mật khẩu. Vui lòng thử lại."
        );
      } else {
        setDone(true);
      }
    } catch {
      setError("Không đổi được mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkClass = "mt-4 inline-block text-sm font-bold text-voice underline-offset-4 hover:underline";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          {characterOn && <Character mood="idle" size={110} className="animate-bob" decorative />}
          <Wordmark className="mt-2 text-2xl" />
        </div>

        <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-7">
          {hasSession === null ? (
            <p className="text-sm text-muted">Đang kiểm tra...</p>
          ) : done ? (
            <div>
              <Notice>Đã đổi mật khẩu.</Notice>
              <Link href="/" className={linkClass}>
                Về trang chủ
              </Link>
            </div>
          ) : !hasSession ? (
            <div>
              <Notice tone="error">Link đã hết hạn, hãy yêu cầu link mới.</Notice>
              <Link href="/" className={linkClass}>
                Về trang đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h1 className="text-xl font-extrabold tracking-[-0.03em] text-ink">Đặt lại mật khẩu</h1>
              <div>
                <label htmlFor="new-password" className={labelClass}>
                  Mật khẩu mới
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Ít nhất 6 ký tự"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className={labelClass}>
                  Nhập lại mật khẩu
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Nhập lại mật khẩu mới"
                  className={inputClass}
                />
              </div>

              {error && <Notice tone="error">{error}</Notice>}

              <Button type="submit" variant="primary" size="lg" block disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý…" : "Đổi mật khẩu"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
