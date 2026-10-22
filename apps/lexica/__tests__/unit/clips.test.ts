import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { cardClips, clipKey, shadowQuote } from '../../app/lib/audio/clips';

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
        ]);
        expect(shadowQuote(quotes, 'KEEP IN MIND')?.source).toBe('A book');
    });

    it('names files the way the API caches them', () => {
        expect(ourKey(clipKey({ text: '  Please keep\nin mind  ', slow: true }))).toBe(apiKey('Kore', true, 'Please keep in mind'));
        expect(ourKey(clipKey({ text: 'abundant', voice: 'Puck' }))).toBe(apiKey('Puck', false, 'abundant'));
    });
});
