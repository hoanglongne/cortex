/**
 * Buddy, the social parts (issue #100, docs/BUDDY_PLAN.md; supabase/
 * migration_buddy_social.sql): what my buddies learned today, gifts, the
 * group quest with shields, study dates. This file: the calls, and the pure
 * parts (the quest maths, the date windows), which are unit tested.
 */
import { getSupabaseClient } from './supabase';
import { localDate } from './engagement/ghost';
import type { DailyActivity } from './buddy';

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Cần đăng nhập và có mạng.');
    const { data, error } = await client.rpc(name, args);
    if (error) throw new Error(socialMessage(error.message));
    return data as T;
}

const MESSAGES: Record<string, string> = {
    'not buddies': 'Chỉ làm được với bạn học của mình.',
    'note too long': 'Lời nhắn tối đa 60 chữ.',
    'no links': 'Lời nhắn không được có đường dẫn hay email.',
    'too many gifts': 'Hôm nay bạn đã tặng 5 món rồi. Mai tặng tiếp nhé.',
    'shield used': 'Tuần này bạn đã đỡ một ngày cho bạn rồi.',
    'bad day': 'Chỉ đỡ được một ngày trong 7 ngày qua.',
    'too many dates': 'Hai bạn đã hẹn 3 buổi chưa diễn ra. Xong rồi hẹn tiếp nhé.',
    'bad time': 'Chọn giờ trong 7 ngày tới.',
    'outside window': 'Chưa đến giờ hẹn, hoặc đã quá giờ.',
    'no such gift': 'Không thấy món quà này.',
    'no such date': 'Không thấy buổi hẹn này.',
    'too many asks': 'Bạn đang chờ 5 câu trả lời rồi. Chờ bạn ấy trả lời đã nhé.',
    'answer length': 'Câu trả lời từ 3 đến 120 chữ.',
    'no such ask': 'Không thấy lời nhờ này.',
    blocked: 'Không kết bạn được với người này.',
};
export function socialMessage(raw: string): string {
    const key = Object.keys(MESSAGES).find((k) => raw.includes(k));
    return key ? MESSAGES[key] : raw;
}

// ── Hôm nay bạn học gì ──────────────────────────────────────────────────

export interface WordsFeed {
    /** I hide my words from buddies. */
    hidden: boolean;
    items: { user_id: string; name: string | null; words: string[] }[];
}
export const buddyWordsSet = (day: string, words: string[]) => rpc<{ ok: boolean }>('buddy_words_set', { p_day: day, p_words: words.slice(0, 40) });
export const buddyWordsFeed = (day = localDate()) => rpc<WordsFeed>('buddy_words_feed', { p_day: day });
export const buddyHideWords = (hide: boolean) => rpc<{ ok: boolean }>('buddy_prefs_set', { p_hide: hide });

// ── Gifts ───────────────────────────────────────────────────────────────

export const GIFT_NOTE_MAX = 60;

export interface GiftsBox {
    received: { id: string; from_id: string; from_name: string | null; card_id: string; note: string; created_at: string; opened: boolean }[];
    sent: { id: string; to_id: string; to_name: string | null; card_id: string; created_at: string; opened: boolean }[];
}
export const giftSend = (to: string, card: string, note: string) => rpc<{ id: string }>('gift_send', { p_to: to, p_card: card, p_note: cleanNote(note) });
export const giftInbox = () => rpc<GiftsBox>('gift_inbox');
export const giftOpen = (id: string) => rpc<{ card_id: string }>('gift_open', { p_gift: id });
export const giftReport = (id: string) => rpc<{ ok: boolean }>('gift_report', { p_gift: id });

/** A note as sent: one line, trimmed, at most 60 characters. */
export const cleanNote = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, GIFT_NOTE_MAX);

/** Why a note cannot be sent (links and emails are refused), or null. */
export const noteProblem = (s: string): string | null => (/(https?:|www\.|\.com|\.vn|@)/i.test(s) ? MESSAGES['no links'] : null);

// ── The group quest ─────────────────────────────────────────────────────

/** Damage a person does on a day: up to 10 for words learned, 15 for reaching the day's goal. */
export const GOAL_DAMAGE = 15;
export const WORD_DAMAGE_CAP = 10;
/** The week's goal, in points, for each member of the group. */
export const HP_PER_MEMBER = 90;
/** After a lost week the monster comes back with this much more life. */
export const REGROW = 0.15;

