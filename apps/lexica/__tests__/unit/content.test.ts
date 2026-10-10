import { afterEach, describe, expect, it } from 'vitest';
import { parseCard, parseManifest, parsePack } from '../../app/lib/content/pack';
import {
    applyRemoteContent,
    getAllCards,
    getCard,
    getCardByWord,
    getCurrentDropCards,
    getDeckCards,
    resetContent,
} from '../../app/lib/content/repository';
import { VOCAB_DATABASE } from '../../app/data/vocabCards';
import { generateInitialDeck } from '../../app/lib/eloAlgorithm';

const trendCard = (id: string, extra: Record<string, unknown> = {}) => ({
    id,
    word: 'FRUGAL',
    elo: 1000,
    level: 'intermediate',
    scenario: 'Cuối tháng sống FRUGAL tới mức ly trà đá cũng chia đôi.',
    translationHint: 'Tiết kiệm',
    trend: { label: 'lương chưa về', dropId: 'drop-1' },
    ...extra,
});

const pack = (cards: unknown[]) => parsePack({ schema: 1, id: 'drop-1', title: 'T', publishedAt: '', cards })!;

afterEach(() => resetContent());

describe('pack parsing', () => {
    it('drops invalid cards and keeps valid ones', () => {
        const p = pack([trendCard('t1'), { id: 't2' }, trendCard('t3', { level: 'godlike' })]);
        expect(p.cards.map(c => c.id)).toEqual(['t1']);
    });

    it('rejects unknown schemas', () => {
        expect(parsePack({ schema: 2, id: 'x', cards: [] })).toBeNull();
        expect(parseManifest({ schema: 2, updatedAt: 'x' })).toBeNull();
    });

    it('keeps trend and audio metadata', () => {
        const c = parseCard(trendCard('t1', { audio: { word: 'https://cdn/w.mp3', bogus: 1 } }))!;
        expect(c.trend?.dropId).toBe('drop-1');
        expect(c.audio).toEqual({ word: 'https://cdn/w.mp3' });
    });

    it('parses a manifest with null refs', () => {
        const m = parseManifest({ schema: 1, updatedAt: 'now', current: null, evergreen: null, retired: ['t9', 3] });
        expect(m).toEqual({ schema: 1, updatedAt: 'now', current: null, evergreen: null, retired: ['t9'] });
    });
});

describe('content repository', () => {
    it('serves core cards by default', () => {
        expect(getAllCards()).toHaveLength(VOCAB_DATABASE.length);
        expect(getCard('v001')?.word).toBe('ABUNDANT');
        expect(getCardByWord('abundant')?.id).toBe('v001');
    });

    it('layers remote cards on top without overriding core ids', () => {
        applyRemoteContent({
            packs: [pack([trendCard('t1'), trendCard('v001', { word: 'HIJACK' })])],
            retired: [],
            currentDropId: 'drop-1',
        });
        expect(getAllCards()).toHaveLength(VOCAB_DATABASE.length + 1);
        expect(getCard('v001')?.word).toBe('ABUNDANT');
        expect(getCurrentDropCards().map(c => c.id)).toEqual(['t1']);
    });

    it('keeps retired and expired cards resolvable but out of the deck', () => {
        applyRemoteContent({
            packs: [pack([
                trendCard('t1'),
                trendCard('t2', { trend: { label: 'cũ', dropId: 'drop-1', expiresAt: '2000-01-01T00:00:00Z' } }),
            ])],
            retired: ['t1', 'v002'],
            currentDropId: 'drop-1',
        });
        const deckIds = new Set(getDeckCards().map(c => c.id));
        expect(deckIds.has('t1')).toBe(false);
        expect(deckIds.has('t2')).toBe(false);
        expect(deckIds.has('v002')).toBe(false);
        expect(getCard('t1')).toBeDefined();
        expect(getCard('v002')).toBeDefined();
        expect(getCurrentDropCards()).toHaveLength(0);
    });

    it('deals live drop cards into a new deck', () => {
        applyRemoteContent({ packs: [pack([trendCard('t1'), trendCard('t2')])], retired: [], currentDropId: 'drop-1' });
        const deck = generateInitialDeck(
            { currentElo: 1000, totalSwipes: 0, correctSwipes: 0, wrongSwipes: 0, recentSwipes: [], seenCardIds: [] },
            {},
            'all',
        );
        const ids = deck.map(c => c.id);
        expect(ids).toContain('t1');
        expect(ids).toContain('t2');
        expect(new Set(ids).size).toBe(ids.length);
    });
});
