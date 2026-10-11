import {
  boostFor,
  decideLifecycle,
  feedbackBoosts,
  type CardMetrics,
} from './feedback';

const m = (over: Partial<CardMetrics> = {}): CardMetrics => ({
  card_id: 't1',
  impressions: 0,
  reveals: 0,
  known: 0,
  unknown: 0,
  shares: 0,
  reports: 0,
  review_correct: 0,
  review_wrong: 0,
  ...over,
});
const card = (over = {}) => ({
  id: 't1',
  lifecycle: 'trend' as const,
  flags: [] as string[],
  dropExpired: false,
  ...over,
});

describe('decideLifecycle', () => {
  it('promotes shared or well-remembered cards', () => {
    expect(
      decideLifecycle(card(), m({ impressions: 300, shares: 9 }))?.lifecycle,
    ).toBe('evergreen');
    expect(
      decideLifecycle(
        card(),
        m({ impressions: 300, review_correct: 18, review_wrong: 6 }),
      )?.lifecycle,
    ).toBe('evergreen');
    expect(
      decideLifecycle(card(), m({ impressions: 100, shares: 9 })),
    ).toBeNull();
  });

  it('retires trend cards after their drop expires', () => {
    expect(decideLifecycle(card({ dropExpired: true }), m())?.lifecycle).toBe(
      'retired',
    );
    expect(
      decideLifecycle(card({ dropExpired: true, lifecycle: 'evergreen' }), m()),
    ).toBeNull();
  });

  it('hides reported cards, even evergreen ones', () => {
    const d = decideLifecycle(
      card({ lifecycle: 'evergreen' }),
      m({ reports: 3 }),
    );
    expect(d).toEqual({
      cardId: 't1',
      lifecycle: 'retired',
      addFlags: ['reported'],
    });
    expect(
      decideLifecycle(
        card({ lifecycle: 'retired', flags: ['reported'] }),
        m({ reports: 4 }),
      ),
    ).toBeNull();
  });

  it('flags cards nobody knows', () => {
    expect(
      decideLifecycle(card(), m({ known: 20, unknown: 290 }))?.addFlags,
    ).toEqual(['too_hard']);
  });
});

describe('feedbackBoosts', () => {
  it('scores tags against the average and clamps', () => {
    const boosts = feedbackBoosts([
      { tags: ['money'], metrics: m({ impressions: 100, shares: 10 }) },
      { tags: ['work'], metrics: m({ impressions: 100, shares: 0 }) },
    ]);
    expect(boosts.money).toBe(1.2);
    expect(boosts.work).toBe(0.8);
    expect(boostFor(['money', 'work'], boosts)).toBeCloseTo(1);
    expect(boostFor(['other'], boosts)).toBe(1);
    expect(feedbackBoosts([])).toEqual({});
  });
});
