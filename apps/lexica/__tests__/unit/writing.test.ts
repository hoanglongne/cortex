import { describe, expect, it } from 'vitest';
import { changedShare, checkFormalRewrite, checkParagraph, checkTask1, passed, wordCount } from '../../app/lib/writing/checks';
import { chartFacts, makeChart, rng } from '../../app/lib/writing/chart';

describe('wordCount', () => {
    it('counts words and numbers, not punctuation', () => {
        expect(wordCount('The price rose to 45% in 2010, then fell.')).toBe(9);
        expect(wordCount('  ')).toBe(0);
    });
});

describe('changedShare', () => {
    it('is 0 for the same words and grows with changes', () => {
        expect(changedShare('a big dog', 'a big dog')).toBe(0);
        expect(changedShare('a big dog', 'a large dog')).toBeCloseTo(1 / 3);
    });
});

describe('checkFormalRewrite', () => {
    const original = 'There is a very big amount of food in the fridge.';
    const options = ['abundant supply', 'surplus'];
    it('passes a formal rewrite that uses an option', () => {
        const c = checkFormalRewrite({ original, rewrite: 'The refrigerator contains an abundant supply of food.', options });
        expect(passed(c)).toBe(c.length);
    });
    it('flags contractions, casual words and no option', () => {
        const c = checkFormalRewrite({ original, rewrite: "There's a really big pile of stuff in the fridge, okay.", options });
        const failed = c.filter((x) => !x.pass).map((x) => x.id);
        expect(failed).toEqual(expect.arrayContaining(['option', 'informal', 'contraction']));
    });
    it('needs a full sentence', () => {
        expect(checkFormalRewrite({ original, rewrite: 'Surplus food', options }).find((x) => x.id === 'length')?.pass).toBe(false);
    });
});

describe('checkParagraph', () => {
    const good = {
        idea: 'Learning a second language brings clear advantages to young people today.',
        explain: 'Because they can talk to more people, they build confidence and open more doors in their careers.',
        example: 'For example, a student who speaks English can join online courses from universities around the world.',
        wrap: 'Overall, a second language gives young people both skills and chances, so schools should teach it early.',
    };
    it('passes a framed paragraph', () => {
        const c = checkParagraph(good);
        expect(c.filter((x) => !x.pass).map((x) => x.id)).toEqual([]);
    });
    it('names the part that is too short', () => {
        const c = checkParagraph({ ...good, wrap: 'Good.' });
        expect(c.find((x) => x.id === 'parts')?.label).toMatch(/kết/);
    });
});

describe('charts', () => {
    it('are the same for the same seed and differ between seeds', () => {
        expect(makeChart(3)).toEqual(makeChart(3));
        expect(makeChart(3)).not.toEqual(makeChart(4));
    });
    it('have three lines of five points', () => {
        const c = makeChart(8);
        expect(c.series).toHaveLength(3);
        expect(c.series.every((s) => s.values.length === 5 && s.values.every((v) => v > 0))).toBe(true);
        expect(c.years).toHaveLength(5);
    });
    it('give a fact for every line and the top one', () => {
        const c = makeChart(5);
        expect(chartFacts(c)).toHaveLength(4);
    });
    it('rng is deterministic', () => {
        const a = rng(1);
        const b = rng(1);
        expect([a(), a()]).toEqual([b(), b()]);
    });
});

describe('checkTask1', () => {
    const chart = makeChart(2);
    const [a, b, c] = chart.series;
    const text =
        `The line graph shows ${chart.title.toLowerCase()}. Overall, ${a.name} rose while ${b.name} fell and ${c.name} remained stable. ` +
        `In ${chart.years[0]}, ${a.name} stood at ${a.values[0]}, whereas ${b.name} reached ${b.values[0]}. ` +
        `By ${chart.years[4]}, ${a.name} had climbed to ${a.values[4]}, higher than ${c.name} at ${c.values[4]}. ` +
        'This is a short filler sentence to pass the length check, which needs many words in total, so we keep writing about the chart here and there. ' +
        'The rest of the description compares the lines again and again so that the word count reaches the required number of words for the task as set. ' +
        'Finally, the figures show that the three lines moved in different directions across the whole period, and each one is described with care in this report. ' +
        'To sum up the details, the first line grew steadily, the second line declined after a short peak, and the third line changed very little from the first year to the last year, which is a pattern that readers can see quickly when they look at the picture above.';
    it('passes a good description', () => {
        const r = checkTask1(text, chart);
        expect(r.filter((x) => !x.pass).map((x) => x.id)).toEqual([]);
    });
    it('flags a short, opinionated text with no numbers', () => {
        const r = checkTask1('I think it is interesting.', chart);
        const failed = r.filter((x) => !x.pass).map((x) => x.id);
        expect(failed).toEqual(expect.arrayContaining(['length', 'overview', 'numbers', 'opinion']));
    });
});
