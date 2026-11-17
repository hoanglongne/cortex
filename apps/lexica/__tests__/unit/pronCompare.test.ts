import { describe, expect, it } from 'vitest';
import { pairFor, pairsForLearner, partsThatDiffer, SOUND_PAIRS } from '../../app/lib/pronunciation/compare';
import { mouthFor } from '../../app/lib/pronunciation/mouth';

describe('sound pairs (#153)', () => {
    it('every pair has pictures for both sounds and at least one visible difference', () => {
        for (const p of SOUND_PAIRS) {
            expect(mouthFor(p.a) && mouthFor(p.b), `${p.a}-${p.b}`).toBeTruthy();
            expect(partsThatDiffer(p.a, p.b).length, `${p.a}-${p.b}`).toBeGreaterThan(0);
        }
    });

    it('voicing-only pairs differ only at the throat', () => {
        expect(partsThatDiffer('Z', 'S')).toEqual(['voice']);
        expect(partsThatDiffer('V', 'F')).toEqual(['voice']);
    });

    it('place pairs show the contact and tongue', () => {
        expect(partsThatDiffer('TH', 'S')).toEqual(expect.arrayContaining(['tongue', 'contact']));
        expect(partsThatDiffer('NG', 'N')).toContain('contact');
        expect(partsThatDiffer('V', 'B')).toContain('lips');
        expect(partsThatDiffer('AE', 'EH')).toContain('jaw');
        expect(partsThatDiffer('T', 'XX')).toEqual([]);
    });

    it('finds a pair in either order, ignoring stress', () => {
        expect(pairFor('S', 'TH1')?.words).toEqual(['think', 'sink']);
        expect(pairFor('P', 'K')).toBeNull();
    });

    it('puts the learner weakest group first', () => {
        const list = pairsForLearner(['ae_e', 'final_ng']);
        expect(list[0].kind).toBe('ae_e');
        expect(list[1].kind).toBe('final_ng');
        expect(list).toHaveLength(SOUND_PAIRS.length);
        expect(pairsForLearner([])[0]).toBe(SOUND_PAIRS[0]);
    });
});
