"use client";

import { useState } from "react";
import { Mic, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase/client";

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string, username: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  isLoading?: boolean;
}

const inputClass =
  "w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#80c0f4]/50 focus:ring-2 focus:ring-[#80c0f4]/20 transition-all";

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

const FEATURES = [
  { label: "Ghép cặp", sublabel: "theo band" },
  { label: "Part 1–3", sublabel: "câu hỏi IELTS thật" },
  { label: "4 tiêu chí", sublabel: "bạn luyện cùng chấm" },
  { label: "Luyện một mình", sublabel: "có ghi âm" },
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#80c0f4]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#add5f5]/5 rounded-full blur-3xl" />
        </div>

        {/* Loading content */}
        <div className="relative z-10">
          <LoadingSpinner size="md" message="Đang kiểm tra đăng nhập..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#80c0f4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#add5f5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center shadow-lg shadow-[#80c0f4]/30">
            <Mic className="w-7 h-7 text-[#050505]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-4xl font-[family-name:var(--font-gugi)] text-[#fffcff] tracking-wide">ORATIO</h1>
            <p className="text-sm text-zinc-400">Luyện IELTS Speaking</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md">
          <div className="p-5 sm:p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
            {mode !== "reset" ? (
              <div className="flex rounded-xl bg-zinc-800/50 p-1 mb-8">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signin"
                    ? "bg-[#80c0f4] text-[#050505]"
                    : "text-zinc-400 hover:text-white"
                    }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signup"
                    ? "bg-[#80c0f4] text-[#050505]"
                    : "text-zinc-400 hover:text-white"
                    }`}
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Quên mật khẩu</h2>
                <p className="text-sm text-zinc-400 mt-1">Nhập email để nhận link đặt lại mật khẩu.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div>
                  <label htmlFor="auth-username" className="block text-sm font-medium text-zinc-400 mb-2">
                    Tên hiển thị
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" aria-hidden="true" />
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
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-sm font-medium text-zinc-400 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" aria-hidden="true" />
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
              </div>

              {mode !== "reset" && (
                <div>
                  <label htmlFor="auth-password" className="block text-sm font-medium text-zinc-400 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" aria-hidden="true" />
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
                </div>
              )}

              {error && (
                <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {info && (
                <div role="status" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-emerald-400">{info}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 h-auto rounded-xl bg-gradient-to-r from-[#80c0f4] to-[#add5f5] hover:from-[#6db0e4] hover:to-[#9dc5e5] text-[#050505] font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#80c0f4]/25 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" aria-label="Đang xử lý" />
                ) : (
                  <>
                    {mode === "signin" ? "Đăng nhập" : mode === "signup" ? "Tạo tài khoản" : "Gửi link đặt lại"}
                    <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => switchMode("reset")}
                className="w-full mt-4 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Quên mật khẩu?
              </button>
            )}
            {mode === "reset" && (
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="w-full mt-4 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Quay lại đăng nhập
              </button>
            )}
          </div>

          {/* Features List */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-center"
              >
                <p className="text-base font-bold text-white">{feature.label}</p>
                <p className="text-xs text-zinc-400">{feature.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
