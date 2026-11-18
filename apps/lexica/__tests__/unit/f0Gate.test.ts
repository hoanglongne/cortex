import { describe, expect, it } from 'vitest';
import { gains, gate, type WeekEvent } from '../../app/lib/learner/f0Gate';

const learner = (id: string, fsrs: number, sm2: number, n = 40): WeekEvent => ({ learner: id, n, ll_fsrs: fsrs * n, ll_sm2: sm2 * n });

describe('F0 gate', () => {
    it('adds weeks per learner and drops learners with too few answers', () => {
        const g = gains([learner('a', 0.4, 0.5, 20), learner('a', 0.4, 0.5, 20), learner('b', 0.4, 0.5, 10)]);
        expect(g).toHaveLength(1);
        expect(g[0]).toBeCloseTo(0.1);
    });

    it('passes when FSRS clearly wins for most of ≥ 50 learners', () => {
        const ev = Array.from({ length: 60 }, (_, i) => learner(`u${i}`, 0.4, i < 50 ? 0.5 : 0.38));
        const r = gate(ev);
        expect(r.learners).toBe(60);
        expect(r.winShare).toBeCloseTo(50 / 60);
        expect(r.ci[0]).toBeGreaterThan(0);
        expect(r.pass).toBe(true);
    });

    it('fails with too few learners or too few wins', () => {
        expect(gate(Array.from({ length: 10 }, (_, i) => learner(`u${i}`, 0.4, 0.5))).pass).toBe(false);
        expect(gate(Array.from({ length: 60 }, (_, i) => learner(`u${i}`, 0.4, i < 30 ? 0.5 : 0.35))).pass).toBe(false);
        expect(gate([]).pass).toBe(false);
    });
});
