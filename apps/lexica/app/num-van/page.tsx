import type { Metadata } from 'next';
import DialReader from './DialReader';

export const metadata: Metadata = { title: 'Núm vặn (thử nghiệm) · Lexica', robots: { index: false } };

/** Núm vặn D1 preview (docs/LEXICA_WOW_PLAN.md §2): paste Vietnamese text, read it as câu chêm. Unlinked. */
export default function NumVanPage() {
    return <DialReader />;
}
