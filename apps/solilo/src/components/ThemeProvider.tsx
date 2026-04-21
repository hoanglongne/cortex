'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface ThemeColors {
    background: string;
    foreground: string;
    surface: string;
    surfaceLight: string;
    accent: string;
    accentDim: string;
    accentRgb: string; // "R, G, B" for rgba() usage
    muted: string;
    bandGold: string;
    bandGoldRgb: string;
}

export interface Theme {
    id: string;
    name: string;
    emoji: string;
    colors: ThemeColors;
}

export const THEMES: Theme[] = [
    {
        id: 'interrogation',
        name: 'Interrogation',
        emoji: '🔴',
        colors: {
            background: '#0F172A',
            foreground: '#E2E8F0',
            surface: '#1E293B',
            surfaceLight: '#334155',
            accent: '#F43F5E',
            accentDim: '#881337',
            accentRgb: '244, 63, 94',
            muted: '#64748B',
            bandGold: '#FBBF24',
            bandGoldRgb: '251, 191, 36',
        },
    },
    {
        id: 'midnight',
        name: 'Midnight',
        emoji: '🟣',
        colors: {
            background: '#0C0A1D',
            foreground: '#E0DEF4',
            surface: '#1A1730',
            surfaceLight: '#2D2A45',
            accent: '#A78BFA',
            accentDim: '#5B21B6',
            accentRgb: '167, 139, 250',
            muted: '#6E6A8E',
            bandGold: '#FCD34D',
            bandGoldRgb: '252, 211, 77',
        },
    },
    {
        id: 'terminal',
        name: 'Terminal',
        emoji: '🟢',
        colors: {
            background: '#0A0A0A',
            foreground: '#D4D4D4',
            surface: '#171717',
            surfaceLight: '#262626',
            accent: '#22C55E',
            accentDim: '#14532D',
            accentRgb: '34, 197, 94',
            muted: '#525252',
            bandGold: '#FBBF24',
            bandGoldRgb: '251, 191, 36',
        },
    },
    {
        id: 'ember',
        name: 'Ember',
        emoji: '🟠',
        colors: {
            background: '#1A0F0A',
            foreground: '#F5E6D3',
            surface: '#2A1A10',
            surfaceLight: '#3D2A1A',
            accent: '#F97316',
            accentDim: '#9A3412',
            accentRgb: '249, 115, 22',
            muted: '#78716C',
            bandGold: '#FDE047',
            bandGoldRgb: '253, 224, 71',
        },
    },
    {
        id: 'arctic',
        name: 'Arctic',
        emoji: '🔵',
        colors: {
            background: '#0B1120',
            foreground: '#E0F2FE',
            surface: '#132035',
            surfaceLight: '#1E3A55',
            accent: '#38BDF8',
            accentDim: '#0C4A6E',
            accentRgb: '56, 189, 248',
            muted: '#5B7A99',
            bandGold: '#FCD34D',
            bandGoldRgb: '252, 211, 77',
        },
    },
    {
        id: 'morning',
        name: 'Morning',
        emoji: '☀️',
        colors: {
            background: '#FBF8F1',
            foreground: '#2C2416',
            surface: '#F5F1E8',
            surfaceLight: '#EBE5D9',
            accent: '#D97706',
            accentDim: '#92400E',
            accentRgb: '217, 119, 6',
            muted: '#78716C',
            bandGold: '#CA8A04',
            bandGoldRgb: '202, 138, 4',
        },
    },
    {
        id: 'sakura',
        name: 'Sakura',
        emoji: '🌸',
        colors: {
            background: '#FFF5F7',
            foreground: '#2D1820',
            surface: '#FFE4E9',
            surfaceLight: '#FED7E2',
            accent: '#EC4899',
            accentDim: '#9F1239',
            accentRgb: '236, 72, 153',
            muted: '#9CA3AF',
            bandGold: '#F59E0B',
            bandGoldRgb: '245, 158, 11',
        },
    },
    {
        id: 'ocean',
        name: 'Ocean',
        emoji: '🌊',
        colors: {
            background: '#F0F9FF',
            foreground: '#0C2340',
            surface: '#E0F2FE',
            surfaceLight: '#BAE6FD',
            accent: '#0EA5E9',
            accentDim: '#075985',
            accentRgb: '14, 165, 233',
            muted: '#64748B',
            bandGold: '#F59E0B',
            bandGoldRgb: '245, 158, 11',
        },
    },
    {
        id: 'forest',
        name: 'Forest',
        emoji: '🌿',
        colors: {
            background: '#F7FBF5',
            foreground: '#1C2817',
            surface: '#ECFDF5',
            surfaceLight: '#D1FAE5',
            accent: '#10B981',
            accentDim: '#065F46',
            accentRgb: '16, 185, 129',
            muted: '#6B7280',
            bandGold: '#F59E0B',
            bandGoldRgb: '245, 158, 11',
        },
    },
    {
        id: 'sunset',
        name: 'Sunset',
        emoji: '🌅',
        colors: {
            background: '#FFF7ED',
            foreground: '#2E1C08',
            surface: '#FFEDD5',
            surfaceLight: '#FED7AA',
            accent: '#F97316',
            accentDim: '#9A3412',
            accentRgb: '249, 115, 22',
            muted: '#78716C',
            bandGold: '#EAB308',
            bandGoldRgb: '234, 179, 8',
        },
    },
];

interface ThemeContextValue {
    theme: Theme;
    setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: THEMES[0],
    setThemeId: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

function applyThemeToDOM(colors: ThemeColors, isDark: boolean) {
    const root = document.documentElement;
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-foreground', colors.foreground);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-surface-light', colors.surfaceLight);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-dim', colors.accentDim);
    root.style.setProperty('--color-accent-rgb', colors.accentRgb);
    root.style.setProperty('--color-muted', colors.muted);
    root.style.setProperty('--color-band-gold', colors.bandGold);
    root.style.setProperty('--color-band-gold-rgb', colors.bandGoldRgb);

    // Apply dark class for Tailwind dark mode
    if (isDark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [themeId, setThemeId] = useState('interrogation');

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('solilo-theme');
        if (saved && THEMES.some((t) => t.id === saved)) {
            setThemeId(saved);
        }
    }, []);

    const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
    const isDark = ['interrogation', 'midnight', 'terminal', 'ember', 'arctic'].includes(theme.id);

    useEffect(() => {
        if (mounted) {
            applyThemeToDOM(theme.colors, isDark);
            localStorage.setItem('solilo-theme', theme.id);
        }
    }, [theme, mounted, isDark]);

    const handleSetThemeId = useCallback((id: string) => {
        setThemeId(id);
    }, []);

    return (
        <ThemeContext value={{ theme, setThemeId: handleSetThemeId }}>
            {children}
        </ThemeContext>
    );
}
