import { describe, expect, it } from 'vitest';
import { teamLine, teamWeek } from '../../app/lib/cheers';
import type { DailyActivity } from '../../app/lib/buddy';

const days = ['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'];
const act = (user_id: string, date: string, goal_met: boolean): DailyActivity => ({ user_id, date, words_swiped: 10, words_learned_today: 5, daily_goal: 10, goal_met, streak: 1 });
const week = (id: string, met: string[]) => Object.fromEntries(met.map((d) => [d, act(id, d, true)]));
const people = [
    { id: 'me', name: 'An' },
    { id: 'b', name: 'Bình' },
    { id: 'c', name: 'Chi' },
];

describe('the group week', () => {
    it('counts goal days, each member up to 5 of 7, against 5 per member', () => {
        const t = teamWeek(people, { me: week('me', days.slice(0, 6)), b: week('b', days.slice(2, 5)), c: {} }, days, 'me');
        expect(t.members.map((m) => m.days)).toEqual([6, 3, 0]);
        expect(t.goal).toBe(15);
        expect(t.done).toBe(5 + 3 + 0);
        expect(t.share).toBeCloseTo(8 / 15);
        expect(t.reached).toBe(false);
        expect(t.quiet.map((m) => m.name)).toEqual(['Chi']);
    });

    it('reaches the goal when everyone has their days, and counts my own today from this device', () => {
        const all = { me: week('me', days.slice(0, 4)), b: week('b', days.slice(0, 5)), c: week('c', days.slice(2, 7)) };
        const t = teamWeek(people, all, days, 'me');
        expect(t.reached).toBe(false); // I have 4 of 5
        const t2 = teamWeek(people, all, days, 'me', true);
        expect(t2.members[0]).toMatchObject({ days: 5, today: true });
        expect(t2.reached).toBe(true);
    });

    it('says what is left, who to cheer, and nothing to do alone', () => {
        const t = teamWeek(people, { me: week('me', days.slice(0, 2)), b: week('b', days.slice(0, 3)), c: {} }, days, 'me');
        expect(teamLine(t)).toBe('Còn 10 ngày nữa. Chi chưa có ngày nào: cổ vũ bạn ấy nhé.');
        expect(teamLine(teamWeek([people[0]], {}, days, 'me'))).toBe('Thêm một người bạn để lập nhóm.');
        expect(teamLine({ ...t, reached: true })).toContain('Giỏi lắm');
    });
});
