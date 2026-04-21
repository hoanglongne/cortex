"use client";

import { useState, useEffect } from "react";
import { Mic, CheckCircle, User, Star, X } from "lucide-react";

interface PartnerFoundScreenProps {
  partner: { name: string; band: string };
  onStartCall: () => void;
  onDecline?: () => void;
}

// Celebration Particles
function CelebrationParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${50 + (Math.random() - 0.5) * 60}%`,
            top: `${50 + (Math.random() - 0.5) * 60}%`,
            background: ["#80c0f4", "#add5f5", "#10B981", "#F59E0B"][
              Math.floor(Math.random() * 4)
            ],
            animation: `celebrationBurst 1.5s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// Success Ring Animation
function SuccessRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[1, 2].map((ring) => (
        <div
          key={ring}
          className="absolute rounded-full border-2 border-emerald-500/40"
          style={{
            width: `${120 + ring * 50}px`,
            height: `${120 + ring * 50}px`,
            animation: `successRing 1s ease-out forwards`,
            animationDelay: `${ring * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

// Main Partner Found Screen Component
export default function PartnerFoundScreen({
  partner,
  onStartCall,
  onDecline,
}: PartnerFoundScreenProps) {
  const [showContent, setShowContent] = useState(false);

  // Show content after initial animation
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden px-4">
      <CelebrationParticles />

      {/* Main Content Container */}
      <div
        className={`relative z-10 text-center transition-all duration-700 ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
      >
        {/* Success Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8 animate-bounce-in">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">
            Partner Found!
          </span>
        </div>

        {/* Partner Avatar */}
        <div className="relative w-40 h-40 lg:w-48 lg:h-48 mx-auto mb-8">
          <SuccessRings />

          {/* Avatar Circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-oratio-primary to-oratio-secondary p-1 animate-scale-in">
            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
              <User className="w-16 h-16 lg:w-20 lg:h-20 text-zinc-500" />
            </div>
          </div>

          {/* Online Indicator */}
          <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[#050505] animate-pulse" />
        </div>

        {/* Partner Info */}
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
          {partner.name}
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-oratio-primary/10 to-oratio-secondary/10 border border-white/10 mb-6">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-zinc-300">
            Band {partner.band}
          </span>
        </div>

        {/* Connection Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/60 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-zinc-400">Excellent connection</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/60 border border-white/5">
            <Mic className="w-4 h-4 text-zinc-500" />
            <span className="text-sm text-zinc-400">Audio ready</span>
          </div>
        </div>

        {/* Ready Button */}
        <button
          onClick={onStartCall}
          className="group relative mt-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="relative bg-gradient-to-r from-blue-500 to-violet-500 rounded-full px-12 py-6 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Mic className="w-6 h-6 text-white" />
              <span className="text-xl font-semibold text-white">I'm Ready!</span>
            </div>
          </div>
        </button>

        <p className="text-zinc-400 mt-6 text-sm">Click when you're ready to start the call</p>
        {/* Decline Button (optional) */}
        {onDecline && (
          <button
            onClick={onDecline}
            className="mt-4 px-6 py-3 rounded-full bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm font-medium flex items-center gap-2 mx-auto"
          >
            <X className="w-4 h-4" />
            Find another partner
          </button>
        )}      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-oratio-primary/5 to-transparent pointer-events-none" />
    </div>
  );
}