export interface Shield {
    giver: string;
    giver_name: string | null;
    receiver: string;
    day: string;
}
export const shieldGive = (to: string, day: string) => rpc<{ ok: boolean }>('shield_give', { p_to: to, p_day: day });
export const shieldsTeam = (from: string) => rpc<Shield[]>('shields_team', { p_from: from });

/** The Monday of the week that contains `date` ('YYYY-MM-DD'). */
export function weekStart(date: string): string {
    const [y, m, d] = date.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
    return dt.toISOString().slice(0, 10);
}

/** `date` moved by `n` days. */
export function shiftDate(date: string, n: number): string {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** The 7 dates (Monday first) of the week that starts on `monday`. */
export function weekDates(monday: string): string[] {
    const [y, m, d] = monday.split('-').map(Number);
    return Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10));
}

export interface QuestMember {
    id: string;
    name: string;
    damage: number;
    /** Days covered by a buddy's shield. */
    shielded: string[];
}

export interface Quest {
    members: QuestMember[];
    hp: number;
    damage: number;
    /** 0..1 */
    left: number;
    state: 'fighting' | 'won' | 'lost';
    /** The monster grew back after last week's loss. */
    regrown: boolean;
    /** People with the least damage, to cheer. */
    quiet: QuestMember[];
}

/**
 * The week's monster, from the people's daily activity. Everyone's damage on a
 * day is counted from what daily_activity already holds, so the quest needs no
 * tracking of its own. A shielded day with no goal still counts as a goal day.
 * `ended`: the week is over, so an unbeaten monster means the group lost.
 * `forceToday`: my own goal today, if the server does not know it yet.
 */
export function questWeek(opts: { people: readonly { id: string; name: string }[]; week: Record<string, Record<string, DailyActivity>>; dates: readonly string[]; shields?: readonly Shield[]; me?: string; forceToday?: string | false; ended?: boolean; regrown?: boolean }): Quest {
    const { people, week, dates, shields = [], me, forceToday = false, ended = false, regrown = false } = opts;
    const members = people.map((p) => {
        const shielded = shields.filter((s) => s.receiver === p.id && dates.includes(s.day)).map((s) => s.day);
        let damage = 0;
        for (const d of dates) {
            const a = week[p.id]?.[d];
            const met = Boolean(a?.goal_met) || (p.id === me && forceToday === d);
            damage += Math.min(WORD_DAMAGE_CAP, a?.words_learned_today ?? 0) + (met || shielded.includes(d) ? GOAL_DAMAGE : 0);
        }
        return { id: p.id, name: p.name, damage, shielded };
    });
    const hp = Math.round(people.length * HP_PER_MEMBER * (regrown ? 1 + REGROW : 1));
    const damage = members.reduce((n, m) => n + m.damage, 0);
    const state = damage >= hp && hp > 0 ? 'won' : ended ? 'lost' : 'fighting';
    const least = Math.min(...members.map((m) => m.damage));
    return { members, hp, damage, left: hp ? Math.max(0, 1 - damage / hp) : 1, state, regrown, quiet: members.length > 1 ? members.filter((m) => m.damage === least && m.id !== me) : [] };
}

/** One line under the monster. */
export function questLine(q: Quest): string {
    if (q.members.length < 2) return 'Thêm một người bạn để cùng đặt mục tiêu tuần. Một mình cũng tính được.';
    if (q.state === 'won') return 'Cả nhóm đã đạt mục tiêu tuần này!';
    if (q.state === 'lost') return 'Tuần trước nhóm chưa đạt mục tiêu. Tuần này làm lại nhé.';
    const need = q.hp - q.damage;
    const slackers = q.quiet.length ? ` ${q.quiet.map((m) => m.name).join(', ')} chưa góp nhiều: cổ vũ hoặc đỡ một ngày cho bạn ấy nhé.` : '';
    return `Còn ${need} điểm.${slackers}`;
}

// ── Study dates ─────────────────────────────────────────────────────────

export interface StudyDate {
    id: string;
    at: string;
    mine: boolean;
    with_id: string;
    with_name: string | null;
    my_in: string | null;
    their_in: string | null;
}
export const dateCreate = (buddy: string, at: Date) => rpc<{ id: string }>('date_create', { p_buddy: buddy, p_at: at.toISOString() });
export const dateList = () => rpc<StudyDate[]>('date_list');
export const dateCheckin = (id: string) => rpc<{ ok: boolean }>('date_checkin', { p_date: id });
export const dateCancel = (id: string) => rpc<{ ok: boolean }>('date_cancel', { p_date: id });

