import type { Ratings } from '@/types';
import { BAND_DESCRIPTORS } from './constants';

/**
 * Compute the overall IELTS band score from 4 criterion ratings.
 * Average → round to nearest 0.5.
 */
export function computeBandScore(ratings: Ratings): number {
    const values = [
        ratings.fluency,
        ratings.lexical,
        ratings.grammar,
        ratings.pronunciation,
    ];

    const valid = values.filter((v): v is number => v !== null);
    if (valid.length === 0) return 0;

    const avg = valid.reduce((sum, v) => sum + v, 0) / valid.length;
    return Math.round(avg * 2) / 2; // round to nearest 0.5
}

/**
 * Get the IELTS band descriptor label for a given score.
 */
export function getBandDescriptor(score: number): string {
    const key = score.toFixed(1);
    return BAND_DESCRIPTORS[key] ?? 'Unknown';
}
