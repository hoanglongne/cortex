"use client";

import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/card";
import { Wordmark } from "@/components/ui/shell";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string, username: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  isLoading?: boolean;
}

const inputClass =
  "h-12 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-4 text-base text-ink placeholder:text-subtle focus-visible:border-onair focus-visible:outline-2 focus-visible:outline-onair";

const labelClass = "mb-2 block text-sm text-muted";

function translateError(message: string | null | undefined): string {
  const m = (message || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Email hoặc mật khẩu không đúng.";
  if (m.includes("user already registered") || m.includes("already been registered")) return "Email này đã có tài khoản.";
  if (m.includes("email not confirmed")) return "Email chưa được xác nhận. Kiểm tra hộp thư nhé.";
  if (m.includes("password") && (m.includes("at least") || m.includes("short") || m.includes("weak"))) return "Mật khẩu cần ít nhất 6 ký tự.";
  if (m.includes("rate limit") || m.includes("too many")) return "Bạn thử quá nhiều lần. Vui lòng đợi một lúc rồi thử lại.";
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "Email không hợp lệ.";
  return message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

const POINTS = [
  "Tập một mình với câu hỏi Part 1–2–3, ghi âm và nghe lại.",
  "Thi thử với người thật trong Giờ thi, đổi vai giám khảo.",
  "Điểm do người luyện cùng chấm, không phải máy.",
];

export default function AuthScreen({ onSignIn, onSignUp, isLoading = false }: AuthScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (next: "signin" | "signup" | "reset") => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      if (mode === "reset") {
        const { error: resetError } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (resetError) {
          setError(translateError(resetError.message));
        } else {
          setInfo("Đã gửi link đặt lại mật khẩu (nếu email có tài khoản).");
        }
      } else if (mode === "signin") {
        const result = await onSignIn(email, password);
        if (result.error) {
          setError(translateError(result.error));
        }
      } else {
        if (!username.trim()) {
          setError("Vui lòng nhập tên hiển thị.");
          return;
        }
        const result = await onSignUp(email, password, username.trim());
        if (result.error) {
          setError(translateError(result.error));
        } else if (result.needsConfirmation) {
          setInfo(`Đã gửi email xác nhận tới ${email}. Mở email để kích hoạt tài khoản rồi đăng nhập.`);
          setPassword("");
          setMode("signin");
        }
      }
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <LoadingSpinner size="md" message="Đang kiểm tra đăng nhập..." />
      </div>
    );
  }

  const tabClass = (active: boolean) =>
    cn(
      "h-10 flex-1 rounded-[calc(var(--radius-control)-2px)] text-sm transition-colors",
      active ? "bg-surface-3 text-ink" : "text-muted hover:text-ink"
    );

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <Wordmark className="text-2xl" />
        <p className="mt-4 font-serif text-lg leading-snug text-ink-2">
          Phòng tập IELTS Speaking. Tự nói, nghe lại, thi thử với người thật.
        </p>

        <div className="mt-8">
          {mode !== "reset" ? (
            <div className="mb-6 flex gap-1 rounded-[var(--radius-control)] border border-line bg-surface p-1">
              <button type="button" onClick={() => switchMode("signin")} aria-pressed={mode === "signin"} className={tabClass(mode === "signin")}>
                Đăng nhập
              </button>
              <button type="button" onClick={() => switchMode("signup")} aria-pressed={mode === "signup"} className={tabClass(mode === "signup")}>
                Đăng ký
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-ink">Quên mật khẩu</h2>
              <p className="mt-1 text-sm text-muted">Nhập email để nhận link đặt lại mật khẩu.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="auth-username" className={labelClass}>
                  Tên hiển thị
                </label>
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên hiển thị"
                  maxLength={40}
                  autoComplete="nickname"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className={labelClass}>
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label htmlFor="auth-password" className={labelClass}>
                  Mật khẩu
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  className={inputClass}
                />
              </div>
            )}

            {error && <Notice tone="error">{error}</Notice>}
            {info && <Notice>{info}</Notice>}

            <Button type="submit" variant="primary" size="lg" block disabled={isSubmitting}>
              {isSubmitting
                ? "Đang xử lý…"
                : mode === "signin"
                  ? "Đăng nhập"
                  : mode === "signup"
                    ? "Tạo tài khoản"
                    : "Gửi link đặt lại"}
            </Button>
          </form>

          {mode === "signin" && (
            <div className="mt-3 text-center">
              <Button type="button" variant="ghost" size="sm" onClick={() => switchMode("reset")}>
                Quên mật khẩu?
              </Button>
            </div>
          )}
          {mode === "reset" && (
            <div className="mt-3 text-center">
              <Button type="button" variant="ghost" size="sm" onClick={() => switchMode("signin")}>
                Quay lại đăng nhập
              </Button>
            </div>
          )}
        </div>

        <ul className="mt-10 space-y-2 border-t border-line pt-6 text-sm text-muted">
          {POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
