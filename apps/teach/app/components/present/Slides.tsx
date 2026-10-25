'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Turtle, Volume2 } from 'lucide-react';
import type { IndexCard } from '../../modules/lexica/words';
import { hush, say } from '../../lib/voice';

/** Lexica's card sentence with the English word in capitals: the word, and the sentence split around it. */
function splitScenario(scenario: string | undefined): { before: string; word: string; after: string } | null {
    if (!scenario) return null;
    const m = /\b[A-Z][A-Z'-]{2,}(?:\s+[A-Z][A-Z'-]+)*\b/.exec(scenario);
    if (!m) return null;
    return { before: scenario.slice(0, m.index), word: m[0], after: scenario.slice(m.index + m[0].length) };
}

/**
 * The lesson's words on the projector, one at a time: the word, its sound,
 * the meaning hidden until the class has guessed, the card's sentence and
 * phrases, and how many in the class already remember it.
 * Keys: ← → move, Space shows the meaning, S says it (Shift+S slowly),
 * G switches "Đoán từ" (the sentence with the word blanked).
 */
export default function Slides({ cards, remembered, students }: { cards: IndexCard[]; remembered: (cardId: string) => number; students: number }) {
    const [at, setAt] = useState(0);
    const [shown, setShown] = useState(false);
    const [guess, setGuess] = useState(false);
    const card = cards[Math.min(at, cards.length - 1)];

    const go = useCallback(
        (d: number) => {
            hush();
            setAt((i) => Math.max(0, Math.min(cards.length - 1, i + d)));
            setShown(false);
        },
        [cards.length],
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'ArrowRight' || e.key === 'PageDown') go(1);
            else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1);
            else if (e.key === ' ') {
                e.preventDefault();
                setShown((s) => !s);
            } else if (e.key.toLowerCase() === 's' && card) void say(card.word, e.shiftKey);
            else if (e.key.toLowerCase() === 'g') {
                setGuess((g) => !g);
                setShown(false);
            } else return;
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [go, card]);

    useEffect(() => () => hush(), []);

    if (!card) return <p className="text-center text-muted">Bài này chưa có từ nào trong danh sách của Lexica.</p>;
    const sentence = splitScenario(card.scenario);
    const word = card.word.toLowerCase();
    const known = remembered(card.id);
    // In "Đoán từ" the word itself is the answer to reveal.
    const hideWord = guess && !shown;

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                <div className="min-h-[7rem] flex flex-col items-center justify-center">
                    {hideWord ? (
                        <p className="font-mono text-5xl tracking-[0.3em] text-subtle md:text-7xl">{'_'.repeat(Math.min(12, word.length))}</p>
                    ) : (
                        <p className="text-6xl font-semibold tracking-tight text-ink md:text-8xl">{word}</p>
                    )}
                    {card.ipa && !hideWord && <p className="mt-3 font-mono text-xl text-muted md:text-2xl">/{card.ipa.replace(/^\/|\/$/g, '')}/</p>}
                </div>

                <div className="flex gap-3">
                    <button onClick={() => void say(card.word)} className="flex h-14 items-center gap-2 rounded-2xl border border-line-strong px-5 text-lg text-ink hover:border-accent" aria-label="Nghe">
                        <Volume2 className="h-6 w-6" /> Nghe
                    </button>
                    <button onClick={() => void say(card.word, true)} className="flex h-14 items-center gap-2 rounded-2xl border border-line-strong px-5 text-lg text-ink hover:border-accent" aria-label="Nghe chậm">
                        <Turtle className="h-6 w-6" /> Chậm
                    </button>
                    <button onClick={() => setShown((s) => !s)} className="flex h-14 items-center gap-2 rounded-2xl bg-accent px-5 text-lg font-semibold text-on-accent">
                        {shown ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />} {shown ? 'Ẩn' : guess ? 'Mở đáp án' : 'Hiện nghĩa'}
                    </button>
                </div>

                <p className={`min-h-[3rem] max-w-3xl text-3xl font-medium transition-opacity md:text-4xl ${shown || hideWord ? 'text-accent-strong opacity-100' : 'opacity-0'}`}>{card.meaning}</p>

                {sentence && (
                    <p className="max-w-4xl text-xl leading-relaxed text-ink-2 md:text-2xl">
                        {sentence.before}
                        <span className={`rounded px-1 font-semibold ${hideWord ? 'bg-surface-2 text-transparent' : 'text-ink'}`}>{hideWord ? '____' : sentence.word.toLowerCase()}</span>
                        {sentence.after}
                    </p>
                )}
                {card.collocations && card.collocations.length > 0 && !hideWord && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {card.collocations.map((c) => (
                            <button key={c} onClick={() => void say(c)} className="rounded-full border border-line px-4 py-1.5 text-lg text-ink-2 hover:border-accent">
                                {c}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-sm text-muted">
                <button onClick={() => go(-1)} disabled={at === 0} className="flex h-11 items-center gap-1 rounded-xl px-3 hover:text-ink disabled:opacity-30">
                    <ChevronLeft className="h-5 w-5" /> Trước
                </button>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="font-mono text-ink">
                        Từ {at + 1}/{cards.length}
                    </span>
                    {students > 0 && (
                        <span>
                            {known}/{students} em đã nhớ từ này
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setGuess((g) => !g); setShown(false); }} aria-pressed={guess} className={`h-11 rounded-xl px-3 ${guess ? 'bg-accent-soft text-accent-strong' : 'hover:text-ink'}`}>
                        Đoán từ
                    </button>
                    <button onClick={() => go(1)} disabled={at === cards.length - 1} className="flex h-11 items-center gap-1 rounded-xl px-3 hover:text-ink disabled:opacity-30">
                        Tiếp <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
