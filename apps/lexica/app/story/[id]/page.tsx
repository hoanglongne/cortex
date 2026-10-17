import { redirect } from 'next/navigation';

/** Story Mode became "Đọc" (docs/LEXICA_FEEDBACK_TASKS.md T7). */
export default function OldStoryPage() {
    redirect('/read');
}
