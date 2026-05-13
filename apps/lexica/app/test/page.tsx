'use client';

import { useRouter } from 'next/navigation';
import { useLexicaStore } from '../store/lexicaStore';
import LevelTestWelcome from '../components/LevelTestWelcome';
import { ArrowLeft } from 'lucide-react';

export default function TestPage() {
    const router = useRouter();
    const selectedLevel = useLexicaStore(state => state.selectedLevel);
    const startTest = useLexicaStore(state => state.startTest);

    const handleStartTest = () => {
        startTest();
        router.push('/test/quiz');
    };

    const handleSkipToManual = () => {
        const skipToManual = useLexicaStore.getState().skipToManual;
        skipToManual(); // Set hasSeenWelcome: true to prevent redirect loop
        router.push('/level-select');
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Back button if user already has a level */}
            {selectedLevel && (
                <button
                    onClick={() => router.push('/')}
                    className="fixed top-4 left-4 md:top-6 md:left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-cyan-500 text-slate-200 text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>
            )}
            <LevelTestWelcome onStartTest={handleStartTest} onSkipToManual={handleSkipToManual} />
        </div>
    );
}
