/**
 * What the timetable and the roll add to Hôm nay: today's lessons, past
 * lessons without a roll, and students who missed lessons in a row. Pure,
 * unit tested; the data comes from useAttendance.
 */
import { addDays, classDays, MISSED_IN_ROW, sessionCounts, studentRecord, unmarkedDays, type AttendanceByClass, type ClassDay, type SessionCounts } from '@cortex/classroom';
import type { Board } from '@cortex/classroom';

/** How far back Hôm nay looks: the roll, the runs of absences. */
export const LOOK_BACK_DAYS = 60;
/** A run of absences older than this is old news. */
const MISSED_FRESH_DAYS = 21;

export interface TodayLesson {
    classId: string;
    className: string;
    day: ClassDay;
    counts: SessionCounts;
    students: number;
}

export interface UnmarkedLesson {
    classId: string;
    className: string;
    date: string;
}

export interface MissedRun {
    classId: string;
    className: string;
    userId: string;
    name: string;
    /** Newest first. */
    dates: string[];
}

export function lessonNeeds(boards: readonly Board[], att: AttendanceByClass, today: string): { today: TodayLesson[]; unmarked: UnmarkedLesson[]; missed: MissedRun[] } {
    const out = { today: [] as TodayLesson[], unmarked: [] as UnmarkedLesson[], missed: [] as MissedRun[] };
    for (const b of boards) {
        const a = att[b.class.id];
        if (!a) continue;
        const ids = b.students.map((s) => s.user_id);
        const day = classDays(a, today, today, today)[0];
        if (day && day.state !== 'cancelled') {
            out.today.push({ classId: b.class.id, className: b.class.name, day, counts: sessionCounts(day.session, ids), students: ids.length });
        }
        for (const date of unmarkedDays(a, today)) out.unmarked.push({ classId: b.class.id, className: b.class.name, date });
        for (const s of b.students) {
            const r = studentRecord(a.sessions, s.user_id);
            if (r.missedInRow >= MISSED_IN_ROW && r.missedDates[0] >= addDays(today, -MISSED_FRESH_DAYS)) {
                out.missed.push({ classId: b.class.id, className: b.class.name, userId: s.user_id, name: s.name, dates: r.missedDates });
            }
        }
    }
    out.today.sort((x, y) => (x.day.slot?.start ?? '99').localeCompare(y.day.slot?.start ?? '99'));
    out.missed.sort((x, y) => y.dates.length - x.dates.length);
    return out;
}
