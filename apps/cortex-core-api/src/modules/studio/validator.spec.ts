import {
  matchesInflection,
  similarity,
  upperTokens,
  validateDraft,
  warnings,
  type ValidationContext,
} from './validator';

const ctx = (over: Partial<ValidationContext> = {}): ValidationContext => ({
  lexicon: new Set(['frugal', 'apply', 'stop', 'judge']),
  blocklist: [
    { pattern: 'chính trị', kind: 'topic' },
    { pattern: 'đm', kind: 'word' },
    { pattern: '\\bsơn tùng\\b', kind: 'regex' },
  ],
  existingScenarios: new Set(),
  sameWordScenarios: [],
  recentWords: new Set(),
  ...over,
});

const GOOD =
  'Cuối tháng sống FRUGAL tới mức ly trà đá cũng chia đôi với đứa bạn thân.';

describe('validateDraft', () => {
  it('passes a well-formed draft', () => {
    const r = validateDraft({ word: 'frugal', scenario: GOOD }, ctx());
    expect(r.ok).toBe(true);
    expect(warnings(r)).toEqual([]);
  });

  it('fails length on short or long scenarios', () => {
    expect(
      validateDraft({ word: 'frugal', scenario: 'Sống FRUGAL ghê.' }, ctx())
        .rules.length.pass,
    ).toBe(false);
    const long = `${GOOD} ${'rất dài '.repeat(20)}`;
    expect(validateDraft({ word: 'frugal', scenario: long }, ctx()).ok).toBe(
      false,
    );
  });

  it('requires exactly one upper-case target matching the word', () => {
    const two =
      'Cuối tháng sống FRUGAL tới mức STOP luôn việc uống trà đá với tụi bạn.';
    expect(
      validateDraft({ word: 'frugal', scenario: two }, ctx()).rules
        .single_target.pass,
    ).toBe(false);
    const wrong = GOOD.replace('FRUGAL', 'THRIFTY');
    expect(validateDraft({ word: 'frugal', scenario: wrong }, ctx()).ok).toBe(
      false,
    );
  });

  it('accepts regular inflections', () => {
    const s =
      'Ông bạn APPLIED cả chục chỗ mà vẫn chưa ai gọi lại, chắc do CV toàn ảnh sống ảo.';
    expect(
      validateDraft({ word: 'apply', scenario: s }, ctx()).rules.single_target
        .pass,
    ).toBe(true);
  });

  it('rejects words outside the lexicon', () => {
    expect(
      validateDraft(
        { word: 'thrifty', scenario: GOOD.replace('FRUGAL', 'THRIFTY') },
        ctx(),
      ).rules.in_lexicon.pass,
    ).toBe(false);
  });

  it('applies topic, whole-word and regex blocklist rules', () => {
    const topic =
      'Nói chuyện chính trị trên bàn nhậu là cách nhanh nhất để thấy ai cũng FRUGAL lời.';
    expect(
      validateDraft({ word: 'frugal', scenario: topic }, ctx()).rules.blocklist
        .pass,
    ).toBe(false);
    const word =
      'Đm sống FRUGAL tới mức ly trà đá cũng chia đôi với đứa bạn thân luôn.';
    expect(
      validateDraft({ word: 'frugal', scenario: word }, ctx()).rules.blocklist
        .pass,
    ).toBe(false);
    // "đm" inside another word is not a hit
    const inside =
      'Sống FRUGAL tới mức đi bộ cả buổi sáng thay vì gọi xe ôm về nhà làm việc.';
    expect(
      validateDraft({ word: 'frugal', scenario: inside }, ctx()).rules.blocklist
        .pass,
    ).toBe(true);
    const person =
      'Nghe nhạc Sơn Tùng cả ngày mà vẫn sống FRUGAL, không mua vé concert nào.';
    expect(
      validateDraft({ word: 'frugal', scenario: person }, ctx()).rules.blocklist
        .pass,
    ).toBe(false);
  });

  it('rejects exact duplicates and warns on near duplicates and fatigue', () => {
    const exact = validateDraft(
      { word: 'frugal', scenario: GOOD },
      ctx({ existingScenarios: new Set([GOOD.toLowerCase()]) }),
    );
    expect(exact.ok).toBe(false);

    const near = validateDraft(
      { word: 'frugal', scenario: GOOD },
      ctx({
        sameWordScenarios: [GOOD.replace('đứa bạn thân', 'thằng bạn thân')],
        recentWords: new Set(['frugal']),
      }),
    );
    expect(near.ok).toBe(true);
    expect(warnings(near).sort()).toEqual(['dup_near', 'word_fatigue']);
  });

  it('warns when the sentence is mostly English', () => {
    const en =
      'My boss is so FRUGAL that he splits the coffee bill with the whole team.';
    expect(
      warnings(validateDraft({ word: 'frugal', scenario: en }, ctx())),
    ).toContain('vi_ratio');
  });
});

describe('helpers', () => {
  it('finds upper-case tokens', () => {
    expect(upperTokens('Sống FRUGAL, ăn BÁNH mì A')).toEqual(['FRUGAL']);
  });

  it('matches inflections', () => {
    expect(matchesInflection('STOPPED', 'stop')).toBe(true);
    expect(matchesInflection('JUDGING', 'judge')).toBe(true);
    expect(matchesInflection('FRUGALLY', 'frugal')).toBe(true);
    expect(matchesInflection('STOPS', 'step')).toBe(false);
  });

  it('measures similarity', () => {
    expect(similarity(GOOD, GOOD)).toBe(1);
    expect(similarity(GOOD, 'hoàn toàn khác biệt')).toBeLessThan(0.2);
  });
});
