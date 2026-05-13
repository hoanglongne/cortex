'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useLexicaStore } from '../../store/lexicaStore';
import LevelTestResult from '../../components/LevelTestResult';
import { DifficultyLevel } from '../../components/VocabCard';

function TestResultContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const score = parseInt(searchParams.get('score') || '0');
    const recommendedLevel = (searchParams.get('level') || 'beginner') as DifficultyLevel;
    const calibratedElo = searchParams.get('elo') ? parseInt(searchParams.get('elo')!) : undefined;

    const testScore = useLexicaStore(state => state.testScore);
    const acceptRecommendedLevel = useLexicaStore(state => state.acceptRecommendedLevel);
    const selectedLevel = useLexicaStore(state => state.selectedLevel);

    // Only redirect if no test score (user shouldn't be here)
    useEffect(() => {
        if (testScore === null) {
            router.replace('/');
        }
    }, [testScore, router]);

    const handleAccept = () => {
        acceptRecommendedLevel();
        router.replace('/');
    };

    const handleChooseManually = () => {
        router.replace('/');
    };

    if (testScore === null) {
        return null;
    }

    return (
        <LevelTestResult
            score={score}
            totalQuestions={5}
            recommendedLevel={recommendedLevel}
            calibratedElo={calibratedElo}
            onAccept={handleAccept}
            onChooseManually={handleChooseManually}
        />
    );
}

export default function TestResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
            <TestResultContent />
        </Suspense>
    );
}
