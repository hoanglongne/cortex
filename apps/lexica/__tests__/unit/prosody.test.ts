import { describe, expect, it } from 'vitest';
import { overlay, prosodyNotes } from '../../app/lib/pronunciation/level3';
import { analyze, contour, dtw, ending, finalConsonant, finalKind, intonationNotes, isYesNoQuestion, nuclei, pace, paceNote, range, stressCheck } from '../../app/lib/pronunciation/prosody';

const R = 16000;
let seed = 1;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

/** A voiced sound whose pitch glides from `from` to `to` Hz, with two harmonics. */
function tone(sec: number, from: number, to = from, amp = 0.3): Float32Array {
    const n = Math.round(sec * R);
    const out = new Float32Array(n);
    let phase = 0;
    for (let i = 0; i < n; i++) {
        phase += (2 * Math.PI * (from + ((to - from) * i) / n)) / R;
        const env = Math.min(1, i / 160, (n - i) / 160);
        out[i] = amp * env * (Math.sin(phase) + 0.5 * Math.sin(2 * phase) + 0.25 * Math.sin(3 * phase));
    }
    return out;
}
/** Room noise. */
const quiet = (sec: number) => Float32Array.from({ length: Math.round(sec * R) }, () => rand() * 0.0005);
/** White noise: a fricative, or a stop's burst when short. */
const hiss = (sec: number, amp: number) => Float32Array.from({ length: Math.round(sec * R) }, () => rand() * amp);
const join = (...parts: Float32Array[]) => {
    const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
    let at = 0;
    for (const p of parts) {
        out.set(p, at);
        at += p.length;
    }
    return out;
};
const p = (s: string) => s.split(' ');

describe('final consonant (6.1)', () => {
    it('hears a stop burst after the vowel, and its absence', () => {
        expect(finalConsonant(analyze(join(quiet(0.3), tone(0.3, 140), quiet(0.08), hiss(0.02, 0.2), quiet(0.4))), 'stop').verdict).toBe('clear');
        expect(finalConsonant(analyze(join(quiet(0.3), tone(0.3, 140), quiet(0.5))), 'stop').verdict).toBe('weak');
    });

    it('hears a fricative', () => {
        expect(finalConsonant(analyze(join(quiet(0.3), tone(0.3, 140), hiss(0.15, 0.15), quiet(0.4))), 'fricative').verdict).toBe('clear');
        expect(finalConsonant(analyze(join(quiet(0.3), tone(0.3, 140), quiet(0.5))), 'fricative').verdict).toBe('weak');
    });

    it('says nothing when the recording stops right after the voice, or the room is too loud', () => {
        expect(finalConsonant(analyze(join(quiet(0.3), tone(0.3, 140), quiet(0.1))), 'stop').verdict).toBeNull();
        const noisy = join(hiss(0.3, 0.05), tone(0.3, 140, 140, 0.06), hiss(0.5, 0.05));
        expect(finalConsonant(analyze(noisy), 'stop').verdict).toBeNull();
    });

    it('only measures a consonant right after a vowel or sonorant', () => {
        expect(finalKind(p('L AY1 T'))).toBe('stop');
        expect(finalKind(p('R AY1 S'))).toBe('fricative');
        expect(finalKind(p('W AO1 K T'))).toBeNull();
        expect(finalKind(p('F IY1 L'))).toBeNull();
    });
});

describe('stress (6.2)', () => {
    const word = p('AH0 B AH1 N D AH0 N T');
    const syllables = (lens: number[], amps: number[], hz: number[]) => join(quiet(0.3), ...lens.flatMap((l, i) => [tone(l, hz[i], hz[i], amps[i]), quiet(0.06)]), quiet(0.3));

    it('finds the stressed syllable by length, loudness and pitch', () => {
        const right = analyze(syllables([0.08, 0.25, 0.1], [0.2, 0.35, 0.15], [130, 170, 120]));
        expect(nuclei(right)).toHaveLength(3);
        expect(stressCheck(right, word)).toEqual({ verdict: 'ok', expected: 1, said: 1 });
        const wrong = analyze(syllables([0.25, 0.1, 0.1], [0.35, 0.2, 0.15], [170, 130, 120]));
        expect(stressCheck(wrong, word)).toEqual({ verdict: 'off', expected: 1, said: 0 });
    });

    it('says nothing when it counts other than the dictionary’s syllables', () => {
        expect(stressCheck(analyze(syllables([0.2, 0.2], [0.3, 0.3], [150, 150])), word)?.verdict).toBeNull();
        expect(stressCheck(analyze(syllables([0.2], [0.3], [150])), p('TH IH1 NG K'))).toBeNull();
    });

    it('uses vowel times from the scoring model when it has them', () => {
        const f = analyze(syllables([0.15, 0.15, 0.15], [0.2, 0.2, 0.35], [140, 140, 140]));
        const spans = [
            { start: 0.3, end: 0.45 },
            { start: 0.51, end: 0.66 },
            { start: 0.72, end: 0.87 },
        ];
        expect(stressCheck(f, word, spans)?.said).toBe(2);
    });
});

