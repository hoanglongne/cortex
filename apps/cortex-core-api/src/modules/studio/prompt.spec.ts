import {
  buildPrompt,
  parseDrafts,
  pickCandidates,
  PROMPT_VERSION,
} from './prompt';

describe('prompt', () => {
  const trend = {
    label: 'lương chưa về',
    summary: 'than nghèo cuối tháng',
    tags: ['money'],
  };

  it('lists candidates when no words are forced', () => {
    const p = buildPrompt({
      trend,
      candidates: [{ word: 'frugal', level: 'intermediate' }],
      forcedWords: [],
      wordsPerTrend: 3,
      sentencesPerWord: 3,
    });
    expect(p).toContain('- frugal (intermediate)');
    expect(p).toContain('lương chưa về');
    expect(PROMPT_VERSION).toBe('generate.v1');
  });

  it('uses forced words verbatim', () => {
    const p = buildPrompt({
      trend,
      candidates: [],
      forcedWords: ['frugal', 'deficit'],
      wordsPerTrend: 3,
      sentencesPerWord: 3,
    });
    expect(p).toContain('Dùng ĐÚNG các từ sau: frugal, deficit.');
  });

  it('parses drafts and drops malformed entries', () => {
    const drafts = parseDrafts({
      drafts: [
        {
          word: ' Frugal ',
          scenario: 'x FRUGAL y',
          translation_hint: 'tiết kiệm',
          archetype: 'casual',
          tone: 'than thở',
        },
        { word: 'deficit', scenario: '' },
        {
          word: 'deficit',
          scenario: 'a DEFICIT b',
          translation_hint: 'thâm hụt',
          archetype: 'alien',
        },
      ],
    });
    expect(drafts).toHaveLength(2);
    expect(drafts[0].word).toBe('frugal');
    expect(drafts[1].archetype).toBeNull();
  });

  it('throws when nothing is usable', () => {
    expect(() => parseDrafts({})).toThrow();
    expect(() => parseDrafts({ drafts: [{}] })).toThrow();
  });

  it('spreads candidates across levels', () => {
    const lex = [
      ...Array.from({ length: 10 }, (_, i) => ({
        word: `b${i}`,
        level: 'beginner' as const,
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        word: `e${i}`,
        level: 'expert' as const,
      })),
    ];
    const picked = pickCandidates(lex, 6, () => 0);
    expect(picked.filter((p) => p.level === 'beginner')).toHaveLength(3);
    expect(new Set(picked.map((p) => p.word)).size).toBe(6);
  });
});
