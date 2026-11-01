import {
  healthOf,
  MIN_ANSWERS,
  worstCards,
  type CardStatsRow,
} from './card-health';

const row = (over: Partial<CardStatsRow>): CardStatsRow => ({
  card_id: 'v1',
  quiz_answers: 0,
  quiz_correct: 0,
  quiz_median_ms: null,
  test_answers: 0,
  test_correct: 0,
  duel_answers: 0,
  duel_correct: 0,
  reports: 0,
  reasons: {},
  ...over,
});

describe('card health', () => {
  it('a rate needs enough answers', () => {
    expect(
      healthOf(row({ quiz_answers: MIN_ANSWERS - 1, quiz_correct: 0 })).rate,
    ).toBeNull();
    expect(
      healthOf(
        row({
          quiz_answers: 5,
          quiz_correct: 1,
          test_answers: 5,
          test_correct: 1,
        }),
      ).rate,
    ).toBeCloseTo(0.2);
  });

  it('flags a low rate and reports; leaves healthy cards out', () => {
    const low = row({ card_id: 'a', quiz_answers: 10, quiz_correct: 2 });
    const fine = row({ card_id: 'b', quiz_answers: 10, quiz_correct: 9 });
    const few = row({ card_id: 'c', quiz_answers: 3, quiz_correct: 0 });
    const reported = row({
      card_id: 'd',
      reports: 2,
      reasons: { wrong_meaning: 2 },
    });
    const list = worstCards([low, fine, few, reported]);
    expect(list.map((c) => c.card_id)).toEqual(['d', 'a']);
    expect(list[0].flags).toEqual(['reported']);
    expect(list[1].flags).toEqual(['low_rate']);
  });

  it('most reports first, then the lowest rate', () => {
    const list = worstCards([
      row({ card_id: 'a', quiz_answers: 10, quiz_correct: 4 }),
      row({ card_id: 'b', quiz_answers: 10, quiz_correct: 1 }),
      row({ card_id: 'c', reports: 1, quiz_answers: 10, quiz_correct: 9 }),
    ]);
    expect(list.map((c) => c.card_id)).toEqual(['c', 'b', 'a']);
    expect(worstCards(list, 1)).toHaveLength(1);
  });
});
