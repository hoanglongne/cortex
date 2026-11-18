'use client';

import { useEffect, useState } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { parseThemePref, resolveTheme, THEME_BAR, THEME_KEY, type ThemePref } from '../lib/theme';

/** Event fired when the theme choice changes in Cài đặt. */
export const THEME_EVENT = 'lexica-theme';

/** Keeps data-theme and data-branch on <html> in step with the saved choice, the system setting and the learner's branch. */
export default function ThemeSync() {
    const branch = useLexicaStore((s) => s.path?.branch ?? null);
    const [pref, setPref] = useState<ThemePref>('dark');
    useEffect(() => {
        const read = () => {
            try { setPref(parseThemePref(localStorage.getItem(THEME_KEY))); } catch { /* private mode */ }
        };
        read();
        window.addEventListener(THEME_EVENT, read);
        window.addEventListener('storage', read);
        return () => {
            window.removeEventListener(THEME_EVENT, read);
            window.removeEventListener('storage', read);
        };
    }, []);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = () => {
            const t = resolveTheme(pref, mq.matches);
            const root = document.documentElement;
            root.setAttribute('data-theme', t);
            root.style.colorScheme = t;
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_BAR[t]);
        };
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, [pref]);
    useEffect(() => {
        const root = document.documentElement;
        if (branch) root.setAttribute('data-branch', branch);
        else root.removeAttribute('data-branch');
    }, [branch]);
    return null;
}

/** Saves a theme choice and tells ThemeSync. */
export function saveThemePref(p: ThemePref) {
    try { localStorage.setItem(THEME_KEY, p); } catch { /* private mode */ }
    window.dispatchEvent(new Event(THEME_EVENT));
}
