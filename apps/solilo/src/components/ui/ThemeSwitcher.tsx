'use client';

import { useState, useEffect } from 'react';
import { useTheme, THEMES } from '@/components/ThemeProvider';

export function ThemeSwitcher() {
    const { theme, setThemeId } = useTheme();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50" suppressHydrationWarning>
            {/* Toggle button - just text */}
            <button
                onClick={() => setOpen(!open)}
                className="px-4 py-2 rounded-lg border border-surface-light bg-surface font-mono text-xs uppercase tracking-wider text-foreground transition-all duration-200 hover:border-accent active:scale-95 shadow-lg"
                aria-label="Change theme"
            >
                {mounted ? theme.name : 'Interrogation'}
            </button>

            {/* Theme list popup */}
            {open && (
                <div className="absolute bottom-14 right-0 rounded-lg border border-surface-light bg-surface p-3 shadow-xl panel-enter min-w-[220px]">
                    <div className="flex flex-col gap-2">
                        {THEMES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setThemeId(t.id);
                                    setOpen(false);
                                }}
                                className={`flex items-center justify-between gap-3 px-3 py-2 rounded text-left font-mono text-sm transition-all duration-150 ${t.id === theme.id
                                    ? 'bg-accent/15 text-accent'
                                    : 'text-foreground hover:bg-surface-light/30'
                                    }`}
                            >
                                <span className="uppercase tracking-wide">{t.name}</span>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="w-4 h-4 rounded border border-white/10"
                                        style={{ background: t.colors.accent }}
                                    />
                                    <span
                                        className="w-4 h-4 rounded border border-white/10"
                                        style={{ background: t.colors.surface }}
                                    />
                                    <span
                                        className="w-4 h-4 rounded border border-white/10"
                                        style={{ background: t.colors.background }}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
