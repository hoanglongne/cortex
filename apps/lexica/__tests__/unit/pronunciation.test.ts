import { describe, expect, it } from 'vitest';
import { ipaSyllables, spellingSyllables, stressedSyllables } from '@/app/lib/pronunciation/syllables';
import { errorKinds, MINIMAL_PAIRS, nearSound, pairFor, tipFor } from '@/app/lib/pronunciation/pairs';
import { diffHeard, scoreAttempt } from '@/app/lib/pronunciation/score';
import { applySpeakResult, hardToSay, pickDrillWords } from '@/app/lib/pronunciation/drill';
import { contourMatch, detectPitch, modelContour, normalizeTrack } from '@/app/lib/pronunciation/pitch';
import type { UserCardProgress } from '@/app/lib/eloAlgorithm';

describe('syllables from IPA', () => {
    it('counts syllables and finds the stressed one', () => {
        expect(ipaSyllables('əˈbʌndənt')).toEqual({ count: 3, stress: 1 });
        expect(ipaSyllables('ˈkɒɡnətɪv')).toEqual({ count: 3, stress: 0 });
        expect(ipaSyllables('ˈfiːzəbl')).toEqual({ count: 3, stress: 0 }); // syllabic final l
        expect(ipaSyllables('ˈsʌtl')).toEqual({ count: 2, stress: 0 });
        expect(ipaSyllables('mʌnˈdeɪn')).toEqual({ count: 2, stress: 1 }); // diphthong is one
        expect(ipaSyllables('blʌnt')).toEqual({ count: 1, stress: 0 });
    });

    it('cuts the spelling into syllables', () => {
        expect(spellingSyllables('abundant')).toEqual(['a', 'bun', 'dant']);
        expect(spellingSyllables('cognitive')).toEqual(['cog', 'ni', 'tive']);
        expect(spellingSyllables('subtle')).toEqual(['sub', 'tle']);
        expect(spellingSyllables('contemplate')).toEqual(['con', 'tem', 'plate']);
    });

    it('marks the stressed syllable, or falls back to the IPA', () => {
        expect(stressedSyllables('ABUNDANT', 'əˈbʌndənt').text).toBe('a·BUN·dant');
        expect(stressedSyllables('DILEMMA', 'dɪˈlemə').text).toBe('di·LEM·ma');
        expect(stressedSyllables('FEASIBLE', 'ˈfiːzəbl').text).toBe('FEA·si·ble');
        const odd = stressedSyllables('AMBIGUOUS', 'æmˈbɪɡjuəs');
        expect(odd).toMatchObject({ fromIpa: true, text: '/æmˈbɪɡjuəs/' });
    });
});

describe('near-sound pairs', () => {
    it('finds the errors a word is exposed to', () => {
        expect(errorKinds('abundant', 'əˈbʌndənt')[0]).toBe('final_consonant');
        expect(errorKinds('thorough', 'ˈθʌrə')).toContain('th');
        expect(errorKinds('street', 'striːt')).toEqual(expect.arrayContaining(['final_consonant', 'cluster', 'long_short']));
        expect(errorKinds('keen', 'kiːn')).toContain('long_short');
    });

    it('makes a near-sound version of the word by the main error', () => {
        expect(nearSound('abundant', 'əˈbʌndənt')).toEqual({ kind: 'final_consonant', distractor: 'abundan' });
        expect(nearSound('thorough', 'ˈθʌrə')).toEqual({ kind: 'th', distractor: 'torough' });
        expect(nearSound('keen', 'kiːn')).toEqual({ kind: 'long_short', distractor: 'kin' });
        expect(nearSound('cognitive', 'ˈkɒɡnətɪv')).toEqual({ kind: 'final_consonant', distractor: 'cogniti' });
    });

    it('picks a real minimal pair of the same kind', () => {
        const { kind, pair } = pairFor('abundant', 'əˈbʌndənt', 0);
        expect(kind).toBe('final_consonant');
        expect(MINIMAL_PAIRS.final_consonant).toContainEqual(pair);
        expect(pairFor('xyz', '', 3).pair).toHaveLength(2);
    });
});

