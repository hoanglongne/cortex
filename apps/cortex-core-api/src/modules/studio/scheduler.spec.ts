import { currentSlot } from './scheduler';

describe('currentSlot', () => {
  it('finds the latest slot today in Vietnam time', () => {
    // 2026-10-10 13:30 in Vietnam = 06:30 UTC
    const now = Date.parse('2026-10-10T06:30:00Z');
    expect(new Date(currentSlot(now, [6, 12, 18])!).toISOString()).toBe(
      '2026-10-10T05:00:00.000Z',
    );
  });

  it('returns null before the first slot of the day', () => {
    // 00:30 in Vietnam
    expect(currentSlot(Date.parse('2026-10-09T17:30:00Z'), [6])).toBeNull();
  });

  it('handles the VN date rolling over before UTC', () => {
    // 2026-10-11 01:10 in Vietnam = 2026-10-10 18:10 UTC
    const slot = currentSlot(Date.parse('2026-10-10T18:10:00Z'), [1]);
    expect(new Date(slot!).toISOString()).toBe('2026-10-10T18:00:00.000Z');
  });
});
