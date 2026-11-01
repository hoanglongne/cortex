/**
 * "Báo thẻ này có vấn đề" (issue #62): a learner flags a card with one of four
 * reasons. Goes to cortex_card_reports (supabase/migration_card_stats.sql); a
 * Studio card's report also counts in its Studio metrics. A card already
 * reported for a reason on this device is not sent twice.
 */
import { getSupabaseClient } from './supabase';
import { flushCardEvents, trackCardEvent } from './content/events';

export type ReportReason = 'wrong_meaning' | 'odd_example' | 'wrong_audio' | 'too_hard';

export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
    { id: 'wrong_meaning', label: 'Sai nghĩa' },
    { id: 'odd_example', label: 'Ví dụ lạ hoặc không hợp' },
    { id: 'wrong_audio', label: 'Giọng đọc sai' },
    { id: 'too_hard', label: 'Quá khó so với cấp độ' },
];

const KEY = 'lexica-card-reports';

/** "v012:wrong_meaning" for each report sent from this device. */
export function readReported(): Set<string> {
    try {
        const v = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
        return new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
    } catch {
        return new Set();
    }
}

export const reportKey = (cardId: string, reason: ReportReason) => `${cardId}:${reason}`;

/** Sends the report. Returns false when it was already sent from this device or could not be sent. */
export async function reportCard(cardId: string, reason: ReportReason): Promise<boolean> {
    const done = readReported();
    const key = reportKey(cardId, reason);
    if (done.has(key)) return false;
    // Studio cards also keep their own counters for Studio's review
    if (reason !== 'too_hard') trackCardEvent(cardId, 'report');
    flushCardEvents();
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.rpc('card_report', { p_card: cardId, p_reason: reason });
    if (error) return false;
    try {
        localStorage.setItem(KEY, JSON.stringify([...done, key].slice(-300)));
    } catch {
        // Storage blocked: the server still dedupes signed-in players.
    }
    return true;
}
