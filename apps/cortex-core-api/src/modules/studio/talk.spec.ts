import { fakeDb, type Call } from './__testkit__/fake-db';
import { hasPhrase, hasWord } from './corpus/corpus';
import {
  buildPassagePrompt,
  buildPassagesFile,
  checkPassage,
  deckWordsIn,
  isDialogue,
  type PassageRow,
} from './passages';
import {
  buildTalkPack,
  buildTalkPrompt,
  checkTalkCard,
  parseTalkReply,
  talkCardId,
  type TalkRow,
} from './talk';
import { TalkService } from './talk.service';
import type { StudioLlm } from './studio-llm';
import type { StudioService } from './studio.service';

const good = {
  phrase: 'running late',
  scenario:
    'Sáng nay kẹt xe quá, em running late chừng mười lăm phút, mọi người cứ họp trước nha.',
  translation_hint: 'bị trễ giờ',
  situation_prompt: 'Bạn kẹt xe, nhắn cho sếp là sẽ đến trễ.',
  situation_model: "Sorry, I'm running late. I'll be there soon.",
};

describe('phrases in text', () => {
  it('finds a phrase with the first word inflected', () => {
    expect(hasPhrase('She followed up twice.', 'follow up')).toBe(true);
    expect(hasPhrase('That makes sense now.', 'make sense')).toBe(true);
    expect(hasPhrase('Follow the money up.', 'follow up')).toBe(false);
    expect(hasWord('We need to touch base.', 'touch base')).toBe(true);
    expect(
      deckWordsIn(
        'Let us touch base and sort out the plan.',
        [
          { id: 'g018', word: 'touch base' },
          { id: 'g030', word: 'sort out' },
          { id: 'v1', word: 'plan' },
        ],
        [],
      ),
    ).toEqual(['g018', 'g030', 'v1']);
  });
});

describe('talk cards', () => {
  it('asks for phrases, a situation and a model sentence', () => {
    const p = buildTalkPrompt({
      level: 'beginner',
      topic: 'Đi làm',
      count: 5,
      avoid: ['on my way'],
    });
    expect(p).toContain('Viết 5 thẻ');
    expect(p).toContain('on my way');
    expect(p).toContain('situation_model');
  });

  it('parses the reply and checks each card', () => {
    const [d] = parseTalkReply({
      cards: [{ ...good, phrase: ' Running  Late ' }, { phrase: 'x' }],
    });
    expect(d.phrase).toBe('running late');
    expect(checkTalkCard(d, new Set(), [])).toEqual([]);
    expect(checkTalkCard(d, new Set(['running late']), [])).toEqual([
      'duplicate',
    ]);
    expect(
      checkTalkCard(
        {
          ...d,
          scenario: 'Một câu không có cụm từ nào hết cả, dài đủ ba mươi ký tự.',
          situation_model: 'I will be there.',
        },
        new Set(),
        [],
      ),
    ).toEqual(expect.arrayContaining(['scenario', 'model']));
  });

  it('publishes approved Studio phrases only, as talk cards', () => {
    const row = (status: TalkRow['status'], core = false): TalkRow => ({
      id: 'abcdef12-0000-0000-0000-000000000000',
      card_id: talkCardId('abcdef12-0000-0000-0000-000000000000'),
      core,
      level: 'beginner',
      topic: 'Đi làm',
      status,
      ...good,
    });
    const pack = buildTalkPack(
      [row('approved'), row('pending'), row('approved', true)],
      'now',
    );
    expect(pack.cards).toHaveLength(1);
    expect(pack.cards[0]).toMatchObject({
      id: 'kabcdef1',
      word: 'running late',
      branch: 'talk',
      situation: { prompt: good.situation_prompt, model: good.situation_model },
    });
  });
});

