"use client";

import { useState, useEffect } from "react";
import { X, Mic, Globe, Users, Sparkles, AlertCircle } from "lucide-react";

interface MatchmakingScreenProps {
  bandRange: string;
  onCancel: () => void;
  onPartnerFound: (partner: {
    name: string;
    band: string;
    avatarUrl?: string;
  }) => void;
  status?: "searching" | "matched" | "error";
  searchTime?: number;
  error?: string | null;
  userId?: string;
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

// Status Badge Component
function StatusBadge({
  icon: Icon,
  text,
  delay,
}: {
  icon: React.ElementType;
  text: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-white/10 transition-all duration-500 hover:scale-105 hover:border-oratio-primary/30 hover:bg-zinc-900 group ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
    >
      <Icon className="w-4 h-4 text-oratio-primary group-hover:scale-110 transition-transform" />
      <span className="text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors">{text}</span>
    </div>
  );
}

// Main Matchmaking Screen Component
export default function MatchmakingScreen({
  bandRange,
  onCancel,
  onPartnerFound,
  status = "searching",
  searchTime: externalSearchTime,
  error,
  userId,
}: MatchmakingScreenProps) {
  // Internal search time for demo mode (when externalSearchTime is undefined)
  const [internalSearchTime, setInternalSearchTime] = useState(0);
  const [statusText, setStatusText] = useState("Searching for partners...");

  // Use external search time if provided, otherwise use internal
  const searchTime = externalSearchTime ?? internalSearchTime;

  // Timer effect for demo mode
  useEffect(() => {
    if (externalSearchTime !== undefined) return; // Skip if using external time

    const timer = setInterval(() => {
      setInternalSearchTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [externalSearchTime]);

  // Status text rotation
  useEffect(() => {
    const statuses = [
      "Searching for partners...",
      "Looking for Band " + bandRange + " learners...",
      "Connecting to global network...",
      "Finding the best match for you...",
    ];

    const interval = setInterval(() => {
      setStatusText(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [bandRange]);

  // Demo mode: Simulate finding a partner after some time
  // This is only used if status is not provided externally
  useEffect(() => {
    if (externalSearchTime !== undefined) return; // Skip if using real matchmaking

    const timer = setTimeout(() => {
      onPartnerFound({ name: "Alex", band: "6.5" });
    }, 8000);

    return () => clearTimeout(timer);
  }, [onPartnerFound, externalSearchTime]);

  // Format search time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Desktop Layout Container */}
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
            <span className="text-sm font-medium">Cancel</span>
          </button>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <FloatingParticles />

          {/* Error State */}
          {status === "error" && error && (
            <div className="absolute top-16 left-0 right-0 p-4 z-40">
              <div className="max-w-md mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Central Animation */}
          <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center mb-8">
            <PulsingRings />

            {/* Rotating glow ring */}
            <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: "8s" }}>
              <div className="w-48 h-48 lg:w-60 lg:h-60 rounded-full bg-gradient-to-r from-oratio-primary/20 via-transparent to-oratio-secondary/20 blur-xl" />
            </div>

            {/* Center Circle */}
            <div className="relative z-10 w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-oratio-primary to-oratio-secondary flex items-center justify-center shadow-2xl shadow-oratio-primary/40 animate-pulse" style={{ animationDuration: "3s" }}>
              <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-[#050505] flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 lg:w-10 lg:h-10 text-oratio-primary animate-pulse" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white tabular-nums">
                    {formatTime(searchTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center mb-8">
            <h2 className="text-xl lg:text-2xl font-semibold text-white mb-2">
              {status === "error" ? "Connection Issue" : statusText}
            </h2>
            <p className="text-zinc-500 text-sm lg:text-base">
              Matching with Band {bandRange} learners
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <StatusBadge icon={Globe} text="Global Search Active" delay={500} />
            <StatusBadge icon={Users} text="142 Learners Online" delay={1000} />
            <StatusBadge icon={Sparkles} text="Smart Matching" delay={1500} />
          </div>
        </div>

        {/* Bottom Info Card */}
        <div className="mt-8 p-5 lg:p-6 rounded-2xl bg-zinc-900/60 border border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white mb-1">
                While you wait...
              </h3>
              <p className="text-sm text-zinc-400">
                Take a moment to think about topics you&apos;d like to discuss.
                Common IELTS topics include travel, education, technology, and
                environment.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-zinc-300 whitespace-nowrap">
                Average wait: ~30 seconds
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
