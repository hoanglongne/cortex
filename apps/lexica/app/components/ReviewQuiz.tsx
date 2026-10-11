'use client';

import { useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { getAllCards } from '../lib/content/repository';
import { VocabCardData } from '../types/vocab';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface ReviewQuizProps {
    card: VocabCardData;
    onSwipe: (direction: 'left' | 'right', source?: 'manual' | 'voice' | 'quiz') => void;
}

export default function ReviewQuiz({ card, onSwipe }: ReviewQuizProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const { quizCorrect, quizWrong } = useSoundEffects();

    const options = useMemo(() => {
        const others = getAllCards().filter(c => c.id !== card.id);
        // eslint-disable-next-line react-hooks/purity
        const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
        const all = [card.translationHint, ...shuffled.map(c => c.translationHint)];
        // eslint-disable-next-line react-hooks/purity
        return all.sort(() => Math.random() - 0.5);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [card.id]);

    const handleSelect = (option: string) => {
        if (answered) return;
        setSelected(option);
        setAnswered(true);
        const isCorrect = option === card.translationHint;

        // Play sound feedback
        if (isCorrect) {
            quizCorrect();
        } else {
            quizWrong();
        }

        setTimeout(() => {
            onSwipe(isCorrect ? 'right' : 'left', 'quiz');
        }, 700);
    };

    return (
        <div className="space-y-1.5">
            <p className="text-[11px] text-warning/80 text-center font-medium">Chọn nghĩa đúng của <span className="font-bold text-warning">{card.word}</span>:</p>
            {options.map((option, i) => {
                const isSelected = selected === option;
                const isCorrect = option === card.translationHint;

                let cls = 'bg-surface-2/60 border-line-strong text-ink-2 hover:border-accent/50 hover:bg-surface-2/80 active:scale-[0.98]';
                if (answered && isCorrect) {
                    cls = 'bg-accent/20 border-accent/50 text-accent';
                } else if (answered && isSelected && !isCorrect) {
                    cls = 'bg-danger/20 border-danger/50 text-danger';
                } else if (answered) {
                    cls = 'bg-surface-2/30 border-line text-muted';
                }

                return (
                    <button
                        key={i}
                        onClick={() => handleSelect(option)}
                        disabled={answered}
                        className={`w-full px-3 py-2 rounded-lg border text-xs text-left transition-colors flex items-center gap-2 ${cls}`}
                    >
                        {answered && isCorrect && <Check className="w-3 h-3 shrink-0 text-accent" />}
                        {answered && isSelected && !isCorrect && <X className="w-3 h-3 shrink-0 text-danger" />}
                        <span className="line-clamp-1">{option}</span>
                    </button>
                );
            })}
        </div>
    );
}
