'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Volume2, X } from 'lucide-react';
import { compileRules, findHits, type DialHit } from '../lib/dial/match';
import { DIAL_RULES_D0 } from '../lib/dial/rules';
import { pickHits } from '../lib/dial/level';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { playText } from '../lib/audio/AudioService';

const INDEX = compileRules(DIAL_RULES_D0);
const CARDS = new Map(VOCAB_DATABASE.map((c) => [c.id, c]));

/** Hits of every paragraph, and which to show, with one density across the whole text. */
export function useDialParagraphs(paras: string[], level: number, priority?: ReadonlySet<string>) {
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
export function DialSheet({ hit, onClose }: { hit: DialHit | null; onClose: () => void }) {
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

export function useDialSheet() {
    const [open, setOpen] = useState<DialHit | null>(null);
    return { open, setOpen, close: () => setOpen(null) };
}
