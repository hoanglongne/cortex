import type { Metadata } from 'next';

/** A parent's private link: never in search results. */
export const metadata: Metadata = { title: 'Báo cáo học của con', robots: { index: false, follow: false } };

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    return children;
}
