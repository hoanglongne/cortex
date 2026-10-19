import { describe, expect, it } from 'vitest';
import { JOURNAL_PROMPTS } from '../../app/data/journalPrompts';
import { pickPrompt } from '../../app/lib/journey/prompts';
import { addSightings, collection, huntCaught, MAX_SIGHTINGS, pickHunt, placeMap, snippetAround, weekOf, type Sighting } from '../../app/lib/journey/sightings';
import { checklist, nextTip, showChecklist, type GuideFacts } from '../../app/lib/guide';
import type { Journeys } from '../../app/lib/journey/steps';

describe('journal questions', () => {
    it('has every topic at every depth, with unique ids', () => {
        expect(new Set(JOURNAL_PROMPTS.map((p) => p.id)).size).toBe(JOURNAL_PROMPTS.length);
        for (const topic of ['work', 'study', 'money', 'love', 'social', 'food', 'people', 'life'])
            for (const depth of [1, 2, 3]) expect(JOURNAL_PROMPTS.filter((p) => p.topic === topic && p.depth === depth).length).toBeGreaterThanOrEqual(3);
    });

    it("draws from the word's topic at the chosen depth", () => {
        const p = pickPrompt(JOURNAL_PROMPTS, { topic: 'work', depth: 3, rand: 0.5 });
        expect(p).toMatchObject({ topic: 'work', depth: 3 });
    });

    it('"Đổi câu" always changes the question, then moves on to everyday ones', () => {
        const seen: string[] = [];
        for (let i = 0; i < 6; i++) {
            const p = pickPrompt(JOURNAL_PROMPTS, { topic: 'food', depth: 1, exclude: seen, rand: 0.99 })!;
            expect(seen).not.toContain(p.id);
            seen.push(p.id);
        }
        expect(seen.slice(0, 3).every((id) => id.startsWith('food-1'))).toBe(true);
        expect(seen.slice(3).every((id) => id.startsWith('life-1'))).toBe(true);
    });
});

const day = (date: string, h = 12) => new Date(`${date}T${String(h).padStart(2, '0')}:00:00`).getTime();

describe('sightings', () => {
    it('keeps the sentence around a word', () => {
        const text = 'First line here. Then the deadline moved again! And more.';
        const at = text.indexOf('deadline');
        expect(snippetAround(text, at, at + 8)).toBe('Then the deadline moved again!');
        const long = `${'word '.repeat(60)}deadline ${'more '.repeat(60)}`;
        const s = snippetAround(long, long.indexOf('deadline'), long.indexOf('deadline') + 8);
        expect(s).toContain('deadline');
        expect(s.length).toBeLessThanOrEqual(163);
    });

    it('adds new ones first, one per card per text, capped', () => {
        const a: Sighting = { cardId: 'a', at: 1, place: 'chat' };
        const list = addSightings([], [a, { ...a, at: 2 }, { cardId: 'b', at: 3, place: 'work' }]);
        expect(list.map((s) => s.cardId)).toEqual(['a', 'b']);
        const many = Array.from({ length: MAX_SIGHTINGS + 5 }, (_, i) => ({ cardId: `c${i}`, at: i, place: 'read' as const }));
        expect(addSightings(list, many)).toHaveLength(MAX_SIGHTINGS);
    });

    it('groups the collection by word and the map by place', () => {
        const list: Sighting[] = [
            { cardId: 'a2', at: 5, place: 'social', snippet: 'x a y' },
            { cardId: 'b', at: 4, place: 'chat' },
            { cardId: 'a', at: 3, place: 'chat', snippet: 'x a y' },
        ];
        const idOf = (id: string) => (id === 'a2' ? 'a' : id);
        expect(collection(list, idOf)).toEqual([
            { cardId: 'a', count: 2, last: 5, places: ['social', 'chat'], snippets: ['x a y'] },
            { cardId: 'b', count: 1, last: 4, places: ['chat'], snippets: [] },
        ]);
        expect(placeMap(list, idOf)[0]).toEqual({ place: 'chat', sightings: 2, words: 2 });
    });

    it('starts the week on Monday', () => {
        expect(weekOf('2026-10-19')).toBe('2026-10-19');
        expect(weekOf('2026-10-25')).toBe('2026-10-19');
        expect(weekOf('2026-10-26')).toBe('2026-10-26');
    });

    it('hunts remembered words first, one card per word, and counts catches since Monday', () => {
        const j = (remembered: boolean, metAt?: number) => ({ understoodAt: 1, recalls: [], ...(remembered ? { rememberedAt: 2 } : {}), ...(metAt ? { metAt } : {}) });
        const journeys: Journeys = { n1: j(true), n2: j(true), h1: j(false), h2: j(false), g1: j(true, 3), dup: j(true), x: j(false), y: j(false) };
        const words: Record<string, string> = { n1: 'one', n2: 'two', h1: 'three', h2: 'four', g1: 'five', dup: 'one', x: 'six', y: 'seven' };
        const hunt = pickHunt(journeys, (id) => words[id], () => false, 1);
        expect(hunt).toHaveLength(5);
        expect(hunt.slice(0, 2).map((id) => words[id]).sort()).toEqual(['one', 'two']);
        expect(hunt.filter((id) => words[id] === 'one')).toHaveLength(1);
        const caught = huntCaught({ week: '2026-10-19', cardIds: ['n1', 'n2'] }, [
            { cardId: 'n1', at: day('2026-10-20'), place: 'chat' },
            { cardId: 'n2', at: day('2026-10-18'), place: 'chat' },
        ]);
        expect([...caught]).toEqual(['n1']);
    });
});

const facts = (f: Partial<GuideFacts> = {}): GuideFacts => ({ words: 0, recalls: 0, remembered: 0, met: 0, spoken: 0, sentences: 0, sightings: 0, pledged: false, lived: 0, daysStudied: 0, due: 0, hard: 0, hunt: null, weekday: 1, daysSinceStart: null, ...f });

describe('guide', () => {
    it('ticks the first-week checklist from what the learner did', () => {
        const done = checklist(facts({ words: 12, recalls: 1, sightings: 1 })).filter((i) => i.done).map((i) => i.id);
        expect(done).toEqual(['learn', 'review', 'spot']);
    });

    it('hides the checklist when hidden, after two weeks, or when all is done', () => {
        expect(showChecklist(facts(), false)).toBe(true);
        expect(showChecklist(facts(), true)).toBe(false);
        expect(showChecklist(facts({ daysSinceStart: 20 }), false)).toBe(false);
        expect(showChecklist(facts({ words: 10, recalls: 1, spoken: 1, sentences: 1, met: 1, pledged: true, daysStudied: 3 }), false)).toBe(false);
    });

    it('gives the tip the numbers call for; a daily tip comes back the next day', () => {
        expect(nextTip(facts(), {}, '2026-10-19')).toBeNull();
        expect(nextTip(facts({ remembered: 4 }), {}, '2026-10-19')?.id).toBe('spot-first');
        expect(nextTip(facts({ remembered: 4 }), { 'spot-first': '2026-10-01' }, '2026-10-19')).toBeNull();
        const due = facts({ due: 10 });
        expect(nextTip(due, { due: '2026-10-19' }, '2026-10-19')).toBeNull();
        expect(nextTip(due, { due: '2026-10-18' }, '2026-10-19')?.id).toBe('due');
    });
});
