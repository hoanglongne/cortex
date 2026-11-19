import type { Metadata } from 'next';
import VoiceSample from './VoiceSample';

export const metadata: Metadata = { title: 'Ghi mẫu giọng · Lexica', robots: { index: false, follow: false } };

/** "Giọng bạn" V0 (issue #145): record one voice sample for the offline test. Not linked from the app. */
export default function VoiceSamplePage() {
    return <VoiceSample />;
}
