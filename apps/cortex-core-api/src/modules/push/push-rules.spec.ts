import {
  asksPayload,
  clockVn,
  datePayload,
  giftsPayload,
  groupBy,
  isQuietHour,
} from './push-rules';

const vn = (h: number, m = 0) => Date.UTC(2026, 10, 1, h - 7, m);

describe('push rules', () => {
  it('quiet hours are 22:00 to 08:00 in Vietnam', () => {
    expect(isQuietHour(vn(21, 59))).toBe(false);
    expect(isQuietHour(vn(22))).toBe(true);
    expect(isQuietHour(vn(3))).toBe(true);
    expect(isQuietHour(vn(7, 59))).toBe(true);
    expect(isQuietHour(vn(8))).toBe(false);
  });

  it('the clock is Vietnam time', () => {
    expect(clockVn(new Date(vn(20, 30)).toISOString())).toBe('20:30');
    expect(clockVn(Date.UTC(2026, 10, 1, 17, 5))).toBe('00:05');
  });

  it('words for a date, gifts and questions', () => {
    expect(
      datePayload('d1', 'Hà', new Date(vn(20, 30)).toISOString()),
    ).toMatchObject({ tag: 'date-d1', url: '/buddy' });
    expect(
      datePayload('d1', 'Hà', new Date(vn(20, 30)).toISOString()).body,
    ).toBe('Hà hẹn học cùng lúc 20:30. Vào học nhé.');
    expect(giftsPayload(['Hà']).body).toBe(
      'Hà tặng bạn một từ. Mở ra xem nhé.',
    );
    expect(giftsPayload(['Hà', 'Hà', 'Lan']).body).toBe(
      'Hà và 1 bạn khác tặng bạn 3 từ. Mở ra xem nhé.',
    );
    expect(giftsPayload([null]).body).toContain('Bạn học');
    expect(asksPayload(['Lan']).body).toBe(
      'Lan nhờ bạn đặt một câu với một từ.',
    );
  });

  it('groups by key', () => {
    const g = groupBy(
      [
        { k: 'a', v: 1 },
        { k: 'b', v: 2 },
        { k: 'a', v: 3 },
      ],
      (x) => x.k,
    );
    expect(g.get('a')?.map((x) => x.v)).toEqual([1, 3]);
    expect(g.get('b')).toHaveLength(1);
  });
});
