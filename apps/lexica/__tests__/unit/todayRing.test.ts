import { describe, expect, it } from 'vitest';
import { arcMiddle, ringArcs } from '../../app/lib/journey/ring';

describe('Today ring (#146)', () => {
    it('draws four arcs clockwise from the top with gaps', () => {
        const arcs = ringArcs(4, 50, 60, 60, 10);
        expect(arcs).toHaveLength(4);
        // First arc starts just right of the top and ends just above the right side.
        expect(arcs[0]).toMatch(/^M64\.36,10\.19 A50,50 0 0 1 109\.81,55\.64$/);
    });

    it('puts each label at the middle of its arc', () => {
        const [x, y] = arcMiddle(0, 4, 50, 60, 60);
        expect(x).toBeCloseTo(60 + 50 * Math.SQRT1_2, 1);
        expect(y).toBeCloseTo(60 - 50 * Math.SQRT1_2, 1);
    });
});
