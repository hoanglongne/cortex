import { describe, expect, it } from 'vitest';
import { firstReview, intervalDays, retrievability, review } from '../../app/lib/learner/fsrs';
import { emptyLearner, evidenceFromChange, facetRecall, LOG_CAP, meanLogLoss, record, seedFromSm2, unlocked } from '../../app/lib/learner/model';

const DAY = 86_400_000;
const T0 = 1_800_000_000_000;

describe('FSRS', () => {
    it('recall is 90% after S days and falls with time', () => {
        const m = { s: 10, last: T0 };
        expect(retrievability(m, T0 + 10 * DAY)).toBeCloseTo(0.9, 5);
        expect(retrievability(m, T0)).toBe(1);
        expect(retrievability(m, T0 + 30 * DAY)).toBeLessThan(0.9);
        expect(intervalDays(10, 0.9)).toBeCloseTo(10, 5);
    });

    it('right answers grow stability, a lapse shrinks it', () => {
        let m = firstReview(3, T0);
        const s1 = m.s;
        m = review(m, 3, T0 + 3 * DAY);
        expect(m.s).toBeGreaterThan(s1);
        const lapsed = review(m, 1, T0 + 20 * DAY);
        expect(lapsed.s).toBeLessThan(m.s);
        expect(lapsed.lapses).toBe(1);
        expect(lapsed.d).toBeGreaterThan(m.d);
    });
});

describe('learner model', () => {
    it('weak evidence is logged but does not change memory', () => {
        let st = record(emptyLearner(), { cardId: 'v004', facet: 'recog', source: 'dial', outcome: 'seen', weight: 0.2, at: T0 });
        expect(st.log).toHaveLength(1);
        expect(st.memories.v004).toBeUndefined();
        st = record(st, { cardId: 'v004', facet: 'recog', source: 'review', outcome: 'right', weight: 1, at: T0 });
        expect(st.memories.v004?.recog?.reps).toBe(1);
    });

    it('caps the log', () => {
        let st = emptyLearner();
        for (let i = 0; i < LOG_CAP + 10; i++) st = record(st, { cardId: 'v004', facet: 'recog', source: 'dial', outcome: 'seen', weight: 0.2, at: T0 + i });
        expect(st.log).toHaveLength(LOG_CAP);
    });

    it('scores FSRS and SM-2 predictions on graded recognition answers', () => {
        let st = record(emptyLearner(), { cardId: 'v004', facet: 'recog', source: 'review', outcome: 'right', weight: 1, at: T0 });
        st = record(st, { cardId: 'v004', facet: 'recog', source: 'review', outcome: 'right', weight: 1, at: T0 + 2 * DAY }, { lastReviewedAt: T0, nextReviewAt: T0 + 3 * DAY });
        expect(st.metrics.fsrs.n).toBe(1);
        expect(st.metrics.sm2.n).toBe(1);
        expect(meanLogLoss(st.metrics.fsrs)).toBeNull();
        expect(meanLogLoss(st.metrics.fsrs, 1)).toBeGreaterThan(0);
    });

    it('seeds recognition from the SM-2 schedule, once', () => {
        const st = seedFromSm2(emptyLearner(), { v004: { lastReviewedAt: T0, nextReviewAt: T0 + 6 * DAY, reviewCount: 3, wrongCount: 1 } });
        expect(st.memories.v004?.recog?.s).toBeCloseTo(6);
        expect(seedFromSm2(st, { v004: { lastReviewedAt: T0, nextReviewAt: T0 + 6 * DAY, reviewCount: 3, wrongCount: 1 } })).toBe(st);
        expect(facetRecall(st, 'v004', T0 + 6 * DAY).recog).toBeCloseTo(0.9, 5);
    });

    it('a facet unlocks only when the one before it holds for a week', () => {
        expect(unlocked(undefined, 'recog', T0)).toBe(true);
        expect(unlocked({ recog: { s: 2, d: 5, last: T0, reps: 1, lapses: 0 } }, 'recall', T0)).toBe(false);
        expect(unlocked({ recog: { s: 60, d: 5, last: T0, reps: 4, lapses: 0 } }, 'recall', T0)).toBe(true);
    });

    it('reads evidence from store changes', () => {
        const base = { cardProgress: {}, spokenAt: {}, speakMisses: {}, mySentences: {}, journeys: {} };
        const next = {
            cardProgress: { v004: { reviewCount: 1, wrongCount: 0, lastReviewedAt: T0, nextReviewAt: T0 + DAY } },
            spokenAt: { v005: T0 },
            speakMisses: { v005: 1 },
            mySentences: { v006: { text: 'x' } },
            journeys: { v007: { livedAt: T0 } },
        };
        const found = evidenceFromChange(base, next, T0).map(({ e }) => `${e.cardId}:${e.facet}:${e.outcome}`);
        expect(found).toEqual(['v004:recog:right', 'v005:produce:wrong', 'v006:produce:right', 'v007:wild:right']);
    });
});

describe('learner model in the store', () => {
    it('records a review answer and a dial tap as evidence', async () => {
        const { useLexicaStore } = await import('../../app/store/lexicaStore');
        useLexicaStore.setState({ learner: emptyLearner(), cardProgress: {}, queuedCardIds: [], currentDeck: [] });
        useLexicaStore.setState({ cardProgress: { v004: { cardId: 'v004', state: 'seed', lastReviewedAt: Date.now(), nextReviewAt: Date.now() + DAY, reviewCount: 1, wrongCount: 0 } } });
        expect(useLexicaStore.getState().learner.memories.v004?.recog?.reps).toBe(1);
        useLexicaStore.getState().dialTap('v004');
        const log = useLexicaStore.getState().learner.log;
        expect(log[log.length - 1].slice(0, 4)).toEqual(['v004', 0, 'dial', 'wrong']);
    });
});
