'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Trophy, X, RotateCcw, Lightbulb, SkipForward, Heart, Delete } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { getAllCards } from '../lib/content/repository';
import ChallengeButton from './ChallengeButton';

import { VocabCardData } from '../types/vocab';

interface WordScrambleProps {
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

export default function WordScramble({ learnedWordIds, onClose, onGameEnd }: WordScrambleProps) {
    const { click, quizCorrect, quizWrong } = useSoundEffects();

    // Shuffle queue — đảm bảo mỗi từ xuất hiện 1 lần trước khi lặp lại
    const wordQueueRef = useRef<string[]>([]);

    const [currentCard, setCurrentCard] = useState<Omit<VocabCardData, 'state'> | null>(null);
    const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [comboCount, setComboCount] = useState(0);
    const [lives, setLives] = useState(3);
    const [reshuffleCount, setReshuffleCount] = useState(0);
    const [answered, setAnswered] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState<number | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('wordScramble_highScore');
        return saved ? parseInt(saved) : null;
    });
    const [showHint, setShowHint] = useState(false);

    // Keyboard event handler
    // (moved below handleClearLast/handleKeyboardLetter declarations to avoid before-declaration errors)

    const scrambleWord = (word: string): string[] => {
        const letters = word.split('');
        // Shuffle until it's different from original
        let shuffled = [...letters];
        do {
            shuffled = letters.sort(() => Math.random() - 0.5);
        } while (shuffled.join('') === word && word.length > 1);
        return shuffled;
    };

    const getRandomWord = () => {
        if (wordQueueRef.current.length === 0) {
            wordQueueRef.current = shuffleArray(learnedWordIds);
        }
        const randomId = wordQueueRef.current.pop()!;
        const card = getAllCards().find(c => c.id === randomId);
        if (card) {
            setCurrentCard(card);
            setScrambledLetters(scrambleWord(card.word));
            setSelectedIndices([]);
            setShowHint(false);
            setReshuffleCount(0);
        }
    };

    const startGame = () => {
        click();
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setStreak(0);
        setComboCount(0);
        setLives(3);
        setAnswered(0);
        // Reset queue khi bắt đầu game mới
        wordQueueRef.current = shuffleArray(learnedWordIds);
        getRandomWord();
    };

    const handleLetterClick = (index: number) => {
        if (selectedIndices.includes(index)) return;
        click();
        const newSelected = [...selectedIndices, index];
        setSelectedIndices(newSelected);

        // Check if word is complete
        if (newSelected.length === scrambledLetters.length) {
            const userWord = newSelected.map(i => scrambledLetters[i]).join('');
            if (!currentCard) return;
            const correctWord = currentCard.word;

            if (userWord.toLowerCase() === correctWord.toLowerCase()) {
                quizCorrect();
                const newStreak = streak + 1;
                setStreak(newStreak);
                const newCombo = comboCount + 1;
                setComboCount(newCombo);

                // Combo reward: Every 3 correct gives +1 life (max 5)
                if (newCombo >= 3 && lives < 5) {
                    setLives(l => Math.min(5, l + 1));
                    setComboCount(0);
                }

                // Score: 200 base + 100 per streak
                const points = 200 + (newStreak * 100);
                setScore(s => s + points);
                setAnswered(a => a + 1);

                setTimeout(() => {
                    getRandomWord();
                }, 800);
            } else {
                quizWrong();
                const newLives = lives - 1;
                setLives(newLives);
                setStreak(0);
                setComboCount(0);
                setSelectedIndices([]);

                if (newLives === 0) {
                    setGameOver(true);
                    if (score > (highScore || 0)) {
                        setHighScore(score);
                        localStorage.setItem('wordScramble_highScore', score.toString());
                    }
                }
            }
        }
    };

    const handleSkip = () => {
        if (!currentCard) return;
        click();
        const newLives = lives - 1;
        setLives(newLives);
        setStreak(0);
        setComboCount(0);

        if (newLives === 0) {
            setGameOver(true);
            if (score > (highScore || 0)) {
                setHighScore(score);
                localStorage.setItem('wordScramble_highScore', score.toString());
            }
        } else {
            getRandomWord();
        }
    };

    const handleReshuffle = () => {
        if (!currentCard || reshuffleCount >= 3) return;
        click();
        setScrambledLetters(scrambleWord(currentCard.word));
        setSelectedIndices([]);
        setReshuffleCount(c => c + 1);
    };

    const handleHint = () => {
        click();
        setShowHint(true);
    };

    const handleClearLast = () => {
        if (selectedIndices.length === 0) return;
        click();
        setSelectedIndices(prev => prev.slice(0, -1));
    };

    const handleClearAll = () => {
        if (selectedIndices.length === 0) return;
        click();
        setSelectedIndices([]);
    };

    const handleKeyboardLetter = (key: string) => {
        // Find first unselected letter that matches the key
        const matchingIndex = scrambledLetters.findIndex((letter, index) =>
            letter.toLowerCase() === key && !selectedIndices.includes(index)
        );

        if (matchingIndex !== -1) {
            handleLetterClick(matchingIndex);
        }
    };

    // Báo cáo điểm cuối cho challenge page khi game kết thúc
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (gameOver) onGameEnd?.(score); }, [gameOver]);

    // Keyboard event handler (after handleClearLast and handleKeyboardLetter are declared)
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // Handle backspace/delete - remove last selected letter
            if (key === 'backspace' || key === 'delete') {
                e.preventDefault();
                handleClearLast();
                return;
            }

            // Handle letter keys - select matching unselected letter
            if (key.length === 1 && /[a-z]/.test(key)) {
                e.preventDefault();
                handleKeyboardLetter(key);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, gameOver, selectedIndices, scrambledLetters]);

    const getUserWord = () => {
        return selectedIndices.map(i => scrambledLetters[i]).join('');
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start md:items-center justify-center md:p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full md:max-w-2xl bg-surface border-0 md:border border-line md:rounded-xl px-6 pb-6 pt-16 sm:p-8 relative min-h-full md:min-h-0 md:max-h-[90vh] md:overflow-y-auto"
            >
                <button
                    onClick={() => { click(); onClose(); }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-surface-2 text-muted hover:text-ink hover:bg-surface-3 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Shuffle className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                        <h2 className="text-xl sm:text-2xl font-bold text-ink">Word Scramble</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-muted">
                        Sắp xếp chữ cái tạo thành từ đúng
                    </p>
                </div>

                {!isPlaying && !gameOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <div className="p-6 bg-surface-2/50 rounded-lg border border-line-strong">
                            <Shuffle className="w-12 h-12 text-accent mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-ink mb-2">Cách chơi</h3>
                            <div className="text-sm text-ink-2 space-y-1 text-left max-w-sm mx-auto">
                                <p>• Nhìn nghĩa + chữ cái xáo trộn</p>
                                <p>• Click hoặc gõ chữ cái theo thứ tự</p>
                                <p>• Backspace/Delete: xoá chữ cuối</p>
                                <p>• 3 mạng - sai/skip mất 1 mạng</p>
                                <p>• Combo 3 lần đúng → +1 mạng (max 5)</p>
                            </div>
                        </div>

                        {highScore !== null && (
                            <div className="flex items-center justify-center gap-2 text-sm text-accent">
                                <Trophy className="w-4 h-4" />
                                <span>High Score: {highScore}</span>
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

                {isPlaying && !gameOver && currentCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Stats */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                                {[...Array(Math.min(5, lives))].map((_, i) => (
                                    <Heart
                                        key={i}
                                        className="w-5 h-5 fill-danger text-danger"
                                    />
                                ))}
                                {[...Array(Math.max(0, 5 - lives))].map((_, i) => (
                                    <Heart
                                        key={`empty-${i}`}
                                        className="w-5 h-5 text-subtle"
                                    />
                                ))}
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-muted">Combo</div>
                                <div className="text-sm font-bold text-accent">{comboCount}/3</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted">Score</div>
                                <div className="text-lg font-bold text-ink">{score}</div>
                            </div>
                        </div>

                        {/* Streak Badge */}
                        {streak > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center justify-center gap-2 py-1 bg-accent/10 border border-accent/30 rounded-full"
                            >
                                <Shuffle className="w-3 h-3 text-accent" />
                                <span className="text-xs font-bold text-accent">Streak × {streak}</span>
                            </motion.div>
                        )}

                        {/* Meaning */}
                        <div className="p-6 bg-surface-2/50 rounded-lg border border-line-strong text-center">
                            <p className="text-xs text-muted mb-2">Nghĩa:</p>
                            <p className="text-xl sm:text-2xl font-bold text-ink">
                                {currentCard.translationHint}
                            </p>
                            {showHint && (
                                <p className="text-sm text-accent mt-2">
                                    Hint: {currentCard.word.charAt(0).toUpperCase()}...
                                </p>
                            )}
                        </div>

                        {/* User's Answer */}
                        <div className="min-h-16 p-4 bg-bg/50 rounded-lg border-2 border-line-strong flex items-center justify-between">
                            <div className="flex-1 text-center">
                                {selectedIndices.length > 0 ? (
                                    <p className="text-2xl font-bold text-accent tracking-wider">
                                        {getUserWord()}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted">Click or type letters...</p>
                                )}
                            </div>
                            {selectedIndices.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="ml-2 p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-muted hover:text-ink transition-all"
                                    title="Clear all (or press Backspace)"
                                >
                                    <Delete className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Scrambled Letters */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {scrambledLetters.map((letter, index) => {
                                const isSelected = selectedIndices.includes(index);
                                const selectionOrder = selectedIndices.indexOf(index);

                                return (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleLetterClick(index)}
                                        whileHover={{ scale: isSelected ? 1 : 1.1 }}
                                        whileTap={{ scale: isSelected ? 1 : 0.95 }}
                                        disabled={isSelected}
                                        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 font-bold text-xl transition-all ${isSelected
 ? 'bg-accent/20 border-accent text-accent opacity-50'
 : 'bg-surface-2 border-line-strong text-ink hover:border-accent'
 }`}
                                    >
                                        {letter.toUpperCase()}
                                        {isSelected && (
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-on-accent text-xs rounded-full flex items-center justify-center">
                                                {selectionOrder + 1}
                                            </span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={handleReshuffle}
                                disabled={reshuffleCount >= 3}
                                className="py-2 bg-surface-2 hover:bg-surface-3 disabled:bg-surface disabled:text-subtle text-ink rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span className="text-xs">Shuffle ({reshuffleCount}/3)</span>
                            </button>
                            <button
                                onClick={handleHint}
                                disabled={showHint}
                                className="py-2 bg-surface-2 hover:bg-surface-3 disabled:bg-surface disabled:text-subtle text-ink rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                            >
                                <Lightbulb className="w-3 h-3" />
                                <span className="text-xs">Hint</span>
                            </button>
                            <button
                                onClick={handleSkip}
                                className="py-2 bg-warning hover:bg-warning text-on-status rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                            >
                                <SkipForward className="w-3 h-3" />
                                <span className="text-xs">Skip</span>
                            </button>
                        </div>

                        <div className="text-center text-xs text-muted">
                            {answered} answered
                        </div>
                    </motion.div>
                )}

                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <Trophy className="w-16 h-16 text-accent mx-auto" />
                        <h3 className="text-2xl font-bold text-ink">Game Over!</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-surface-2/50 rounded-lg border border-line-strong">
                                <p className="text-xs text-muted mb-1">Score</p>
                                <p className="text-2xl font-bold text-accent">{score}</p>
                            </div>
                            <div className="p-4 bg-surface-2/50 rounded-lg border border-line-strong">
                                <p className="text-xs text-muted mb-1">Answered</p>
                                <p className="text-2xl font-bold text-ink">{answered}</p>
                            </div>
                        </div>

                        {highScore !== null && (
                            <div className="flex items-center justify-center gap-2 text-sm text-accent">
                                <Trophy className="w-4 h-4" />
                                <span>High Score: {highScore}</span>
                            </div>
                        )}

                        <button
                            onClick={startGame}
                            className="w-full py-3 bg-accent hover:bg-accent-strong text-on-accent rounded-lg font-medium transition-all"
                        >
                            Play Again
                        </button>
                        <ChallengeButton gameType="scramble" score={score} />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
