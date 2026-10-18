import { describe, expect, it } from 'vitest';
import { pledgeIdea, pledgeState, pledgeWord, spotWords, usesWord } from '../../app/lib/journey/outside';
import { countLived, knownAlready, live, meet, understand, type Journeys } from '../../app/lib/journey/steps';
import { useLexicaStore } from '../../app/store/lexicaStore';

const T0 = Date.parse('2026-10-18T00:00:00');

describe('Pledge', () => {
    it('asks the next day, not the same day', () => {
        expect(pledgeState(null, '2026-10-18')).toBe('none');
        expect(pledgeState({ cardId: 'a', date: '2026-10-18' }, '2026-10-18')).toBe('today');
        expect(pledgeState({ cardId: 'a', date: '2026-10-16' }, '2026-10-18')).toBe('due');
    });

    it('offers a remembered word not used yet, else one understood before today', () => {
        const journeys: Journeys = {
            fresh: understand(undefined, T0 + 1000),
            old: understand(undefined, T0 - 1000),
            nho: knownAlready(undefined, T0 - 5000),
            gap: meet(knownAlready(undefined, T0 - 9000), T0 - 8000)!,
        };
        // The furthest along first: a word already met in English is the readiest to use.
        expect(pledgeWord(journeys, T0)).toBe('gap');
        expect(pledgeWord(journeys, T0, new Set(['gap']))).toBe('nho');
        expect(pledgeWord({ ...journeys, nho: live(journeys.nho, 1)!, gap: live(journeys.gap, 1)! }, T0)).toBe('old');
        expect(pledgeWord({ fresh: journeys.fresh }, T0)).toBeNull();
        expect(pledgeIdea('v1', 'tech')).toMatch(/^Thử dùng /);
        expect(pledgeIdea('g1', 'tech', 'Bạn kẹt xe, nhắn cho sếp.')).toBe('Bạn kẹt xe, nhắn cho sếp.');
    });

    it('a lived word counts once, only if understood', () => {
        expect(live(undefined, 1)).toBeUndefined();
        const j = live(understand(undefined, 1), 5)!;
        expect(live(j, 9)).toBe(j);
        expect(countLived({ a: j, b: understand(undefined, 1) })).toBe(1);
    });

    it('the store records it, for every card of the word, with the sentence', () => {
        const s = useLexicaStore.getState();
        useLexicaStore.setState({ journeys: { v416: understand(undefined, 1), v442: understand(undefined, 1) }, mySentences: {} });
        s.makePledge('v416');
        expect(useLexicaStore.getState().pledge?.cardId).toBe('v416');
        useLexicaStore.getState().markLived('v416', 'I believe we can finish today.');
        const after = useLexicaStore.getState();
        expect(after.journeys.v416.livedAt).toBeTruthy();
        expect(after.journeys.v442.livedAt).toBeTruthy();
        expect(after.pledge).toBeNull();
        expect(after.mySentences.v416.text).toBe('I believe we can finish today.');
    });
});

describe('Spotting words', () => {
    const cards = [
        { id: 'a', word: 'Annoy' },
        { id: 'b', word: 'decision' },
        { id: 'c', word: 'keep in mind' },
        { id: 'd', word: 'cat' },
    ];

    it('finds learned words in any form, and phrases', () => {
        const text = 'It was annoying, but the decisions were made. Keep it in mind? Keep in  mind!';
        const found = spotWords(text, cards);
        expect([...new Set(found.map((f) => f.cardId))]).toEqual(['a', 'b', 'c']);
        expect(text.slice(found[0].start, found[0].end)).toBe('annoying');
        expect(usesWord('We postponed it.', 'postpone')).toBe(true);
        expect(usesWord('We delayed it.', 'postpone')).toBe(false);
    });
});
