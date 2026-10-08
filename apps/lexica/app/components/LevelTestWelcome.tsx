'use client';

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
                <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
                    LEXICA
                </h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-xl mx-auto pt-16 md:pt-32 space-y-8 pb-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent/10 border border-accent/20">
                        <Zap className="w-8 h-8 text-accent" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight">
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
                        className="w-full p-6 rounded-xl bg-ink/[0.03] border border-ink/20 hover:bg-ink/[0.05] hover:border-accent/50 transition-all group text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent-strong/15 transition-colors shrink-0">
                                <FlaskConical className="w-6 h-6 text-accent" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-ink">
                                        Test nhanh
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded border border-accent/20">
                                        Khuyên dùng
                                    </span>
                                </div>
                                <p className="text-sm text-muted leading-relaxed">
                                    5 câu hỏi giúp hệ thống đánh giá và gợi ý level phù hợp nhất
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
                        className="w-full p-6 rounded-xl bg-ink/[0.02] border border-ink/20 hover:bg-ink/[0.04] hover:border-ink/30 transition-all group text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-surface border border-line group-hover:bg-surface-2/70 transition-colors shrink-0">
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
