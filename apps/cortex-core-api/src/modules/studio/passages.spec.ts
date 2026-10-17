import { fakeDb, type Call } from './__testkit__/fake-db';
import {
  buildPassagePrompt,
  buildPassagesFile,
  checkPassage,
  deckWordsIn,
  parsePassageReply,
  pickNewWords,
  publishedId,
  wordCount,
  type PassageRow,
} from './passages';
import { PassagesService } from './passages.service';
import type { StudioLlm } from './studio-llm';
import type { StudioService } from './studio.service';

const cards = [
  {
    id: 'v001',
    word: 'ABUNDANT',
    level: 'beginner',
    translation_hint: 'dồi dào',
  },
  {
    id: 'v002',
    word: 'COGNITIVE',
    level: 'beginner',
    translation_hint: 'nhận thức',
  },
  {
    id: 'v003',
    word: 'DILEMMA',
    level: 'beginner',
    translation_hint: 'khó xử',
  },
  {
    id: 'v004',
    word: 'FEASIBLE',
    level: 'beginner',
    translation_hint: 'khả thi',
  },
  {
    id: 'v005',
    word: 'INEVITABLE',
    level: 'beginner',
    translation_hint: 'không tránh được',
  },
  { id: 'v009', word: 'ABUNDANT', level: 'beginner', translation_hint: 'dup' },
  {
    id: 'v100',
    word: 'UBIQUITOUS',
    level: 'intermediate',
    translation_hint: 'khắp nơi',
  },
  {
    id: 'tabc',
    word: 'VIRAL',
    level: 'beginner',
    translation_hint: 'lan truyền',
  },
];

/** A 140-word passage that uses the words given. */
function textWith(words: string[]): string {
  const filler =
    'Every morning the small team met in the kitchen to plan the day and share a pot of tea before the calls began. ';
  return `${words.map((w) => `The ${w.toLowerCase()} part mattered.`).join(' ')}\n\n${filler.repeat(6)}`.trim();
}

describe('pickNewWords', () => {
  it('takes cards of the level, least used first, core before Studio, one per word', () => {
    const used = new Map([['v001', 2]]);
    const out = pickNewWords(cards, used, 'beginner', 4, 1).map((c) => c.id);
    expect(out).toHaveLength(4);
    expect(out).not.toContain('v001'); // used twice already
    expect(out).not.toContain('v009'); // same word as v001
    expect(out).not.toContain('v100'); // other level
    expect(out).not.toContain('tabc'); // core cards first
  });
});

describe('checkPassage', () => {
  it('passes a passage of the right length that uses every new word', () => {
    const text = textWith(['abundant', 'dilemmas', 'feasible']);
    expect(wordCount(text)).toBeGreaterThanOrEqual(120);
    expect(
      checkPassage(
        { title: 'T', text, translation: 'x'.repeat(text.length) },
        ['ABUNDANT', 'DILEMMA', 'FEASIBLE'],
        [],
      ),
    ).toEqual([]);
  });

  it('names missing words, short texts and missing translations', () => {
    const failed = checkPassage(
      { title: 'T', text: 'The abundant part.', translation: '' },
      ['ABUNDANT', 'COGNITIVE'],
      [],
    );
    expect(failed).toEqual(
      expect.arrayContaining(['length', 'missing:COGNITIVE', 'translation']),
    );
  });
});

describe('parsePassageReply', () => {
  it('keeps title, text, translation and up to two valid questions', () => {
    const d = parsePassageReply({
      title: ' Tiêu đề ',
      text: 'Text',
      translation: 'Bản dịch',
      questions: [
        { question: 'Q1', options: ['a', 'b'], answer: 1 },
        { question: 'Q2', options: ['a'], answer: 0 },
        { question: 'Q3', options: ['a', 'b', 'c'], answer: 2 },
        { question: 'Q4', options: ['a', 'b'], answer: 0 },
      ],
    })!;
    expect(d.title).toBe('Tiêu đề');
    expect(d.questions.map((q) => q.question)).toEqual(['Q1', 'Q3']);
    expect(parsePassageReply({ title: 'x' })).toBeNull();
  });
});

describe('deckWordsIn', () => {
  it('lists other deck words found in the text, once per word', () => {
    expect(
      deckWordsIn('Two dilemmas and an inevitable, abundant crop.', cards, [
        'v003',
      ]),
    ).toEqual(['v001', 'v005']);
  });
});

describe('buildPassagesFile', () => {
  it('publishes approved passages with short ids', () => {
    const row = (status: PassageRow['status']): PassageRow => ({
      id: '1234abcd-0000-0000-0000-000000000000',
      level: 'beginner',
      topic: 'Đời sống',
      title: 'T',
      text: 'x',
      translation: 'y',
      new_words: ['v001'],
      words: [],
      questions: [],
      status,
    });
    const file = buildPassagesFile([row('approved'), row('rejected')], 'now');
    expect(file.passages).toHaveLength(1);
    expect(file.passages[0]).toMatchObject({
      id: publishedId(row('approved').id),
      newWords: ['v001'],
    });
    expect(file.passages[0].id).toBe('s1234abcd');
    expect(file.passages[0]).not.toHaveProperty('questions');
  });
});

