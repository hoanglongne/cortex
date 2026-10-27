import { describe, expect, it } from 'vitest';
import {
    addDays,
    classDays,
    cleanSchedule,
    dayLabel,
    endTime,
    isoDow,
    mondayOf,
    nextLesson,
    rollMarks,
    scheduleLine,
    sessionCounts,
    studentRecord,
    unmarkedDays,
    weekAttendance,
    type Board,
    type ClassAttendance,
    type Session,
} from '@cortex/classroom';
import { lessonNeeds } from '../app/lib/lessons';
import { absenceParentMessage } from '../app/lib/messages';

// 2026-10-27 is a Tuesday. Lessons Tuesday and Thursday, 18:00 for 90 minutes.
const TODAY = '2026-10-27';
const schedule = [
    { dow: 2, start: '18:00', minutes: 90 },
    { dow: 4, start: '18:00', minutes: 90 },
];
const s = (date: string, marks: Session['marks'], extra: Partial<Session> = {}): Session => ({ date, topic: null, cancelled: false, marks, ...extra });

describe('dates and timetable', () => {
    it('knows weekdays and weeks', () => {
        expect(isoDow(TODAY)).toBe(2);
        expect(isoDow('2026-10-26')).toBe(1);
        expect(isoDow('2026-11-01')).toBe(7);
        expect(mondayOf('2026-11-01')).toBe('2026-10-26');
        expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
        expect(dayLabel('2026-10-23')).toBe('Thứ Sáu 23/10');
        expect(dayLabel('2026-10-23', true)).toBe('T6 23/10');
    });

    it('writes the timetable in one line', () => {
        expect(endTime('18:00', 90)).toBe('19:30');
        expect(endTime('23:30', 60)).toBe('00:30');
        expect(scheduleLine(schedule)).toBe('T3, T5 · 18:00–19:30');
        expect(scheduleLine([{ dow: 7, start: '08:30', minutes: 120 }, ...schedule])).toBe('T3 18:00–19:30, T5 18:00–19:30, CN 08:30–10:30');
        expect(scheduleLine([])).toBe('');
    });

    it('cleans a timetable the way the SQL does', () => {
        expect(
            cleanSchedule([
                { dow: 4, start: '18:00', minutes: 90 },
                { dow: 2, start: '19:00' },
                { dow: 2, start: '18:00', minutes: 5 },
                { dow: 8, start: '18:00' },
                { dow: 3, start: '7:00' },
                { dow: 6, start: '08:30', minutes: 9999 },
            ]),
        ).toEqual([
            { dow: 2, start: '18:00', minutes: 15 },
            { dow: 4, start: '18:00', minutes: 90 },
            { dow: 6, start: '08:30', minutes: 300 },
        ]);
    });
});

describe('class days', () => {
    const att: ClassAttendance = {
        schedule,
        sessions: [
            s('2026-10-30', {}, { cancelled: true, topic: 'Nghỉ lễ' }),
            s('2026-10-25', { a: 'present' }), // an extra Sunday lesson
            s('2026-10-22', {}, { topic: 'Unit 3' }), // topic written, roll not taken
            s('2026-10-20', { a: 'present', b: 'absent' }),
        ],
    };

    it('lists timetable days and extra lessons, newest first, with their state', () => {
        expect(classDays(att, '2026-10-19', '2026-10-31', TODAY).map((d) => `${d.date} ${d.state}`)).toEqual([
            '2026-10-30 cancelled',
            '2026-10-29 upcoming',
            '2026-10-27 open',
            '2026-10-25 marked',
            '2026-10-22 open',
            '2026-10-20 marked',
        ]);
    });

    it('finds the next lesson, today included, skipping cancelled days', () => {
        expect(nextLesson(att, TODAY)?.date).toBe(TODAY);
        expect(nextLesson(att, '2026-10-28')?.date).toBe('2026-10-29');
        expect(nextLesson({ schedule: [{ dow: 5, start: '18:00', minutes: 90 }], sessions: att.sessions }, '2026-10-28')?.date).toBe('2026-11-06');
        expect(nextLesson({ schedule: [], sessions: [] }, TODAY)).toBeNull();
    });

    it('flags past lessons without a roll, only once the teacher has started taking it', () => {
        expect(unmarkedDays(att, TODAY)).toEqual(['2026-10-22']);
        // Today is not "missed" yet; a teacher who never took the roll is not nagged
        expect(unmarkedDays({ schedule, sessions: [] }, TODAY)).toEqual([]);
        // Nothing before the first roll
        expect(unmarkedDays({ schedule, sessions: [s('2026-10-22', { a: 'present' })] }, TODAY)).toEqual([]);
        // Not further back than two weeks
        expect(unmarkedDays({ schedule, sessions: [s('2026-09-01', { a: 'present' })] }, TODAY)).toEqual(['2026-10-22', '2026-10-20', '2026-10-15', '2026-10-13']);
    });

    it('counts a roll over the students in the class now', () => {
        expect(sessionCounts(att.sessions[3], ['a', 'b', 'c'])).toEqual({ present: 1, late: 0, absent: 1, excused: 0, unmarked: 1 });
        expect(sessionCounts(undefined, ['a'])).toMatchObject({ unmarked: 1 });
    });
});

