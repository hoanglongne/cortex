'use client';

import { useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type Theme = 'system' | 'light' | 'dark';
const KEY = 'teach-theme';
const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
const LABEL: Record<Theme, string> = { system: 'Theo máy', light: 'Sáng', dark: 'Tối' };

function read(): Theme {
    try {
        const t = localStorage.getItem(KEY);
        return t === 'light' || t === 'dark' ? t : 'system';
    } catch {
        return 'system';
    }
}

/** Light, dark, or the system's: one button that cycles. */
export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => (typeof window === 'undefined' ? 'system' : read()));
    const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
    return (
        <button
            onClick={() => {
                const next = NEXT[theme];
                setTheme(next);
                try {
                    if (next === 'system') localStorage.removeItem(KEY);
                    else localStorage.setItem(KEY, next);
                } catch {
                    // Private mode: the choice lasts this visit.
                }
                if (next === 'system') delete document.documentElement.dataset.theme;
                else document.documentElement.dataset.theme = next;
            }}
            className="mt-1 flex items-center gap-1.5 text-sm text-muted hover:text-ink"
            aria-label={`Giao diện: ${LABEL[theme]}. Bấm để đổi`}
        >
            <Icon className="h-4 w-4" /> Giao diện: {LABEL[theme]}
        </button>
    );
}