describe('buildPassagePrompt', () => {
  it('asks for the level, topic, length and every new word', () => {
    const p = buildPassagePrompt({
      level: 'beginner',
      topic: 'Công việc',
      newWords: cards.slice(0, 3),
      knownWords: ['plan'],
    });
    expect(p).toContain('120–200');
    expect(p).toContain('Công việc');
    for (const w of ['abundant', 'cognitive', 'dilemma'])
      expect(p).toContain(`- ${w} (`);
  });
});

describe('PassagesService', () => {
  const studio = {
    listBlocklist: () => Promise.resolve([]),
    readManifest: () =>
      Promise.resolve({
        schema: 1,
        updatedAt: 'x',
        current: null,
        library: null,
        retired: [],
        variants: { id: 'variants', url: 'u', sha256: 'h' },
      }),
    writeManifest: jest.fn((_db: unknown, _u: unknown, manifest: unknown) =>
      Promise.resolve(JSON.stringify(manifest)),
    ),
  } as unknown as StudioService & { writeManifest: jest.Mock };

  function setup(reply: unknown, stored: Record<string, unknown>[] = []) {
    const inserted: Record<string, unknown>[] = [];
    const fake = fakeDb((c: Call) => {
      if (c.table === 'studio_core_cards')
        return { data: cards.filter((x) => x.id.startsWith('v')) };
      if (c.table === 'studio_cards')
        return { data: cards.filter((x) => x.id.startsWith('t')) };
      if (c.table === 'studio_passages' && c.op === 'insert') {
        inserted.push(c.payload as Record<string, unknown>);
        return { data: { id: 'new-id' } };
      }
      if (c.table === 'studio_passages') return { data: stored };
      return {};
    });
    const llm = {
      generateJson: jest.fn(() =>
        Promise.resolve({ model: 'test', json: reply }),
      ),
    } as unknown as StudioLlm;
    return { ...fake, inserted, service: new PassagesService(llm, studio) };
  }

  it('generates a passage around new words and saves it for review', async () => {
    const reply = {
      title: 'Một buổi sáng',
      text: textWith(['abundant', 'cognitive', 'dilemma', 'feasible']),
      translation: 'x'.repeat(400),
      questions: [],
    };
    const { db, service, inserted } = setup(reply);
    // Every beginner core card is in the reply, whichever 4 get picked.
    reply.text = textWith([
      'abundant',
      'cognitive',
      'dilemma',
      'feasible',
      'inevitable',
    ]);
    const r = await service.generate(db, 'u1', {
      level: 'beginner',
      topic: 'Đời sống',
      words: 4,
    });
    expect(r).toMatchObject({ saved: 1 });
    expect(inserted[0]).toMatchObject({
      level: 'beginner',
      topic: 'Đời sống',
      status: 'pending',
      prompt_version: 'passage.v1',
    });
    expect((inserted[0].new_words as string[]).length).toBe(4);
  });

  it('refuses unknown levels and topics', async () => {
    const { db, service } = setup({});
    await expect(
      service.generate(db, null, { level: 'pro', topic: 'Đời sống' }),
    ).rejects.toThrow(/Level/);
    await expect(
      service.generate(db, null, { level: 'beginner', topic: 'Sports' }),
    ).rejects.toThrow(/Chủ đề/);
  });

  it('does not save a passage that misses a new word', async () => {
    const { db, service, inserted } = setup({
      title: 'T',
      text: textWith([]),
      translation: 'x'.repeat(400),
    });
    const r = await service.generate(db, null, {
      level: 'beginner',
      topic: 'Đời sống',
    });
    expect(r.saved).toBe(0);
    expect(r).toHaveProperty('failed', expect.stringContaining('thiếu từ'));
    expect(inserted).toHaveLength(0);
  });

  it('publishes approved passages and keeps the variants overlay in the manifest', async () => {
    const approved = [
      {
        id: 'aaaaaaaa-1',
        level: 'beginner',
        topic: 'Đời sống',
        title: 'T',
        text: 't',
        translation: 'v',
        new_words: ['v001'],
        words: [],
        questions: [],
        status: 'approved',
      },
    ];
    const { db, service, uploads } = setup({}, approved);
    const r = await service.publish(db, 'u1');
    expect(r.passages).toBe(1);
    expect(uploads[0].path).toMatch(/^packs\/passages\.[0-9a-f]{12}\.json$/);
    const calls = studio.writeManifest.mock.calls as unknown[][];
    const manifest = calls[calls.length - 1][2] as Record<string, unknown>;
    expect(manifest.variants).toEqual({
      id: 'variants',
      url: 'u',
      sha256: 'h',
    });
    expect(manifest.passages).toMatchObject({ id: 'passages' });
  });
});
