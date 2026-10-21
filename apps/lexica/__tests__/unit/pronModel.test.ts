import { readFileSync, statSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { logMel, melFilters } from '../../app/lib/pronunciation/model/mel';
import { forcedAlign, gopRows, validFrames } from '../../app/lib/pronunciation/model/ctc';
import { parseGbm, predict } from '../../app/lib/pronunciation/model/gbm';
import { phoneIds, scorePhones, trimSilence } from '../../app/lib/pronunciation/model/score';
import { ORT_LOADER, OUTPUTS, PACK } from '../../app/lib/pronunciation/model/pack';

// Fixtures from scripts/pron-pack/build.py: one speechocean762 utterance (CC BY 4.0,
// "LOOK AT MY HAND", speaker 0094) run through the Python model and the regressor.
const fixture = (f: string) => path.join(__dirname, 'fixtures', f);
const utt = JSON.parse(readFileSync(fixture('pron-utterance.json'), 'utf8')) as {
    phones: string[];
    samples: number;
    frames: number;
    mel: { every: number; values: number[]; max: number; mean: number };
    logp: number[][];
    spans: [number, number][];
    features: number[][];
    scores: number[];
};
const gbmRaw = JSON.parse(readFileSync(path.join(__dirname, '../../scripts/pron-pack/pron-gbm-v1.json'), 'utf8'));

function readWav(file: string): Float32Array {
    const b = readFileSync(file);
    const data = b.indexOf('data') + 8;
    const n = (b.length - data) / 2;
    return Float32Array.from({ length: n }, (_, i) => b.readInt16LE(data + i * 2) / 32768);
}

describe('log-mel', () => {
    it('has Slaney filters that sum like librosa', () => {
        const f = melFilters();
        expect(f.length).toBe(80 * 201);
        expect(f.every((x) => x >= 0)).toBe(true);
    });

    it('matches Whisper on a real recording', () => {
        const audio = readWav(fixture('pron-utterance.wav'));
        expect(audio.length).toBe(utt.samples);
        const mel = logMel(audio);
        expect(mel.length).toBe(80 * 500);
        expect(Math.max(...mel)).toBeCloseTo(utt.mel.max, 3);
        expect(mel.reduce((a, b) => a + b, 0) / mel.length).toBeCloseTo(utt.mel.mean, 3);
        let worst = 0;
        utt.mel.values.forEach((v, k) => (worst = Math.max(worst, Math.abs(mel[k * utt.mel.every] - v))));
        expect(worst).toBeLessThan(2e-3);
    });
});

describe('CTC alignment and GOP', () => {
    const V = OUTPUTS;
    const logp = Float32Array.from(utt.logp.flat());

    it('finds the same phone spans as torchaudio', () => {
        const ids = phoneIds(utt.phones)!;
        const T = validFrames(utt.samples / 16000, ids.length, 250);
        expect(T).toBe(utt.frames);
        const spans = forcedAlign(logp, T, V, ids)!;
        expect(spans.map((s) => [s.start, s.end])).toEqual(utt.spans);
    });

    it('reads the same GOP features', () => {
        const spans = forcedAlign(logp, utt.frames, V, phoneIds(utt.phones)!)!;
        gopRows(logp, V, spans).forEach((r, i) => r.features.forEach((f, k) => expect(f).toBeCloseTo(utt.features[i][k], 2)));
    });

    it('refuses phones that cannot fit, and keeps a blank between repeats', () => {
        const T = 3;
        const lp = new Float32Array(T * V).fill(-5);
        expect(forcedAlign(lp, T, V, [10, 20, 30, 40])).toBeNull();
        // Two frames cannot hold the same phone twice: it needs a blank between.
        expect(forcedAlign(lp, 2, V, [10, 10])).toBeNull();
        const spans = forcedAlign(lp, 3, V, [10, 10])!;
        expect(spans).toEqual([
            { token: 10, start: 0, end: 1 },
            { token: 10, start: 2, end: 3 },
        ]);
    });
});

describe('regressor', () => {
    it('gives the same scores as scikit-learn on 100 rows', () => {
        const gbm = parseGbm(gbmRaw)!;
        const { rows, scores } = JSON.parse(readFileSync(fixture('pron-gbm.json'), 'utf8')) as { rows: number[][]; scores: number[] };
        rows.forEach((r, i) => {
            const id = r.slice(5).indexOf(1);
            expect(predict(gbm, r.slice(0, 5), id)).toBeCloseTo(scores[i], 4);
        });
    });

    it('scores the recording like the Python model', () => {
        const gbm = parseGbm(gbmRaw)!;
        const s = scorePhones(Float32Array.from(utt.logp.flat()), utt.frames, utt.phones, utt.samples / 16000, gbm)!;
        expect(s.map((p) => p.phone)).toEqual(utt.phones);
        s.forEach((p, i) => expect(p.score).toBeCloseTo(utt.scores[i], 2));
        expect(s[0].start).toBeLessThan(s[s.length - 1].start);
    });

    it('does not score phones outside the vocabulary', () => {
        expect(phoneIds(['TH', 'XX'])).toBeNull();
    });
});

describe('trimSilence', () => {
    it('cuts quiet ends but keeps a margin', () => {
        const a = new Float32Array(16000 * 2);
        for (let i = 12000; i < 20000; i++) a[i] = Math.sin(i / 5) * 0.3;
        const t = trimSilence(a);
        expect(t.length).toBeGreaterThan(8000);
        expect(t.length).toBeLessThan(8000 + 16000 * 0.35);
        expect(trimSilence(new Float32Array(1000)).length).toBe(0);
    });
});

describe('the pack', () => {
    it('keeps onnxruntime pieces in step with the installed package', () => {
        const dist = path.join(__dirname, '../../node_modules/onnxruntime-web/dist');
        const version = JSON.parse(readFileSync(path.join(dist, '../package.json'), 'utf8')).version as string;
        expect(PACK.wasm.file).toContain(version);
        expect(ORT_LOADER).toContain(version);
        expect(readFileSync(path.join(__dirname, '../../public', ORT_LOADER))).toEqual(readFileSync(path.join(dist, 'ort-wasm-simd-threaded.mjs')));
        expect(statSync(path.join(dist, 'ort-wasm-simd-threaded.wasm')).size).toBe(PACK.wasm.bytes);
    });

    it('ships the regressor that the pack lists', () => {
        expect(statSync(path.join(__dirname, '../../scripts/pron-pack/pron-gbm-v1.json')).size).toBe(PACK.regressor.bytes);
    });
});
