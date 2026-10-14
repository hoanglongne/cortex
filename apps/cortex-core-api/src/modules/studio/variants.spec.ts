import {
  buildVariantsFile,
  buildVariantsPrompt,
  checkVariant,
  parseVariants,
  variantsPath,
  type SourceCard,
} from './variants';

const card: SourceCard = {
  id: 'v001',
  word: 'abundant',
  scenario:
    'Lương chưa về mà bill thì ABUNDANT vãi, nhìn cái app ngân hàng mà muốn trầm cảm.',
  translation_hint: 'Dư thừa, nhiều hơn cần thiết',
};

describe('buildVariantsPrompt', () => {
  it('lists every card with its word, meaning and original sentence', () => {
    const p = buildVariantsPrompt([card]);
    expect(p).toContain('id=v001');
    expect(p).toContain('ABUNDANT');
    expect(p).toContain('Dư thừa');
    expect(p).toContain('tech');
    expect(p).toContain('business');
    expect(p).toContain('student');
  });
});

describe('parseVariants', () => {
  it('keeps the three archetypes of cards that were asked about', () => {
    const out = parseVariants(
      {
        variants: [
          { card_id: 'v001', tech: 'a', business: 'b', student: 'c' },
          { card_id: 'v999', tech: 'x' },
          { card_id: 'v001', casual: 'ignored' },
        ],
      },
      new Set(['v001']),
    );
    expect(out.map((v) => v.archetype)).toEqual([
      'tech',
      'business',
      'student',
    ]);
    expect(out.every((v) => v.card_id === 'v001')).toBe(true);
  });

  it('throws on output without a variants array', () => {
    expect(() => parseVariants({ drafts: [] }, new Set())).toThrow();
  });
});

describe('checkVariant', () => {
  it('passes a good sentence', () => {
    expect(
      checkVariant(
        {
          scenario:
            'Server dev thì log ABUNDANT tới mức đọc cả ngày không hết, còn bug thật thì trốn kỹ.',
        },
        card,
        [],
        [card.scenario],
      ),
    ).toEqual([]);
  });

  it('rejects a sentence without the target word in capitals', () => {
    expect(
      checkVariant(
        {
          scenario:
            'Deadline thì nhiều vô kể, sếp thì giao thêm việc mỗi ngày.',
        },
        card,
        [],
        [card.scenario],
      ),
    ).toContain('single_target');
  });

  it('rejects a copy of the original and blocked words', () => {
    expect(
      checkVariant({ scenario: card.scenario }, card, [], [card.scenario]),
    ).toContain('dup_exact');
    expect(
      checkVariant(
        {
          scenario:
            'Hội chính trị bàn chuyện ABUNDANT ngân sách mà chẳng ai hiểu gì.',
        },
        card,
        [{ pattern: 'chính trị', kind: 'topic' }],
        [card.scenario],
      ),
    ).toContain('blocklist');
  });
});

describe('buildVariantsFile', () => {
  it('groups approved variants by card', () => {
    const file = buildVariantsFile(
      [
        { card_id: 'v002', archetype: 'tech', scenario: 'b' },
        { card_id: 'v001', archetype: 'student', scenario: 'a' },
        { card_id: 'v001', archetype: 'tech', scenario: 'c' },
      ],
      '2026-10-14T00:00:00.000Z',
    );
    expect(file.variants).toEqual({
      v001: { student: 'a', tech: 'c' },
      v002: { tech: 'b' },
    });
    expect(Object.keys(file.variants)).toEqual(['v001', 'v002']);
  });

  it('names the file by its content hash', () => {
    const a = variantsPath('{"x":1}');
    expect(a.path).toMatch(/^packs\/variants\.[0-9a-f]{12}\.json$/);
    expect(a.path).not.toBe(variantsPath('{"x":2}').path);
  });
});
