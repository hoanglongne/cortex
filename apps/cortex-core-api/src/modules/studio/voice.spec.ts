import { validateDraft } from './validator';
import { angleFor, ANGLES, clicheHits, VOICE_EXAMPLES } from './voice';

const ctx = (word: string) => ({
  lexicon: new Set([word]),
  blocklist: [],
  existingScenarios: new Set<string>(),
  sameWordScenarios: [],
  recentWords: new Set<string>(),
});

/** "- [angle] sentence" lines from the good / bad halves of the examples. */
function examples(kind: 'good' | 'bad'): string[] {
  const [good, bad] = VOICE_EXAMPLES.split('Câu DỞ');
  const lines = (kind === 'good' ? good : bad).split('\n');
  return lines
    .map((l) =>
      kind === 'good'
        ? /^- \[[^\]]+\] (.+)$/.exec(l)?.[1]
        : /^- "(.+)" →/.exec(l)?.[1],
    )
    .filter((s): s is string => !!s);
}

const targetOf = (s: string) => /\b([A-Z]{4,})\b/.exec(s)![1].toLowerCase();

describe('voice examples', () => {
  it('every good example passes the draft rules and has no clichés', () => {
    const good = examples('good');
    expect(good.length).toBeGreaterThanOrEqual(5);
    for (const s of good) {
      const report = validateDraft(
        { word: targetOf(s), scenario: s },
        ctx(targetOf(s)),
      );
      expect({ s, ok: report.ok, cliche: report.rules.cliche?.pass }).toEqual({
        s,
        ok: true,
        cliche: true,
      });
    }
  });

  it('the bad examples are caught as clichés', () => {
    const bad = examples('bad');
    expect(bad.length).toBe(3);
    expect(clicheHits(bad[0])).toEqual(
      expect.arrayContaining(['vãi', 'ông nội']),
    );
    expect(clicheHits(bad[2])).toEqual(
      expect.arrayContaining(['haha', 'cười xỉu', 'ai đọc cũng']),
    );
  });
});

describe('clicheHits', () => {
  it('flags jokey or preachy phrases and stock openings, whole words only', () => {
    expect(clicheHits('Deadline dí sát nút, việc này vãi thật.')).toEqual([
      'vãi',
    ]);
    expect(clicheHits('Mấy cái buổi họp này dài ghê.')).toEqual([
      'mở đầu "mấy cái"',
    ]);
    expect(clicheHits('Đừng có bỏ bữa sáng nữa.')).toEqual([
      'mở đầu "đừng có"',
    ]);
    expect(clicheHits('Cuối tuần tôi đi chợ mua rau và trái cây.')).toEqual([]);
    // whole words only: "toàn" is not "toang"
    expect(clicheHits('Đường toàn ổ gà sau cơn mưa lớn.')).toEqual([]);
  });
});

describe('angleFor', () => {
  it('rotates through every situation angle', () => {
    const seen = new Set(
      Array.from({ length: ANGLES.length }, (_, i) => angleFor(i, 3)),
    );
    expect(seen.size).toBe(ANGLES.length);
  });
});
