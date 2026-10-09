'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Zap, Trophy, ChevronLeft, Lock } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import {
    STORIES,
    getStoryLearnedCount,
    isStoryPreviewVisible,
    canTakePart1Quiz,
    isStoryPart1Unlocked,
    canTakePart2Quiz,
    isStoryPart2Unlocked
} from '../data/stories';
import { useSoundEffects } from '../hooks/useSoundEffects';

function getLevelLabel(level: string) {
    switch (level) {
        case 'beginner': return 'Cơ bản';
        case 'intermediate': return 'Trung cấp';
        case 'advanced': return 'Nâng cao';
        case 'expert': return 'Chuyên gia';
        default: return 'Mixed';
    }
}

function getLevelColor(level: string) {
    switch (level) {
        case 'beginner': return 'text-muted';
        case 'intermediate': return 'text-accent';
        case 'advanced': return 'text-accent';
        case 'expert': return 'text-accent';
        default: return 'text-muted';
    }
}

export default function StoriesPage() {
    const router = useRouter();
    const { buttonPress } = useSoundEffects();
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const unlockedStories = useLexicaStore(state => state.unlockedStories);
    const unlockedStoryPart1 = useLexicaStore(state => state.unlockedStoryPart1);
    const readStories = useLexicaStore(state => state.readStories);
    const readStoryPart1 = useLexicaStore(state => state.readStoryPart1);
    const storyQuizAttempts = useLexicaStore(state => state.storyQuizAttempts);

    const learnedWordIds = Array.from(learnedWords);
    const visibleStories = STORIES.filter(story => isStoryPreviewVisible(story, learnedWordIds));

    return (
        <div className="min-h-screen bg-bg pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-bg/95 backdrop-blur-sm border-b border-line z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link
                        href="/"
                        className="p-1.5 hover:bg-surface rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-muted" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-base font-bold text-ink">Story Packs</h1>
                        <p className="text-xs text-muted">
                            {readStories.length > 0
                                ? `${readStories.length}/${visibleStories.length} đã hoàn thành`
                                : `${visibleStories.length} câu chuyện có sẵn`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stories List */}
            <div className="max-w-2xl mx-auto px-4 pt-4">
                {visibleStories.length === 0 ? (
                    <div className="text-center py-16">
                        <Lock className="w-10 h-10 text-subtle mx-auto mb-3" />
                        <h2 className="text-lg font-bold text-ink mb-1">Chưa có câu chuyện nào</h2>
                        <p className="text-muted text-sm mb-6">
                            Học thêm 2 từ vựng để mở khóa câu chuyện đầu tiên
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent/20 hover:bg-accent-strong/30 border border-accent/30 rounded-lg font-bold text-accent text-sm transition-colors"
                        >
                            Bắt đầu học →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {visibleStories.map((story) => {
                            const storyId = story.id;
                            const learnedCountForStory = getStoryLearnedCount(story, learnedWordIds);

                            const part1Unlocked = isStoryPart1Unlocked(story, learnedWordIds, unlockedStoryPart1, storyQuizAttempts);
                            const part2Unlocked = isStoryPart2Unlocked(story, learnedWordIds, unlockedStories, storyQuizAttempts);
                            const canQuizPart1 = canTakePart1Quiz(story, learnedWordIds);
                            const canQuizPart2 = canTakePart2Quiz(story, learnedWordIds);
                            const part1Read = readStoryPart1.includes(storyId);
                            const fullRead = readStories.includes(storyId);

                            const progressPct = Math.round((learnedCountForStory / 7) * 100);

                            return (
                                <div
                                    key={storyId}
                                    className="rounded-xl border bg-surface/40 border-line/50 overflow-hidden"
                                >
                                    {/* Card top */}
                                    <div className="px-4 pt-4 pb-3">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h2 className="text-base font-bold text-ink leading-snug flex-1">
                                                {story.title}
                                            </h2>
                                            {fullRead ? (
                                                <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-surface-2/60 text-ink-2 text-xs font-medium rounded-full">
                                                    <Trophy className="w-3 h-3" />
                                                    Done
                                                </span>
                                            ) : (part1Unlocked || part2Unlocked) ? (
                                                <span className="flex-shrink-0 px-2 py-0.5 bg-accent/20 text-accent text-xs font-bold rounded-full">
                                                    {part2Unlocked ? 'Full' : 'Part 1'} Ready
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Meta row */}
                                        <div className="flex items-center gap-2 text-xs mb-3">
                                            <span className={`font-medium ${getLevelColor(story.difficultyLevel)}`}>
                                                {getLevelLabel(story.difficultyLevel)}
                                            </span>
                                            <span className="text-subtle">·</span>
                                            <span className="text-muted">{learnedCountForStory}/7 từ</span>
                                            <span className="text-subtle">·</span>
                                            <span className="text-muted">
                                                {story.darkComedyLevel === 'extreme' ? 'Dark comedy cực mạnh' : story.darkComedyLevel === 'high' ? 'Dark comedy cao' : 'Dark comedy vừa'}
                                            </span>
                                        </div>

                                        {/* Teaser */}
                                        <p className="text-sm text-muted leading-relaxed mb-3">
                                            {story.teaser}
                                        </p>

                                        {/* Progress bar */}
                                        <div className="space-y-1">
                                            <div className="h-1.5 rounded-full bg-bg overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${part2Unlocked ? 'bg-accent' : part1Unlocked ? 'bg-accent/60' : 'bg-surface-3'}`}
                                                    style={{ width: `${progressPct}%` }}
                                                />
                                            </div>
                                            {learnedCountForStory < 7 && (
                                                <p className="text-xs text-subtle">
                                                    {learnedCountForStory < 4
                                                        ? `Cần ${4 - learnedCountForStory} từ nữa để mở Part 1`
                                                        : learnedCountForStory < 7
                                                            ? `Cần ${7 - learnedCountForStory} từ nữa để mở Ending`
                                                            : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action area */}
                                    <div className="px-4 pb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {/* Locked: 0-1 words */}
                                            {learnedCountForStory < 2 && (
                                                <p className="text-xs text-muted py-1">
                                                    Thu thập thêm <span className="text-ink-2 font-medium">{2 - learnedCountForStory} từ</span> để xem preview
                                                </p>
                                            )}

                                            {/* Preview only: 2-3 words, no quiz yet */}
                                            {learnedCountForStory >= 2 && !part1Unlocked && !canQuizPart1 && (
                                                <p className="text-xs text-muted py-1">
                                                    Thu thập thêm <span className="text-ink-2 font-medium">{story.part1QuizRequirement - learnedCountForStory} từ</span> để unlock Part 1
                                                </p>
                                            )}

                                            {/* Quiz unlock Part 1 */}
                                            {!part1Unlocked && canQuizPart1 && learnedCountForStory < 4 && (
                                                <>
                                                    <button
                                                        onClick={() => { buttonPress(); router.push(`/story/${storyId}/unlock-quiz?part=1`); }}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-warning/15 hover:bg-warning/25 border border-warning/25 hover:border-warning/40 text-warning rounded-lg text-xs font-bold transition-all active:scale-95"
                                                    >
                                                        <Zap className="w-3.5 h-3.5" />
                                                        Unlock Part 1 (Quiz)
                                                    </button>
                                                    <span className="text-xs text-muted self-center">
                                                        hoặc học thêm <span className="text-ink-2 font-medium">{4 - learnedCountForStory} từ</span>
                                                    </span>
                                                </>
                                            )}

                                            {/* Part 1 unlocked */}
                                            {part1Unlocked && !part2Unlocked && (
                                                <>
                                                    <button
                                                        onClick={() => { buttonPress(); router.push(`/story/${storyId}?part=part1`); }}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-accent/15 hover:bg-accent-strong/25 border border-accent/25 hover:border-accent/40 text-accent rounded-lg text-xs font-bold transition-all active:scale-95"
                                                    >
                                                        <BookOpen className="w-3.5 h-3.5" />
                                                        {part1Read ? 'Đọc lại Part 1' : 'Đọc Part 1'}
                                                    </button>
                                                    {canQuizPart2 && learnedCountForStory < 7 && (
                                                        <>
                                                            <button
                                                                onClick={() => { buttonPress(); router.push(`/story/${storyId}/unlock-quiz?part=2`); }}
                                                                className="flex items-center gap-1.5 px-3 py-2 bg-warning/15 hover:bg-warning/25 border border-warning/25 hover:border-warning/40 text-warning rounded-lg text-xs font-bold transition-all active:scale-95"
                                                            >
                                                                <Zap className="w-3.5 h-3.5" />
                                                                Unlock Ending (Quiz)
                                                            </button>
                                                            <span className="text-xs text-muted self-center">
                                                                hoặc học thêm <span className="text-ink-2 font-medium">{7 - learnedCountForStory} từ</span>
                                                            </span>
                                                        </>
                                                    )}
                                                    {!canQuizPart2 && learnedCountForStory < 7 && (
                                                        <span className="text-xs text-muted self-center">
                                                            Cần <span className="text-ink-2 font-medium">{story.part2QuizRequirement - learnedCountForStory} từ</span> nữa để mở quiz Ending
                                                        </span>
                                                    )}
                                                </>
                                            )}

                                            {/* Full story unlocked */}
                                            {part2Unlocked && (
                                                <button
                                                    onClick={() => { buttonPress(); router.push(`/story/${storyId}?part=full`); }}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-accent/15 hover:bg-accent-strong/25 border border-accent/25 hover:border-accent/40 text-accent rounded-lg text-xs font-bold transition-all active:scale-95"
                                                >
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    {fullRead ? 'Đọc lại Full Story' : 'Đọc Full Story'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom link */}
                <div className="mt-8 pb-4 text-center">
                    <Link
                        href="/"
                        className="text-sm text-muted hover:text-ink-2 transition-colors"
                    >
                        ← Tiếp tục học từ vựng
                    </Link>
                </div>
            </div>
        </div>
    );
}

