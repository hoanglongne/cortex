import { BadRequestException } from '@nestjs/common';
import { sanitizeEvents } from './content.controller';

describe('sanitizeEvents', () => {
  it('keeps valid Studio card events only', () => {
    expect(
      sanitizeEvents({
        events: [
          { cardId: 't0k9xa', kind: 'known', dwellMs: 1234.6 },
          { cardId: 'v001', kind: 'known' },
          { cardId: 't1', kind: 'hack' },
          { cardId: 't2', kind: 'report', dwellMs: 'x' },
          null,
        ],
      }),
    ).toEqual([
      { cardId: 't0k9xa', kind: 'known', dwellMs: 1235 },
      { cardId: 't2', kind: 'report' },
    ]);
  });

  it('caps the batch and rejects bad bodies', () => {
    const many = Array.from({ length: 150 }, () => ({
      cardId: 't1',
      kind: 'impression',
    }));
    expect(sanitizeEvents({ events: many })).toHaveLength(100);
    expect(() => sanitizeEvents({})).toThrow(BadRequestException);
  });
});
