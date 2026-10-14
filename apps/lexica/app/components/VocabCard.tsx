'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Leaf, Sparkles, Trophy, Swords, Eye, Volume2, Check, X as XIcon, Mic, RotateCcw, TrendingUp, Flag } from 'lucide-react';
import { flushCardEvents, trackCardEvent } from '../lib/content/events';
import { useVocalSwipe } from '../hooks/useVocalSwipe';
import { useLexicaStore } from '../store/lexicaStore';
import { useVoiceAvailable } from '../lib/speechAvailability';
import { AudioService } from '../lib/audio/AudioService';
import RecallPanel from './RecallPanel';
import { blankWord, type RecallCheck } from '../lib/engagement/recall';
import { isHard, mnemonic } from '../lib/engagement/hard';
import { SESSION_SIZE } from '../lib/engagement/session';
import type { VocabCardData } from '../types/vocab';

interface VocabCardProps {
    card: VocabCardData;
    index: number;
    onSwipe: (direction: 'left' | 'right', source?: 'manual' | 'voice') => void;
    revealed?: boolean;
    onReveal?: () => void;
    /** Lucky card: pays a small reward when marked as known. */
    lucky?: boolean;
    /** One line about what knowing this card now would change. */
    hint?: string | null;
    /** Cards done in the current 10-card session (top card only). */
    sessionCount?: number;
    /** A recall check in progress on this card (top card only). */
    check?: RecallCheck | null;
    onCheckAnswer?: (correct: boolean) => void;
}

