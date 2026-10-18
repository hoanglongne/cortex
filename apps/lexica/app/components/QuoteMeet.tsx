'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { getAllCards, getCard, getQuotes } from '../lib/content/repository';
import { useLexicaStore } from '../store/lexicaStore';

/**
 * Gặp from "Ngoài đời" when no passage fits: a real sentence from a book,
 * the news or a song with the word in it, and its meaning to pick. A right
 * answer counts as meeting the word in English.
 */
export default function QuoteMeet({ cardId, onDone }: { cardId: string; onDone: () => void }) {
    const card = getCard(cardId);
    const quote = getQuotes(cardId)[0];
    const markMet = useLexicaStore((s) => s.markMet);
    const [picked, setPicked] = useState<string | null>(null);
    const options = useMemo(() => {
        if (!card) return [];
        const others = getAllCards()
            .filter((c) => c.id !== cardId && c.translationHint !== card.translationHint)
            .map((c) => c.translationHint);
        const seed = cardId.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
        const picks = [0, 1].map((i) => others[(seed * (i + 7)) % Math.max(1, others.length)]).filter(Boolean);
        const list = [...new Set([card.translationHint, ...picks])];
        return seed % 2 ? list : list.reverse();
    }, [card, cardId]);
    if (!card || !quote) return null;

    const answer = (o: string) => {
        if (picked) return;
        setPicked(o);
        if (o === card.translationHint) markMet([cardId]);
    };

    return (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} data-testid="quote-meet" className="rounded-2xl border border-line bg-surface p-5">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-accent">
                <Quote className="w-4 h-4" /> Ngoài đời
            </p>
            <blockquote className="mt-3 text-lg leading-relaxed text-ink">&ldquo;{highlight(quote.text, card.word)}&rdquo;</blockquote>
            <p className="mt-1 text-xs text-muted">{quote.source}</p>
            <p className="mt-5 text-sm text-ink-2">
                <span className="font-semibold lowercase">{card.word}</span> ở đây nghĩa là gì?
            </p>
            <div className="mt-2 space-y-2">
                {options.map((o) => {
                    const cls = picked ? (o === card.translationHint ? 'border-accent bg-accent/10 text-ink' : o === picked ? 'border-danger/60 text-muted' : 'border-line text-subtle') : 'border-line text-ink hover:border-line-strong';
                    return (
                        <button key={o} disabled={!!picked} onClick={() => answer(o)} className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm ${cls}`}>
                            {o}
                        </button>
                    );
                })}
            </div>
            {picked && (
                <div className="mt-4">
                    {quote.translation && <p className="text-sm text-muted">{quote.translation}</p>}
                    <button data-testid="stage-next" onClick={onDone} className="mt-4 w-full h-12 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold">
                        Tiếp tục →
                    </button>
                </div>
            )}
        </motion.section>
    );
}

function highlight(text: string, word: string): React.ReactNode {
    const re = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*)`, 'i');
    const parts = text.split(re);
    return parts.map((p, i) => (i % 2 === 1 ? <span key={i} className="font-semibold text-accent">{p}</span> : <span key={i}>{p}</span>));
}
