'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Volume2, X } from 'lucide-react';
import { compileRules, findHits, type DialHit } from '../lib/dial/match';
import { DIAL_RULES } from '../lib/dial/allRules';
import { pickHits } from '../lib/dial/level';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { playText } from '../lib/audio/AudioService';
import { useLexicaStore } from '../store/lexicaStore';
import { dialRank } from '../lib/dial/review';

const INDEX = compileRules(DIAL_RULES);
const CARDS = new Map(VOCAB_DATABASE.map((c) => [c.id, c]));

/** Hits of every paragraph, and which to show, with one density across the whole text. */
export function useDialParagraphs(paras: string[], level: number, priority?: ReadonlySet<string> | ReadonlyMap<string, number>) {
    return useMemo(() => {
        const hits = paras.map((p) => findHits(p, INDEX));
        const flat = hits.flat();
        const shown = pickHits(flat, level, priority);
        let k = 0;
        return { hits, shown: hits.map((hs) => hs.map(() => shown.has(k++))), total: flat.length };
    }, [paras, level, priority]);
}

/** One paragraph with the shown hits swapped to English buttons. */
export function DialParagraph({ text, hits, shown, onOpen }: { text: string; hits: DialHit[]; shown: boolean[]; onOpen: (h: DialHit) => void }) {
    const out: ReactNode[] = [];
    let last = 0;
    const src = text.normalize('NFC');
    hits.forEach((h, i) => {
        if (!shown[i]) return;
        out.push(src.slice(last, h.start));
        out.push(
            <button key={i} onClick={() => onOpen(h)} className="font-semibold text-accent underline decoration-accent/40 decoration-dotted underline-offset-4">
                {h.en}
            </button>,
        );
        last = h.end;
    });
    out.push(src.slice(last));
    return <>{out}</>;
}

/** Bottom sheet with the original phrase, meaning and sound of a tapped word. */
export function DialSheet({ hit, onClose, effect = 'none' }: { hit: DialHit | null; onClose: () => void; effect?: 'due' | 'queued' | 'none' }) {
    if (!hit) return null;
    const card = CARDS.get(hit.cardId);
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4 max-w-2xl mx-auto" role="dialog" aria-label={`Nghĩa của ${hit.en}`}>
            <div className="rounded-2xl bg-surface border border-line p-4 shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-semibold">{hit.en}</span>
                            {card?.ipa && <span className="text-sm font-mono text-muted">/{card.ipa}/</span>}
                            <button onClick={() => void playText(hit.en, 'en')} aria-label="Nghe phát âm" className="p-1 text-accent"><Volume2 className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-ink-2 mt-1">Trong bài: <b className="text-ink">{hit.vi}</b></p>
                        {card && <p className="text-sm text-muted mt-1">{card.translationHint}</p>}
                        {effect === 'due' && <p className="text-xs text-accent mt-2">Đã đưa từ này vào lượt ôn tới.</p>}
                        {effect === 'queued' && <p className="text-xs text-accent mt-2">Đã thêm từ này vào bộ thẻ học tiếp theo.</p>}
                    </div>
                    <button onClick={onClose} aria-label="Đóng" className="p-1 text-muted"><X className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    );
}

/** The level slider. */
export function DialSlider({ level, onChange, total }: { level: number; onChange: (v: number) => void; total?: number }) {
    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted">Mức tiếng Anh</span>
                <span className="font-mono text-accent">{level}%</span>
            </div>
            <input type="range" min={0} max={100} step={10} value={level} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" aria-label="Mức tiếng Anh" />
            {total !== undefined && <p className="mt-1 text-xs text-muted">{total === 0 ? 'Chưa có từ nào khớp trong đoạn này' : `${total} chỗ có thể đổi · chạm vào từ để xem nghĩa`}</p>}
        </div>
    );
}

/**
 * The tapped word, and what the tap did to the review schedule: a tap means
 * the learner did not recall the word (a learned word becomes due, a new one
 * is queued to learn).
 */
export function useDialSheet() {
    const [open, setOpenState] = useState<DialHit | null>(null);
    const [effect, setEffect] = useState<'due' | 'queued' | 'none'>('none');
    const dialTap = useLexicaStore((s) => s.dialTap);
    const setOpen = (h: DialHit | null) => {
        setOpenState(h);
        if (h) setEffect(dialTap(h.cardId));
    };
    return { open, setOpen, effect, close: () => setOpenState(null) };
}

/** Due words first, then other learned words. */
export function useDialRank() {
    const progress = useLexicaStore((s) => s.cardProgress);
    return useMemo(() => dialRank(progress), [progress]);
}
