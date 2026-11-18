import { redirect } from 'next/navigation';

/** Old address of Blend (was "Núm vặn"); keeps shared links and the share target working. */
export default async function OldBlendPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(await searchParams)) if (typeof v === 'string') q.set(k, v);
    redirect(q.size ? `/blend?${q}` : '/blend');
}
