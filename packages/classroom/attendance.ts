/**
 * Class sessions and attendance (sql/classroom_attendance.sql): the weekly
 * timetable, which days were class days, who came, and the few numbers built
 * on them (a student's record, who missed lessons in a row, days the roll was
 * not taken). Dates are local "YYYY-MM-DD" (Asia/Ho_Chi_Minh on the server).
 * Pure, unit tested.
 */

export type Mark = 'present' | 'late' | 'absent' | 'excused';
export const MARKS: readonly Mark[] = ['present', 'late', 'absent', 'excused'];
export const MARK_LABEL: Record<Mark, string> = { present: 'Có mặt', late: 'Muộn', absent: 'Vắng', excused: 'Có phép' };

/** One weekly lesson: ISO weekday (Monday 1 … Sunday 7), start "HH:MM", length in minutes. */
export interface Slot {
    dow: number;
    start: string;
    minutes: number;
}

/** A day the teacher took the roll, wrote the topic or cancelled. */
export interface Session {
    date: string;
    topic: string | null;
    cancelled: boolean;
    marks: Record<string, Mark>;
}

export interface ClassAttendance {
    schedule: Slot[];
    /** Newest first. */
    sessions: Session[];
}

/** classroom_attendance: by class id. */
export type AttendanceByClass = Record<string, ClassAttendance>;

