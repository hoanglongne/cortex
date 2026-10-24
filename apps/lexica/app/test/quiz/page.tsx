'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLexicaStore } from '../../store/lexicaStore';
import PlacementTest, { type TestOutcome } from '../../components/PlacementTest';
import { signedIn } from '../../lib/engagement/economy';
import PlacementResultView from '../../components/PlacementResultView';
import { retake } from '../../lib/placement/engine';

/**
 * The adaptive vocabulary test and its result (docs/LEXICA_LEVEL_TEST_DESIGN.md).
 * Open to anyone the first time, also with a level already chosen; after
 * that a new score counts only 14 days and 100 reviews after the last.
 */
export default function TestQuizPage() {
    const router = useRouter();
    const isInTest = useLexicaStore((s) => s.isInTest);
    const placements = useLexicaStore((s) => s.placements);
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const elo = useLexicaStore((s) => s.userStats.currentElo);
    const completePlacement = useLexicaStore((s) => s.completePlacement);
    const acceptRecommendedLevel = useLexicaStore((s) => s.acceptRecommendedLevel);
    const [done, setDone] = useState<{ result: TestOutcome; previous: number | null } | null>(null);
    const [gate] = useState(() => {
        const reviews = Object.values(cardProgress).reduce((n, c) => n + c.reviewCount + c.wrongCount, 0);
        return retake(placements, reviews, Date.now());
    });
    // A re-take starts from the last score; a first test from the middle of the scale.
    const [start] = useState(() => (placements.length > 0 ? elo : 1000));
    // Signed in: a verified test (the server scores it); otherwise a practice one.
    const [verify, setVerify] = useState<boolean | null>(null);
    useEffect(() => {
        let live = true;
        void signedIn().then((yes) => live && setVerify(yes));
        return () => {
            live = false;
        };
    }, []);

    useEffect(() => {
        if (!isInTest && !done) router.replace('/test');
    }, [isInTest, done, router]);

    if (done) {
        return (
            <PlacementResultView
                result={done.result}
                previous={done.previous}
                onAccept={() => {
                    acceptRecommendedLevel();
                    router.replace('/');
                }}
                onChoose={() => router.replace('/level-select')}
            />
        );
    }
    if (!isInTest || verify === null) return null;

    if (!gate.ok) {
        return (
            <div className="min-h-screen bg-bg px-4 py-10">
                <section className="max-w-md mx-auto rounded-2xl border border-line bg-surface p-5 space-y-3">
                    <p className="font-semibold text-ink">Chưa tới lúc thi lại</p>
                    <p className="text-sm text-muted">
                        Điểm mới chỉ có ý nghĩa khi bạn đã học thêm. Còn
                        {gate.daysLeft > 0 ? ` ${gate.daysLeft} ngày` : ''}
                        {gate.daysLeft > 0 && gate.reviewsLeft > 0 ? ' và' : ''}
                        {gate.reviewsLeft > 0 ? ` ${gate.reviewsLeft} lượt ôn` : ''} nữa.
                    </p>
                    <Link href="/" onClick={() => useLexicaStore.setState({ isInTest: false })} className="inline-flex h-10 px-4 items-center rounded-xl bg-accent text-on-accent text-sm font-semibold">
                        Về học tiếp
                    </Link>
                </section>
            </div>
        );
    }

    return (
        <PlacementTest
            start={start}
            verify={verify}
            onBack={() => {
                useLexicaStore.setState({ isInTest: false });
                router.back();
            }}
            onDone={(result) => {
                const previous = placements.length > 0 ? placements[placements.length - 1].score : null;
                completePlacement({ at: Date.now(), score: result.score, sd: result.sd, level: result.level, ...(result.code ? { code: result.code } : {}) });
                setDone({ result, previous });
            }}
        />
    );
}
