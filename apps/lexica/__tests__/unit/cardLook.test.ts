import { describe, expect, it } from 'vitest';
import { FLAT, TOPIC_COLOR, tiltAt } from '../../app/lib/engagement/cardLook';
import { TOPICS } from '../../app/lib/engagement/collection';

describe('cardLook (#146)', () => {
    it('has a colour for every topic', () => {
        expect(TOPICS.filter((t) => !TOPIC_COLOR[t.id])).toEqual([]);
    });

    it('tilts toward the finger and moves the light with it', () => {
        expect(tiltAt(50, 75, 100, 150)).toEqual({ rx: 0, ry: 0, gx: 50, gy: 50 });
        expect(tiltAt(100, 0, 100, 150)).toEqual({ rx: 12, ry: 12, gx: 100, gy: 0 });
        expect(tiltAt(-20, 999, 100, 150, 10)).toEqual({ rx: -10, ry: -10, gx: 0, gy: 100 });
        expect(tiltAt(1, 1, 0, 0)).toBe(FLAT);
    });
});
