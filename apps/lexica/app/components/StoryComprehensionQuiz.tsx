'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, BookOpen, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { ComprehensionQuestion } from '../data/stories';
import { analytics } from '../lib/analytics';

interface StoryComprehensionQuizProps {
    storyId: string;
    part: 'part1' | 'full'; // Which part was read
    questions: ComprehensionQuestion[];
    onComplete: (score: number, passed: boolean) => void;
    onRetry: () => void; // Go back to re-read story
}

export default function StoryComprehensionQuiz({
    storyId,
    part,
    questions,
    onComplete,
    onRetry,
}: StoryComprehensionQuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);

    const totalQuestions = questions.length;
    const passThreshold = Math.ceil(totalQuestions * 0.7); // 70% to pass

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...selectedAnswers, optionIndex];
        setSelectedAnswers(newAnswers);

        if (currentQuestion < totalQuestions - 1) {
            // Move to next question
            setTimeout(() => {
                setCurrentQuestion(currentQuestion + 1);
            }, 300);
        } else {
            // Show results
            setTimeout(() => {
                setShowResults(true);

                // Calculate score
                const correctCount = newAnswers.filter(
                    (answer, idx) => answer === questions[idx].correctAnswer
                ).length;
                const passed = correctCount >= passThreshold;

                // Track analytics
                analytics.storyComprehensionQuiz(storyId, part, correctCount, totalQuestions, passed);

                // Don't call onComplete here - let user review results first
            }, 300);
        }
    };

    if (showResults) {
        const correctCount = selectedAnswers.filter(
            (answer, idx) => answer === questions[idx].correctAnswer
        ).length;
        const passed = correctCount >= passThreshold;

        return (
            <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-10 p-4">
                    <div className="flex items-center gap-3">
                        <Trophy className={`w-6 h-6 ${passed ? 'text-cyan-400' : 'text-amber-400'}`} />
                        <h1 className="text-lg font-bold text-white">
                            {passed ? '🎉 Xuất sắc!' : '💭 Gần đúng rồi!'}
                        </h1>
                    </div>
                </div>

                {/* Results Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Score Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-xl p-6 border-2 ${passed
                                ? 'bg-cyan-500/10 border-cyan-500/50'
                                : 'bg-amber-500/10 border-amber-500/50'
                                }`}
                        >
                            <div className="text-center space-y-3">
                                <div className="text-5xl font-bold text-white">
                                    {correctCount}/{totalQuestions}
                                </div>
                                <p className={`text-lg font-semibold ${passed ? 'text-cyan-400' : 'text-amber-400'}`}>
                                    {passed
                                        ? `Bạn hiểu rất rõ câu chuyện! 🌟`
                                        : `Bạn cần ${passThreshold - correctCount} câu nữa để pass (${Math.round(passThreshold / totalQuestions * 100)}%)`}
                                </p>
                                {passed && (
                                    <p className="text-sm text-slate-400">
                                        Comprehension xuất sắc! Bạn nắm được từ vựng trong ngữ cảnh.
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Question Review */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-cyan-400" />
                                Review câu trả lời
                            </h2>

                            {questions.map((question, idx) => {
                                const userAnswer = selectedAnswers[idx];
                                const isCorrect = userAnswer === question.correctAnswer;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`rounded-xl p-4 border ${isCorrect
                                            ? 'bg-slate-800/50 border-cyan-500/30'
                                            : 'bg-slate-800/50 border-amber-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            {isCorrect ? (
                                                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-white font-medium mb-2">
                                                    {idx + 1}. {question.question}
                                                </p>

                                                {!isCorrect && (
                                                    <div className="space-y-1 mb-2">
                                                        <p className="text-sm text-amber-400">
                                                            ❌ Bạn chọn: {question.options[userAnswer]}
                                                        </p>
                                                        <p className="text-sm text-cyan-400">
                                                            ✓ Đáp án đúng: {question.options[question.correctAnswer]}
                                                        </p>
                                                    </div>
                                                )}

                                                {question.explanation && (
                                                    <p className="text-sm text-slate-400 leading-relaxed">
                                                        💡 {question.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pb-8">
                            {!passed && (
                                <button
                                    onClick={onRetry}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Đọc lại
                                </button>
                            )}
                            <button
                                onClick={() => onComplete(correctCount, passed)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-bold transition-colors"
                            >
                                Tiếp tục
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Flow
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col overflow-hidden">
            {/* Header with Progress */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-10 p-4">
                <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="w-6 h-6 text-cyan-400" />
                    <h1 className="text-lg font-bold text-white">Comprehension Check</h1>
                    <span className="ml-auto text-sm text-slate-400">
                        {currentQuestion + 1}/{totalQuestions}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                    />
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-2xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Question */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <p className="text-xl font-semibold text-white leading-relaxed">
                                    {question.question}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {question.options.map((option, idx) => (
                                    <motion.button
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handleAnswer(idx)}
                                        className="w-full p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-left transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 group-hover:bg-cyan-500/20 border border-slate-600 group-hover:border-cyan-500/50 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 font-semibold transition-all">
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="text-slate-300 group-hover:text-white transition-colors">
                                                {option}
                                            </span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Hint */}
                            <p className="text-center text-sm text-slate-500">
                                💡 Chọn đáp án phù hợp nhất với câu chuyện bạn vừa đọc
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
