import { describe, expect, it } from 'vitest';
import { isOver, level, LIVES, maxDrops, maxLen, newRain, speed, submit, target, tick } from '../../app/lib/games/rain';
import { doors, ended, finishRoom, FLOORS, newRun, offer, questionsIn, rest, runScore, take, victory } from '../../app/lib/games/run';
import type { GameCard } from '../../app/lib/games/rounds';

const cards: GameCard[] = ['plan', 'brief', 'dense', 'eager', 'humble', 'cautious', 'bridge', 'merge'].map((w, i) => ({ id: `c${i}`, word: w.toUpperCase(), translationHint: `nghĩa ${w}` }));
const rand = () => 0.3;

describe('rain', () => {
    it('drops appear after a calm start, fall slowly and cost a heart when they land', () => {
        let r = newRain(cards, rand);
        r = tick(r, 1000, rand);
        expect(r.drops).toHaveLength(0);
        r = tick(r, 1600, rand);
        expect(r.drops).toHaveLength(1);
        const before = r.drops[0].y;
        r = tick(r, 1000, rand);
        expect(r.drops[0].y).toBeGreaterThan(before);
        expect(speed(newRain(cards, rand))).toBeLessThan(0.07);
        for (let i = 0; i < 80 && r.lives === LIVES; i++) r = tick(r, 500, rand);
        expect(r.lives).toBeLessThan(LIVES);
        expect(r.missed.length).toBeGreaterThan(0);
    });

    it('a miss slows the rain for a while', () => {
        let r = newRain(cards, rand);
        const normal = speed(r);
        r = { ...r, slowMs: 3000 };
        expect(speed(r)).toBeLessThan(normal);
        r = tick(r, 3500, rand);
        expect(r.slowMs).toBe(0);
    });

    it('typing the word clears the lowest one and scores more for longer words and chains', () => {
        let r = tick(newRain(cards, rand), 2600, rand);
        const d = r.drops[0];
        expect(target(r, d.word.slice(0, 2))?.id).toBe(d.id);
        expect(submit(r, 'zzz').hit).toBeNull();
        const a = submit(r, d.word.toUpperCase());
        expect(a.hit?.id).toBe(d.id);
        expect(a.rain.drops).toHaveLength(0);
        expect(a.rain.cleared).toEqual([d.cardId]);
        expect(a.rain.score).toBeGreaterThan(0);
        r = tick(a.rain, 3600, rand);
        const second = submit(r, r.drops[0].word);
        expect(second.rain.score - a.rain.score).toBeGreaterThan(0);
    });

    it('speeds up and lets more words fall as words are cleared, but starts with three at most', () => {
        const r = newRain(cards, rand);
        const faster = { ...r, cleared: ['a', 'b', 'c', 'd', 'e'] };
        expect(level(faster)).toBe(2);
        expect(speed(faster)).toBeGreaterThan(speed(r));
        expect(maxDrops(r)).toBe(3);
        expect(maxDrops(faster)).toBe(4);
        expect(maxLen(r)).toBe(5);
    });

    it('every seventh word is golden and gives a hand: a heart, a slow-down or a clear-out', () => {
        const r = { ...newRain(cards, rand), lives: 3 };
        const drop = (id: number, gold = false) => ({ id, cardId: `c${id}`, word: `word${id}`, meaning: 'x', lane: id % 4, y: 0.2, gold });
        const heart = submit({ ...r, drops: [drop(3, true)] }, 'word3');
        expect(heart.effect).toBe('heart');
        expect(heart.rain.lives).toBe(4);
        const slow = submit({ ...r, drops: [drop(4, true)] }, 'word4');
        expect(slow.effect).toBe('slow');
        expect(slow.rain.slowMs).toBeGreaterThan(0);
        const clear = submit({ ...r, drops: [drop(5, true), drop(6), drop(7)] }, 'word5');
        expect(clear.effect).toBe('clear');
        expect(clear.rain.drops).toHaveLength(0);
        expect(clear.rain.cleared).toEqual(['c5', 'c6', 'c7']);
        expect(submit({ ...r, drops: [drop(9)] }, 'word9').effect).toBeNull();
        let g = newRain(cards, rand);
        let golds = 0;
        for (let i = 0; i < 60; i++) {
            g = tick(g, 700, rand);
            golds = Math.max(golds, g.drops.filter((d) => d.gold).length);
            g = { ...g, drops: [], lives: LIVES };
        }
        expect(golds).toBeGreaterThan(0);
    });

    it('practice never costs a heart', () => {
        let r = newRain(cards, rand, true);
        for (let i = 0; i < 120; i++) r = tick(r, 500, rand);
        expect(r.lives).toBe(LIVES);
        expect(r.missed.length).toBeGreaterThan(0);
        expect(isOver({ ...r, lives: 0, queue: cards })).toBe(false);
    });

    it('ends when hearts or words run out', () => {
        const r = newRain(cards, rand);
        expect(isOver({ ...r, lives: 0 })).toBe(true);
        expect(isOver({ ...r, queue: [] })).toBe(true);
        expect(isOver(r)).toBe(false);
    });

    it('skips words that cannot be typed', () => {
        const r = newRain([{ id: 'x', word: 'ice cream', translationHint: 'kem' }, { id: 'y', word: 'a', translationHint: 'một' }], rand);
        expect(r.queue).toHaveLength(0);
    });
});

