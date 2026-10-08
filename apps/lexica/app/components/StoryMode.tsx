'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Trophy, Volume2, ArrowRight } from 'lucide-react';
import { STORIES, parseStoryContentWithIds } from '../data/stories';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { useLexicaStore } from '../store/lexicaStore';
import StoryComprehensionQuiz from './StoryComprehensionQuiz';
import { useSoundEffects } from '../hooks/useSoundEffects';

const VOCAB_ID_BY_WORD = new Map(
    VOCAB_DATABASE.map(vocab => [vocab.word.trim().toLowerCase(), vocab.id])
);

const VOCAB_BY_ID = new Map(
    VOCAB_DATABASE.map(vocab => [vocab.id, vocab])
);

interface StoryVocabDialogData {
    word: string;
    ipa?: string;
    translationHint: string;
    scenario?: string;
    level?: string;
}

interface StoryModeProps {
    storyId: string;
    part: 'part1' | 'part2' | 'full'; // Which part to display
    onClose: () => void;
    onFinish: (partRead: 'part1' | 'full') => void;
    onNavigateToPart2?: () => void; // Optional callback for Part 2 navigation (for routing context)
}

export default function StoryMode({ storyId, part, onClose, onFinish, onNavigateToPart2 }: StoryModeProps) {
    const { buttonPress, click } = useSoundEffects();
    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
    const [selectedVocab, setSelectedVocab] = useState<StoryVocabDialogData | null>(null);
    const [showComprehensionQuiz, setShowComprehensionQuiz] = useState(false);
    const story = STORIES.find(s => s.id === storyId);
    const unlockedStories = useLexicaStore(state => state.unlockedStories);
    const openStory = useLexicaStore(state => state.openStory);

    if (!story) return null;

    // Determine which content to show
    const contentToShow = part === 'part1'
        ? story.part1Content
        : part === 'full'
            ? story.content // Full story (part1 + part2)
            : story.content; // Default to full

    const contentSegments = parseStoryContentWithIds(contentToShow, story.vocabularyIds);
    const isPart1Only = part === 'part1';
    const isPart2Unlocked = unlockedStories.includes(storyId);
    const showContinueCTA = isPart1Only && isPart2Unlocked;

    // Get appropriate questions
    const quizQuestions = isPart1Only ? story.part1Questions : story.fullStoryQuestions;

    // Handle quiz completion
    const handleQuizComplete = () => {
        setShowComprehensionQuiz(false);

        // Continue with original flow
        if (isPart1Only) {
            onFinish('part1');
            if (onNavigateToPart2) {
                onNavigateToPart2();
            } else {
                openStory?.(storyId, 'full');
            }
        } else {
            // Full story complete - just mark as read
            onFinish('full');
        }
    };

    const handleRetryReading = () => {
        setShowComprehensionQuiz(false);
        setHasScrolledToEnd(false);
        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show quiz instead of proceeding
    if (showComprehensionQuiz) {
        return (
            <StoryComprehensionQuiz
                storyId={storyId}
                part={isPart1Only ? 'part1' : 'full'}
                questions={quizQuestions}
                onComplete={handleQuizComplete}
                onRetry={handleRetryReading}
            />
        );
    }

    // Track scroll to show CTA
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
        if (scrolledToBottom && !hasScrolledToEnd) {
            setHasScrolledToEnd(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-bg z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-bg/95 backdrop-blur-sm border-b border-line z-10">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-accent" />
                        <div>
                            <h1 className="text-lg font-bold text-ink">
                                {story.title}
                                {isPart1Only && <span className="ml-2 text-sm text-accent">• Part 1</span>}
                            </h1>
                            <p className="text-xs text-muted">
                                {story.vocabularyIds.length} từ vựng
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            click();
                            onClose();
                        }}
                        className="p-2 hover:bg-surface rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-muted" />
                    </button>
                </div>
            </div>

            {/* Story Content */}
            <div
                className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
                onScroll={handleScroll}
            >
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Story text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-invert max-w-none"
                    >
                        <div className="text-ink-2 text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                            {contentSegments.map((segment, index) => {
                                if (segment.isVocab) {
                                    return (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => {
                                                const normalizedWord = segment.text.trim().toLowerCase();
                                                const exactVocabId = VOCAB_ID_BY_WORD.get(normalizedWord);
                                                const exactVocab = exactVocabId ? VOCAB_BY_ID.get(exactVocabId) : undefined;
                                                const fallbackVocab = segment.vocabId ? VOCAB_BY_ID.get(segment.vocabId) : undefined;
                                                const resolved = exactVocab || fallbackVocab;

                                                if (resolved) {
                                                    setSelectedVocab({
                                                        word: segment.text.toUpperCase(),
                                                        ipa: resolved.ipa,
                                                        translationHint: resolved.translationHint,
                                                        scenario: resolved.scenario,
                                                        level: resolved.level,
                                                    });
                                                    return;
                                                }

                                                setSelectedVocab({
                                                    word: segment.text.toUpperCase(),
                                                    translationHint: 'Định nghĩa cho từ này đang được cập nhật.',
                                                    scenario: 'Từ này đang được dùng trong ngữ cảnh câu chuyện.',
                                                    level: story.difficultyLevel === 'mixed' ? 'intermediate' : story.difficultyLevel,
                                                });
                                            }}
                                            className="text-accent font-semibold bg-accent/10 px-1 rounded hover:bg-accent-strong/20 cursor-pointer transition-colors border-b-2 border-accent/30 hover:border-accent"
                                            title="Click to see definition"
                                        >
                                            {segment.text}
                                        </motion.button>
                                    );
                                }
                                return <span key={index}>{segment.text}</span>;
                            })}
                        </div>
                    </motion.div>

                    {/* Vocabulary summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-surface/50 border border-line rounded-xl p-4"
                    >
                        <h3 className="text-sm font-semibold text-ink-2 mb-3 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-accent" />
                            Từ vựng trong câu chuyện này
                        </h3>
                        <p className="text-xs text-muted">
                            Bạn đã học được {story.vocabularyIds.length} từ được làm nổi bật bên trên
                        </p>
                    </motion.div>

                    {/* Continue to Part 2 CTA (only show if viewing Part 1 and Part 2 is unlocked) */}
                    {showContinueCTA && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className=" bg-accent/20 border-2 border-accent/50 rounded-2xl p-6 space-y-4"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-ink">
                                    Part 2 đã sẵn sàng
                                </h3>
                                <p className="text-ink-2 text-sm">
                                    Bạn đã hoàn thành 60% câu chuyện. Tiếp tục đọc phần kết?
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    buttonPress();
                                    setShowComprehensionQuiz(true); // Show quiz instead of proceeding
                                }}
                                className="w-full bg-accent hover:bg-accent-strong text-on-accent font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Đọc Part 2</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {/* Full Story Completion (only show if reading full story and scrolled to end) */}
                    {!isPart1Only && hasScrolledToEnd && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-surface/60 border border-line/50 rounded-xl p-4"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-ink mb-0.5">Hoàn thành câu chuyện</h3>
                                    <p className="text-xs text-muted">Làm quiz để kiểm tra comprehension của bạn</p>
                                </div>
                                <button
                                    onClick={() => {
                                        buttonPress();
                                        setShowComprehensionQuiz(true);
                                    }}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-accent/20 hover:bg-accent-strong/30 border border-accent/30 hover:border-accent/50 text-accent rounded-lg text-sm font-bold transition-all active:scale-95"
                                >
                                    <span>Làm Quiz</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Bottom padding for mobile */}
                    <div className="h-20 lg:h-8" />
                </div>
            </div>

            {/* Bottom hint (mobile only) */}
            {!hasScrolledToEnd && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:hidden sticky bottom-0 bg-bg p-4 text-center border-t border-line"
                >
                    <p className="text-muted text-sm">Cuộn xuống để xem tiếp</p>
                </motion.div>
            )}

            {/* Vocabulary Detail Modal */}
            <AnimatePresence>
                {selectedVocab && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVocab(null)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-surface border-2 border-accent/50 rounded-2xl p-6 z-50 shadow-2xl"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => {
                                    click();
                                    setSelectedVocab(null);
                                }}
                                className="absolute top-4 right-4 p-1.5 hover:bg-surface-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-muted" />
                            </button>

                            {/* Word */}
                            <div className="mb-4">
                                <h2 className="text-3xl font-bold text-accent mb-2">
                                    {selectedVocab.word}
                                </h2>
                                <div className="flex items-center gap-3">
                                    {selectedVocab.ipa && (
                                        <span className="text-muted text-sm font-mono">
                                            {selectedVocab.ipa}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            click();
                                            const utterance = new SpeechSynthesisUtterance(selectedVocab.word);
                                            utterance.lang = 'en-US';
                                            utterance.rate = 0.8;
                                            speechSynthesis.speak(utterance);
                                        }}
                                        className="p-1.5 bg-accent/20 hover:bg-accent-strong/30 rounded-lg transition-colors"
                                        title="Hear pronunciation"
                                    >
                                        <Volume2 className="w-4 h-4 text-accent" />
                                    </button>
                                </div>
                            </div>

                            {/* Definition */}
                            <div className="mb-4">
                                <h3 className="text-xs uppercase font-mono text-muted font-medium mb-2">
                                    Meaning
                                </h3>
                                <p className="text-ink text-sm">
                                    {selectedVocab.translationHint}
                                </p>
                            </div>

                            {/* Example Scenario */}
                            <div className="mb-4">
                                <h3 className="text-xs uppercase font-mono text-muted font-medium mb-2">
                                    Example
                                </h3>
                                <p className="text-ink-2 text-sm italic leading-relaxed">
                                    &ldquo;{selectedVocab.scenario || 'Không có ví dụ cho từ này.'}&rdquo;
                                </p>
                            </div>

                            {/* Level Badge */}
                            <div className="flex items-center justify-between pt-4 border-t border-line">
                                <span className="text-xs text-muted">Level</span>
                                <span className="text-xs font-semibold text-accent uppercase font-mono">
                                    {selectedVocab.level || 'intermediate'}
                                </span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
