'use client';

import { LexicaLogo } from './LexicaLogo';
import { useState, useEffect } from 'react';
import { FlaskConical, Gamepad2, Zap } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface LevelTestWelcomeProps {
    onStartTest: () => void;
    onSkipToManual: () => void;
}

export default function LevelTestWelcome({ onStartTest, onSkipToManual }: LevelTestWelcomeProps) {
    const { buttonPress, click } = useSoundEffects();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="w-full px-4 relative">
            {/* Logo - Top Left - Hidden on mobile when scrolled */}
            <div className={`fixed top-4 left-4 md:top-6 md:left-6 z-50 transition-opacity duration-300 ${isScrolled ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
                <h1 className="text-ink">
                    <LexicaLogo className="h-6 md:h-7 w-auto" />
                </h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-xl mx-auto pt-16 md:pt-32 space-y-8 pb-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="lx-hard inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent text-on-accent">
                        <Zap className="w-8 h-8" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
                            Chào mừng đến LEXICA
                        </h2>
                        <p className="text-muted max-w-md mx-auto leading-relaxed">
                            Để trải nghiệm tốt nhất, hãy cho chúng tôi biết trình độ của bạn
                        </p>
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {/* Test Option - Recommended */}
                    <button
                        onClick={() => {
                            buttonPress();
                            onStartTest();
                        }}
                        className="lx-soft lx-press w-full p-6 rounded-[20px] bg-surface group text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="lx-soft p-3 rounded-xl bg-surface-2 shrink-0">
                                <FlaskConical className="w-6 h-6 text-ink" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-ink">
                                        Test nhanh
                                    </h3>
                                    <span className="lx-sticker whitespace-nowrap text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-surface text-ink">
                                        Khuyên dùng
                                    </span>
                                </div>
                                <p className="text-sm text-muted leading-relaxed">
                                    15–30 câu, khoảng 6 phút. Câu hỏi khó dần hoặc dễ dần theo câu trả lời của bạn
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Manual Option */}
                    <button
                        onClick={() => {
                            click();
                            onSkipToManual();
                        }}
                        className="lx-soft lx-press w-full p-6 rounded-[20px] bg-surface group text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="lx-soft p-3 rounded-xl bg-surface-2 shrink-0">
                                <Gamepad2 className="w-6 h-6 text-muted group-hover:text-ink-2 transition-colors" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-lg font-semibold text-ink">
                                    Tự chọn level
                                </h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    Chọn level phù hợp với trình độ của bạn. Hệ thống sẽ tự động điều chỉnh độ khó theo performance của bạn.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
