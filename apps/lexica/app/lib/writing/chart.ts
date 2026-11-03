/**
 * Charts for "Mô tả biểu đồ" (W4, issue #105), made by the program from a seed:
 * nothing is copied from an exam, so there is no copyright question, and the
 * same seed always gives the same chart. Pure, unit tested.
 */
import type { ChartData } from './checks';

/** Small seeded generator (mulberry32). */
export function rng(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a += 0x6d2b79f5;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

interface Topic {
    title: string;
    unit: string;
    names: [string, string, string];
    /** Typical size of the numbers */
    base: [number, number];
}

const TOPICS: Topic[] = [
    { title: 'Percentage of households with internet access', unit: '%', names: ['Country A', 'Country B', 'Country C'], base: [20, 85] },
    { title: 'Average weekly hours spent on social media by age group', unit: 'hours', names: ['Teenagers', 'Adults', 'Seniors'], base: [3, 22] },
    { title: 'Annual sales of three beverages in a café chain', unit: 'thousand cups', names: ['Coffee', 'Tea', 'Juice'], base: [40, 180] },
    { title: 'Share of energy from renewable sources', unit: '%', names: ['Norway', 'Germany', 'Japan'], base: [8, 70] },
    { title: 'Number of students enrolled in three university subjects', unit: 'hundreds', names: ['Engineering', 'Medicine', 'Arts'], base: [15, 90] },
    { title: 'Average monthly rainfall in three cities', unit: 'mm', names: ['Hanoi', 'Hue', 'Saigon'], base: [30, 260] },
];

/** The shape of each line: it rises, falls, stays about level or goes up and down. */
const SHAPES = ['rise', 'fall', 'level', 'wave'] as const;

export const CHART_COUNT = TOPICS.length * 12;

export function makeChart(seed: number): ChartData {
    const rand = rng(seed * 7919 + 13);
    const topic = TOPICS[seed % TOPICS.length];
    const step = rand() < 0.5 ? 5 : 10;
    // The last year is in the past (2010 to 2020), the first four steps before it
    const last = 2020 - Math.floor(rand() * 3) * 5;
    const years = Array.from({ length: 5 }, (_, i) => last - (4 - i) * step);
    const [lo, hi] = topic.base;
    const shapes = [...SHAPES].sort(() => rand() - 0.5).slice(0, 3);
    const decimals = hi <= 30 ? 1 : 0;
    const round = (v: number) => Number(v.toFixed(decimals));

    const series = topic.names.map((name, i) => {
        const startV = lo + rand() * (hi - lo) * 0.55;
        const span = (hi - lo) * (0.25 + rand() * 0.3);
        const shape = shapes[i];
        const values = years.map((_, k) => {
            const p = k / (years.length - 1);
            const noise = (rand() - 0.5) * (hi - lo) * 0.04;
            const move = shape === 'rise' ? span * p : shape === 'fall' ? -span * p : shape === 'level' ? 0 : span * 0.6 * Math.sin(p * Math.PI * 2);
            const from = shape === 'fall' ? startV + span : startV;
            return round(Math.min(hi * 1.05, Math.max(lo * 0.5, from + move + noise)));
        });
        return { name, values };
    });
    return { title: topic.title, unit: topic.unit, years, series };
}

/** Facts the learner can check their text against, shown after they have written. */
export function chartFacts(chart: ChartData): string[] {
    const facts: string[] = [];
    for (const s of chart.series) {
        const first = s.values[0];
        const last = s.values[s.values.length - 1];
        const diff = last - first;
        const rel = first === 0 ? 0 : Math.abs(diff) / first;
        const trend = rel < 0.08 ? 'stayed about level' : diff > 0 ? 'rose' : 'fell';
        facts.push(`${s.name} ${trend}: ${first} in ${chart.years[0]} to ${last} in ${chart.years[chart.years.length - 1]} (${chart.unit}).`);
    }
    const lastYear = chart.years.length - 1;
    const top = [...chart.series].sort((a, b) => b.values[lastYear] - a.values[lastYear])[0];
    facts.push(`In ${chart.years[lastYear]}, ${top.name} was the highest at ${top.values[lastYear]}.`);
    return facts;
}
