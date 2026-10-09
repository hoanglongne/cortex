'use client';

import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Skull, Flame } from 'lucide-react';

interface EnergyBarProps {
    currentEnergy: number;
    maxEnergy: number;
    streak?: number;
}

export default function EnergyBar({ currentEnergy, maxEnergy, streak = 0 }: EnergyBarProps) {
    const percentage = (currentEnergy / maxEnergy) * 100;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Client-side only rendering to prevent hydration mismatch
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-safe" data-tour-id="energy-bar">
            <div className="mx-auto max-w-md pt-4 pb-2">
                {/* Energy Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        <span className="text-sm font-bold text-accent uppercase tracking-wider cyber-text">
                            Energy
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Streak Badge */}
                        {streak > 0 && (
                            <div data-tour-id="streak-badge" className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold ${streak >= 7 ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-surface-2/60 text-ink-2 border border-line-strong/30'}`}>
                                <Flame className={`w-3.5 h-3.5 ${streak >= 7 ? 'text-accent' : 'text-muted'}`} />
                                {streak}
                            </div>
                        )}
                        <div className="text-lg font-bold text-ink">
                            <span className="text-accent">{currentEnergy}</span>
                            <span className="text-muted mx-1">/</span>
                            <span className="text-muted">{maxEnergy}</span>
                        </div>
                    </div>
                </div>

                {/* Neumorphic Energy Bar Container */}
                <div
                    className="relative h-4 rounded-full overflow-hidden"
                    style={{
                        background: 'var(--color-surface-2)',
                    }}
                >
                    {/* Energy Fill */}
                    <div
                        className="h-full transition-all duration-500 ease-out relative overflow-hidden rounded-full"
                        style={{
                            width: `${percentage}%`,
                            background: percentage > 20 ? 'var(--color-accent)' : 'var(--color-warning)',
                        }}
                    >
                    </div>

                </div>

                {/* Low energy warning */}
                {currentEnergy < 5 && currentEnergy > 0 && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-muted mt-2 animate-pulse font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Low Energy! Resets at midnight</span>
                    </p>
                )}

                {/* Empty energy message */}
                {currentEnergy === 0 && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-muted mt-2 font-bold uppercase font-mono">
                        <Skull className="w-3.5 h-3.5" />
                        <span>Energy Depleted! Come back tomorrow</span>
                    </p>
                )}
            </div>
        </div>
    );
}
