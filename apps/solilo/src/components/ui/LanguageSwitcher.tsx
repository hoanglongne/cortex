'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import type { Language } from '@/lib/translations';

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const currentLang = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-surface-light hover:border-accent/30 transition-all duration-200 text-foreground"
                aria-label="Change language"
            >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline">
                    {currentLang.id}
                </span>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                >
                    <path d="M2 4l4 4 4-4" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-14 right-0 rounded-lg border border-surface-light bg-surface p-2 shadow-xl panel-enter min-w-[180px] z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => {
                                setLanguage(lang.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all duration-150 text-left ${lang.id === language
                                    ? 'bg-accent/10 text-accent'
                                    : 'text-foreground hover:bg-muted/10'
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-mono text-sm flex-1">{lang.label}</span>
                            {lang.id === language && (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M2 7l3.5 3.5L12 3" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