describe('rule-based tips', () => {
    it('matches the main error of the word', () => {
        expect(tipFor('abundant', 'əˈbʌndənt')).toBe('Đừng nuốt âm /t/ cuối: đọc rõ rồi mới dừng.');
        expect(tipFor('thorough', 'ˈθʌrə')).toMatch(/θ/);
        expect(tipFor('keen', 'kiːn')).toMatch(/iː/);
        expect(tipFor('area', 'ˈeəriə', 'A')).toBe('Nhấn mạnh âm tiết A.');
    });
});

describe('three-level score', () => {
    it('is clear only for a confident exact match', () => {
        expect(scoreAttempt('cognitive', [{ transcript: 'Cognitive', confidence: 0.9 }])).toEqual({ level: 'clear', heard: 'cognitive' });
        expect(scoreAttempt('cognitive', [{ transcript: 'cognitive', confidence: 0.3 }]).level).toBe('close');
    });

    it('is close when an alternative matches or the miss is small', () => {
        expect(scoreAttempt('cognitive', [{ transcript: 'cognative', confidence: 0.8 }])).toEqual({ level: 'close', heard: 'cognative' });
        expect(scoreAttempt('cognitive', [{ transcript: 'cog native', confidence: 0.8 }, { transcript: 'cognitive', confidence: 0.1 }]).level).toBe('close');
    });

    it('is unclear otherwise, or when nothing was heard', () => {
        expect(scoreAttempt('cognitive', [{ transcript: 'carnival', confidence: 0.9 }]).level).toBe('unclear');
        expect(scoreAttempt('cognitive', []).level).toBe('unclear');
    });

    it('finds the target inside a longer phrase', () => {
        expect(scoreAttempt('abundant supply', [{ transcript: 'an abundant supply of water', confidence: 0.9 }]).level).toBe('clear');
    });

    it('marks what was heard differently', () => {
        expect(diffHeard('cognative', 'cognitive')).toEqual([
            { text: 'cogn', ok: true },
            { text: 'a', ok: false },
            { text: 'tive', ok: true },
        ]);
    });
});


const prog = (id: string, lastReviewedAt: number, nextReviewAt: number): UserCardProgress => ({ cardId: id, state: 'sprout', lastReviewedAt, nextReviewAt, reviewCount: 1, wrongCount: 0 });

describe('the drill words', () => {
    it('takes hard-to-say words, then due ones, then the most recent, five at most', () => {
        const now = 1000;
        const progress = {
            a: prog('a', 10, 5000),
            b: prog('b', 20, 900), // due
            c: prog('c', 30, 800), // due, longer overdue
            d: prog('d', 900, 5000), // recent
            e: prog('e', 800, 5000),
            f: prog('f', 700, 5000),
            g: prog('g', 600, 5000),
        };
        expect(pickDrillWords(progress, { a: 2, zzz: 5 }, now)).toEqual(['a', 'c', 'b', 'd', 'e']);
    });

    it('keeps a word on the hard-to-say list until it is said clearly', () => {
        let m = applySpeakResult({}, 'a', 'unclear');
        m = applySpeakResult(m, 'a', 'unclear');
        m = applySpeakResult(m, 'b', 'close');
        expect(hardToSay(m)).toEqual([{ cardId: 'a', misses: 2 }]);
        m = applySpeakResult(m, 'a', 'clear');
        m = applySpeakResult(m, 'a', 'clear');
        expect(hardToSay(m)).toEqual([]);
    });
});

describe('pitch', () => {
    const sine = (hz: number, rate = 16000, n = 2048) => Float32Array.from({ length: n }, (_, i) => 0.5 * Math.sin((2 * Math.PI * hz * i) / rate));

    it('detects the pitch of a voiced frame and ignores silence', () => {
        expect(detectPitch(sine(200), 16000)).toBeCloseTo(200, -1);
        expect(detectPitch(new Float32Array(2048), 16000)).toBeNull();
    });

    it('compares a voice with the model line by shape', () => {
        const model = modelContour([false, true, false]);
        expect(model).toHaveLength(40);
        expect(Math.max(...model.slice(10, 25))).toBeGreaterThan(model[39]); // peak on the stress, falls at the end
        const voice = normalizeTrack(model.map((st) => 150 * 2 ** (st / 12)));
        expect(contourMatch(voice, model)).toBeGreaterThan(0.9);
        expect(normalizeTrack([null, null, 120])).toEqual([]);
    });
});
