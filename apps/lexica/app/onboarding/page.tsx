'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import OnboardingModal from '../components/OnboardingModal';

export default function OnboardingPage() {
    const router = useRouter();
    const hasSeenOnboarding = useLexicaStore(state => state.hasSeenOnboarding);
    const completeOnboarding = useLexicaStore(state => state.completeOnboarding);

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

    return <OnboardingModal onComplete={handleComplete} />;
}
