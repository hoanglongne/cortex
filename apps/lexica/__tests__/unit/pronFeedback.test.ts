import { readFileSync, statSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { alignAttempt, normalizeWords, numberWords } from '../../app/lib/pronunciation/align';
import { ipaToArpabet, modelPhones, phonesOf, type Dict } from '../../app/lib/pronunciation/phones';
import { classify, describe as describeIssue, issuesFromHeardWord, issuesFromScores, topIssues } from '../../app/lib/pronunciation/sounds';
import { soundFeedback, swapsOf } from '../../app/lib/pronunciation/feedback';
import { MINIMAL_PAIRS } from '../../app/lib/pronunciation/pairs';

const dictFile = path.join(__dirname, '../../public/pron/cmudict-v1.json');
const dict = JSON.parse(readFileSync(dictFile, 'utf8')) as Dict;
const p = (s: string) => s.split(' ');
const alt = (transcript: string, confidence = 0.9) => ({ transcript, confidence });

describe('level 1: words of the model sentence', () => {
    it('normalizes numbers, contractions and punctuation', () => {
        expect(numberWords(42)).toBe('forty two');
        expect(numberWords(110)).toBe('one hundred ten');
        expect(normalizeWords("I'm late, it's 10 o'clock! Don't wait.")).toEqual(['i', 'am', 'late', 'it', 'is', 'ten', "o'clock", 'do', 'not', 'wait']);
    });

    it('marks every word ok when all were heard', () => {
        const a = alignAttempt('Keep in mind.', [alt('keep in mind')]);
        expect(a.words.map((w) => w.status)).toEqual(['ok', 'ok', 'ok']);
        expect(a.level).toBe('clear');
    });

    it('finds a missing last word (recognition stopped early)', () => {
        const a = alignAttempt('make a decision', [alt('make a')]);
        expect(a.words.map((w) => w.status)).toEqual(['ok', 'ok', 'missing']);
        expect(a.level).toBe('close');
    });

    it('names the word heard instead', () => {
        const a = alignAttempt('I think so', [alt('I sink so')]);
        expect(a.words[1]).toEqual({ word: 'think', status: 'swapped', heard: 'sink' });
    });

    it('ignores fillers and counts other extra words without blame', () => {
        const a = alignAttempt('take a break', [alt('um take uh a short break')]);
        expect(a.words.every((w) => w.status === 'ok')).toBe(true);
        expect(a.extra).toBe(1);
    });

    it('reads contractions and numbers either way', () => {
        expect(alignAttempt("I'm 20", [alt('I am twenty')]).level).toBe('clear');
        expect(alignAttempt('I am twenty', [alt("I'm 20")]).level).toBe('clear');
    });

    it('is unsure when only another reading has the word', () => {
        const a = alignAttempt('three trees', [alt('tree trees'), alt('three trees', 0)]);
        expect(a.words[0].status).toBe('unsure');
    });

    it('reports only missing words when the engine is not confident', () => {
        const a = alignAttempt('I think so', [alt('I sink', 0.3)]);
        expect(a.words.map((w) => w.status)).toEqual(['ok', 'unsure', 'missing']);
        // 0 means the browser does not know: no reason to hold back.
        expect(alignAttempt('I think so', [alt('I sink so', 0)]).words[1].status).toBe('swapped');
    });

    it('lists the words heard as others', () => {
        expect(swapsOf(alignAttempt('a cheap ticket', [alt('a sheep ticket')]))).toEqual([{ word: 'cheap', heard: 'sheep' }]);
    });
});

describe('phones', () => {
    it('ships a small dictionary with the app words and common words', () => {
        expect(statSync(dictFile).size).toBeLessThanOrEqual(400 * 1024);
        expect(dict.think).toBe('TH IH1 NG K');
        expect(dict.abundant).toBe('AH0 B AH1 N D AH0 N T');
        expect(dict.sink).toBeDefined();
        for (const [a, b] of Object.values(MINIMAL_PAIRS).flat()) {
            expect(dict[a], a).toBeDefined();
            expect(dict[b], b).toBeDefined();
        }
    });

    it('turns a card IPA into ARPAbet with stress', () => {
        expect(ipaToArpabet('/əˈbʌndənt/')).toEqual(p('AH0 B AH1 N D AH0 N T'));
        expect(ipaToArpabet('θɪŋk')).toEqual(p('TH IH0 NG K'));
        expect(ipaToArpabet('ˈtʃiːp')).toEqual(p('CH IY1 P'));
        expect(ipaToArpabet('ʃ☃')).toBeNull();
    });

    it('falls back to the IPA for words not in the dictionary', () => {
        expect(phonesOf(dict, 'Think')).toEqual(p('TH IH1 NG K'));
        expect(phonesOf(dict, 'zyzzogeton', 'ˈzɪzəˌdʒiːtən')).toEqual(p('Z IH1 Z AH0 JH IY2 T AH0 N'));
        expect(phonesOf(dict, 'zyzzogeton')).toBeNull();
    });

    it('gives one-syllable words stress 0, as the model learned them', () => {
        expect(modelPhones(p('TH IH1 NG K'))).toEqual(p('TH IH0 NG K'));
        expect(modelPhones(p('AH0 B AH1 N D AH0 N T'))).toEqual(p('AH0 B AH1 N D AH0 N T'));
    });
});

describe('the library of Vietnamese learners’ errors', () => {
    const cases: [string, string, number, string | null, string][] = [
        ['light', 'L AY1 T', 2, null, 'final_consonant'],
        ['bike', 'B AY1 K', 2, null, 'final_consonant'],
        ['bed', 'B EH1 D', 2, 'T', 'final_voicing'],
        ['prize', 'P R AY1 Z', 3, 'S', 'final_voicing'],
        ['think', 'TH IH1 NG K', 0, 'S', 'th'],
        ['three', 'TH R IY1', 0, 'T', 'th'],
        ['play', 'P L EY1', 1, null, 'cluster'],
        ['street', 'S T R IY1 T', 2, null, 'cluster'],
        ['walked', 'W AO1 K T', 3, null, 'ending'],
        ['cats', 'K AE1 T S', 3, null, 'ending'],
        ['sheep', 'SH IY1 P', 1, 'IH', 'long_short'],
        ['pool', 'P UW1 L', 1, 'UH', 'long_short'],
        ['cheap', 'CH IY1 P', 0, 'SH', 'ch_j'],
        ['ship', 'SH IH1 P', 0, 'S', 'ch_j'],
        ['thing', 'TH IH1 NG', 2, 'N', 'final_ng'],
        ['sing', 'S IH1 NG', 2, null, 'final_ng'],
        ['feel', 'F IY1 L', 2, null, 'final_l'],
        ['right', 'R AY1 T', 0, 'L', 'final_l'],
        ['zoo', 'Z UW1', 0, 'S', 'initial_z'],
        ['zip', 'Z IH1 P', 0, 'S', 'initial_z'],
        ['bad', 'B AE1 D', 1, 'EH', 'ae_e'],
        ['man', 'M AE1 N', 1, 'EH', 'ae_e'],
    ];
    it.each(cases)('%s: phone %i', (_w, phones, i, heard, kind) => {
        expect(classify(p(phones), i, heard)).toBe(kind);
    });

    it('knows nothing of other changes', () => {
        expect(classify(p('K AE1 T'), 0, 'G')).toBeNull();
        expect(classify(p('K AE1 T'), 1, null)).toBeNull();
    });

    it('says what may be off and how to fix it', () => {
        const i = describeIssue('think', p('TH IH1 NG K'), 0, 'S');
        expect(i.text).toBe('Âm /θ/ trong “think” có thể nghe như /s/.');
        expect(i.tip).toMatch(/lưỡi/);
        expect(i.pair).toEqual(['think', 'sink']);
        expect(describeIssue('light', p('L AY1 T'), 2, null).text).toBe('Âm /t/ cuối trong “light” có thể bị mất.');
    });
});

describe('without the model: the word heard instead', () => {
    it('finds the changed sound', () => {
        const [i] = issuesFromHeardWord('think', p(dict.think), p(dict.sink));
        expect(i).toMatchObject({ index: 0, heardAs: 'S', kind: 'th' });
        const [d] = issuesFromHeardWord('light', p(dict.light), p(dict.lie));
        expect(d).toMatchObject({ index: 2, heardAs: null, kind: 'final_consonant' });
        expect(issuesFromHeardWord('sheep', p(dict.sheep), p(dict.ship))[0].kind).toBe('long_short');
    });

    it('gives at most two issues, known errors first', () => {
        const target = p('S T R IY1 T');
        const issues = [describeIssue('street', target, 3, 'EY'), describeIssue('street', target, 2, null), describeIssue('street', target, 4, null)];
        expect(topIssues(issues).map((x) => x.index)).toEqual([2, 4]);
    });

    it('compares each word heard as another real word', () => {
        const f = soundFeedback({ dict, swaps: [{ word: 'cheap', heard: 'sheep' }] });
        expect(f.source).toBe('heard');
        expect(f.issues[0]).toMatchObject({ word: 'cheap', kind: 'ch_j' });
        // A made-up spelling has no phones: nothing to say.
        expect(soundFeedback({ dict, swaps: [{ word: 'cheap', heard: 'sheepz' }] })).toEqual({ issues: [], source: null });
    });
});

describe('with the model', () => {
    const word = { word: 'think', phones: p('TH IH1 NG K') };
    const scores = (s: number[], comp: string[]) => s.map((score, i) => ({ phone: word.phones[i], score, competitor: comp[i] }));

    it('reports low phones, worst first, as swaps or drops', () => {
        const issues = issuesFromScores([{ ...word, scores: scores([0.2, 1.9, 1.8, 0.4], ['S', 'IY', 'N', 'G']) }]);
        expect(issues.map((x) => [x.index, x.heardAs, x.kind])).toEqual([
            [0, 'S', 'th'],
            [3, null, 'final_consonant'],
        ]);
    });

    it('says nothing when every phone scores well', () => {
        expect(soundFeedback({ dict, scored: [{ ...word, scores: scores([1.9, 1.8, 1.7, 1.6], ['S', 'IY', 'N', 'G']) }], swaps: [] })).toEqual({ issues: [], source: 'model' });
    });
});
