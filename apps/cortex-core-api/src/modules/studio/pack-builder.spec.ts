import {
  buildDropPack,
  buildLibraryPack,
  newCardId,
  packPath,
  sha256,
} from './pack-builder';
import type { CardRow } from './studio.types';

const card = (id: string, over: Partial<CardRow> = {}): CardRow => ({
  id,
  draft_id: null,
  word: 'frugal',
  ipa: 'ˈfruːɡəl',
  elo: 1000,
  level: 'intermediate',
  scenario: 'Cuối tháng sống FRUGAL.',
  translation_hint: 'Tiết kiệm',
  trend_label: 'lương chưa về',
  tags: [],
  lifecycle: 'trend',
  revision: 1,
  created_at: '2026-10-01T00:00:00Z',
  ...over,
});

describe('pack builder', () => {
  it('builds a drop pack in the Lexica card shape', () => {
    const pack = buildDropPack(
      {
        id: 'drop-1',
        title: 'Tuần lương chưa về',
        expires_at: '2026-11-01T00:00:00Z',
      },
      [
        card('t1'),
        card('t2', { lifecycle: 'evergreen' }),
        card('t3', { lifecycle: 'retired' }),
      ],
      '2026-10-19T00:00:00Z',
    );
    expect(pack.schema).toBe(1);
    expect(pack.cards.map((c) => c.id)).toEqual(['t1', 't2']);
    expect(pack.cards[0]).toEqual({
      id: 't1',
      word: 'FRUGAL',
      ipa: 'ˈfruːɡəl',
      elo: 1000,
      level: 'intermediate',
      scenario: 'Cuối tháng sống FRUGAL.',
      translationHint: 'Tiết kiệm',
      revision: 1,
      trend: {
        label: 'lương chưa về',
        dropId: 'drop-1',
        expiresAt: '2026-11-01T00:00:00Z',
      },
    });
    // evergreen cards never expire
    expect(pack.cards[1].trend?.expiresAt).toBeUndefined();
  });

  it('marks past trend cards expired in the library, keeps evergreen dealable', () => {
    const pack = buildLibraryPack(
      [card('t1'), card('t2', { lifecycle: 'evergreen' })],
      '2026-10-19T00:00:00Z',
      '2026-10-19T00:00:00Z',
    );
    expect(pack.cards[0].trend?.expiresAt).toBe('2026-10-19T00:00:00Z');
    expect(pack.cards[1].trend?.expiresAt).toBeUndefined();
    expect(pack.cards[0].trend?.dropId).toBeUndefined();
  });

  it('makes ids that never collide with core cards', () => {
    const id = newCardId(() => Buffer.from([1, 2, 3, 4, 5]));
    expect(id).toMatch(/^t[0-9a-z]{7}$/);
    expect(newCardId()).not.toMatch(/^v/);
  });

  it('names pack files by content hash', () => {
    const h = sha256('abc');
    expect(h).toHaveLength(64);
    expect(packPath('drop-1', h)).toBe(`packs/drop-1.${h.slice(0, 12)}.json`);
  });
});
