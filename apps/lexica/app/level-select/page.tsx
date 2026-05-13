'use client';

import { useRouter } from 'next/navigation';
import { useLexicaStore } from '../store/lexicaStore';
import LevelSelector from '../components/LevelSelector';
import InstallPWAPrompt from '../components/InstallPWAPrompt';
import { DifficultyLevel } from '../components/VocabCard';
import { ArrowLeft } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function LevelSelectPage() {
    const router = useRouter();
    const selectedLevel = useLexicaStore(state => state.selectedLevel);
    const setSelectedLevel = useLexicaStore(state => state.setSelectedLevel);
    const { click } = useSoundEffects();

    const handleSelectLevel = (level: DifficultyLevel | 'all') => {
        setSelectedLevel(level);
        router.push('/');
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-900">
            {/* Back button if user already has a level */}
            {selectedLevel && (
                <button
                    onClick={() => {
                        click();
                        router.push('/');
                    }}
                    className="fixed top-4 left-4 md:top-6 md:left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-cyan-500 text-slate-200 text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>
            )}
            <LevelSelector
                onSelect={handleSelectLevel}
                currentLevel={selectedLevel}
            />

            {/* PWA Install Prompt */}
            <InstallPWAPrompt />
        </div>
    );
}
