'use client';

import { useRouter } from 'next/navigation';
import MoreList from '../components/MoreList';
import { useLexicaStore } from '../store/lexicaStore';

/** "Luyện": every single practice, for after today's session or for one thing only. */
export default function PracticePage() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-xl mx-auto space-y-4">
                <h1 className="text-xl font-semibold text-ink">Luyện</h1>
                <MoreList
                    onLearnMore={() => {
                        // The Drop's cards in a free swipe session on Home.
                        useLexicaStore.getState().loadNewDeck();
                        router.push('/?swipe=1');
                    }}
                />
            </div>
        </div>
    );
}
