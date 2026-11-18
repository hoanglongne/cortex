/**
 * How a word card looks (issue #146, đợt 2): a colour per topic, and the
 * tilt and light that follow the finger. Pure, unit tested.
 */
import type { TopicId } from './collection';

/** One hue per topic, used for the card's band and glow. */
export const TOPIC_COLOR: Record<TopicId, string> = {
    money: '#E0B341',
    work: '#5B8DEF',
    love: '#EF6F8E',
    study: '#9B7BEA',
    social: '#3FC1C9',
    food: '#F08A4B',
    people: '#7BC67E',
    life: '#A3A9B3',
};

export interface Tilt {
    /** Degrees around the horizontal axis (finger at the top tips the top away). */
    rx: number;
    /** Degrees around the vertical axis. */
    ry: number;
    /** Where the light sits, 0–100 % across and down. */
    gx: number;
    gy: number;
}

export const FLAT: Tilt = { rx: 0, ry: 0, gx: 50, gy: 50 };

/** Tilt for a finger at (x, y) inside a card of size w × h, at most `max` degrees. */
export function tiltAt(x: number, y: number, w: number, h: number, max = 12): Tilt {
    if (w <= 0 || h <= 0) return FLAT;
    const u = Math.min(1, Math.max(0, x / w));
    const v = Math.min(1, Math.max(0, y / h));
    const r = (n: number) => Math.round(n * 10) / 10;
    return { rx: r((0.5 - v) * 2 * max), ry: r((u - 0.5) * 2 * max), gx: r(u * 100), gy: r(v * 100) };
}
