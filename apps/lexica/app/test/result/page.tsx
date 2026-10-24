'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLexicaStore } from '../../store/lexicaStore';
import PlacementResultView from '../../components/PlacementResultView';

/**
 * The last test's result, for a learner who left before choosing a level
 * (Home sends them here). The breakdown by kind is only shown right after
 * the test (app/test/quiz).
 */
export default function TestResultPage() {
    const router = useRouter();
    const placements = useLexicaStore((s) => s.placements);
    const acceptRecommendedLevel = useLexicaStore((s) => s.acceptRecommendedLevel);
    const last = placements[placements.length - 1];

    useEffect(() => {
        if (!last) router.replace('/level-select');
    }, [last, router]);
    if (!last) return null;

    const empty = { right: 0, total: 0 };
    return (
        <PlacementResultView
            result={{ score: last.score, sd: last.sd, level: last.level, byKind: { meaning: empty, phrase: empty, real: empty }, fakes: { yes: 0, total: 0 }, questions: 0 }}
            previous={placements.length > 1 ? placements[placements.length - 2].score : null}
            onAccept={() => {
                acceptRecommendedLevel();
                router.replace('/');
            }}
            onChoose={() => router.replace('/level-select')}
        />
    );
}
