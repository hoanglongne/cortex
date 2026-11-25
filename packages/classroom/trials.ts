/**
 * "Buổi học thử" (docs/TEACH_TRIAL_PLAN.md; sql/classroom_trials.sql): types and
 * pure rules for trial sessions. No React, no Supabase.
 */

export type TrialGuestStatus = 'new' | 'invited' | 'enrolled';

export interface TrialGuest {
    id: string;
    name: string;
    phone: string | null;
    status: TrialGuestStatus;
    joined_at: string;
    /** From the guest's placement test; null until they finish it. */
    score: number | null;
    level: string | null;
    score_code: string | null;
}

export interface Trial {
    id: string;
    title: string;
    code: string;
    closed: boolean;
    closes_at: string;
    created_at: string;
    class_id: string | null;
    class_name: string | null;
    class_code: string | null;
    guests: TrialGuest[];
}

export interface TrialInfo {
    valid: boolean;
    title?: string;
    center?: string;
}

/** The address guests open (Lexica's /thu page) for a trial code. */
export function trialLink(lexicaUrl: string, code: string): string {
    return `${lexicaUrl.replace(/\/+$/, '')}/thu?code=${encodeURIComponent(code)}`;
}

/** The address of a class, for "Mời vào lớp". */
export function classJoinLink(lexicaUrl: string, classCode: string): string {
    return `${lexicaUrl.replace(/\/+$/, '')}/join?code=${encodeURIComponent(classCode)}`;
}

const LEVEL_VI: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao', expert: 'Chuyên gia' };
export const trialLevelLabel = (level: string | null): string => (level ? LEVEL_VI[level] ?? level : 'Chưa làm bài');

/** Guests who came and nobody has answered yet: the teacher's to-do. */
export const waitingGuests = (trials: readonly Trial[]): number =>
    trials.reduce((n, t) => n + t.guests.filter((g) => g.status === 'new').length, 0);

/** The message a teacher sends a guest to invite them to the class (pasted into Zalo). */
export function trialInviteMessage(guest: Pick<TrialGuest, 'name' | 'level'>, center: string, link: string | null): string {
    const level = guest.level ? ` Kết quả bài xếp lớp: ${trialLevelLabel(guest.level)}.` : '';
    return `Chào ${guest.name}, cảm ơn bạn đã học thử ở ${center}.${level}${link ? ` Vào lớp tại: ${link}` : ' Mình sẽ gửi link vào lớp cho bạn nhé.'}`;
}