export const DOW_SHORT = ['', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
export const DOW_LONG = ['', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'] as const;

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
const toUtc = (date: string) => Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10));
const fromUtc = (t: number) => {
    const d = new Date(t);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

/** `date` moved by `n` days. */
export const addDays = (date: string, n: number) => fromUtc(toUtc(date) + n * DAY_MS);
/** Days from `a` to `b`. */
export const daysBetween = (a: string, b: string) => Math.round((toUtc(b) - toUtc(a)) / DAY_MS);
/** ISO weekday: Monday 1 … Sunday 7. */
export const isoDow = (date: string) => ((new Date(toUtc(date)).getUTCDay() + 6) % 7) + 1;
/** The Monday of `date`'s week. */
export const mondayOf = (date: string) => addDays(date, 1 - isoDow(date));

/** "Thứ Năm 23/10" / "T5 23/10" */
export const dayLabel = (date: string, short = false) => `${(short ? DOW_SHORT : DOW_LONG)[isoDow(date)]} ${+date.slice(8, 10)}/${+date.slice(5, 7)}`;

/** "19:30" for a lesson starting 18:00 that lasts 90 minutes. */
export function endTime(start: string, minutes: number): string {
    const m = (+start.slice(0, 2) * 60 + +start.slice(3, 5) + minutes) % (24 * 60);
    return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

export const slotTime = (s: Slot) => `${s.start}–${endTime(s.start, s.minutes)}`;

/** The timetable in one line: "T2, T4, T6 · 18:00–19:30", or "T2 18:00–19:30, T7 08:30–10:00" when times differ. */
export function scheduleLine(schedule: readonly Slot[]): string {
    if (schedule.length === 0) return '';
    const sorted = [...schedule].sort((a, b) => a.dow - b.dow);
    const same = sorted.every((s) => s.start === sorted[0].start && s.minutes === sorted[0].minutes);
    if (same) return `${sorted.map((s) => DOW_SHORT[s.dow]).join(', ')} · ${slotTime(sorted[0])}`;
    return sorted.map((s) => `${DOW_SHORT[s.dow]} ${slotTime(s)}`).join(', ');
}

/** The same rules as cortex_clean_schedule: one slot per weekday, a valid time, 15–300 minutes. */
export function cleanSchedule(input: readonly Partial<Slot>[]): Slot[] {
    const byDow = new Map<number, Slot>();
    for (const s of input) {
        if (!s || !Number.isInteger(s.dow) || s.dow! < 1 || s.dow! > 7) continue;
        if (typeof s.start !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.start)) continue;
        const minutes = Math.min(300, Math.max(15, Math.round(typeof s.minutes === 'number' ? s.minutes : 90)));
        const slot = { dow: s.dow!, start: s.start, minutes };
        const had = byDow.get(slot.dow);
        if (!had || slot.start < had.start) byDow.set(slot.dow, slot);
    }
    return [...byDow.values()].sort((a, b) => a.dow - b.dow);
}

export const slotOn = (schedule: readonly Slot[], date: string) => schedule.find((s) => s.dow === isoDow(date));

/** A day on the class's calendar: on the timetable, or held as an extra lesson. */
export interface ClassDay {
    date: string;
    slot?: Slot;
    session?: Session;
    /** cancelled: no lesson; marked: roll taken; open: on the timetable, roll not taken (yet); upcoming: after today. */
    state: 'cancelled' | 'marked' | 'open' | 'upcoming';
}

const isMarked = (s: Session | undefined) => Boolean(s && !s.cancelled && Object.keys(s.marks).length > 0);

/** Class days from `from` to `to`, newest first: timetable days plus any day with a session. */
export function classDays(att: ClassAttendance, from: string, to: string, today: string): ClassDay[] {
    const sessions = new Map(att.sessions.map((s) => [s.date, s]));
    const out: ClassDay[] = [];
    for (let d = to; d >= from; d = addDays(d, -1)) {
        const slot = slotOn(att.schedule, d);
        const session = sessions.get(d);
        if (!slot && !session) continue;
        const state = session?.cancelled ? 'cancelled' : isMarked(session) ? 'marked' : d > today ? 'upcoming' : 'open';
        out.push({ date: d, ...(slot ? { slot } : {}), ...(session ? { session } : {}), state });
    }
    return out;
}

/** The next lesson from `today` on (today included), within two weeks; cancelled days are skipped. */
export function nextLesson(att: ClassAttendance, today: string): ClassDay | null {
    return classDays(att, today, addDays(today, 14), today).reverse().find((d) => d.state !== 'cancelled') ?? null;
}

/**
 * Past timetable days without a roll, newest first: from the class's first
 * roll on (a teacher who never takes the roll is not nagged), within `back` days.
 */
export function unmarkedDays(att: ClassAttendance, today: string, back = 14): string[] {
    const marked = att.sessions.filter(isMarked).map((s) => s.date);
    if (marked.length === 0) return [];
    const first = marked.reduce((a, b) => (a < b ? a : b));
    const from = [first, addDays(today, -back)].reduce((a, b) => (a > b ? a : b));
    return classDays(att, from, addDays(today, -1), today)
        .filter((d) => d.state === 'open' && d.slot)
        .map((d) => d.date);
}

export interface SessionCounts {
    present: number;
    late: number;
    absent: number;
    excused: number;
    /** Students in the class with no mark that day. */
    unmarked: number;
}

/** A day's roll, counted over the students in the class now. */
export function sessionCounts(session: Session | undefined, studentIds: readonly string[]): SessionCounts {
    const c: SessionCounts = { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 };
    for (const id of studentIds) {
        const m = session?.marks[id];
        if (m) c[m]++;
        else c.unmarked++;
    }
    return c;
}

export interface StudentRecord {
    /** Lessons with a mark for this student (cancelled days and days before they joined don't count). */
    held: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    /** Present or late. */
    came: number;
    /** Lessons missed without leave in a row, up to the latest; leave neither counts nor breaks the run. */
    missedInRow: number;
    /** The dates of that run, newest first. */
    missedDates: string[];
    /** The latest marks, newest first (up to `last`). */
    recent: { date: string; mark: Mark }[];
}

/** A student's attendance over the given sessions (any order). */
export function studentRecord(sessions: readonly Session[], userId: string, last = 12): StudentRecord {
    const marks = sessions
        .filter((s) => !s.cancelled && s.marks[userId])
        .map((s) => ({ date: s.date, mark: s.marks[userId] }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
    const r: StudentRecord = { held: marks.length, present: 0, late: 0, absent: 0, excused: 0, came: 0, missedInRow: 0, missedDates: [], recent: marks.slice(0, last) };
    for (const m of marks) r[m.mark]++;
    r.came = r.present + r.late;
    for (const m of marks) {
        if (m.mark === 'excused') continue;
        if (m.mark !== 'absent') break;
        r.missedInRow++;
        r.missedDates.push(m.date);
    }
    return r;
}

/** Lessons missed in a row before a student shows on Hôm nay. */
export const MISSED_IN_ROW = 2;

/** A week's lessons for the parent report (null: no lesson with a mark for this student that week). */
export function weekAttendance(sessions: readonly Session[], userId: string, monday: string): { held: number; came: number; late: number; excused: number } | null {
    const sunday = addDays(monday, 6);
    const r = studentRecord(
        sessions.filter((s) => s.date >= monday && s.date <= sunday),
        userId,
    );
    if (r.held === 0) return null;
    return { held: r.held, came: r.came, late: r.late, excused: r.excused };
}

/** The marks to save from the in-class roll: everyone present except those tapped absent. */
export function rollMarks(studentIds: readonly string[], absent: readonly string[], keep: Record<string, Mark> = {}): Record<string, Mark> {
    const out: Record<string, Mark> = {};
    for (const id of studentIds) {
        const was = keep[id];
        if (absent.includes(id)) out[id] = was === 'excused' ? 'excused' : 'absent';
        else out[id] = was === 'late' ? 'late' : 'present';
    }
    return out;
}
