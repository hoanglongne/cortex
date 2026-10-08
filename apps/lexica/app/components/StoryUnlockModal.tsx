'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, X } from 'lucide-react';
import { STORIES } from '../data/stories';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface StoryUnlockModalProps {
    storyId: string;
    part: 1 | 2; // Which part was unlocked
    onReadNow: () => void;
    onClose: () => void;
}

// Pre-generated sparkle positions to avoid Math.random() in render
const SPARKLE_POSITIONS = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    initialX: (i * 17) % 100 - 50,
    animateX: (i * 23) % 100 - 50,
    duration: 2 + (i % 3),
    delay: (i * 0.3) % 2,
    left: (i * 13) % 100,
}));

export default function StoryUnlockModal({ storyId, part, onReadNow, onClose }: StoryUnlockModalProps) {
    const story = STORIES.find(s => s.id === storyId);
    const { unlock, buttonPress, click } = useSoundEffects();

    // Play unlock sound when modal appears
    useEffect(() => {
        unlock();
    }, [unlock]);

    if (!story) return null;

    const isPart1 = part === 1;
    const title = isPart1 ? 'Đã mở khoá Part 1' : 'Đã mở khoá phần kết';
    const description = isPart1
        ? 'Bạn đã mở khóa 60% đầu của câu chuyện'
        : 'Bạn đã hoàn thành full story!';
    const wordCount = isPart1 ? '4/7 từ' : '7/7 từ';

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-md z-50 lg:inset-x-0"
            >
                <div className="bg-surface border-2 border-accent/50 rounded-2xl p-6 relative overflow-hidden">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-surface-2 rounded-lg transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-muted" />
                    </button>

                    {/* Sparkles background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {SPARKLE_POSITIONS.map((sparkle) => (
                            <motion.div
                                key={sparkle.id}
                                initial={{ y: 100, x: sparkle.initialX, opacity: 0 }}
                                animate={{
                                    y: -100,
                                    x: sparkle.animateX,
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: sparkle.duration,
                                    repeat: Infinity,
                                    delay: sparkle.delay,
                                }}
                                className="absolute w-2 h-2 bg-accent rounded-full"
                                style={{
                                    left: `${sparkle.left}%`,
                                    top: '100%',
                                }}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center space-y-6">
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex justify-center"
                        >
                            <div className="p-4 bg-accent/20 rounded-full">
                                <BookOpen className="w-12 h-12 text-accent" />
                            </div>
                        </motion.div>

                        {/* Title */}
                        <div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-bold text-ink mb-2 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-6 h-6 text-accent" />
                                {title}
                                <Sparkles className="w-6 h-6 text-accent" />
                            </motion.h2>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-muted text-sm"
                            >
                                {description}
                            </motion.p>
                        </div>

                        {/* Story title */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-bg/50 border border-line rounded-lg p-4"
                        >
                            <h3 className="text-xl font-bold text-accent mb-2">{story.title}</h3>
                            <p className="text-muted text-sm">
                                {wordCount} • {story.darkComedyLevel === 'extreme' ? 'Cực kỳ' : story.darkComedyLevel === 'high' ? 'Rất' : 'Khá'} hài hước đen
                            </p>
                        </motion.div>

                        {/* Buttons */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex gap-3"
                        >
                            <button
                                onClick={() => {
                                    click();
                                    onClose();
                                }}
                                className="flex-1 px-4 py-3 bg-surface-2/50 hover:bg-surface-2 text-ink-2 rounded-lg font-medium transition-colors"
                            >
                                Để sau
                            </button>
                            <button
                                onClick={() => {
                                    buttonPress();
                                    onReadNow();
                                }}
                                className="flex-1 px-4 py-3 bg-accent hover:bg-accent-strong text-on-accent rounded-lg font-bold transition-colors active:scale-95"
                            >
                                Đọc ngay
                            </button>
                        </motion.div>

                        {/* Hint */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-muted text-xs"
                        >
                            Mỗi story pack gom các từ có ELO gần nhau để không phá nhịp học của bạn
                        </motion.p>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
