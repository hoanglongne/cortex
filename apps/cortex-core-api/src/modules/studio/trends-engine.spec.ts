import { clusterSignals, hotness, isUsefulPhrase } from './trends-engine';

const sig = (
  id: number,
  phrase: string,
  source = 'news_rss',
  seen = '2026-10-10T00:00:00Z',
) => ({
  id,
  source_id: source,
  phrase,
  metric: 0.8,
  seen_at: seen,
});

describe('clusterSignals', () => {
  it('attaches to a similar live trend and groups new phrases', () => {
    const plan = clusterSignals(
      [
        sig(1, 'Lịch nghỉ Tết 2027 chính thức'),
        sig(2, 'săn deal 10.10 vỡ ví'),
        sig(3, 'săn deal 10.10 bị vỡ ví', 'google_trends_vn'),
        sig(4, '2027'),
      ],
      [{ id: 't1', label: 'lịch nghỉ tết 2027' }],
    );
    expect(plan.attach).toEqual([{ trendId: 't1', signalIds: [1] }]);
    expect(plan.create).toEqual([
      { label: 'săn deal 10.10 vỡ ví', signalIds: [2, 3] },
    ]);
  });

  it('filters noise', () => {
    expect(isUsefulPhrase('2027')).toBe(false);
    expect(isUsefulPhrase('giá vàng')).toBe(true);
  });
});

describe('hotness', () => {
  const now = Date.parse('2026-10-10T12:00:00Z');
  const base = {
    firstSeenAt: '2026-10-10T00:00:00Z',
    sourceWeights: { news_rss: 0.6, google_trends_vn: 1 },
    feedbackBoost: 1,
    now,
  };

  it('rewards more signals, more sources and recency', () => {
    const one = hotness({ ...base, signals: [sig(1, 'x')] });
    const two = hotness({
      ...base,
      signals: [sig(1, 'x'), sig(2, 'x', 'google_trends_vn')],
    });
    expect(two).toBeGreaterThan(one);
    const old = hotness({
      ...base,
      firstSeenAt: '2026-09-30T00:00:00Z',
      signals: [sig(1, 'x')],
    });
    expect(old).toBeLessThan(one / 3);
    expect(hotness({ ...base, signals: [] })).toBe(0);
  });

  it('applies the feedback boost', () => {
    const plain = hotness({ ...base, signals: [sig(1, 'x')] });
    expect(
      hotness({ ...base, feedbackBoost: 1.2, signals: [sig(1, 'x')] }),
    ).toBeCloseTo(plain * 1.2);
  });
});
