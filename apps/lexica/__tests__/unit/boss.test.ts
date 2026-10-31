import { describe, expect, it } from 'vitest';
import { answer, fightScore, liveScore, lost, newFight, over, won } from '../../app/lib/games/boss';
import { canTrace, isStep, makeBoard, matchPlaced, neighbours, SIZE, wordPoints } from '../../app/lib/games/grid';
import type { GameCard } from '../../app/lib/games/rounds';

describe('boss fight', () => {
    it('a right answer hurts the boss, a quick one more', () => {
        const f = newFight(12);
        const slow = answer(f, true, 9000);
        const quick = answer(f, true, 2000);
        expect(slow.fight.boss).toBeLessThan(100);
        expect(quick.damage).toBeGreaterThan(slow.damage);
        expect(quick.strike).toBe('hit');
    });

    it('every third right answer in a row is a critical hit', () => {
        let f = newFight(12);
        const dmg: number[] = [];
        for (let i = 0; i < 3; i++) {
            const r = answer(f, true, 9000);
            f = r.fight;
            dmg.push(r.damage);
            if (i === 2) expect(r.strike).toBe('crit');
        }
        expect(dmg[2]).toBe(dmg[0] * 2);
    });

    it('a wrong or late answer costs a heart and breaks the chain', () => {
        let f = answer(newFight(12), true, 5000).fight;
        const w = answer(f, false, 5000);
        expect(w.fight.hearts).toBe(2);
        expect(w.fight.combo).toBe(0);
        expect(answer(f, true, null).strike).toBe('late');
    });

    it('five in a row raise a shield that blocks one strike', () => {
        let f = newFight(20);
        for (let i = 0; i < 5; i++) f = answer(f, true, 5000).fight;
        expect(f.shield).toBe(true);
        const b = answer(f, false, 4000);
        expect(b.strike).toBe('blocked');
        expect(b.fight.hearts).toBe(3);
        expect(b.fight.shield).toBe(false);
    });

    it('is won when the boss falls, lost when the hearts run out', () => {
        let f = newFight(4);
        while (!won(f)) f = answer(f, true, 1000).fight;
        expect(over(f, 99)).toBe(true);
        expect(fightScore(f)).toBeGreaterThan(500);
        let g = newFight(12);
        for (let i = 0; i < 3; i++) g = answer(g, false, 1000).fight;
        expect(lost(g)).toBe(true);
    });

    it('the live score starts at zero and the final one adds the hearts', () => {
        const f = newFight(12);
        expect(liveScore(f)).toBe(0);
        expect(fightScore(f)).toBe(150);
    });

    it('a perfect run kills the boss before the questions run out', () => {
        let f = newFight(12);
        let k = 0;
        while (!won(f) && k < 12) {
            f = answer(f, true, 8000).fight;
            k++;
        }
        expect(won(f)).toBe(true);
    });
});

const cards: GameCard[] = ['plan', 'brief', 'dense', 'eager', 'humble', 'cautious'].map((w, i) => ({ id: `c${i}`, word: w.toUpperCase(), translationHint: `nghĩa ${w}` }));

describe('letter grid', () => {
    it('knows which cells touch', () => {
        expect(neighbours(0).sort((a, b) => a - b)).toEqual([1, 4, 5]);
        expect(neighbours(5)).toHaveLength(8);
        expect(isStep(0, 5)).toBe(true);
        expect(isStep(0, 2)).toBe(false);
    });

    it('hides the words as paths that never share a cell', () => {
        let i = 0;
        const rand = () => ((i = (i * 5 + 3) % 17) + 1) / 18;
        const b = makeBoard(cards, 4, rand);
        expect(b.cells).toHaveLength(SIZE * SIZE);
        expect(b.placed.length).toBeGreaterThan(0);
        const cellsUsed = b.placed.flatMap((p) => p.path);
        expect(new Set(cellsUsed).size).toBe(cellsUsed.length);
        for (const p of b.placed) {
            expect(p.path.map((c) => b.cells[c]).join('')).toBe(p.word);
            for (let k = 1; k < p.path.length; k++) expect(isStep(p.path[k - 1], p.path[k])).toBe(true);
            expect(canTrace(b.cells, p.word)).toBe(true);
        }
    });

    it('matches a traced path to a placed word once', () => {
        const b = makeBoard(cards, 3, () => 0.4);
        const p = b.placed[0];
        expect(matchPlaced(b, p.path, new Set())?.word).toBe(p.word);
        expect(matchPlaced(b, p.path, new Set([p.word]))).toBeNull();
        expect(matchPlaced(b, p.path.slice(0, 2), new Set())).toBeNull();
    });

    it('longer words are worth much more', () => {
        expect(wordPoints('abcdef')).toBeGreaterThan(wordPoints('abc') * 3);
    });
});
