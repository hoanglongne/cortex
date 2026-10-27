import { describe, expect, it } from 'vitest';
import { arenaReview } from '../../app/lib/arenaReview';

const room = (room_id: string, answers: [string, boolean, number][], seconds = 20) => ({ room_id, seconds, finished_at: '2026-10-27T10:00:00Z', answers: answers.map(([card_id, correct, ms]) => ({ card_id, correct, ms })) });
const known = (id: string) => id !== 'new1' && id !== 'new2';

describe('arena review', () => {
    it('sends wrong words back to review, counts quick right answers, queues unknown wrong words', () => {
        const r = arenaReview([room('r1', [['a', false, 3000], ['b', true, 4000], ['c', true, 15000], ['new1', false, 2000], ['new2', true, 1000]])], [], known);
        expect(r).toEqual({ rooms: ['r1'], again: ['a'], recalled: ['b'], queue: ['new1'] });
    });

    it('applies each room once, and a wrong answer anywhere wins', () => {
        const rooms = [room('r1', [['a', true, 1000]]), room('r2', [['a', false, 9000], ['b', true, 1000]])];
        expect(arenaReview(rooms, [], known)).toEqual({ rooms: ['r1', 'r2'], again: ['a'], recalled: ['b'], queue: [] });
        expect(arenaReview(rooms, ['r2'], known)).toEqual({ rooms: ['r1'], again: [], recalled: ['a'], queue: [] });
        expect(arenaReview(rooms, ['r1', 'r2'], known)).toEqual({ rooms: [], again: [], recalled: [], queue: [] });
    });

    it('uses each room’s own time for "quick"', () => {
        // 60% of 10 s is 6 s
        expect(arenaReview([room('r', [['a', true, 6000], ['b', true, 6001]], 10)], [], known).recalled).toEqual(['a']);
    });
});

describe('the store applies a quiz once', () => {
    it('puts a wrong known word back into review and remembers the room', async () => {
        const { useLexicaStore } = await import('../../app/store/lexicaStore');
        const now = Date.now();
        const far = now + 20 * 86_400_000;
        useLexicaStore.setState({
            cardProgress: { a: { cardId: 'a', state: 'review', lastReviewedAt: now - 86_400_000, nextReviewAt: far, ease: 2.5, intervalDays: 20, streak: 3, reviewCount: 5, wrongCount: 0 } },
            arenaApplied: [],
            reviewLog: {},
        } as never);
        const results = [room('r1', [['a', false, 2000]])];
        expect(useLexicaStore.getState().applyArena(results)).toEqual({ again: 1, recalled: 0, queued: 0 });
        const p = useLexicaStore.getState().cardProgress.a;
        expect(p.nextReviewAt).toBeLessThan(far);
        expect(p.wrongCount).toBe(1);
        expect(useLexicaStore.getState().arenaApplied).toEqual(['r1']);
        expect(useLexicaStore.getState().applyArena(results)).toEqual({ again: 0, recalled: 0, queued: 0 });
    });
});
