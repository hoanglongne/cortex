import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { sha256Hex, voiceFileName } from '../../app/lib/audio/voiceKey';

const node = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

describe('voice cache names', () => {
    it('hashes like Node, across block sizes and UTF-8', () => {
        for (const s of ['', 'a', 'abc', 'Kore|0|abundant', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'y'.repeat(200), 'Năm nay mùa xoài rất ABUNDANT — “ngon” ✓']) expect(sha256Hex(s)).toBe(node(s));
    });

    it('names a clip as the API does (voice|slow|text, 32 hex)', () => {
        expect(voiceFileName({ text: ' abundant ' })).toBe(`${node('Kore|0|abundant').slice(0, 32)}.wav`);
        expect(voiceFileName({ text: 'keep in mind', voice: 'Puck', slow: true })).toBe(`${node('Puck|1|keep in mind').slice(0, 32)}.wav`);
    });
});
