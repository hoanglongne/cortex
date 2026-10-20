import { describe, expect, it } from 'vitest';
import { inviteLink, lastDays, nudgeText, weekRanking, type DailyActivity } from '../../app/lib/buddy';

const act = (user_id: string, date: string, words: number, goal_met = false): DailyActivity => ({ user_id, date, words_swiped: words, words_learned_today: words, daily_goal: 10, goal_met, streak: 1 });

describe('buddy', () => {
    it('lists the last days oldest first, in local dates', () => {
        const days = lastDays(7, new Date('2026-10-20T01:00:00').getTime());
        expect(days).toHaveLength(7);
        expect(days[0]).toBe('2026-10-14');
        expect(days[6]).toBe('2026-10-20');
    });

    it('ranks the week by days studied, then words', () => {
        const week = {
            me: { '2026-10-19': act('me', '2026-10-19', 5), '2026-10-20': act('me', '2026-10-20', 3) },
            an: { '2026-10-20': act('an', '2026-10-20', 30) },
            binh: { '2026-10-18': act('binh', '2026-10-18', 4), '2026-10-19': act('binh', '2026-10-19', 0, true) },
        };
        const r = weekRanking([{ id: 'me', name: 'Tôi' }, { id: 'an', name: 'An' }, { id: 'binh', name: 'Bình' }], week);
        expect(r.map((x) => x.id)).toEqual(['me', 'binh', 'an']);
        expect(r[0]).toMatchObject({ days: 2, words: 8 });
        expect(r[1]).toMatchObject({ days: 2, words: 4 });
    });

    it('builds the invite link and the nudge', () => {
        expect(inviteLink('AB 12', 'https://lexica.app')).toBe('https://lexica.app/buddy?code=AB%2012');
        expect(nudgeText('An', 'https://lexica.app')).toContain('An ơi');
    });
});
