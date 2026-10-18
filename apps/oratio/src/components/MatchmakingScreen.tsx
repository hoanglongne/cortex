"use client";

import { useState, useEffect } from "react";
import { X, Mic, Users, AlertCircle, RefreshCw, BookOpen } from "lucide-react";
import { useOnlineCount } from "@/hooks/useOnlineCount";

interface MatchmakingScreenProps {
  /** The partner band range being searched, as shown on Home ("Bất kỳ", "6.0–7.0"…) */
  bandLabel: string;
  onCancel: () => void;
  onRetry: () => void;
  onPracticeSolo: () => void;
  status: "searching" | "matched" | "error";
  searchTime: number;
  error?: string | null;
}

// Animated Ring Component
function PulsingRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[1, 2, 3, 4].map((ring) => (
        <div
          key={ring}
          className="absolute rounded-full border-2"
          style={{
            width: `${100 + ring * 60}px`,
            height: `${100 + ring * 60}px`,
            borderColor: ring % 2 === 0 ? 'rgba(128, 192, 244, 0.3)' : 'rgba(173, 213, 245, 0.2)',
            animation: `pulseRing 3s ease-out infinite`,
            animationDelay: `${ring * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// Floating Particles Component
function FloatingParticles() {
  // Use state to store random values after mount
  const [particles, setParticles] = useState<Array<{
    left: string;
    top: string;
    duration: number;
    delay: number;
    size: number;
    color: string;
  }>>([]);

  useEffect(() => {
    // Generate particles only once on client-side mount
    // Use requestAnimationFrame to avoid synchronous state update in effect
    requestAnimationFrame(() => {
      const colors = ['#80c0f4', '#add5f5', '#fffcff'];
      const newParticles = [...Array(25)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 6 + Math.random() * 6,
        delay: Math.random() * 5,
        size: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-[0.5px]"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: 0.4,
            animation: `floatParticle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            boxShadow: `0 0 ${particle.size * 4}px ${particle.color}66`,
          }}
        />
      ))}
    </div>
  );
}

/** After this long with no partner, offer solo practice. */
const OFFER_SOLO_AFTER_S = 45;
/** Matches findMatch's rules: after 90s any band is accepted. */
const ANY_BAND_AFTER_S = 90;

export default function MatchmakingScreen({
  bandLabel,
  onCancel,
  onRetry,
  onPracticeSolo,
  status,
  searchTime,
  error,
}: MatchmakingScreenProps) {
  const { count } = useOnlineCount();
  // The count includes this user while they wait
  const others = Math.max(0, count - 1);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const heading =
    status === "error"
      ? "Không kết nối được"
      : searchTime >= ANY_BAND_AFTER_S
        ? "Đang tìm với mọi band…"
        : "Đang tìm bạn luyện…";

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-oratio-primary to-oratio-secondary flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              ORATIO
            </span>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 hover:border-white/20 transition-all text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Huỷ</span>
          </button>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <FloatingParticles />

          {status === "error" && (
            <div className="relative z-40 w-full max-w-md mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-300">{error || "Có lỗi khi ghép cặp."}</p>
                  <button
                    onClick={onRetry}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Thử lại
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Central Animation */}
          <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center mb-8">
            <PulsingRings />
            <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: "8s" }}>
              <div className="w-48 h-48 lg:w-60 lg:h-60 rounded-full bg-gradient-to-r from-oratio-primary/20 via-transparent to-oratio-secondary/20 blur-xl" />
            </div>
            <div className="relative z-10 w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-oratio-primary to-oratio-secondary flex items-center justify-center shadow-2xl shadow-oratio-primary/40 animate-pulse" style={{ animationDuration: "3s" }}>
              <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-[#050505] flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 lg:w-10 lg:h-10 text-oratio-primary animate-pulse" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white tabular-nums" aria-label={`Đã chờ ${formatTime(searchTime)}`}>
                    {formatTime(searchTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center mb-6" aria-live="polite">
            <h2 className="text-xl lg:text-2xl font-semibold text-white mb-2">{heading}</h2>
            <p className="text-zinc-400 text-sm lg:text-base">
              Band bạn luyện cùng: {bandLabel}
              {searchTime >= ANY_BAND_AFTER_S && bandLabel !== "Bất kỳ" ? " (đã mở rộng)" : ""}
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              {others > 0 ? `${others} người khác đang chờ ghép` : "Chưa có ai khác đang chờ"}
            </p>
          </div>

          {status === "searching" && searchTime >= OFFER_SOLO_AFTER_S && (
            <div className="relative z-40 w-full max-w-md mx-auto p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center">
              <p className="text-sm text-zinc-300 mb-3">
                Chưa có ai phù hợp. Bạn có thể chờ tiếp, hoặc luyện một mình trước rồi quay lại sau.
              </p>
              <button
                onClick={onPracticeSolo}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-oratio-primary to-oratio-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <BookOpen className="w-4 h-4" /> Luyện một mình
              </button>
            </div>
          )}
        </div>

        {/* While-you-wait: how a session works */}
        <div className="mt-8 p-5 lg:p-6 rounded-2xl bg-zinc-900/60 border border-white/5">
          <h3 className="text-base font-semibold text-white mb-2">Buổi luyện diễn ra thế nào?</h3>
          <ul className="text-sm text-zinc-400 space-y-1.5 list-disc pl-5">
            <li>Hai bạn lần lượt làm <span className="text-zinc-200">giám khảo</span> và <span className="text-zinc-200">thí sinh</span>, đổi vai sau mỗi lượt.</li>
            <li>Giám khảo đọc câu hỏi trên màn hình và bấm “Câu tiếp theo”. Thí sinh trả lời bằng giọng nói.</li>
            <li>Có Part 1, Part 2 (thẻ đề, 1 phút chuẩn bị, nói 2 phút) và Part 3, tổng 18 câu.</li>
            <li>Xong buổi, hai bạn chấm nhau theo 4 tiêu chí IELTS.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