describe('intonation (6.3)', () => {
    const statement = analyze(join(quiet(0.2), tone(1.2, 220, 140), quiet(0.2)));

    it('reads a falling end and the range in semitones', () => {
        const c = contour(statement);
        expect(ending(c)).toBeLessThan(-1.5);
        expect(range(c)).toBeGreaterThan(5);
    });

    it('notes a rising end where the model falls, and a flat voice', () => {
        const rising = contour(analyze(join(quiet(0.2), tone(1.2, 140, 220), quiet(0.2))));
        const flat = contour(analyze(join(quiet(0.2), tone(1.2, 150, 155), quiet(0.2))));
        expect(intonationNotes(rising, contour(statement), false)).toEqual(['ending']);
        expect(intonationNotes(flat, contour(statement), false)).toEqual(['flat']);
        expect(intonationNotes(contour(statement), contour(statement), false)).toEqual([]);
        // A yes/no question should rise: the rising voice is right there.
        expect(intonationNotes(rising, rising, true)).toEqual([]);
        expect(intonationNotes(rising, null, false)).toEqual([]);
    });

    it('aligns two contours of different speed', () => {
        const a = [0, 1, 2, 3, 4];
        const b = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
        const { cost, path } = dtw(a, b);
        expect(cost).toBe(0);
        expect(path[4]).toBeGreaterThanOrEqual(8);
    });

    it('knows a yes/no question', () => {
        expect(isYesNoQuestion('Can you help me?')).toBe(true);
        expect(isYesNoQuestion('Where is the station?')).toBe(false);
        expect(isYesNoQuestion('I can help.')).toBe(false);
    });
});

describe('speed and pauses (6.4)', () => {
    it('counts syllables per second of speech and long pauses', () => {
        const f = analyze(join(quiet(0.2), tone(0.5, 150), quiet(0.5), tone(0.5, 150), quiet(0.2)));
        const pc = pace(f, 4)!;
        expect(pc.pauses).toHaveLength(1);
        expect(pc.pauses[0][1] - pc.pauses[0][0]).toBeGreaterThan(0.4);
        expect(pc.rate).toBeGreaterThan(3);
        expect(pc.rate).toBeLessThan(4.5);
    });

    it('compares with the model voice', () => {
        expect(paceNote({ rate: 2, pauses: [] }, { rate: 4, pauses: [] })).toBe('slow');
        expect(paceNote({ rate: 6, pauses: [] }, { rate: 4, pauses: [] })).toBe('fast');
        expect(paceNote({ rate: 4.2, pauses: [] }, { rate: 4, pauses: [] })).toBeNull();
        expect(paceNote({ rate: 4.2, pauses: [] }, null)).toBeNull();
    });
});

describe('level 3 remarks', () => {
    const syllables = (lens: number[], amps: number[], hz: number[]) => join(quiet(0.3), ...lens.flatMap((l, i) => [tone(l, hz[i], hz[i], amps[i]), quiet(0.06)]), quiet(0.3));

    it('names a weak final consonant of a word, only without the model', () => {
        const mine = analyze(join(quiet(0.3), tone(0.3, 140), quiet(0.5)));
        const words = [{ word: 'light', phones: p('L AY1 T') }];
        expect(prosodyNotes({ target: 'light', words, mine, model: null, scored: null }).notes).toEqual([{ kind: 'final', text: 'Âm /t/ cuối của “light” nghe còn yếu. Đọc rõ âm cuối rồi mới dừng.' }]);
        const scored = [{ word: 'light', phones: words[0].phones, scores: [] }];
        expect(prosodyNotes({ target: 'light', words, mine, model: null, scored }).notes).toEqual([]);
    });

    it('shows the stress said and the stress wanted', () => {
        const mine = analyze(syllables([0.25, 0.1, 0.1], [0.35, 0.2, 0.15], [170, 130, 120]));
        const r = prosodyNotes({ target: 'abundant', words: [{ word: 'abundant', phones: p('AH0 B AH1 N D AH0 N T') }], mine, model: null, scored: null });
        // The synthetic word has no final /t/ either: both remarks.
        expect(r.notes.map((n) => n.kind)).toEqual(['final', 'stress']);
        expect(r.notes[1].text).toBe('Bạn có vẻ nhấn A-bun-dant. Nên nhấn a-BUN-dant.');
        expect(r.measures.stress).toEqual({ expected: 1, said: 0 });
    });

    it('compares a phrase with the model voice: the end of the line, and pauses', () => {
        const words = [
            { word: 'keep', phones: p('K IY1 P') },
            { word: 'in', phones: p('IH1 N') },
            { word: 'mind', phones: p('M AY1 N D') },
        ];
        const model = analyze(join(quiet(0.2), tone(1, 220, 140), quiet(0.2)));
        const rising = analyze(join(quiet(0.2), tone(0.45, 140, 170), quiet(0.45), tone(0.45, 170, 220), quiet(0.2)));
        const r = prosodyNotes({ target: 'keep in mind', words, mine: rising, model, scored: null });
        expect(r.notes.map((n) => n.kind)).toEqual(['ending', 'pause']);
        expect(r.measures.pauses).toBe(1);
        expect(prosodyNotes({ target: 'keep in mind', words, mine: model, model, scored: null }).notes).toEqual([]);
    });

    it('lays the model line over the learner’s', () => {
        const o = overlay([0, 1, 2, 3, 4, 5], [0, 0, 1, 2, 3, 4, 5, 5])!;
        expect(o.mine).toHaveLength(40);
        expect(o.model[39]).toBe(5);
        expect(overlay([1, 2], [1, 2, 3, 4, 5])).toBeNull();
    });
});
