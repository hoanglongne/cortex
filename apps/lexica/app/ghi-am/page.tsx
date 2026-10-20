import type { Metadata } from 'next';
import RecordingKit from './RecordingKit';

export const metadata: Metadata = { title: 'Ghi âm kiểm định · Lexica', robots: { index: false, follow: false } };

/** The recording kit for testers (docs/LEXICA_PRONUNCIATION_RECORDING.md). Not linked from the app. */
export default function RecordingKitPage() {
    return <RecordingKit />;
}