export default function VocabCard({ card, index, onSwipe, revealed: controlledRevealed, onReveal, lucky, hint, sessionCount, check, onCheckAnswer }: VocabCardProps) {
    const [internalRevealed, setInternalRevealed] = useState(false);
    const [reported, setReported] = useState(false);
    const swipeMode = useLexicaStore(state => state.swipeMode);
    const cardProgress = useLexicaStore(state => state.cardProgress[card.id]);
    const userArchetype = useLexicaStore(state => state.userArchetype);

    const revealed = controlledRevealed !== undefined ? controlledRevealed : internalRevealed;
    const handleReveal = onReveal ?? (() => setInternalRevealed(true));

    const isBossCard = card.isBossCard || false;
    const voiceAvailable = useVoiceAvailable();
    const wantsVoice = isBossCard || (swipeMode === 'voice' && index === 0);
    // Fall back to touch when the browser can't do speech or the mic is blocked
    const isVoiceSwipeRequired = wantsVoice && voiceAvailable;
    const isReviewCard = Boolean(cardProgress);
    const hard = isHard(cardProgress);

    // Personalized scenario selection with fallback
    const displayScenario =
        (card.scenarios && userArchetype && card.scenarios[userArchetype]) ||
        card.scenario ||
        (card.scenarios && card.scenarios.casual) ||
        'Scenario not available';

    const speakWord = () => {
        void AudioService.play(card.id, 'word');
    };

    const {
        state: vocalState,
        hitsRemaining,
        startListening,
        stopListening,
        setHolding,
        canStartListening,
    } = useVocalSwipe({
        targetWord: card.word,
        onSuccess: () => {
            onSwipe('right', 'voice');
        },
        enabled: isVoiceSwipeRequired,
    });

    return (
        <div className="relative w-full">
            <motion.div
                data-tour-id="swipe-actions"
                drag={!check}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.7}
                whileDrag={{ scale: 1.05 }}
                onDragEnd={(_event, info) => {
                    const threshold = 150;
                    if (Math.abs(info.offset.x) > threshold) {
                        const direction = info.offset.x > 0 ? 'right' : 'left';
                        if (direction === 'right' && isVoiceSwipeRequired) return;
                        onSwipe(direction);
                    }
                }}
                animate={{ y: index * 5, scale: 1 - index * 0.02, rotate: 0 }}
                className="w-full"
                style={{ userSelect: 'none', zIndex: 100 - index }}
            >
                <div className={`relative mx-2 sm:mx-4 h-[450px] sm:h-100 rounded-2xl bg-surface border p-5 sm:p-6 overflow-hidden flex flex-col ${lucky ? 'border-accent/60' : 'border-line'}`}>
                    {sessionCount !== undefined && (
                        <div className="absolute top-0 left-0 right-0 flex gap-0.5 px-4 pt-2" aria-label={`Phiên: ${sessionCount}/${SESSION_SIZE}`}>
                            {Array.from({ length: SESSION_SIZE }, (_, i) => (
                                <span key={i} className={`h-[3px] flex-1 rounded-full transition-colors ${i < sessionCount ? 'bg-accent' : 'bg-surface-3'}`} />
                            ))}
                        </div>
                    )}
                    {/* Meta row */}
                    <div className="flex items-center gap-2 font-mono text-[11px] text-subtle">
                        <span>ELO {card.elo}</span>
                        {isBossCard && (
                            <span className="flex items-center gap-1 text-warning"><Swords className="w-3 h-3" /> BOSS</span>
                        )}
                        {hard ? (
                            <span className="flex items-center gap-1 text-warning" title={`Bạn đã quên từ này ${cardProgress?.wrongCount} lần`}>
                                <Swords className="w-3 h-3" /> TỪ KHÓ
                            </span>
                        ) : isReviewCard && (
                            <span className="flex items-center gap-1 text-warning"><RotateCcw className="w-3 h-3" /> ÔN TẬP</span>
                        )}
                        {lucky && (
                            <span className="flex items-center gap-1 text-accent" title="Nhớ thẻ này để nhận Bụi hoặc Hộp">
                                <Sparkles className="w-3 h-3" /> MAY MẮN
                            </span>
                        )}
                        {card.trend && (
                            <span className="flex items-center gap-1 text-accent truncate" title={card.trend.label}>
                                <TrendingUp className="w-3 h-3 shrink-0" /> TREND
                            </span>
                        )}
                        {card.trend && index === 0 && (
                            <button
                                type="button"
                                onPointerDown={e => e.stopPropagation()}
                                onClick={e => {
                                    e.stopPropagation();
                                    if (reported) return;
                                    if (!window.confirm('Báo cáo câu này là không phù hợp hoặc sai?')) return;
                                    trackCardEvent(card.id, 'report');
                                    flushCardEvents();
                                    setReported(true);
                                }}
                                className={`-m-2 p-2 flex items-center gap-1 ${reported ? 'text-danger' : 'hover:text-danger'}`}
                                aria-label={reported ? 'Đã báo cáo' : 'Báo cáo câu này'}
                                title={reported ? 'Đã báo cáo' : 'Báo cáo câu này'}
                            >
                                <Flag className="w-3 h-3" />
                            </button>
                        )}
                        <span className="ml-auto flex items-center gap-1" aria-label={`Trạng thái: ${card.state}`}>
                            {card.state === 'seed' && <Sprout className="w-3.5 h-3.5" />}
                            {card.state === 'sprout' && <Leaf className="w-3.5 h-3.5 text-accent" />}
                            {card.state === 'gold' && <Sparkles className="w-3.5 h-3.5 text-warning" />}
                            {card.state === 'mastered' && <Trophy className="w-3.5 h-3.5 text-warning" />}
                        </span>
                    </div>

                    {/* Scenario with the target word highlighted */}
                    <p className="mt-6 text-lg sm:text-xl leading-relaxed text-ink-2">
                        {check && check.kind !== 'meaning' ? blankWord(displayScenario, card.word) : highlightWord(displayScenario, card.word)}
                    </p>

                    {check && index === 0 && (
                        <div className="mt-3">
                            <p className="font-mono text-[11px] text-accent uppercase tracking-wider">
                                {check.kind === 'meaning' ? 'Kiểm tra nhanh · từ này nghĩa là gì?' : check.kind === 'cloze' ? 'Nhắc lại · từ nào điền vào chỗ trống?' : 'Nhắc lại · gõ từ còn thiếu'}
                            </p>
                            {check.kind !== 'meaning' && <p className="mt-1 text-sm text-ink">Nghĩa: {card.translationHint}</p>}
                        </div>
                    )}

                    {!check && hint && index === 0 && (
                        <p className="mt-3 font-mono text-[11px] text-accent">{hint}</p>
                    )}

                    {wantsVoice && !voiceAvailable && index === 0 && (
                        <p className="mt-3 font-mono text-[11px] text-warning">
                            Không dùng được micro trên trình duyệt này, tạm chuyển sang vuốt thẻ.
                        </p>
                    )}

                    <div className="mt-auto pt-4">
                        {check && index === 0 && onCheckAnswer ? (
                            <RecallPanel check={check} word={card.word} meaning={card.translationHint} aid={mnemonic(card)} onAnswer={onCheckAnswer} />
                        ) : isVoiceSwipeRequired ? (
                            /* Voice mode: word info always visible + mic controls */
                            <div className="space-y-3">
                                <WordBlock card={card} onSpeak={speakWord} />
                                <button
                                    onPointerDown={(e) => { e.preventDefault(); setHolding(true); startListening(); }}
                                    onPointerUp={() => { setHolding(false); stopListening(); }}
                                    onPointerLeave={() => { setHolding(false); stopListening(); }}
                                    disabled={!canStartListening}
                                    className={`w-full h-12 px-4 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 select-none touch-none disabled:cursor-not-allowed disabled:opacity-50 ${vocalState === 'LISTENING' ? 'bg-accent text-on-accent scale-[0.98]' :
                                        vocalState === 'SUCCESS' ? 'bg-accent text-on-accent' :
                                            vocalState === 'FAIL' ? 'bg-surface-2 border border-danger/40 text-ink' :
                                                'bg-surface-2 border border-line-strong text-ink hover:bg-surface-3'
                                        }`}
                                >
                                    <Mic className={`w-4 h-4 ${vocalState === 'LISTENING' ? 'animate-pulse' : ''}`} />
                                    {vocalState === 'LISTENING' ? 'Đang nghe...' :
                                        vocalState === 'SUCCESS' ? 'Hoàn hảo' :
                                            vocalState === 'FAIL' ? 'Thử lại' :
                                                'Giữ để nói'}
                                    <span className="ml-auto flex gap-1" aria-label={`${3 - hitsRemaining}/3 lần đúng`}>
                                        {[0, 1, 2].map((i) => (
                                            <span key={i} className={`w-4 h-1 ${i < 3 - hitsRemaining ? 'bg-accent' : 'bg-surface-3'}`} />
                                        ))}
                                    </span>
                                </button>
                            </div>
                        ) : !revealed ? (
                            <button
                                data-tour-id="reveal-button"
                                onClick={handleReveal}
                                className="w-full h-12 rounded-xl bg-surface-2 border border-line-strong hover:bg-surface-3 transition-colors active:scale-[0.98] flex items-center justify-center gap-2 text-sm font-medium text-ink"
                            >
                                <Eye className="w-4 h-4" />
                                Xem từ và nghĩa
                            </button>
                        ) : (
                            <WordBlock card={card} onSpeak={speakWord} aid={hard ? mnemonic(card) : null} />
                        )}
                    </div>
                </div>

                {!isVoiceSwipeRequired && (
                    <>
                        <motion.div className="absolute top-1/2 left-8 -translate-y-1/2 opacity-0" style={{ opacity: 0 }}>
                            <XIcon className="w-16 h-16 text-danger" />
                        </motion.div>
                        <motion.div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-0" style={{ opacity: 0 }}>
                            <Check className="w-16 h-16 text-accent" />
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

/** Word, IPA, pronunciation button and meaning, in the "Focus" style. */
function WordBlock({ card, onSpeak, aid }: { card: VocabCardData; onSpeak: () => void; aid?: string | null }) {
    return (
        <div className="border-l-2 border-accent pl-4 space-y-1">
            <div className="flex items-center gap-3">
                <span className="text-3xl font-bold tracking-tight text-ink lowercase">{card.word}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); onSpeak(); }}
                    aria-label={`Nghe phát âm ${card.word}`}
                    className="w-11 h-11 shrink-0 rounded-xl border border-line bg-surface-2 text-ink flex items-center justify-center hover:bg-surface-3 transition-colors"
                >
                    <Volume2 className="w-4 h-4" />
                </button>
            </div>
            {card.ipa && <p className="font-mono text-sm text-muted">/{card.ipa}/</p>}
            <p className="text-base text-ink">{card.translationHint}</p>
            {aid && <p className="font-mono text-[11px] text-warning leading-relaxed">Mẹo nhớ: {aid}</p>}
        </div>
    );
}

/** Wraps each case-insensitive occurrence of `word` in a highlight mark. */
function highlightWord(text: string, word: string): React.ReactNode {
    if (!word) return text;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
        part.toLowerCase() === word.toLowerCase()
            ? <mark key={i} className="bg-accent text-on-accent px-1">{part.toLowerCase()}</mark>
            : part,
    );
}
