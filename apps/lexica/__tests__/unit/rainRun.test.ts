import { describe, expect, it } from 'vitest';
import { isOver, level, newRain, speed, submit, target, tick } from '../../app/lib/games/rain';
import { doors, ended, finishRoom, FLOORS, newRun, offer, questionsIn, rest, runScore, take, victory } from '../../app/lib/games/run';
import type { GameCard } from '../../app/lib/games/rounds';

const cards: GameCard[] = ['plan', 'brief', 'dense', 'eager', 'humble', 'cautious', 'bridge', 'merge'].map((w, i) => ({ id: `c${i}`, word: w.toUpperCase(), translationHint: `nghĩa ${w}` }));
const rand = () => 0.3;

describe('rain', () => {
    it('drops appear, fall and cost a life when they land', () => {
        let r = newRain(cards, rand);
        r = tick(r, 700, rand);
        expect(r.drops).toHaveLength(1);
        const before = r.drops[0].y;
        r = tick(r, 1000, rand);
        expect(r.drops[0].y).toBeGreaterThan(before);
        for (let i = 0; i < 40 && r.lives === 3; i++) r = tick(r, 500, rand);
        expect(r.lives).toBeLessThan(3);
        expect(r.missed.length).toBeGreaterThan(0);
    });

    it('typing the word clears the lowest one and scores more for longer words and chains', () => {
        let r = tick(newRain(cards, rand), 700, rand);
        const d = r.drops[0];
        expect(target(r, d.word.slice(0, 2))?.id).toBe(d.id);
        expect(submit(r, 'zzz').hit).toBeNull();
        const a = submit(r, d.word.toUpperCase());
        expect(a.hit?.id).toBe(d.id);
        expect(a.rain.drops).toHaveLength(0);
        expect(a.rain.cleared).toEqual([d.cardId]);
        expect(a.rain.score).toBeGreaterThan(0);
        // a second clear in a row scores more
        r = tick(a.rain, 3000, rand);
        const second = submit(r, r.drops[0].word);
        expect(second.rain.score - a.rain.score).toBeGreaterThan(0);
    });

    it('speeds up as words are cleared and ends when lives or words run out', () => {
        const r = newRain(cards, rand);
        const faster = { ...r, cleared: ['a', 'b', 'c', 'd', 'e'] };
        expect(level(faster)).toBe(2);
        expect(speed(faster)).toBeGreaterThan(speed(r));
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
