import { getSupabaseClient } from './supabase';
import { capture } from './productAnalytics';

export type FeedbackKind = 'bug' | 'idea' | 'other';

const MESSAGES: Record<string, string> = {
    'empty feedback': 'Bạn viết vài chữ rồi gửi nhé.',
    'too much feedback': 'Hôm nay bạn đã gửi nhiều rồi. Mai gửi tiếp giúp mình nhé.',
};

/** Sends a note to the team (table lexica_feedback). Works signed in or not. Returns an error in Vietnamese, or null. */
export async function sendFeedback(kind: FeedbackKind, message: string, contact: string, page: string): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return 'Chưa kết nối được máy chủ. Thử lại sau nhé.';
    const device = typeof navigator === 'undefined' ? null : navigator.userAgent.slice(0, 300);
    const { error } = await client.rpc('lexica_send_feedback', {
        p_kind: kind,
        p_message: message,
        p_contact: contact.trim() || null,
        p_page: page.slice(0, 200) || null,
        p_device: device,
    });
    if (error) return MESSAGES[error.message] ?? (/fetch|network/i.test(error.message) ? 'Không kết nối được. Thử lại khi có mạng.' : 'Chưa gửi được. Thử lại sau nhé.');
    // Only that it happened: the text stays in Supabase.
    capture('feedback_sent', { kind });
    return null;
}
