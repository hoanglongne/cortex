import { vnDay } from './card-stats.scheduler';

describe('card stats schedule', () => {
  it('reads the Vietnam day and hour', () => {
    expect(vnDay(Date.UTC(2026, 10, 1, 20, 30))).toEqual({
      day: '2026-11-02',
      hour: 3,
    });
    expect(vnDay(Date.UTC(2026, 10, 1, 19, 59))).toEqual({
      day: '2026-11-02',
      hour: 2,
    });
    expect(vnDay(Date.UTC(2026, 10, 1, 3, 0))).toEqual({
      day: '2026-11-01',
      hour: 10,
    });
  });
});
