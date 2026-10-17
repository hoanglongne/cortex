'use client';

import { useMemo, useState } from 'react';
import VocabCard from '../../components/VocabCard';
import { getAllCards } from '../../lib/content/repository';
import { mnemonic } from '../../lib/engagement/hard';
import type { CheckKind, RecallCheck } from '../../lib/engagement/recall';
import type { VocabCardData } from '../../types/vocab';

const longest = <T,>(items: readonly T[], size: (item: T) => number): T =>
    items.reduce((best, item) => (size(item) > size(best) ? item : best));

/** Worst case for each part of the card, taken from the real deck. */
function worstCase(kind: CheckKind): { card: VocabCardData; check: RecallCheck } {
    const all = getAllCards();
    const sentence = longest(all, (c) => (c.scenario ?? '').length);
    const aid = longest(all, (c) => mnemonic(c)?.length ?? 0);
    const byMeaning = [...all].sort((a, b) => b.translationHint.length - a.translationHint.length);
    const byWord = [...all].sort((a, b) => b.word.length - a.word.length);
    const card: VocabCardData = {
        ...sentence,
        translationHint: byMeaning[0].translationHint,
        surgeryModule: aid.surgeryModule,
        state: 'seed',
    } as VocabCardData;
    // The right answer goes last, so "click the first option" is a wrong answer.
    const options =
        kind === 'meaning' ? [...byMeaning.slice(1, 4).map((c) => c.translationHint), card.translationHint]
            : kind === 'cloze' ? [...byWord.filter((c) => c.word !== card.word).slice(0, 2).map((c) => c.word), card.word]
                : [];
    const answer = kind === 'meaning' ? card.translationHint : card.word;
    return { card, check: { cardId: card.id, kind, options, answer, peeked: kind !== 'meaning', isNew: kind !== 'type' } };
}

export default function CardFitFixture() {
    const [kind] = useState<CheckKind>(() => {
        const k = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('kind');
        return k === 'cloze' || k === 'type' ? k : 'meaning';
    });
    const { card, check } = useMemo(() => worstCase(kind), [kind]);
    return (
        <main className="min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                <VocabCard card={card} index={0} onSwipe={() => {}} check={check} onCheckAnswer={() => {}} sessionCount={3} />
            </div>
        </main>
    );
}
