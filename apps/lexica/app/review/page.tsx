'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ReviewSession from '../components/ReviewSession';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards } from '../lib/content/repository';
import { getDueCards } from '../lib/eloAlgorithm';
import { hardWords } from '../lib/engagement/hard';

function ReviewPageContent() {
    const searchParams = useSearchParams();
    const testAll = searchParams.get('all') === '1';
    const hardOnly = searchParams.get('hard') === '1';
    // ?ids=a,b: a chosen list, e.g. "5 từ hay sai nhất" from a path checkpoint.
    const idsParam = searchParams.get('ids');

    const cardProgress = useLexicaStore(state => state.cardProgress);
    const learnedWords = useLexicaStore(state => state.learnedWords);

    const dueCardIds = useMemo(() => {
        if (idsParam) return idsParam.split(',').filter(id => cardProgress[id]);
        if (testAll) {
            // Test mode: use all learned words that exist in getAllCards()
            const vocabIds = new Set(getAllCards().map(c => c.id));
            return Array.from(learnedWords).filter(id => vocabIds.has(id));
        }
        if (hardOnly) return hardWords(cardProgress).map(p => p.cardId);
        return getDueCards(cardProgress).map(p => p.cardId);
    }, [cardProgress, learnedWords, testAll, hardOnly, idsParam]);

    const n = dueCardIds.length;
    return (
        <ReviewSession
            dueCardIds={dueCardIds}
            subtitle={idsParam ? `${n} từ hay sai` : testAll ? `${n} từ (test)` : hardOnly ? `${n} từ khó` : `${n} từ đến hạn`}
            {...(hardOnly
                ? { emptyTitle: 'Không còn từ khó nào!', emptyText: 'Bạn đã hạ hết từ khó. Từ nào quên nhiều lần sẽ hiện lại ở đây.' }
                : {})}
        />
    );
}

function ReviewPageFallback() {
    return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-line border-t-accent animate-spin" />
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<ReviewPageFallback />}>
            <ReviewPageContent />
        </Suspense>
    );
}
