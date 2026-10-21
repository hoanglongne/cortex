import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { spellPhones } from '../../app/lib/pronunciation/graphemes';
import { chipLevel, wordChips } from '../../app/lib/pronunciation/chips';
import { mouthFor } from '../../app/lib/pronunciation/mouth';
import { VOCAB } from '../../app/lib/pronunciation/model/pack';
import type { Dict } from '../../app/lib/pronunciation/phones';

const dict = JSON.parse(readFileSync(path.join(__dirname, '../../public/pron/cmudict-v1.json'), 'utf8')) as Dict;
const p = (s: string) => s.split(' ');
const spell = (w: string) => spellPhones(w, p(dict[w]))?.join('·');

describe('letters for each sound', () => {
    it.each([
        ['think', 'th·i·n·k'],
        ['light', 'l·igh·t'],
        ['sheep', 'sh·ee·p'],
        ['thorough', 'th·or·ough'],
        ['walked', 'w·al·k·ed'],
        ['knowledge', 'kn·ow·l·e·dge'],
        ['abundant', 'a·b·u·n·d·a·n·t'],
        ['nature', 'n·a·t·ure'],
    ])('%s', (w, want) => expect(spell(w)).toBe(want));

    it('joins letters back into the word', () => {
        for (const w of ['through', 'enough', 'island', 'psychology', 'cute', 'bike'])
            expect(spellPhones(w, p(dict[w]))!.join('')).toBe(w);
    });

    it('aligns every card word in the deck', () => {
        const words = [...readFileSync(path.join(__dirname, '../../app/data/vocabCards.ts'), 'utf8').matchAll(/"word": "([A-Z]+)"/g)].map((m) => m[1].toLowerCase()).filter((w) => dict[w]);
        expect(words.length).toBeGreaterThan(400);
        expect(words.filter((w) => !spellPhones(w, p(dict[w])))).toEqual([]);
    });

    it('gives up on a spelling that does not fit', () => {
        expect(spellPhones('xyzzy', p('TH IH1 NG K'))).toBeNull();
    });
});

describe('sound chips', () => {
    it('colours by the model score: clear from 1.3, unclear below 0.8', () => {
        expect([1.9, 1.3, 1.29, 0.8, 0.79, 0].map(chipLevel)).toEqual(['ok', 'ok', 'warn', 'warn', 'bad', 'bad']);
    });

    it('carries what the off sound was heard as', () => {
        const scores = [0.3, 1.8, 1.9, 1.0].map((score, i) => ({ phone: p('TH IH1 NG K')[i], score, competitor: ['S', 'IY', 'N', 'G'][i] }));
        const chips = wordChips('think', p('TH IH1 NG K'), scores);
        expect(chips.map((c) => [c.ipa, c.letters, c.level])).toEqual([
            ['θ', 'th', 'bad'],
            ['ɪ', 'i', 'ok'],
            ['ŋ', 'n', 'ok'],
            ['k', 'k', 'warn'],
        ]);
        expect(chips[0].issue).toMatchObject({ heardAs: 'S', kind: 'th' });
        expect(chips[3].issue?.text).toMatch(/có thể chưa rõ/);
    });

    it('calls a final /t/ an ending only in a word spelled with one', () => {
        const scores = (phones: string[]) => phones.map((phone, i) => ({ phone, score: i === phones.length - 1 ? 0.2 : 1.9, competitor: 'AH' }));
        const abundant = p('AH0 B AH1 N D AH0 N T');
        expect(wordChips('abundant', abundant, scores(abundant)).at(-1)!.issue?.kind).toBe('final_consonant');
        expect(wordChips('walked', p('W AO1 K T'), scores(p('W AO1 K T'))).at(-1)!.issue?.kind).toBe('ending');
    });

    it('reads a low final consonant as dropped', () => {
        const scores = [1.9, 1.9, 0.2].map((score, i) => ({ phone: p('L AY1 T')[i], score, competitor: 'AH' }));
        expect(wordChips('light', p('L AY1 T'), scores)[2].issue).toMatchObject({ heardAs: null, kind: 'final_consonant' });
    });
});

describe('mouth pictures', () => {
    it('has a pose for every phone the model scores', () => {
        const phones = [...new Set(VOCAB.slice(2).map((x) => x.replace(/\d/, '')))];
        expect(phones.filter((x) => !mouthFor(x))).toEqual([]);
    });

    it('says where the contact is and whether the throat buzzes', () => {
        expect(mouthFor('TH')).toMatchObject({ voiced: false, nasalAir: null });
        expect(mouthFor('TH')!.hint).toMatch(/giữa hai hàm răng/);
        expect(mouthFor('DH')!.voiceHint).toMatch(/Rung/);
        expect(mouthFor('M')!.nasalAir).not.toBeNull();
        expect(mouthFor('M')!.hint).toMatch(/mũi/);
        expect(mouthFor('IY1')!.voiceHint).toBe('');
        expect(mouthFor('XX')).toBeNull();
    });

    it('opens the jaw for open vowels', () => {
        const lowTooth = (ph: string) => Number(/M158,([\d.]+)/.exec(mouthFor(ph)!.lowerTooth)![1]);
        expect(lowTooth('AE1')).toBeGreaterThan(lowTooth('IY1') + 15);
    });
});
