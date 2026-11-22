'use client';

import Link from 'next/link';
import { getPassage, useContentVersion } from '../../lib/content/repository';
import PassageReader from '../../components/PassageReader';
import { QueryPage, useQueryParam } from '../../lib/useQueryParam';

export default function ReadRoute() {
    return <QueryPage><ReadPassagePage /></QueryPage>;
}

function ReadPassagePage() {
    const id = useQueryParam('id');
    useContentVersion();
    const passage = getPassage(id);

    if (!passage) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-ink font-semibold">Không tìm thấy đoạn văn này.</p>
                <Link href="/read" className="text-accent underline">
                    Xem các đoạn khác
                </Link>
            </div>
        );
    }
    return <PassageReader key={passage.id} passage={passage} />;
}
