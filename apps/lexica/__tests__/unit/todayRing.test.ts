import { describe, expect, it } from 'vitest';
import { ringArcs } from '../../app/lib/journey/ring';

describe('Today ring (#146)', () => {
    it('draws four arcs clockwise from the top with gaps', () => {
        const arcs = ringArcs(4, 50, 60, 60, 10);
        expect(arcs).toHaveLength(4);
        // First arc starts just right of the top and ends just above the right side.
        expect(arcs[0]).toMatch(/^M64\.36,10\.19 A50,50 0 0 1 109\.81,55\.64$/);
    });
});
