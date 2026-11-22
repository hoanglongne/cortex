'use client';

import { Suspense, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * One value from the query string ("?id=…"), '' when absent. The packaged app is a
 * static export (docs/LEXICA_NATIVE_APP_PLAN.md), which cannot pre-render pages whose
 * address holds a code, so those pages take their code from the query instead.
 */
export function useQueryParam(name: string): string {
    return useSearchParams().get(name) ?? '';
}

/** useSearchParams needs a Suspense boundary in a static export. */
export function QueryPage({ children }: { children: ReactNode }) {
    return <Suspense fallback={null}>{children}</Suspense>;
}
