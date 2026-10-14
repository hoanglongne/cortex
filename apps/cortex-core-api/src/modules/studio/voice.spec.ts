import { validateDraft } from './validator';
import {
  angleFor,
  ANGLES,
  clicheHits,
  SLANG,
  slangFor,
  VOICE_EXAMPLES,
} from './voice';

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

  it('the bad examples are caught as stuffed or trying too hard', () => {
    const bad = examples('bad');
    expect(bad.length).toBe(3);
    expect(clicheHits(bad[0])).toEqual([
      expect.stringMatching(/^nhồi \d slang$/),
    ]);
    expect(clicheHits(bad[2])).toEqual(
      expect.arrayContaining(['haha', 'cười xỉu', 'ai đọc cũng']),
    );
  });

  it('good examples actually use current slang', () => {
    const withSlang = examples('good').filter((s) =>
      SLANG.some((w) => s.toLowerCase().includes(w)),
    );
    expect(withSlang.length).toBe(examples('good').length);
  });
});

describe('clicheHits', () => {
  it('allows a little slang but flags stuffing and stock openings', () => {
    expect(
      clicheHits('Deadline dí sát nút mà sếp còn bắt họp, ét o ét thật sự.'),
    ).toEqual([]);
    expect(
      clicheHits('Ví FRUGAL tới mức ét o ét, u là trời, xu cà na thiệt.'),
    ).toEqual(['nhồi 3 slang']);
    expect(clicheHits('Mấy cái buổi họp này BORING ghê.')).toEqual([
      'mở đầu "mấy cái"',
    ]);
    expect(clicheHits('Đừng có COMPLAIN nữa.')).toEqual(['mở đầu "đừng có"']);
    // whole words only: "realtime" is not "real"
    expect(clicheHits('Group chat realtime mà ai cũng FRUSTRATED.')).toEqual(
      [],
    );
  });
});

describe('slangFor', () => {
  it('gives neighbouring slots different slang', () => {
    const a = slangFor(0, 5);
    const b = slangFor(1, 5);
    expect(a).toHaveLength(3);
    expect(a.some((w) => b.includes(w))).toBe(false);
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
