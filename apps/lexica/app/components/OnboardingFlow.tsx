'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLexicaStore } from '../store/lexicaStore';
import OnboardingModal from './OnboardingModal';
import TryFirst from './TryFirst';

/**
 * A new learner's first minutes: one real card (#146), then the two choices
 * (branch, persona), then the level. Shown at / for someone new, so the first
 * card appears without a second page load (#178), and at /onboarding.
 */
export default function OnboardingFlow() {
    const router = useRouter();
    const completeOnboarding = useLexicaStore((state) => state.completeOnboarding);
    const [tried, setTried] = useState(false);

    if (!tried) return <TryFirst onDone={() => setTried(true)} />;
    return (
        <OnboardingModal
            firstTime
            onComplete={() => {
                completeOnboarding();
                router.replace('/test');
            }}
        />
    );
}
