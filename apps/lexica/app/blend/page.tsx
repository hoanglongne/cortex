import type { Metadata } from 'next';
import DialReader from './DialReader';

export const metadata: Metadata = { title: 'Blend (thử nghiệm) · Lexica', robots: { index: false } };

/** Blend D1 preview (docs/LEXICA_WOW_PLAN.md §2): paste Vietnamese text, read it as câu chêm. Unlinked. */
export default function BlendPage() {
    return <DialReader />;
}
