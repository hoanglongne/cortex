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

  it('the bad examples are caught as clichés or say nothing surprising', () => {
    const bad = examples('bad');
    expect(bad.length).toBe(3);
    expect(clicheHits(bad[0])).toEqual(
      expect.arrayContaining(['vãi', 'ông nội']),
    );
    expect(clicheHits(bad[2])).toEqual(expect.arrayContaining(['cười xỉu']));
  });
});

describe('clicheHits', () => {
  it('flags stale slang and stock openings, whole words only', () => {
    expect(clicheHits('Mấy cái buổi họp này BORING vãi.')).toEqual([
      'vãi',
      'mở đầu "mấy cái"',
    ]);
    expect(clicheHits('Đừng có COMPLAIN nữa.')).toEqual(['mở đầu "đừng có"']);
    // whole words only: "toàn" is not "toang"
    expect(
      clicheHits('Mưa xong đường toàn ổ gà, ai đi làm về cũng FRUSTRATED.'),
    ).toEqual([]);
    expect(
      clicheHits(
        'Kế hoạch sống FRUGAL của tôi kéo dài tới lúc có mã giảm giá.',
      ),
    ).toEqual([]);
  });
});

describe('angleFor', () => {
  it('rotates through every angle', () => {
    const seen = new Set(
      Array.from({ length: ANGLES.length }, (_, i) => angleFor(i, 3)),
    );
    expect(seen.size).toBe(ANGLES.length);
  });
});
