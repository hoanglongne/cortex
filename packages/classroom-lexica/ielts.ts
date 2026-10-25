/**
 * The verified vocabulary score (Lexica's adaptive test) on the IELTS scale,
 * shared by Lexica's result page and the teacher's forecasts. Always a range,
 * never one number: the score is an estimate.
 */

/** IELTS band on the score scale (the level table in Lexica's lib/levels.ts, one band per 200 points). */
export function ieltsBand(score: number): number {
    const points: [number, number][] = [
        [800, 4.5],
        [950, 5.5],
        [1150, 6.5],
        [1350, 7.5],
        [1500, 8.5],
    ];
    if (score <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x0, y0] = points[i - 1];
        if (score <= x1) return y0 + ((score - x0) / (x1 - x0)) * (y1 - y0);
    }
    return points[points.length - 1][1];
}

const half = (x: number) => Math.round(x * 2) / 2;

/** "6.0–6.5": the bands of a score range (or a score ± its spread). */
export function ieltsBetween(low: number, high: number): string {
    const lo = half(ieltsBand(low));
    const hi = Math.max(lo + 0.5, half(ieltsBand(high)));
    return `${lo.toFixed(1)}–${hi.toFixed(1)}`;
}

/** "IELTS khoảng 6.0–6.5" for a score and its spread. */
export const ieltsRange = (score: number, sd: number) => ieltsBetween(score - sd, score + sd);
