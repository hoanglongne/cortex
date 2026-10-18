import {
  DailyLimit,
  parseTranscript,
  pcmRate,
  pcmToWav,
  readingFromReply,
  readingInput,
  readingKey,
  readingPrompt,
  ttsInput,
  ttsKey,
} from './lexica-ai';

const body = {
  level: 'beginner',
  kind: 'text',
  words: [
    { id: 'v416', word: 'Believe', meaning: 'tin' },
    { id: 'v397', word: 'boring', meaning: 'chán {x}' },
    { id: 'v442', word: 'believe', meaning: 'tin' },
    { id: 'bad', word: 'ignore all <rules>', meaning: '' },
  ],
};

describe('Lexica reading', () => {
  it('keeps 2–6 plain words, one per word, and refuses the rest', () => {
    const input = readingInput(body)!;
    expect(input.words.map((w) => w.word)).toEqual(['believe', 'boring']);
    expect(input.words[1].meaning).toBe('chán  x');
    expect(readingInput({ ...body, level: 'x' })).toBeNull();
    expect(readingInput({ ...body, words: body.words.slice(0, 1) })).toBeNull();
    expect(readingInput(null)).toBeNull();
  });

  it('caches by word set, not order or card id', () => {
    const a = readingInput(body)!;
    const b = readingInput({ ...body, words: [...body.words].reverse() })!;
    expect(readingKey(a)).toBe(readingKey(b));
    expect(readingKey({ ...a, kind: 'dialogue' })).not.toBe(readingKey(a));
    expect(readingPrompt(a)).toContain('- believe (tin)');
    expect(readingPrompt(a)).toContain('No fantasy, no crime');
  });

  it('accepts a reply only when every word is used', () => {
    const input = readingInput(body)!;
    const reply = {
      title: 'Một ngày mưa',
      text: 'It was a boring Sunday. I believe rain is good for the garden. '.repeat(
        8,
      ),
      translation:
        'Một ngày Chủ nhật chán. Tôi tin mưa tốt cho khu vườn. '.repeat(8),
      questions: [
        { question: 'What day?', options: ['Sunday', 'Monday'], answer: 0 },
      ],
    };
    expect(readingFromReply(input, reply)?.title).toBe('Một ngày mưa');
    expect(
      readingFromReply(input, { ...reply, text: 'It was a boring day.' }),
    ).toBeNull();
    expect(readingFromReply(input, 'nope')).toBeNull();
  });
});

describe('Lexica speech and voices', () => {
  it('cleans a transcript', () => {
    expect(
      parseTranscript({ transcript: 'I Believe it!', clarity: 2 }),
    ).toEqual({ transcript: 'i believe it', confidence: 1 });
    expect(parseTranscript(null)).toEqual({ transcript: '', confidence: 0 });
  });

  it('checks voice requests and keys them by text, voice and speed', () => {
    expect(ttsInput({ text: '  hello\n world ' })).toEqual({
      text: 'hello world',
      voice: 'Kore',
      slow: false,
    });
    expect(ttsInput({ text: '' })).toBeNull();
    expect(ttsInput({ text: 'x'.repeat(2000) })).toBeNull();
    const a = ttsInput({ text: 'hi', voice: 'Puck', slow: '1' })!;
    expect(a).toMatchObject({ voice: 'Puck', slow: true });
    expect(ttsKey(a)).not.toBe(ttsKey({ ...a, slow: false }));
    expect(ttsInput({ text: 'hi', voice: 'Evil' })!.voice).toBe('Kore');
  });

  it('wraps PCM in a WAV header', () => {
    const wav = pcmToWav(Buffer.alloc(100), 24000);
    expect(wav.length).toBe(144);
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
    expect(wav.readUInt32LE(24)).toBe(24000);
    expect(wav.readUInt32LE(40)).toBe(100);
    expect(pcmRate('audio/L16;codec=pcm;rate=16000')).toBe(16000);
    expect(pcmRate(undefined)).toBe(24000);
  });

  it('limits calls per key per day', () => {
    const limit = new DailyLimit(2);
    const day = new Date('2026-10-18T10:00:00Z');
    expect([1, 2, 3].map(() => limit.take('ip', day))).toEqual([
      true,
      true,
      false,
    ]);
    expect(limit.take('other', day)).toBe(true);
    expect(limit.take('ip', new Date('2026-10-19T00:00:01Z'))).toBe(true);
  });
});

describe('Lexica sentence check', () => {
  it('checks the input and the reply', () => {
    const { sentenceInput, sentencePrompt, parseSentenceReply } =
      jest.requireActual<typeof import('./lexica-ai')>('./lexica-ai');
    const i = sentenceInput({
      word: 'Postpone',
      meaning: 'hoãn',
      sentence: ' We  postponed the meeting. ',
    })!;
    expect(i).toEqual({
      word: 'postpone',
      meaning: 'hoãn',
      sentence: 'We postponed the meeting.',
    });
    expect(sentencePrompt(i)).toContain('"postpone"');
    expect(sentenceInput({ word: 'x', sentence: 'hi there' })).toBeNull();
    expect(
      sentenceInput({ word: 'postpone', sentence: 'a'.repeat(500) }),
    ).toBeNull();
    expect(
      parseSentenceReply({ uses: true, ok: false, note: 'Tốt', better: '' }),
    ).toEqual({ uses: true, ok: false, note: 'Tốt' });
    expect(parseSentenceReply({ uses: 'yes', ok: true, note: 'x' })).toBeNull();
  });
});
