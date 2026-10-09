'use client';

import { useEffect } from 'react';
import { Sprout, Leaf, Sparkles, Trophy, Lightbulb, Target as TargetIcon, CheckCircle } from 'lucide-react';
import { DifficultyLevel } from '../types/vocab';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface LevelTestResultProps {
    score: number;
    totalQuestions: number;
    recommendedLevel: DifficultyLevel;
    calibratedElo?: number;
    onAccept: () => void;
    onChooseManually: () => void;
}

const LEVEL_INFO = {
    beginner: {
        icon: Sprout,
        label: 'Cơ bản',
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent/30',
        description: 'Bạn đang ở giai đoạn xây dựng nền tảng. Từ vựng cơ bản sẽ giúp bạn tự tin hơn!',
        cardCount: '40 từ',
        eloRange: 'ELO 800-950'
    },
    intermediate: {
        icon: Leaf,
        label: 'Trung cấp',
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent/30',
        description: 'Bạn đã có nền tảng tốt! Các từ vựng phổ biến trong IELTS sẽ nâng band điểm của bạn.',
        cardCount: '72 từ',
        eloRange: 'ELO 950-1200'
    },
    advanced: {
        icon: Sparkles,
        label: 'Nâng cao',
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent/30',
        description: 'Ấn tượng! Bạn đã sẵn sàng với từ vựng học thuật phức tạp hơn.',
        cardCount: '98 từ',
        eloRange: 'ELO 1100-1400'
    },
    expert: {
        icon: Trophy,
        label: 'Chuyên gia',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/30',
        description: 'Xuất sắc! Bạn thuộc top tier. Từ vựng advanced cho band 8+ đang chờ bạn!',
        cardCount: '90 từ',
        eloRange: 'ELO 1350-1500'
    }
};

export default function LevelTestResult({
    score,
    totalQuestions,
    recommendedLevel,
    calibratedElo,
    onAccept,
    onChooseManually
}: LevelTestResultProps) {
    const levelInfo = LEVEL_INFO[recommendedLevel];
    const percentage = Math.round((score / totalQuestions) * 100);
    const { levelUp, buttonPress, click } = useSoundEffects();

    // Play celebration sound on mount
    useEffect(() => {
        levelUp();
    }, [levelUp]);

    return (
        <div className="w-full h-full px-4">
            {/* Logo - Top Left */}
            <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
                <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
                    LEXICA
                </h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-2xl mx-auto pt-20 md:pt-24 space-y-6 md:space-y-8">
                {/* Celebration Animation */}
                <div className="text-center space-y-3 md:space-y-4 animate-[fadeIn_0.5s_ease-out]">
                    <div className="flex justify-center">
                        <div className="p-6 md:p-8 bg-surface/50 rounded-2xl animate-[bounce_1s_ease-in-out]">
                            <levelInfo.icon className={`w-16 h-16 md:w-20 md:h-20 ${levelInfo.color}`} />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink">
                        Kết quả của bạn!
                    </h1>
                </div>

                {/* Score Card */}
                <div className="bg-surface/50 backdrop-blur border border-line rounded-xl md:rounded-2xl p-5 md:p-8 space-y-5 md:space-y-6">
                    {/* Score Display */}
                    <div className="text-center space-y-2">
                        <div className="text-5xl md:text-6xl font-bold text-ink">
                            {score}/{totalQuestions}
                        </div>
                        <div className="text-lg md:text-xl text-ink-2">
                            {percentage}% chính xác
                        </div>
                        {calibratedElo !== undefined && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-2/60 rounded-full text-sm font-mono text-accent border border-accent/20">
                                <TargetIcon className="w-3.5 h-3.5" />
                                ELO khởi điểm: {calibratedElo}
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-bg rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ease-out ${percentage >= 80 ? 'bg-warning' :
 percentage >= 60 ? 'bg-accent' :
 percentage >= 40 ? 'bg-accent' :
 'bg-accent'
 }`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>

                    <div className="h-px bg-surface-2"></div>

                    {/* Recommended Level */}
                    <div className={`p-4 md:p-6 rounded-lg md:rounded-xl ${levelInfo.bgColor} border-2 ${levelInfo.borderColor}`}>
                        <div className="flex items-start gap-3 md:gap-4">
                            <div className="p-2 bg-surface/50 rounded-lg shrink-0">
                                <levelInfo.icon className="w-8 h-8 md:w-10 md:h-10 text-accent" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className={`text-xl md:text-2xl font-bold ${levelInfo.color} mb-1`}>
                                        Level: {levelInfo.label}
                                    </h3>
                                    <p className="text-ink-2 text-xs md:text-sm leading-relaxed">
                                        {levelInfo.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                                    <div className="bg-bg/50 rounded-lg p-3">
                                        <div className="text-muted mb-1">Số lượng từ</div>
                                        <div className={`font-bold ${levelInfo.color}`}>
                                            {levelInfo.cardCount}
                                        </div>
                                    </div>
                                    <div className="bg-bg/50 rounded-lg p-3">
                                        <div className="text-muted mb-1">Độ khó</div>
                                        <div className={`font-bold font-mono text-xs ${levelInfo.color}`}>
                                            {levelInfo.eloRange}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 md:space-y-3">
                        <button
                            onClick={() => {
                                buttonPress();
                                onAccept();
                            }}
                            className="w-full py-3 md:py-4 rounded-lg md:rounded-xl bg-accent text-on-accent font-bold text-base md:text-lg hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Bắt đầu với level {levelInfo.label}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                click();
                                onChooseManually();
                            }}
                            className="w-full py-2.5 md:py-3 rounded-lg md:rounded-xl bg-surface-2/30 border border-line-strong/30 text-ink-2 text-sm md:text-base hover:border-line-strong hover:bg-surface-2/50 transition-all"
                        >
                            Hoặc tự chọn level khác
                        </button>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="text-center text-xs text-muted space-y-1">
                    <p className="flex items-center justify-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Hệ thống sẽ tự động điều chỉnh độ khó dựa trên performance của bạn</span>
                    </p>
                    <p className="flex items-center justify-center gap-1.5">
                        <TargetIcon className="w-3.5 h-3.5" />
                        <span>Bạn có thể thay đổi level bất cứ lúc nào trong quá trình học</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
