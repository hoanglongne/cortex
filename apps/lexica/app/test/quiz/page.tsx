'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLexicaStore } from '../../store/lexicaStore';
import LevelTest from '../../components/LevelTest';
import { DifficultyLevel } from '../../components/VocabCard';

export default function TestQuizPage() {
    const router = useRouter();
    const isInTest = useLexicaStore(state => state.isInTest);
    const selectedLevel = useLexicaStore(state => state.selectedLevel);
    const completeTest = useLexicaStore(state => state.completeTest);

    // Redirect if not in test or already selected level
    useEffect(() => {
        if (!isInTest || selectedLevel) {
            router.replace('/');
        }
    }, [isInTest, selectedLevel, router]);

    const handleComplete = (score: number, recommendedLevel: DifficultyLevel, calibratedElo?: number) => {
        completeTest(score, recommendedLevel, calibratedElo);
        router.push(`/test/result?score=${score}&level=${recommendedLevel}${calibratedElo ? `&elo=${calibratedElo}` : ''}`);
    };

    const handleBack = () => {
        router.back();
    };

    if (!isInTest) {
        return null;
    }

    return <LevelTest onComplete={handleComplete} onBack={handleBack} />;
}
