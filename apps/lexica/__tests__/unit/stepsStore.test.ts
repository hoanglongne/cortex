import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { useLexicaStore } from '../../app/store/lexicaStore';
import { stepOf } from '../../app/lib/journey/steps';

beforeEach(() => {
    localStorage.clear();
    useLexicaStore.setState({ cardProgress: {}, learnedWords: new Set(), journeys: {}, stepHistory: {}, currentDeck: [], speakMisses: {} });
});
afterEach(() => vi.useRealTimers());

describe('store: four steps', () => {
    it('moves a word from Hiểu to Dùng through swipe, review, reading and speaking', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 1, 9));
        const s = () => useLexicaStore.getState();
        s().swipeCard('v001', 'right');
        expect(stepOf(s().journeys.v001)).toBe('hieu');

        vi.setSystemTime(new Date(2026, 9, 2, 9));
        s().submitReviewAnswer('v001', true);
        vi.setSystemTime(new Date(2026, 9, 6, 9));
        s().submitReviewAnswer('v001', true);
        expect(stepOf(s().journeys.v001)).toBe('nho');

        s().markMet(['v001', 'v999']);
        expect(stepOf(s().journeys.v001)).toBe('gap');
        expect(s().journeys.v999).toBeUndefined();

        s().recordSpeak('v001', 'close');
        expect(stepOf(s().journeys.v001)).toBe('gap');
        s().recordSpeak('v001', 'clear');
        expect(stepOf(s().journeys.v001)).toBe('dung');
        expect(s().stepHistory['2026-10-06']).toEqual({ hieu: 1, nho: 1, gap: 1, dung: 1 });

        s().submitReviewAnswer('v001', false);
        expect(stepOf(s().journeys.v001)).toBe('hieu');
    });

    it('a word swiped "Chưa nhớ" the first time is not Hiểu yet', () => {
        useLexicaStore.getState().swipeCard('v002', 'left');
        expect(useLexicaStore.getState().journeys.v002).toBeUndefined();
    });

    it('a word known on sight counts as Nhớ', () => {
        useLexicaStore.getState().markAsMastered('v003');
        expect(stepOf(useLexicaStore.getState().journeys.v003)).toBe('nho');
    });
});
