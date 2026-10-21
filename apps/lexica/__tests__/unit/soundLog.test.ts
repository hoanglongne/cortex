import { describe, expect, it } from 'vitest';
import { classSounds, lexicaModule, oftenMissed, parseSounds, SOUND_KINDS } from '@cortex/classroom-lexica';
import { addAttempt, exposures, improved, practiceSuggestion, reportSounds, shiftDay, totals, weakSounds, type SoundLog } from '../../app/lib/pronunciation/soundLog';
import { MINIMAL_PAIRS } from '../../app/lib/pronunciation/pairs';
import { nextTip, type GuideFacts } from '../../app/lib/guide';

const p = (s: string) => s.split(' ');
const DAY = '2026-10-21';

/** `n` attempts on `day`, `m` of them missed. */
function many(log: SoundLog, day: string, kind: (typeof SOUND_KINDS)[number], n: number, m: number): SoundLog {
    for (let i = 0; i < n; i++) log = addAttempt(log, day, [kind], i < m ? [kind] : []);
    return log;
}

describe('sound groups a word exposes', () => {
    it('reads them from the phones', () => {
        expect([...exposures(p('TH IH1 NG K'))].sort()).toEqual(['final_consonant', 'long_short', 'th'].sort());
        expect(exposures(p('W AO1 K T')).has('ending')).toBe(true);
        expect(exposures(p('L AY1 T')).has('ending')).toBe(false);
        expect(exposures(p('S T R IY1 T')).has('cluster')).toBe(true);
        expect(exposures(p('B EH1 D'))).toEqual(new Set(['final_consonant', 'final_voicing', 'ae_e']));
        expect(exposures(p('F IY1 L')).has('final_l')).toBe(true);
        expect(exposures(p('Z UW1')).has('initial_z')).toBe(true);
        expect(exposures(p('TH IH1 NG')).has('final_ng')).toBe(true);
    });

    it('covers every group of the library', () => {
        expect(Object.keys(MINIMAL_PAIRS).sort()).toEqual([...SOUND_KINDS].sort());
    });
});

describe('the sound log', () => {
    it('counts tries and misses per day and keeps 60 days', () => {
        let log = addAttempt({}, DAY, ['th', 'long_short'], ['th']);
        log = addAttempt(log, DAY, ['th'], []);
        expect(log.th).toEqual({ [DAY]: [2, 1] });
        expect(log.long_short).toEqual({ [DAY]: [1, 0] });
        const later = addAttempt(log, shiftDay(DAY, 60), ['cluster'], []);
        expect(later.th).toBeUndefined();
        expect(later.cluster).toBeDefined();
    });

    it('counts a missed group as tried too', () => {
        expect(addAttempt({}, DAY, [], ['ae_e']).ae_e).toEqual({ [DAY]: [1, 1] });
    });

    it('sums days in a window', () => {
        let log = many({}, DAY, 'th', 4, 2);
        log = many(log, shiftDay(DAY, -10), 'th', 6, 6);
        log = many(log, shiftDay(DAY, -20), 'th', 5, 5);
        expect(totals(log, 'th', DAY, 14)).toEqual([10, 8]);
        expect(totals(log, 'th', DAY, 7)).toEqual([4, 2]);
        expect(reportSounds(log, DAY)).toEqual({ th: [10, 8] });
    });

    it('lists the groups missed most, with the trend', () => {
        let log = many({}, DAY, 'th', 4, 1);
        log = many(log, shiftDay(DAY, -8), 'th', 4, 4);
        log = many(log, DAY, 'cluster', 3, 3);
        log = many(log, DAY, 'ae_e', 6, 0);
        const weak = weakSounds(log, DAY);
        expect(weak.map((w) => w.kind)).toEqual(['cluster', 'th']);
        expect(weak[1]).toEqual({ kind: 'th', tries: 8, misses: 5, trend: 'better' });
        expect(weak[0].trend).toBeNull();
        expect(improved(log, DAY)).toEqual(['th']);
    });

    it('suggests practice for 5+ tries and over 40% missed', () => {
        expect(practiceSuggestion(many({}, DAY, 'th', 4, 4), DAY)).toBeNull();
        expect(practiceSuggestion(many({}, DAY, 'th', 5, 2), DAY)).toBeNull();
        expect(practiceSuggestion(many({}, DAY, 'th', 5, 3), DAY)).toBe('th');
    });

    it('becomes a Home tip', () => {
        const facts = { words: 30, recalls: 5, remembered: 2, met: 1, spoken: 3, sentences: 1, sightings: 1, pledged: true, lived: 0, daysStudied: 1, due: 0, hard: 0, hunt: null, weekday: 2, daysSinceStart: 3 } satisfies GuideFacts;
        expect(nextTip({ ...facts, sound: { kind: 'th', label: 'Âm /θ ð/ (th)' } }, {}, DAY)).toMatchObject({ id: 'sound-th', href: '/speak?sound=th' });
        expect(nextTip(facts, {}, DAY)).toBeNull();
    });
});

describe('sounds in the class report', () => {
    it('keeps known groups, whole numbers, misses not above tries', () => {
        expect(parseSounds({ th: [12, 5], ae_e: [3, 9], bogus: [1, 1], final_l: [20000, -4], cluster: 'x', ending: [1.6, 0.4] })).toEqual({ th: [12, 5], ae_e: [3, 3], final_l: [10000, 0], ending: [2, 0] });
        expect(lexicaModule.parseMetrics({}).sounds).toEqual({});
    });

    it('ranks the class’s groups by students who often miss them', () => {
        const student = (sounds: unknown) => ({ apps: { lexica: { metrics: { sounds } } } }) as never;
        const board = { students: [student({ th: [10, 6], cluster: [5, 3] }), student({ th: [6, 4], ae_e: [4, 4] }), student({ cluster: [9, 1] })] };
        expect(classSounds(board)).toEqual([
            { kind: 'th', students: 2, misses: 10 },
            { kind: 'cluster', students: 1, misses: 4 },
        ]);
        expect(oftenMissed([4, 4])).toBe(false);
    });
});