const MIN = 60_000;
export const WINDOW_BEFORE = 15 * MIN;
export const WINDOW_AFTER = 90 * MIN;

export type DateStatus = 'soon' | 'open' | 'together' | 'missed';

/** Where a study date stands: not yet, check in now, both studied, or it passed without both. */
export function dateStatus(d: Pick<StudyDate, 'at' | 'my_in' | 'their_in'>, now: number): DateStatus {
    if (d.my_in && d.their_in) return 'together';
    const at = Date.parse(d.at);
    if (now > at + WINDOW_AFTER) return 'missed';
    return now >= at - WINDOW_BEFORE ? 'open' : 'soon';
}

/** A calendar file (.ics) for the date, so the phone reminds both of them. */
export function dateIcs(d: Pick<StudyDate, 'id' | 'at'>, withName: string): string {
    const stamp = (t: number) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const start = Date.parse(d.at);
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lexica//Buddy//VI', 'BEGIN:VEVENT', `UID:${d.id}@lexica`, `DTSTAMP:${stamp(Date.now())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(start + 30 * MIN)}`, `SUMMARY:Học Lexica cùng ${withName.replace(/[,;\n]/g, ' ')}`, 'BEGIN:VALARM', 'TRIGGER:-PT10M', 'ACTION:DISPLAY', 'DESCRIPTION:Sắp đến giờ học chung', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

/** Evening choices for the next days, as start times (local): tonight if still ahead, and the 3 days after. */
export function dateSlots(now: Date): { label: string; at: Date }[] {
    const out: { label: string; at: Date }[] = [];
    for (let i = 0; i < 4; i++) {
        for (const hour of [12, 20]) {
            const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, 30);
            if (at.getTime() < now.getTime() + 30 * MIN) continue;
            out.push({ label: `${i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : `${at.getDate()}/${at.getMonth() + 1}`} ${hour}:30`, at });
        }
    }
    return out;
}

// ── Gift labels: "Từ Hà tặng" on the card ───────────────────────────────

const GIFT_KEY = 'lexica-gift-from';
const readLabels = (): Record<string, string> => {
    try {
        return JSON.parse(localStorage.getItem(GIFT_KEY) ?? '{}') as Record<string, string>;
    } catch {
        return {};
    }
};
/** Remember who gave a word, to show on its card. */
export function rememberGift(cardId: string, from: string): void {
    try {
        localStorage.setItem(GIFT_KEY, JSON.stringify({ ...readLabels(), [cardId]: from.slice(0, 20) }));
    } catch {
        // storage can be blocked
    }
}
export const giftFrom = (cardId: string): string | null => (typeof window === 'undefined' ? null : readLabels()[cardId] ?? null);

// ── Block, ask, milestones ──────────────────────────────────────────────

export const buddyBlock = (user: string) => rpc<{ ok: boolean }>('buddy_block', { p_user: user });

export const ASK_MAX = 120;
export interface AsksBox {
    to_answer: { id: string; from_name: string | null; card_id: string; created_at: string }[];
    answers: { id: string; from_name: string | null; card_id: string; answer: string | null; answered_at: string }[];
    waiting: number;
}
export const askSend = (to: string, card: string) => rpc<{ id: string }>('ask_send', { p_to: to, p_card: card });
export const askInbox = () => rpc<AsksBox>('ask_inbox');
export const askAnswer = (id: string, text: string) => rpc<{ ok: boolean }>('ask_answer', { p_ask: id, p_text: text.replace(/\s+/g, ' ').trim().slice(0, ASK_MAX) });
export const askReport = (id: string) => rpc<{ ok: boolean }>('ask_report', { p_ask: id });
export const teamWords = () => rpc<{ total: number; members: number }>('team_words');

export const MILESTONES = [50, 100, 250, 500, 1000, 2000, 5000, 10000];

/** The last milestone passed and the next one, for "cùng nhau đã học N từ". */
export function milestone(total: number): { passed: number | null; next: number | null } {
    const passed = [...MILESTONES].reverse().find((m) => total >= m) ?? null;
    return { passed, next: MILESTONES.find((m) => total < m) ?? null };
}
