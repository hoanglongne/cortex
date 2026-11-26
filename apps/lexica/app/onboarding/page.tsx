'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import OnboardingFlow from '../components/OnboardingFlow';

/** The onboarding at its own address (old links, tests); someone new at / sees the same flow there. */
export default function OnboardingPage() {
    const router = useRouter();
    const hasSeenOnboarding = useLexicaStore((state) => state.hasSeenOnboarding);

    useEffect(() => {
        if (hasSeenOnboarding) router.replace('/');
    }, [hasSeenOnboarding, router]);

    if (hasSeenOnboarding) return null;
    return <OnboardingFlow />;
}
