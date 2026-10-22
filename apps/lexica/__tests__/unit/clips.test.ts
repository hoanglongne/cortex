import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { cardClips, clipKey, pairClips, passageClips, shadowQuote } from '../../app/lib/audio/clips';

// The Cortex API's cache name for a clip (apps/cortex-core-api/src/modules/lexica/lexica-ai.ts, ttsKey).
const apiKey = (voice: string, slow: boolean, text: string) => createHash('sha256').update(`${voice}|${slow ? 1 : 0}|${text}`, 'utf8').digest('hex').slice(0, 32);
const ourKey = (k: string) => createHash('sha256').update(k, 'utf8').digest('hex').slice(0, 32);

describe('model-voice clips', () => {
    const card = { word: 'Keep in mind', collocations: ['keep in mind that', 'Keep In Mind'], situation: { prompt: 'x', model: 'Please keep in mind  the deadline.' } };
    const quotes = [
        { kind: 'book' as const, text: 'Keep in mind that the road is long.', source: 'A book' },
        { kind: 'news' as const, text: Array(30).fill('keep in mind').join(' '), source: 'Too long' },
    ];

    it('lists every clip the drill asks for, once', () => {
        const clips = cardClips(card, quotes);
        expect(clips.map(clipKey)).toEqual([
            'Kore|0|Keep in mind',
            'Kore|0|keep in mind',
            'Kore|1|keep in mind',
            'Puck|0|keep in mind',
            'Aoede|0|keep in mind',
            'Kore|0|keep in mind that',
            'Kore|0|Please keep in mind the deadline.',
            'Kore|0|Keep in mind that the road is long.',
            'Kore|1|Keep in mind that the road is long.',
            // the near-sound word of the listening round, in its three voices
            'Kore|0|keep in min',
            'Puck|0|keep in min',
            'Aoede|0|keep in min',
        ]);
        expect(shadowQuote(quotes, 'KEEP IN MIND')?.source).toBe('A book');
    });

    it('names files the way the API caches them', () => {
        expect(ourKey(clipKey({ text: '  Please keep\nin mind  ', slow: true }))).toBe(apiKey('Kore', true, 'Please keep in mind'));
        expect(ourKey(clipKey({ text: 'abundant', voice: 'Puck' }))).toBe(apiKey('Puck', false, 'abundant'));
    });

    it('covers the minimal pairs and the readings as they are played', () => {
        expect(pairClips().map(clipKey)).toEqual(expect.arrayContaining(['Kore|0|rice', 'Puck|0|rye', 'Aoede|0|bike', 'Kore|1|buy']));
        expect(passageClips({ text: 'One.\n\nTwo.', kind: undefined }).map(clipKey)).toEqual(['Kore|0|One. Two.', 'Kore|1|One. Two.']);
        expect(passageClips({ text: 'Linh: Hi!\nTom: Hello.\nLinh: Bye.', kind: 'dialogue' }).map(clipKey)).toEqual([
            'Kore|0|Hi! Hello. Bye.',
            'Kore|1|Hi! Hello. Bye.',
            'Kore|0|Hi!',
            'Puck|0|Hello.',
            'Kore|0|Bye.',
        ]);
    });
});
