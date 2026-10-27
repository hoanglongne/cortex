import { describe, expect, it } from 'vitest';
import { parseCueCard } from '@cortex/classroom-oratio';
import { mmss, pickQuestion, speakingClock, speakingPairs } from '../app/lib/speaking';

describe('speaking clock', () => {
    it('gives Part 2 a minute to prepare, then two to talk', () => {
        expect(speakingClock(2, 0)).toEqual({ phase: 'prep', left: 60_000, total: 60_000 });
        expect(speakingClock(2, 59_000)).toMatchObject({ phase: 'prep', left: 1_000 });
        expect(speakingClock(2, 60_000)).toEqual({ phase: 'talk', left: 120_000, total: 120_000 });
        expect(speakingClock(2, 181_000)).toEqual({ phase: 'done', left: 0, total: 120_000 });
    });

    it('starts Parts 1 and 3 straight away', () => {
        expect(speakingClock(1, 0)).toMatchObject({ phase: 'talk', left: 30_000 });
        expect(speakingClock(3, 30_000)).toMatchObject({ phase: 'talk', left: 30_000 });
        expect(mmss(65_000)).toBe('1:05');
        expect(mmss(400)).toBe('0:01');
    });
});

describe('questions', () => {
    const all = [
        { id: 'a', part: 1, category: 'Work' },
        { id: 'b', part: 1, category: 'Work' },
        { id: 'c', part: 1, category: 'Home' },
        { id: 'd', part: 2, category: 'Work' },
    ];
    const first = () => 0;

    it('keeps to the part and topic, and does not repeat until all were shown', () => {
        expect(pickQuestion(all, { part: 1, category: 'Work' }, [], first)?.id).toBe('a');
        expect(pickQuestion(all, { part: 1, category: 'Work' }, ['a'], first)?.id).toBe('b');
        expect(pickQuestion(all, { part: 1, category: 'Work' }, ['a', 'b'], first)?.id).toBe('a');
        expect(pickQuestion(all, { part: 1, category: null }, ['a', 'b'], first)?.id).toBe('c');
        expect(pickQuestion(all, { part: 1, category: null, ids: ['c', 'd'] }, [], first)?.id).toBe('c');
        expect(pickQuestion(all, { part: 3, category: null }, [], first)).toBeNull();
    });
});

describe('pairs', () => {
    const p = (id: string, strength: number | null) => ({ id, name: id, strength });

    it('pairs everyone, a three when the class is odd', () => {
        const pairs = speakingPairs([p('a', 1200), p('b', 1100), p('c', 1000), p('d', 900), p('e', 800)], () => 0.5);
        expect(pairs.flat().map((x) => x.id).sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
        expect(pairs.map((g) => g.length).sort()).toEqual([2, 3]);
        // Strongest with weakest
        expect(pairs[0].map((x) => x.id)).toEqual(['a', 'e']);
        expect(speakingPairs([p('a', null)], () => 0)).toEqual([[p('a', null)]]);
        expect(speakingPairs([], () => 0)).toEqual([]);
    });

    it('reads a cue card into the task and its points', () => {
        expect(parseCueCard('Describe a person you admire. You should say: who this person is, how you know them, and explain why you admire them.')).toEqual({
            task: 'Describe a person you admire.',
            points: ['Who this person is', 'How you know them', 'Explain why you admire them'],
        });
    });
});