describe('dialogues', () => {
  const text = [
    'Mai: Hi Tom, can we touch base about the website?',
    'Tom: Sure. Just a heads up, the client wants one more page.',
    "Mai: Okay, I'll follow up with the designer today.",
    "Tom: Great, and let's sort out the budget on Friday.",
    'Mai: Sounds good. I will send the notes after lunch.',
    'Tom: Thanks. Talk soon, and have a good afternoon at work.',
  ].join('\n');

  it('recognises the "Name: words" shape', () => {
    expect(isDialogue(text)).toBe(true);
    expect(isDialogue('Just a paragraph of prose.\n\nAnother one.')).toBe(
      false,
    );
  });

  it('checks a dialogue with its own length and the phrases', () => {
    const failed = checkPassage(
      { title: 'T', text, translation: 'x'.repeat(text.length) },
      ['touch base', 'heads up', 'follow up', 'sort out'],
      [],
      'dialogue',
    );
    expect(failed).toEqual([]);
    expect(
      checkPassage(
        { title: 'T', text: 'no speakers here', translation: 'x' },
        [],
        [],
        'dialogue',
      ),
    ).toEqual(expect.arrayContaining(['length', 'dialogue']));
  });

  it('asks for one line per turn and publishes the kind', () => {
    const p = buildPassagePrompt({
      level: 'intermediate',
      topic: 'Công việc',
      newWords: [
        {
          id: 'g018',
          word: 'touch base',
          level: 'intermediate',
          translation_hint: 'liên lạc',
        },
      ],
      knownWords: [],
      kind: 'dialogue',
    });
    expect(p).toContain('"Name: what they say"');
    expect(p).toContain('- touch base (liên lạc)');
    const row = {
      id: '1234abcd',
      level: 'intermediate',
      kind: 'dialogue',
      topic: 'Công việc',
      title: 'T',
      text,
      translation: 'y',
      new_words: ['g018'],
      words: [],
      questions: [],
      status: 'approved',
    } as PassageRow;
    expect(buildPassagesFile([row], 'now').passages[0]).toMatchObject({
      kind: 'dialogue',
    });
  });
});

describe('TalkService', () => {
  const studio = {
    listBlocklist: () => Promise.resolve([]),
    readManifest: () =>
      Promise.resolve({
        schema: 1,
        updatedAt: 'x',
        current: null,
        library: null,
        retired: [],
        passages: { id: 'passages', url: 'p', sha256: 'h' },
      }),
    writeManifest: jest.fn((_db: unknown, _u: unknown, manifest: unknown) =>
      Promise.resolve(JSON.stringify(manifest)),
    ),
  } as unknown as StudioService & { writeManifest: jest.Mock };

  function setup(reply: unknown, stored: Record<string, unknown>[] = []) {
    const inserted: Record<string, unknown>[] = [];
    const fake = fakeDb((c: Call) => {
      if (c.table === 'studio_talk_cards' && c.op === 'insert') {
        inserted.push(c.payload as Record<string, unknown>);
        return {};
      }
      if (c.table === 'studio_talk_cards') return { data: stored };
      return {};
    });
    const llm = {
      generateJson: jest.fn(() =>
        Promise.resolve({ model: 'test', json: reply }),
      ),
    } as unknown as StudioLlm;
    return { ...fake, inserted, service: new TalkService(llm, studio) };
  }

  it('saves good cards for review and reports the rest', async () => {
    const { db, service, inserted } = setup(
      { cards: [good, { ...good, phrase: 'on my way' }] },
      [{ phrase: 'on my way' }],
    );
    const r = await service.generate(db, 'u1', {
      level: 'beginner',
      topic: 'Đi làm',
      count: 5,
    });
    expect(r.saved).toBe(1);
    expect(r.failed).toHaveLength(1);
    expect(r.failed[0].phrase).toBe('on my way');
    expect(r.failed[0].reason).toContain('đã có');
    expect(inserted[0]).toMatchObject({
      phrase: 'running late',
      status: 'pending',
      level: 'beginner',
      prompt_version: 'talk.v1',
    });
    expect(String(inserted[0].card_id)).toMatch(/^k[0-9a-f]{7}$/);
  });

  it('refuses unknown levels and topics', async () => {
    const { db, service } = setup({});
    await expect(
      service.generate(db, null, { level: 'pro', topic: 'Đi làm' }),
    ).rejects.toThrow(/Level/);
    await expect(
      service.generate(db, null, { level: 'beginner', topic: 'Sports' }),
    ).rejects.toThrow(/Chủ đề/);
  });

  it('publishes the talk pack and keeps the passages in the manifest', async () => {
    const approved = [
      {
        id: 'aaaaaaaa-1',
        card_id: 'kaaaaaaa',
        core: false,
        level: 'beginner',
        topic: 'Đi làm',
        status: 'approved',
        ...good,
      },
    ];
    const { db, service, uploads } = setup({}, approved);
    const r = await service.publish(db, 'u1');
    expect(r.cards).toBe(1);
    expect(uploads[0].path).toMatch(/^packs\/talk\.[0-9a-f]{12}\.json$/);
    const calls = studio.writeManifest.mock.calls as unknown[][];
    const manifest = calls[calls.length - 1][2] as Record<string, unknown>;
    expect(manifest.passages).toEqual({
      id: 'passages',
      url: 'p',
      sha256: 'h',
    });
    expect(manifest.talk).toMatchObject({ id: 'talk' });
  });
});
