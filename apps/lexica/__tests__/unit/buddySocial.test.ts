import { describe, expect, it } from 'vitest';
import { cleanNote, dateIcs, dateSlots, dateStatus, noteProblem, questLine, questWeek, weekDates, weekStart, HP_PER_MEMBER, type Shield } from '../../app/lib/buddySocial';
import type { DailyActivity } from '../../app/lib/buddy';

const act = (user: string, date: string, learned: number, met: boolean): DailyActivity => ({ user_id: user, date, words_swiped: learned, words_learned_today: learned, daily_goal: 10, goal_met: met, streak: 1 });

describe('buddy social', () => {
    it('weeks start on Monday', () => {
        expect(weekStart('2026-10-31')).toBe('2026-10-26'); // a Saturday
        expect(weekStart('2026-10-26')).toBe('2026-10-26');
        expect(weekStart('2026-11-01')).toBe('2026-10-26'); // Sunday
        expect(weekDates('2026-10-26')).toEqual(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
    });

    it('notes: one line of at most 60 characters, no links', () => {
        expect(cleanNote('  chúc   bạn \n học tốt ')).toBe('chúc bạn học tốt');
        expect(cleanNote('x'.repeat(100))).toHaveLength(60);
        expect(noteProblem('xem http://a.b')).not.toBeNull();
        expect(noteProblem('mail me a@b')).not.toBeNull();
        expect(noteProblem('từ này hay lắm')).toBeNull();
    });

    const dates = weekDates('2026-10-26');
    const people = [{ id: 'a', name: 'An' }, { id: 'b', name: 'Bình' }];

    it('quest: damage from words (capped) and goal days, hp per member', () => {
        const week = { a: { '2026-10-26': act('a', '2026-10-26', 25, true) }, b: { '2026-10-26': act('b', '2026-10-26', 3, false) } };
        const q = questWeek({ people, week, dates });
        expect(q.hp).toBe(2 * HP_PER_MEMBER);
        expect(q.members.find((m) => m.id === 'a')!.damage).toBe(10 + 15);
        expect(q.members.find((m) => m.id === 'b')!.damage).toBe(3);
        expect(q.damage).toBe(28);
        expect(q.state).toBe('fighting');
        expect(q.quiet.map((m) => m.id)).toEqual(['b']);
    });

    it('quest: a shield turns a missed day into a goal day, once per day it covers', () => {
        const shields: Shield[] = [{ giver: 'a', giver_name: 'An', receiver: 'b', day: '2026-10-27' }, { giver: 'a', giver_name: 'An', receiver: 'b', day: '2026-11-09' }];
        const q = questWeek({ people, week: {}, dates, shields });
        expect(q.members.find((m) => m.id === 'b')!.damage).toBe(15); // the day outside the week does not count
    });

    it('quest: won when the life runs out; lost only once the week ended; regrows after a loss', () => {
        const full = Object.fromEntries(people.map((p) => [p.id, Object.fromEntries(dates.map((d) => [d, act(p.id, d, 10, true)]))]));
        expect(questWeek({ people, week: full, dates }).state).toBe('won');
        expect(questWeek({ people, week: {}, dates }).state).toBe('fighting');
        expect(questWeek({ people, week: {}, dates, ended: true }).state).toBe('lost');
        expect(questWeek({ people, week: {}, dates, regrown: true }).hp).toBeGreaterThan(2 * HP_PER_MEMBER);
        expect(questWeek({ people: [people[0]], week: full, dates }).state).toBe('won'); // alone works
        expect(questWeek({ people, week: {}, dates, me: 'a', forceToday: '2026-10-26' }).members[0].damage).toBe(15);
    });

    it('quest line mentions who to cheer', () => {
        expect(questLine(questWeek({ people, week: {}, dates, me: 'a' }))).toContain('Bình');
        expect(questLine(questWeek({ people: [people[0]], week: {}, dates }))).toContain('Một mình');
    });

    it('study dates: soon, open from 15 minutes before to 90 after, together, missed', () => {
        const at = Date.parse('2026-10-31T13:30:00Z');
        const min = 60_000;
        const d = { at: new Date(at).toISOString(), my_in: null, their_in: null };
        expect(dateStatus(d, at - 20 * min)).toBe('soon');
        expect(dateStatus(d, at - 10 * min)).toBe('open');
        expect(dateStatus(d, at + 80 * min)).toBe('open');
        expect(dateStatus(d, at + 100 * min)).toBe('missed');
        expect(dateStatus({ ...d, my_in: 'x', their_in: 'y' }, at + 200 * min)).toBe('together');
        expect(dateStatus({ ...d, my_in: 'x' }, at)).toBe('open');
    });

    it('calendar file and slots', () => {
        const ics = dateIcs({ id: 'u', at: '2026-10-31T13:30:00.000Z' }, 'Bình');
        expect(ics).toContain('DTSTART:20261031T133000Z');
        expect(ics).toContain('SUMMARY:Học Lexica cùng Bình');
        const slots = dateSlots(new Date(2026, 9, 31, 21, 0));
        expect(slots[0].label).toBe('Ngày mai 12:30');
        expect(slots.every((s) => s.at.getTime() > new Date(2026, 9, 31, 21, 0).getTime())).toBe(true);
    });
});