describe('run', () => {
    it('offers two different doors per floor and only the boss at the end', () => {
        for (let f = 1; f < FLOORS; f++) {
            const [a, b] = doors(f, Math.random);
            expect(a).not.toBe(b);
            expect(['boss']).not.toContain(a);
        }
        expect(doors(FLOORS)).toEqual(['boss']);
    });

    it('wrong answers cost hearts, a Khiên blocks the first, a clean room is rewarded', () => {
        const plain = finishRoom(newRun(), 'fight', 1, 3);
        expect(plain.hearts).toBe(1);
        const shielded = finishRoom(take({ ...newRun(), floor: 1 }, 'shield'), 'fight', 1, 3);
        expect(shielded.hearts).toBe(1 + 0 + 1);
        const clean = finishRoom(newRun(), 'fight', 3, 3);
        expect(clean.score).toBe(40);
        expect(clean.floor).toBe(2);
    });

    it('Nhân đôi doubles only the next fight, once', () => {
        let r = take(newRun(), 'double');
        expect(r.doubleNext).toBe(true);
        r = finishRoom(r, 'fight', 3, 3);
        expect(r.score).toBe(70);
        expect(r.doubleNext).toBe(false);
        expect(finishRoom(r, 'fight', 3, 3).score - r.score).toBe(40);
    });

    it('elites and the boss pay more', () => {
        expect(finishRoom(newRun(), 'elite', 4, 4).score).toBeGreaterThan(finishRoom(newRun(), 'fight', 4, 4).score);
        expect(finishRoom(newRun(), 'boss', 5, 5).score).toBeGreaterThan(finishRoom(newRun(), 'elite', 5, 5).score);
        expect(questionsIn('treasure')).toBe(0);
    });

    it('rest and hearts heal up to the cap; relics are not offered twice', () => {
        const r = rest({ ...newRun(), hearts: 5 });
        expect(r.hearts).toBe(5);
        const held = take(newRun(), 'eye');
        expect(offer(held, rand)).not.toContain('eye');
        expect(offer(held, rand)).toHaveLength(3);
    });

    it('ends in defeat at zero hearts and in victory past the last floor', () => {
        expect(ended(finishRoom({ ...newRun(), hearts: 1 }, 'fight', 0, 3))).toBe(true);
        const win = { ...newRun(), floor: FLOORS + 1 };
        expect(victory(win)).toBe(true);
        expect(runScore(win)).toBeGreaterThan(runScore({ ...win, hearts: 0 }));
    });
});
