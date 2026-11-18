'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import OnboardingModal from '../components/OnboardingModal';
import TryFirst from '../components/TryFirst';

export default function OnboardingPage() {
    const router = useRouter();
    const hasSeenOnboarding = useLexicaStore(state => state.hasSeenOnboarding);
    const completeOnboarding = useLexicaStore(state => state.completeOnboarding);
    // Issue #146: one real card before the welcome steps.
    const [tried, setTried] = useState(false);

    // Redirect if already seen onboarding
    useEffect(() => {
        if (hasSeenOnboarding) {
            router.replace('/');
        }
    }, [hasSeenOnboarding, router]);

    const handleComplete = () => {
        completeOnboarding();
        router.replace('/test');
    };

    if (hasSeenOnboarding) {
        return null;
    }

    if (!tried) return <TryFirst onDone={() => setTried(true)} />;
    return <OnboardingModal firstTime onComplete={handleComplete} />;
}
