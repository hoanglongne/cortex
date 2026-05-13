'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import StoryUnlockModal from '../../../components/StoryUnlockModal';
import { STORIES } from '../../../data/stories';

function UnlockContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const storyId = params.id as string;
    const part = parseInt(searchParams.get('part') || '1') as 1 | 2;

    const story = STORIES.find(s => s.id === storyId);

    // Check if story exists
    useEffect(() => {
        if (!story) {
            router.replace('/learned');
        }
    }, [story, router]);

    const handleReadNow = () => {
        const partParam = part === 1 ? 'part1' : 'full';
        router.push(`/story/${storyId}?part=${partParam}`);
    };

    const handleClose = () => {
        router.push('/learned');
    };

    if (!story) {
        return null;
    }

    return <StoryUnlockModal storyId={storyId} part={part} onReadNow={handleReadNow} onClose={handleClose} />;
}

export default function UnlockPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
            <UnlockContent />
        </Suspense>
    );
}
