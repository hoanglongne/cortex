'use client';

import { FlaskConical, Gamepad2, Zap } from 'lucide-react';

interface LevelTestWelcomeProps {
    onStartTest: () => void;
    onSkipToManual: () => void;
}

export default function LevelTestWelcome({ onStartTest, onSkipToManual }: LevelTestWelcomeProps) {
    return (
        <div className="w-full h-full px-4 relative">
            {/* Logo - Top Left */}
            <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    LEXICA
                </h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-xl mx-auto pt-24 md:pt-32 space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <Zap className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                            Chào mừng đến LEXICA
                        </h2>
                        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                            Để trải nghiệm tốt nhất, hãy cho chúng tôi biết trình độ của bạn
                        </p>
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {/* Test Option - Recommended */}
                    <button
                        onClick={onStartTest}
                        className="w-full p-6 rounded-xl bg-white/[0.03] border border-white/20 hover:bg-white/[0.05] hover:border-cyan-500/50 transition-all group text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/15 transition-colors shrink-0">
                                <FlaskConical className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-white">
                                        Test nhanh
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                                        Khuyên dùng
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    5 câu hỏi giúp hệ thống đánh giá và gợi ý level phù hợp nhất
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Manual Option */}
                    <button
                        onClick={onSkipToManual}
                        className="w-full p-6 rounded-xl bg-white/[0.02] border border-white/20 hover:bg-white/[0.04] hover:border-white/30 transition-all group text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 group-hover:bg-slate-700/70 transition-colors shrink-0">
                                <Gamepad2 className="w-6 h-6 text-slate-400 group-hover:text-slate-300 transition-colors" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-lg font-semibold text-white">
                                    Tự chọn level
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Chọn level phù hợp với trình độ của bạn
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Footer Info */}
                <div className="text-center pt-4">
                    <p className="text-xs text-slate-500">
                        Hệ thống sẽ tự động điều chỉnh độ khó theo performance
                    </p>
                </div>
            </div>
        </div>
    );
}
