"use client";

import { useState } from "react";
import { Mic, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react"; import LoadingSpinner from "./LoadingSpinner"; import { Button } from "@/components/ui/button";

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  isLoading?: boolean;
}

export default function AuthScreen({ onSignIn, onSignUp, isLoading = false }: AuthScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const result = await onSignIn(email, password);
        if (result.error) {
          setError(result.error);
        }
      } else {
        if (!username.trim()) {
          setError("Please enter a username");
          setIsSubmitting(false);
          return;
        }
        const result = await onSignUp(email, password, username);
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
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
          <LoadingSpinner size="md" message="Checking authentication..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#80c0f4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#add5f5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center shadow-lg shadow-[#80c0f4]/30">
            <Mic className="w-7 h-7 text-[#050505]" />
          </div>
          <div>
            <h1 className="text-4xl font-[family-name:var(--font-gugi)] text-[#fffcff] tracking-wide">ORATIO</h1>
            <p className="text-sm text-zinc-500">IELTS Speaking Practice</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md">
          <div className="p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
            {/* Mode Tabs */}
            <div className="flex rounded-xl bg-zinc-800/50 p-1 mb-8">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signin"
                  ? "bg-[#80c0f4] text-[#050505]"
                  : "text-zinc-400 hover:text-white"
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signup"
                  ? "bg-[#80c0f4] text-[#050505]"
                  : "text-zinc-400 hover:text-white"
                  }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#80c0f4]/50 focus:ring-2 focus:ring-[#80c0f4]/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#80c0f4]/50 focus:ring-2 focus:ring-[#80c0f4]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#80c0f4]/50 focus:ring-2 focus:ring-[#80c0f4]/20 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 h-auto rounded-xl bg-gradient-to-r from-[#80c0f4] to-[#add5f5] hover:from-[#6db0e4] hover:to-[#9dc5e5] text-[#050505] font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#80c0f4]/25 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {mode === "signin" && (
              <button className="w-full mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Forgot password?
              </button>
            )}
          </div>

          {/* Features List */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "Global", sublabel: "Community" },
              { label: "AI", sublabel: "Feedback" },
              { label: "Free", sublabel: "Practice" },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-center"
              >
                <p className="text-lg font-bold text-white">{feature.label}</p>
                <p className="text-xs text-zinc-500">{feature.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

