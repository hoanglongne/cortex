/**
 * How an answer feels in review (issue #146): a short tone and a light buzz.
 * Right answers in a row climb a semitone each and buzz a little longer, so
 * a run of correct answers feels like it is building. Pure, unit tested.
 */
export interface Feel {
    /** 'combo' plays a tone climbing with the run; 'wrong' a soft low tone. */
    sound: 'combo' | 'wrong';
    /** Value passed to the combo tone (its pitch rises from 3). */
    combo: number;
    /** Vibration in ms. */
    buzz: number;
}

export function feelFor(correct: boolean, streak: number): Feel {
    if (!correct) return { sound: 'wrong', combo: 0, buzz: 6 };
    // streak is the run including this answer: 1, 2, 3…
    return { sound: 'combo', combo: streak + 2, buzz: Math.min(10 + (streak - 1) * 4, 30) };
}
