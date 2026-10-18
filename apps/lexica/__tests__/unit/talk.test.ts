import { describe, expect, it } from 'vitest';
import { TALK_CARDS } from '../../app/data/talkCards';
import { CORE_PASSAGES } from '../../app/data/passages';
import { parseCard, parseManifest } from '../../app/lib/content/pack';
import { parsePassage, splitByWords } from '../../app/lib/content/passages';
import { getCard, getPassages } from '../../app/lib/content/repository';
import { generateInitialDeck } from '../../app/lib/eloAlgorithm';

const stats = { currentElo: 900, totalSwipes: 0, correctSwipes: 0, wrongSwipes: 0, recentSwipes: [], seenCardIds: [] };

describe('Giao tiếp branch', () => {
    it('ships phrase cards whose sentence and model both use the phrase', () => {
        expect(TALK_CARDS.length).toBeGreaterThanOrEqual(40);
        for (const c of TALK_CARDS) {
            expect(c.branch).toBe('talk');
            expect((c.scenario ?? '').toLowerCase()).toContain(c.word);
            expect(c.situation.model.toLowerCase()).toContain(c.word);
            expect(getCard(c.id)).toBeDefined();
        }
    });

    it('deals only the learner’s branch', () => {
        const talk = generateInitialDeck(stats, {}, 'beginner', [], false, 'talk');
        expect(talk.length).toBeGreaterThan(0);
        expect(talk.every((c) => c.branch === 'talk')).toBe(true);
        const cert = generateInitialDeck(stats, {}, 'beginner', [], false, 'cert');
        expect(cert.every((c) => (c.branch ?? 'cert') === 'cert')).toBe(true);
    });

    it('finds phrases with the ending on the first word', () => {
        const targets = [
            { id: 'g017', word: 'follow up' },
            { id: 'g010', word: 'make sense' },
            { id: 'v1', word: 'up' },
        ];
        const segs = splitByWords('She followed up twice. It makes sense now.', targets).filter((s) => s.cardId);
        expect(segs.map((s) => [s.text, s.cardId])).toEqual([
            ['followed up', 'g017'],
            ['makes sense', 'g010'],
        ]);
    });

    it('keeps phrases out of IELTS passages, marks them in dialogues', () => {
        const passages = getPassages();
        const heist = passages.find((p) => p.id === 'p_first_day')!;
        expect(heist.words.some((id) => id.startsWith('g'))).toBe(false);
        const cafe = passages.find((p) => p.id === 'd_cafe_1')!;
        expect(cafe.kind).toBe('dialogue');
        // Every new word of a dialogue appears in its text.
        for (const p of CORE_PASSAGES.filter((x) => x.kind === 'dialogue')) {
            const found = new Set(splitByWords(p.text, p.newWords.map((id) => ({ id, word: getCard(id)!.word }))).map((s) => s.cardId));
            for (const id of p.newWords) expect(found.has(id), `${p.id} ${id}`).toBe(true);
        }
    });

    it('reads branch, situation and dialogues from Studio packs', () => {
        const c = parseCard({ id: 'k1', word: 'run late', elo: 900, level: 'beginner', scenario: 'x run late', translationHint: 'trễ', branch: 'talk', situation: { prompt: 'p', model: 'm' } });
        expect(c).toMatchObject({ branch: 'talk', situation: { prompt: 'p', model: 'm' } });
        expect(parseManifest({ schema: 1, updatedAt: 'now', talk: { id: 'talk', url: 'u', sha256: 'h' } })?.talk).toEqual({ id: 'talk', url: 'u', sha256: 'h' });
        expect(parsePassage({ id: 'd', kind: 'dialogue', level: 'beginner', topic: 't', title: 't', text: 'A: hi', translation: 'A: chào', newWords: ['g001'] })?.kind).toBe('dialogue');
    });
});
