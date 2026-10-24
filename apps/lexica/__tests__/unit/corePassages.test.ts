import { describe, expect, it } from 'vitest';
import { CORE_PASSAGES } from '../../app/data/passages';
import { PASSAGE_TOPICS, wordCount } from '../../app/lib/content/passages';
import { getAllCards, getCard } from '../../app/lib/content/repository';
import { spotWords } from '../../app/lib/journey/outside';

describe('passages that ship with the app', () => {
    it('have unique ids and known topics', () => {
        const ids = CORE_PASSAGES.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const p of CORE_PASSAGES) expect(PASSAGE_TOPICS as readonly string[]).toContain(p.topic);
    });

    it('use every word they were written for, and those words are deck cards', () => {
        const missing: string[] = [];
        for (const p of CORE_PASSAGES) {
            const card = (id: string) => getCard(id);
            const found = new Set(spotWords(p.text, p.newWords.map(card).filter((c) => c !== undefined)).map((s) => s.cardId));
            for (const id of p.newWords) {
                if (!card(id)) missing.push(`${p.id}: ${id} is not a card`);
                else if (!found.has(id)) missing.push(`${p.id}: "${card(id)?.word}"`);
            }
        }
        expect(missing).toEqual([]);
    });

    it('are a readable length, with a translation and valid questions', () => {
        for (const p of CORE_PASSAGES) {
            const n = wordCount(p.text);
            if (p.kind === 'dialogue') expect(p.text.split('\n').filter(Boolean).length, p.id).toBeGreaterThanOrEqual(6);
            else expect(n, p.id).toBeGreaterThanOrEqual(90);
            expect(n, p.id).toBeLessThanOrEqual(220);
            expect(p.translation.trim().length, p.id).toBeGreaterThan(0);
            for (const q of p.questions ?? []) expect(q.answer, p.id).toBeLessThan(q.options.length);
        }
    });

    it('cover a good part of the deck', () => {
        const all = getAllCards();
        const covered = new Set(CORE_PASSAGES.flatMap((p) => spotWords(p.text, all).map((s) => s.cardId)));
        // 79 of 610 before the 40 passages of 10/2026.
        expect(covered.size).toBeGreaterThanOrEqual(250);
    });
});
