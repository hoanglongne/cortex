/**
 * Banked review points turn into Bụi at the end of a session
 * (docs/LEXICA_FEEDBACK_TASKS.md T3): 10 points = 1 Bụi, at most 30 Bụi a day.
 * This connects the review page with the Album, where Bụi upgrades cards.
 *
 * The server (lexica_review_dust in supabase/migration_engagement_review_dust.sql)
 * applies the same rule and the daily cap; this copy is for wording.
 */

export const POINTS_PER_DUST = 10;
export const REVIEW_DUST_DAILY_CAP = 30;

/** Bụi for `points`, given how much review Bụi was already earned today. */
export function dustFor(points: number, earnedToday = 0, cap = REVIEW_DUST_DAILY_CAP): number {
    const raw = Math.floor(Math.max(0, points) / POINTS_PER_DUST);
    return Math.max(0, Math.min(raw, cap - Math.max(0, earnedToday)));
}

export type ReviewDust =
    | { status: 'paid'; dust: number; points: number; capped: boolean }
    | { status: 'signed-out' | 'none' | 'error'; points: number };

/** One line for the result screen: "Chốt 120 điểm → +12 Bụi". */
export function reviewDustLine(r: ReviewDust): string {
    if (r.status === 'paid') {
        if (r.dust === 0) return `Chốt ${r.points} điểm · hôm nay đã đủ ${REVIEW_DUST_DAILY_CAP} Bụi từ ôn tập`;
        return `Chốt ${r.points} điểm → +${r.dust} Bụi${r.capped ? ` (đủ ${REVIEW_DUST_DAILY_CAP} Bụi hôm nay)` : ''}`;
    }
    if (r.status === 'signed-out') return `Chốt ${r.points} điểm · đăng nhập để đổi điểm ra Bụi (${POINTS_PER_DUST} điểm = 1 Bụi)`;
    if (r.status === 'none') return `Chốt ${r.points} điểm · cần ${POINTS_PER_DUST} điểm để đổi 1 Bụi`;
    return `Chốt ${r.points} điểm · chưa đổi được ra Bụi, thử lại sau`;
}
