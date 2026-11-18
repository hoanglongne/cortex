import { describe, expect, it } from 'vitest';
import { mouthFor } from '../../app/lib/pronunciation/mouth';
import { blend, frameAt, HOLD_T, keyframes, poseAt, REST } from '../../app/lib/pronunciation/motion';

describe('mouth motion (#156)', () => {
    it('starts and ends relaxed, and the hold matches the still picture', () => {
        const keys = keyframes('T')!;
        expect(poseAt(keys, 0).pose.jaw).toBe(REST.jaw);
        expect(poseAt(keys, 1).pose.jaw).toBe(REST.jaw);
        expect(frameAt('T', HOLD_T)!.drawing.tongue).toBe(mouthFor('T')!.tongue);
    });

    it('stops have a release phase with air and no contact ring', () => {
        const phases = [0, 0.2, 0.4, 0.62, 0.66, 0.9].map((t) => frameAt('T', t)!.phase);
        expect(phases).toContain('release');
        const rel = [0.6, 0.62, 0.64, 0.66, 0.7].map((t) => frameAt('T', t)!).find((f) => f.phase === 'release')!;
        expect(rel.drawing.air).not.toBeNull();
        expect(rel.drawing.contact).toBeNull();
        expect(frameAt('T', HOLD_T)!.drawing.air).toBeNull();
    });

    it('flowing sounds have no release and show air while held', () => {
        expect([0, 0.2, 0.5, 0.8, 1].map((t) => frameAt('S', t)!.phase)).not.toContain('release');
        expect(frameAt('S', HOLD_T)!.drawing.air).not.toBeNull();
        expect(frameAt('S', 0)!.drawing.contact).toBeNull();
    });

    it('blends tongue points and jaw linearly', () => {
        const mid = blend(REST, { ...REST, jaw: 0.9 }, 0.5);
        expect(mid.jaw).toBeCloseTo(0.6);
        expect(keyframes('XX')).toBeNull();
    });
});
