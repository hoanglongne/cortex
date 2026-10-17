'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Languages, Pause, Plus, Volume2, X } from 'lucide-react';
import { useLexicaStore } from '../../store/lexicaStore';
import { getCard, getPassage, useContentVersion } from '../../lib/content/repository';
import { splitByWords, type Passage, type PassageQuestion } from '../../lib/content/passages';
import { finishLine, finishPassage } from '../../lib/engagement/reading';
import { isOwned } from '../../lib/engagement/collection';
import { localDate } from '../../lib/engagement/ghost';
import { AudioService } from '../../lib/audio/AudioService';
import { levelDef } from '../../lib/levels';

/** Reading speeds for "Nghe cả đoạn". */
const RATES = { slow: 0.65, normal: 0.9 } as const;

export default function ReadPassagePage() {
    const { id } = useParams<{ id: string }>();
    useContentVersion();
    const passage = getPassage(id);

    if (!passage) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-ink font-semibold">Không tìm thấy đoạn văn này.</p>
                <Link href="/read" className="text-accent underline">
                    Xem các đoạn khác
                </Link>
            </div>
        );
    }
    return <Reader key={passage.id} passage={passage} />;
}

function Reader({ passage }: { passage: Passage }) {
    const progress = useLexicaStore((s) => s.cardProgress);
    const queued = useLexicaStore((s) => s.queuedCardIds);
    const queueCards = useLexicaStore((s) => s.queueCards);
    const lightReview = useLexicaStore((s) => s.lightReview);
    const markMet = useLexicaStore((s) => s.markMet);
    const [showTranslation, setShowTranslation] = useState(false);
    const [rate, setRate] = useState<keyof typeof RATES>('slow');
    const [speaking, setSpeaking] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [added, setAdded] = useState<string[]>([]);
    const [result, setResult] = useState<{ reviewed: number } | null>(null);
    const scrolled = useRef(false);
    const endRef = useRef<HTMLDivElement>(null);

    const targets = useMemo(
        () =>
            [...passage.newWords, ...passage.words]
                .map((cardId) => ({ id: cardId, word: getCard(cardId)?.word ?? '' }))
                .filter((t) => t.word),
        [passage],
    );
    const paragraphs = passage.text.split(/\n\s*\n/);
    const translation = passage.translation.split(/\n\s*\n/);

    const finish = () => {
        if (result) return;
        const ids = finishPassage(passage, useLexicaStore.getState().cardProgress, localDate());
        lightReview(ids);
        // Gặp: every word of the deck the learner already understood, seen here in English.
        markMet(targets.map((t) => t.id));
        setResult({ reviewed: ids.length });
        AudioService.stop();
        setSpeaking(false);
    };

    // Reaching the end by scrolling counts as reading it; a passage that fits
    // on one screen is finished with the button instead.
    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 40) scrolled.current = true;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        const el = endRef.current;
        const io = el
            ? new IntersectionObserver((entries) => {
                  if (entries.some((e) => e.isIntersecting) && scrolled.current) finish();
              })
            : null;
        if (el && io) io.observe(el);
        return () => {
            window.removeEventListener('scroll', onScroll);
            io?.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one observer per passage
    }, []);

    useEffect(() => () => AudioService.stop(), []);

    const listen = () => {
        if (speaking) {
            AudioService.stop();
            setSpeaking(false);
            return;
        }
        AudioService.playText(paragraphs.join(' '), 'en', RATES[rate]);
        setSpeaking(true);
    };

    const add = (cardId: string) => {
        if (queueCards([cardId]) > 0) setAdded((a) => [...a, cardId]);
    };

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/read" className="text-muted hover:text-accent text-sm">
                        ← Đọc
                    </Link>
                    <p className="font-mono text-[11px] text-muted">
                        {levelDef(passage.level).label} · {passage.topic}
                    </p>
                    <div className="w-12" />
                </div>

                <h1 className="text-2xl font-semibold text-ink">{passage.title}</h1>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button onClick={listen} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                        {speaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        {speaking ? 'Dừng' : 'Nghe cả đoạn'}
                    </button>
                    <div className="flex rounded-lg border border-line overflow-hidden text-xs" role="radiogroup" aria-label="Tốc độ đọc">
                        {(['slow', 'normal'] as const).map((r) => (
                            <button key={r} role="radio" aria-checked={rate === r} onClick={() => setRate(r)} className={`h-9 px-3 ${rate === r ? 'bg-surface-2 text-ink' : 'text-muted'}`}>
                                {r === 'slow' ? 'Chậm' : 'Bình thường'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowTranslation(!showTranslation)}
                        aria-pressed={showTranslation}
                        className={`h-9 px-3 rounded-lg border text-sm flex items-center gap-2 ${showTranslation ? 'border-accent text-accent' : 'border-line text-ink hover:border-line-strong'}`}
                    >
                        <Languages className="w-4 h-4" /> Xem nghĩa tiếng Việt
                    </button>
                </div>

                <p className="mt-4 font-mono text-[11px] text-subtle">
                    <span className="text-accent">Từ mới</span> · <span className="underline decoration-ink/30 underline-offset-4">từ đã học</span> · bấm vào từ để xem nghĩa
                </p>

                <article data-testid="passage-text" className="mt-4 space-y-4">
                    {paragraphs.map((para, i) => (
                        <div key={i}>
                            <p className="text-lg leading-relaxed text-ink-2">
                                {splitByWords(para, targets).map((seg, j) =>
                                    seg.cardId ? (
                                        <button
                                            key={j}
                                            onClick={() => setSelected(seg.cardId!)}
                                            data-word={seg.cardId}
                                            className={
                                                isOwned(progress[seg.cardId])
                                                    ? 'underline decoration-ink/30 underline-offset-4 hover:decoration-ink'
                                                    : 'rounded px-0.5 bg-accent/15 text-accent font-semibold hover:bg-accent/25'
                                            }
                                        >
                                            {seg.text}
                                        </button>
                                    ) : (
                                        <span key={j}>{seg.text}</span>
                                    ),
                                )}
                            </p>
                            {showTranslation && translation[i] && <p className="mt-1.5 text-sm leading-relaxed text-muted">{translation[i]}</p>}
                        </div>
                    ))}
                </article>

                <div ref={endRef} className="h-px" />

                {!result ? (
                    <button onClick={finish} className="mt-8 w-full h-12 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Đọc xong
                    </button>
                ) : (
                    <FinishCard reviewed={result.reviewed} added={added.length} questions={passage.questions ?? []} />
                )}
            </div>

            <AnimatePresence>
                {selected && (
                    <WordSheet
                        cardId={selected}
                        known={isOwned(progress[selected])}
                        queued={queued.includes(selected) || added.includes(selected) || Boolean(progress[selected])}
                        onAdd={() => add(selected)}
                        onClose={() => setSelected(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/** The mini card for a tapped word, with "Thêm vào phiên học". */
function WordSheet({ cardId, known, queued, onAdd, onClose }: { cardId: string; known: boolean; queued: boolean; onAdd: () => void; onClose: () => void }) {
    const card = getCard(cardId);
    if (!card) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
                role="dialog"
                aria-label={card.word}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-5"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink" aria-label="Đóng">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-ink lowercase">{card.word}</span>
                    <button onClick={() => void AudioService.play(card.id, 'word')} className="w-10 h-10 rounded-xl border border-line bg-surface-2 flex items-center justify-center text-ink" aria-label={`Nghe ${card.word}`}>
                        <Volume2 className="w-4 h-4" />
                    </button>
                </div>
                {card.ipa && <p className="font-mono text-sm text-muted">/{card.ipa}/</p>}
                <p className="mt-2 text-ink">{card.translationHint}</p>
                {card.collocations && card.collocations.length > 0 && <p className="mt-1 text-sm text-ink-2">Hay đi với: {card.collocations.join(' · ')}</p>}
                <div className="mt-4">
                    {known ? (
                        <p className="text-sm text-muted">Bạn đã học từ này. Đọc xong đoạn này sẽ tính một lượt ôn.</p>
                    ) : queued ? (
                        <p className="flex items-center gap-2 text-sm text-accent">
                            <Check className="w-4 h-4" /> Đã thêm vào phiên học tới
                        </p>
                    ) : (
                        <button onClick={onAdd} className="w-full h-11 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Thêm vào phiên học
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function FinishCard({ reviewed, added, questions }: { reviewed: number; added: number; questions: PassageQuestion[] }) {
    return (
        <motion.div data-testid="read-finish" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl border border-line bg-surface p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Đọc xong</p>
            <p className="mt-2 text-ink font-semibold">{finishLine(reviewed, added)}</p>
            {questions.length > 0 && (
                <div className="mt-4 space-y-4 border-t border-line pt-4">
                    <p className="text-xs text-muted">Hai câu hỏi nhanh, không bắt buộc:</p>
                    {questions.map((q) => (
                        <Question key={q.question} q={q} />
                    ))}
                </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-2">
                <Link href="/read" className="h-11 rounded-xl border border-line text-ink text-sm font-medium flex items-center justify-center hover:border-line-strong">
                    Đọc đoạn khác
                </Link>
                <Link href="/" className="h-11 rounded-xl border border-line text-ink text-sm font-medium flex items-center justify-center hover:border-line-strong">
                    Học tiếp
                </Link>
            </div>
        </motion.div>
    );
}

function Question({ q }: { q: PassageQuestion }) {
    const [picked, setPicked] = useState<number | null>(null);
    return (
        <div>
            <p className="text-sm text-ink">{q.question}</p>
            <div className="mt-2 space-y-1.5">
                {q.options.map((o, i) => {
                    const done = picked !== null;
                    const cls = done && i === q.answer ? 'border-accent text-ink bg-accent/10' : done && i === picked ? 'border-danger/60 text-muted' : 'border-line text-ink-2 hover:border-line-strong';
                    return (
                        <button key={o} disabled={done} onClick={() => setPicked(i)} className={`w-full text-left text-sm rounded-xl border px-3 py-2 ${cls}`}>
                            {o}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