describe("a student's record", () => {
    const sessions = [
        s('2026-10-06', { a: 'present' }),
        s('2026-10-08', { a: 'absent' }),
        s('2026-10-13', { a: 'late' }),
        s('2026-10-15', { a: 'absent' }),
        s('2026-10-20', { a: 'excused' }),
        s('2026-10-22', { a: 'absent' }),
        s('2026-10-23', { a: 'present' }, { cancelled: true }),
        s('2026-10-24', { b: 'present' }), // before a joined, or not marked: not counted
    ];

    it('counts lessons with a mark, and the run of absences without leave up to now', () => {
        const r = studentRecord(sessions, 'a');
        expect(r).toMatchObject({ held: 6, present: 1, late: 1, absent: 3, excused: 1, came: 2, missedInRow: 2 });
        // Leave neither counts nor breaks the run
        expect(r.missedDates).toEqual(['2026-10-22', '2026-10-15']);
        expect(r.recent.map((m) => m.mark)).toEqual(['absent', 'excused', 'absent', 'late', 'absent', 'present']);
        expect(studentRecord(sessions, 'z')).toMatchObject({ held: 0, missedInRow: 0 });
    });

    it("gives a week's lessons for the parents' report", () => {
        expect(weekAttendance(sessions, 'a', '2026-10-19')).toEqual({ held: 2, came: 0, late: 0, excused: 1 });
        expect(weekAttendance(sessions, 'a', '2026-10-12')).toEqual({ held: 2, came: 1, late: 1, excused: 0 });
        expect(weekAttendance(sessions, 'a', '2026-10-26')).toBeNull();
    });

    it('turns the in-class roll into marks, keeping late and leave already set', () => {
        expect(rollMarks(['a', 'b', 'c', 'd'], ['b', 'd'], { a: 'late', d: 'excused' })).toEqual({ a: 'late', b: 'absent', c: 'present', d: 'excused' });
    });
});

describe('Hôm nay', () => {
    const board = (id: string, name: string, students: string[]) =>
        ({ class: { id, name }, students: students.map((u) => ({ user_id: u, name: u.toUpperCase() })) }) as unknown as Board;
    const boards = [board('c1', 'Lớp A', ['a', 'b']), board('c2', 'Lớp B', ['x']), board('c3', 'Lớp C', ['y'])];
    const att = {
        c1: { schedule, sessions: [s('2026-10-22', { a: 'absent', b: 'present' }), s('2026-10-20', { a: 'absent', b: 'absent' })] },
        c2: { schedule: [{ dow: 2, start: '08:00', minutes: 60 }], sessions: [s(TODAY, { x: 'present' })] },
        c3: { schedule, sessions: [s(TODAY, {}, { cancelled: true }), s('2026-09-01', { y: 'absent' }), s('2026-08-30', { y: 'absent' })] },
    };

    it("lists today's lessons by time, rolls not taken and runs of absences", () => {
        const n = lessonNeeds(boards, att, TODAY);
        expect(n.today.map((t) => `${t.className} ${t.day.state} ${t.counts.present}/${t.students}`)).toEqual(['Lớp B marked 1/1', 'Lớp A open 0/2']);
        // Lớp C took the roll before, then stopped
        expect(n.unmarked.map((u) => `${u.classId} ${u.date}`)).toEqual(['c3 2026-10-22', 'c3 2026-10-20', 'c3 2026-10-15', 'c3 2026-10-13']);
        // Lớp C: a run from September is old news
        expect(n.missed).toEqual([{ classId: 'c1', className: 'Lớp A', userId: 'a', name: 'A', dates: ['2026-10-22', '2026-10-20'] }]);
    });

    it('writes the message to the parents', () => {
        expect(absenceParentMessage('An', 'Lớp A', ['T5 22/10', 'T3 20/10'])).toContain('vắng 2 buổi gần đây của lớp Lớp A (T5 22/10, T3 20/10)');
    });
});
