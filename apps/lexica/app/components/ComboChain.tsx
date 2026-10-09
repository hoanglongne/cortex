'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, X, Zap } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { VocabCardData } from '../types/vocab';

interface ComboChainProps {
    learnedWordIds: string[];
    onClose: () => void;
    onGameEnd?: (score: number) => void;
}

/** Fisher-Yates shuffle — trả về mảng mới đã xáo */
function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function ComboChain({ learnedWordIds, onClose, onGameEnd }: ComboChainProps) {
    const { click, quizCorrect, quizWrong } = useSoundEffects();

    // Shuffle queue — đảm bảo mỗi từ xuất hiện 1 lần trước khi lặp lại
    const wordQueueRef = useRef<string[]>([]);

    const [currentCard, setCurrentCard] = useState<Omit<VocabCardData, 'state'> | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [answered, setAnswered] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [highScore, setHighScore] = useState<number | null>(() => {
        const saved = localStorage.getItem('comboChain_highScore');
        return saved ? parseInt(saved) : null;
    });

    const getRandomIndex = (arrayLength: number): number => {
        const randomBuffer = new Uint32Array(1);
        crypto.getRandomValues(randomBuffer);
        return randomBuffer[0] % arrayLength;
    };

    const generateQuestion = () => {
        // Lấy từ tiếp theo từ shuffle queue
        if (wordQueueRef.current.length === 0) {
            wordQueueRef.current = shuffleArray(learnedWordIds);
        }
        const randomId = wordQueueRef.current.pop()!;
        const card = VOCAB_DATABASE.find(c => c.id === randomId);
        if (!card) return;

        // Get 3 wrong answers
        const allOtherCards = VOCAB_DATABASE
            .filter(c => learnedWordIds.includes(c.id) && c.id !== card.id);

        const wrongOptions: string[] = [];
        const usedIndices = new Set<number>();

        while (wrongOptions.length < 3 && wrongOptions.length < allOtherCards.length) {
            const idx = getRandomIndex(allOtherCards.length);
            if (!usedIndices.has(idx)) {
                usedIndices.add(idx);
                wrongOptions.push(allOtherCards[idx].translationHint);
            }
        }

        // Shuffle options
        const allOptions = [card.translationHint, ...wrongOptions];
        const shuffled: string[] = [];
        const optionsSet = new Set(allOptions.map((_, i) => i));

        while (shuffled.length < allOptions.length) {
            const remaining = Array.from(optionsSet);
            const idx = remaining[getRandomIndex(remaining.length)];
            optionsSet.delete(idx);
            shuffled.push(allOptions[idx]);
        }

        setCurrentCard(card);
        setOptions(shuffled);
        setFeedback(null);
        setSelectedAnswer(null);
    };

    const startGame = () => {
        click();
        setIsPlaying(true);
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setAnswered(0);
        // Reset queue khi bắt đầu game mới
        wordQueueRef.current = shuffleArray(learnedWordIds);
        generateQuestion();
    };

    const handleAnswer = (answer: string) => {
        if (!currentCard || feedback !== null) return;

        click();
        setSelectedAnswer(answer);

        if (answer === currentCard.translationHint) {
            quizCorrect();
            setFeedback('correct');
            const newCombo = combo + 1;
            setCombo(newCombo);
            if (newCombo > maxCombo) {
                setMaxCombo(newCombo);
                if (newCombo > (highScore || 0)) {
                    setHighScore(newCombo);
                    localStorage.setItem('comboChain_highScore', newCombo.toString());
                }
            }

            // Score increases exponentially with combo
            const points = 100 * Math.pow(1.5, Math.min(combo, 10));
            setScore(s => Math.round(s + points));
            setAnswered(a => a + 1);

            setTimeout(() => {
                generateQuestion();
            }, 800);
        } else {
            quizWrong();
            setFeedback('wrong');
            setCombo(0); // Reset combo but don't end game

            setTimeout(() => {
                generateQuestion();
            }, 1500);
        }
    };

    const getComboColor = () => {
        if (combo >= 10) return 'text-accent';
        if (combo >= 5) return 'text-accent';
        return 'text-muted';
    };

    const getComboText = () => {
        if (combo >= 10) return 'ON FIRE!';
        if (combo >= 5) return 'GREAT!';
        return '';
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start md:items-center justify-center md:p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full md:max-w-2xl bg-surface border-0 md:border border-line md:rounded-xl px-6 pb-6 pt-16 sm:p-8 relative min-h-full md:min-h-0 md:max-h-[90vh] md:overflow-y-auto"
            >
                <button
                    onClick={() => { click(); if (isPlaying) onGameEnd?.(maxCombo); onClose(); }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-surface-2 text-muted hover:text-ink hover:bg-surface-3 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2">
                        <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                        <h2 className="text-xl sm:text-2xl font-bold text-ink">Combo Chain</h2>
                    </div>
                </div>

                {!isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <div className="p-6 bg-surface-2/50 rounded-lg border border-line-strong">
                            <Flame className="w-12 h-12 text-accent mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-ink mb-2">Cách chơi</h3>
                            <div className="text-sm text-ink-2 space-y-1 text-left max-w-sm mx-auto">
                                <p>• Trả lời đúng → Combo tăng</p>
                                <p>• Combo càng cao → Điểm nhân lên</p>
                                <p>• Sai → Combo về 0 (không game over)</p>
                                <p>• Mục tiêu: Combo chain dài nhất!</p>
                            </div>
                        </div>

                        {highScore !== null && highScore > 0 && (
                            <div className="flex items-center justify-center gap-2 text-sm text-accent">
                                <Trophy className="w-4 h-4" />
                                <span>Best Combo: {highScore}</span>
                            </div>
                        )}

                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-accent hover:bg-accent-strong text-on-accent rounded-lg font-medium transition-all"
                        >
                            Bắt đầu
                        </button>
                    </motion.div>
                )}

                {isPlaying && currentCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Stats Bar */}
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-muted">
                                {answered} answered
                            </div>
                            <div className="text-lg font-bold text-ink">
                                {Math.round(score)}
                            </div>
                        </div>

                        {/* Combo Display */}
                        <div className={`text-center p-6 bg-accent/10 border border-accent/30 rounded-lg`}>
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <Flame className={`w-8 h-8 ${getComboColor()}`} />
                                <motion.p
                                    key={combo}
                                    initial={{ scale: 1.3, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`text-5xl font-bold ${getComboColor()}`}
                                >
                                    {combo}
                                </motion.p>
                                <Flame className={`w-8 h-8 ${getComboColor()}`} />
                            </div>
                            <p className={`text-sm font-bold ${getComboColor()}`}>
                                {getComboText() || 'COMBO CHAIN'}
                            </p>
                            <p className={`text-xs mt-1 transition-opacity ${maxCombo > 0 ? 'text-muted opacity-100' : 'text-subtle opacity-0'}`}>
                                Best: {maxCombo > 0 ? maxCombo : '-'}
                            </p>
                        </div>

                        {/* Question */}
                        <motion.div
                            key={answered}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={`p-6 rounded-lg border-2 text-center transition-all ${feedback === 'correct'
 ? 'bg-accent/10 border-accent'
 : feedback === 'wrong'
 ? 'bg-danger/10 border-danger'
 : 'bg-surface-2/50 border-line-strong'
 }`}
                        >
                            <p className="text-xs text-muted mb-2">English word:</p>
                            <p className="text-2xl sm:text-3xl font-bold text-accent">
                                {currentCard.word}
                            </p>
                        </motion.div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2">
                            {options.map((option, index) => {
                                const isSelected = selectedAnswer === option;
                                const isCorrect = option === currentCard.translationHint;
                                const showResult = feedback !== null;

                                return (
                                    <motion.button
                                        key={index}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleAnswer(option)}
                                        disabled={feedback !== null}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${showResult && isCorrect
 ? 'bg-accent/20 border-accent text-ink'
 : showResult && isSelected
 ? 'bg-danger/20 border-danger text-ink'
 : 'bg-surface-2/50 border-line-strong text-ink-2 hover:border-accent'
 }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${showResult && isCorrect
 ? 'border-accent text-accent'
 : showResult && isSelected
 ? 'border-danger text-danger'
 : 'border-line-strong text-muted'
 }`}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="text-sm sm:text-base">{option}</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Multiplier Info */}
                        <div className="text-center text-xs text-muted">
                            <Zap className="w-3 h-3 inline mr-1" />
                            Điểm nhân: {combo > 0 ? `×${(1.5 ** Math.min(combo - 1, 10)).toFixed(1)}` : '×1.0'}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
