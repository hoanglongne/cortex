"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, Loader2, Mic } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

const inputClass =
  "w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#80c0f4]/50 focus:ring-2 focus:ring-[#80c0f4]/20 transition-all";

export default function ResetPasswordPage() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const linkClass = "inline-block mt-4 text-sm font-medium text-[#80c0f4] hover:text-[#add5f5] transition-colors";

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-12 relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#80c0f4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#add5f5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center shadow-lg shadow-[#80c0f4]/30">
            <Mic className="w-6 h-6 text-[#050505]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-[family-name:var(--font-gugi)] text-[#fffcff] tracking-wide">ORATIO</h1>
        </div>

        <div className="p-5 sm:p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
          {hasSession === null ? (
            <p className="text-sm text-zinc-400 text-center">Đang kiểm tra...</p>
          ) : done ? (
            <div className="text-center">
              <p role="status" className="text-emerald-400">Đã đổi mật khẩu.</p>
              <Link href="/" className={linkClass}>
                Về trang chủ
              </Link>
            </div>
          ) : !hasSession ? (
            <div className="text-center">
              <p role="alert" className="text-red-400 text-sm">Link đã hết hạn, hãy yêu cầu link mới.</p>
              <Link href="/" className={linkClass}>
                Về trang đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Đặt lại mật khẩu</h2>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-zinc-400 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" aria-hidden="true" />
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
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-400 mb-2">
                  Nhập lại mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" aria-hidden="true" />
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
              </div>

              {error && (
                <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-4 rounded-xl bg-gradient-to-r from-[#80c0f4] to-[#add5f5] text-[#050505] font-semibold text-base shadow-lg shadow-[#80c0f4]/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" aria-label="Đang xử lý" />
                ) : (
                  "Đổi mật khẩu"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
