'use client';

import { useState, useEffect } from 'react';
import { Sprout, Leaf, Sparkles, Trophy, Target, CheckCircle } from 'lucide-react';
import { DifficultyLevel } from '../types/vocab';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface LevelSelectorProps {
    onSelect: (level: DifficultyLevel | 'all') => void;
    currentLevel: DifficultyLevel | 'all' | null;
}

interface LevelOption {
    value: DifficultyLevel | 'all';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    eloRange: string;
    cardCount: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
    {
        value: 'beginner',
        label: 'Cơ bản',
        icon: Sprout,
        description: 'Từ vựng dễ, phù hợp người mới bắt đầu',
        eloRange: 'ELO 800-950',
        cardCount: '243 từ',
    },
    {
        value: 'intermediate',
        label: 'Trung cấp',
        icon: Leaf,
        description: 'Từ vựng phổ biến trong IELTS',
        eloRange: 'ELO 950-1200',
        cardCount: '139 từ',
    },
    {
        value: 'advanced',
        label: 'Nâng cao',
        icon: Sparkles,
        description: 'Từ vựng học thuật phức tạp hơn',
        eloRange: 'ELO 1100-1400',
        cardCount: '98 từ',
    },
    {
        value: 'expert',
        label: 'Chuyên gia',
        icon: Trophy,
        description: 'Từ vựng advanced cho band 8+',
        eloRange: 'ELO 1350-1500',
        cardCount: '90 từ',
    },
    {
        value: 'all',
        label: 'Tất cả',
        icon: Target,
        description: 'Học hết 570 từ, hệ thống sẽ adaptive theo khả năng',
        eloRange: 'ELO 800-1500',
        cardCount: '570 từ',
    },
];

export default function LevelSelector({ onSelect, currentLevel }: LevelSelectorProps) {
    const { buttonPress } = useSoundEffects();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="w-full px-4">
            {/* Logo - Top Left - Hidden on mobile when scrolled */}
            <div className={`fixed top-4 left-4 md:top-6 md:left-6 z-50 transition-opacity duration-300 ${isScrolled ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
                <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
                    LEXICA
                </h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-4xl mx-auto pt-14 md:pt-20 space-y-5 pb-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight">
                        Chọn độ khó
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        Chọn level phù hợp với trình độ của bạn. Bạn có thể đổi bất cứ lúc nào. Hệ thống sẽ tự động điều chỉnh độ khó theo performance của bạn.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {LEVEL_OPTIONS.map((option) => {
                        const isSelected = currentLevel === option.value;

                        return (
                            <button
                                key={option.value}
                                onClick={() => {
                                    buttonPress();
                                    onSelect(option.value);
                                }}
                                className={`
 p-6 rounded-xl border text-left transition-all
 ${isSelected
 ? 'bg-accent/10 border-accent/50'
 : 'bg-ink/[0.02] border-ink/20 hover:bg-ink/[0.04] hover:border-ink/30'
 }
 `}
                            >
                                {/* Selected indicator */}
                                {isSelected && (
                                    <div className="absolute top-3 right-3">
                                        <CheckCircle className="w-5 h-5 text-accent" />
                                    </div>
                                )}

                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className={`p-3 rounded-lg ${isSelected
 ? 'bg-accent/10 border border-accent/20'
 : 'bg-ink/5'
 }`}>
                                        <option.icon className={`w-8 h-8 ${isSelected ? 'text-accent' : 'text-muted'
 }`} />
                                    </div>
                                </div>

                                {/* Label */}
                                <div className={`text-xl font-semibold mb-2 ${isSelected ? 'text-ink' : 'text-ink'
 }`}>
                                    {option.label}
                                </div>

                                {/* Description */}
                                <p className={`text-sm mb-4 min-h-10 leading-relaxed ${isSelected ? 'text-ink-2' : 'text-muted'
 }`}>
                                    {option.description}
                                </p>

                                {/* Stats */}
                                <div className={`space-y-1.5 text-xs border-t pt-3 ${isSelected ? 'border-accent/20' : 'border-ink/5'
 }`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted">Độ khó:</span>
                                        <span className={`font-mono text-xs ${isSelected ? 'text-accent' : 'text-muted'
 }`}>{option.eloRange}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted">Số lượng:</span>
                                        <span className={`font-semibold ${isSelected ? 'text-accent' : 'text-ink-2'
 }`}>{option.cardCount}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
