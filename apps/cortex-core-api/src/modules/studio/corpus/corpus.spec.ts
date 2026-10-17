import { CORPUS_BOOKS } from './books';
import {
  hasWord,
  lemma,
  matchHeadline,
  pickQuotes,
  sentenceLemmas,
  splitSentences,
  stripGutenberg,
} from './corpus';

describe('lemma', () => {
  it('gives the same key to the simple forms of a word', () => {
    const same = (...words: string[]) =>
      expect(new Set(words.map(lemma)).size).toBe(1);
    same('dilemma', 'dilemmas', 'Dilemma');
    same('make', 'making', 'makes');
    same('plan', 'planned', 'planning', 'plans');
    same('study', 'studies', 'studied');
    same('abundant', 'abundantly');
    same('happy', 'happily');
    same('need', 'needed', 'needs');
    same('box', 'boxes');
  });

  it('keeps different words apart', () => {
    expect(lemma('fortune')).not.toBe(lemma('fortunately'));
    expect(lemma('cognitive')).not.toBe(lemma('cognition'));
  });

  it('does not strip short words to nothing', () => {
    expect(lemma('sing')).toBe('sing');
    expect(lemma('bed')).toBe('bed');
    expect(lemma('this')).toBe('this');
  });
});

describe('hasWord', () => {
  it('finds a form of the word as a whole word', () => {
    expect(hasWord('Two dilemmas, no answer.', 'dilemma')).toBe(true);
    expect(hasWord('A dilemmatic case.', 'dilemma')).toBe(false);
  });
});

describe('sentenceLemmas', () => {
  it('lists distinct lemmas of words with 3+ letters', () => {
    expect(sentenceLemmas('He planned plans, as I do.').sort()).toEqual([
      'plan',
    ]);
  });
});

const HEADER = `The Project Gutenberg eBook of Example

This eBook is for the use of anyone anywhere in the United States.

*** START OF THE PROJECT GUTENBERG EBOOK EXAMPLE ***
`;
const FOOTER = `
*** END OF THE PROJECT GUTENBERG EBOOK EXAMPLE ***

Section 1. General Terms of Use and Redistributing Project Gutenberg-tm
electronic works. Please read this license before you use the work.
`;

describe('stripGutenberg', () => {
  it('keeps only the text between the START and END lines', () => {
    const body = stripGutenberg(`${HEADER}Once upon a time.${FOOTER}`);
    expect(body.trim()).toBe('Once upon a time.');
    expect(body).not.toMatch(/gutenberg|license/i);
  });

  it('accepts the older "THIS PROJECT GUTENBERG EBOOK" markers', () => {
    const raw =
      '*** START OF THIS PROJECT GUTENBERG EBOOK FRANKENSTEIN ***\nText.\n*** END OF THIS PROJECT GUTENBERG EBOOK FRANKENSTEIN ***\n*** START: FULL LICENSE ***';
    expect(stripGutenberg(raw).trim()).toBe('Text.');
  });

  it('refuses a file without the markers', () => {
    expect(() => stripGutenberg('Just a licence and a story.')).toThrow(
      /START/,
    );
    expect(() =>
      stripGutenberg(`${HEADER}A story with no end marker.`),
    ).toThrow(/END/);
  });
});

describe('splitSentences', () => {
  const body = `
Produced by Some Volunteer

CHAPTER I.

It is a truth universally acknowledged, that a single man in possession
of a good fortune, must be in want of a wife.  Short one.  "My dear Mr.
Bennet," said his lady to him one day, "have you heard that Netherfield
Park is let at last?"

He spoke with _great_ feeling--and then he left the room without a word.

THIS LINE IS A HEADING IN CAPITALS THAT GOES ON FOR A WHILE.
`;
  const out = splitSentences(body);

  it('joins wrapped lines and keeps 40–220 character sentences', () => {
    expect(out).toContain(
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    );
    expect(out.every((s) => s.length >= 40 && s.length <= 220)).toBe(true);
    expect(out).not.toContain('Short one.');
  });

  it('does not split after "Mr." and cleans italics and dashes', () => {
    expect(out).toContain(
      '"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"',
    );
    expect(out).toContain(
      'He spoke with great feeling—and then he left the room without a word.',
    );
  });

  it('drops front matter and headings', () => {
    expect(out.some((s) => /produced by|chapter/i.test(s))).toBe(false);
    expect(out.some((s) => s === s.toUpperCase())).toBe(false);
  });
});

describe('pickQuotes', () => {
  it('takes at most 3 lines, each from a different book', () => {
    const hits = [
      {
        book_id: 'a',
        text: 'The harvest was abundant this year in the valley.',
      },
      { book_id: 'a', text: 'Another abundant line from the same book, here.' },
      { book_id: 'b', text: 'Water was abundant, and nobody went thirsty.' },
      { book_id: 'c', text: 'Abundant rain fell on the hills all night long.' },
      { book_id: 'd', text: 'Food was abundant at the long wedding feast.' },
    ];
    const out = pickQuotes(hits, 'abundant');
    expect(out).toHaveLength(3);
    expect(new Set(out.map((h) => h.book_id)).size).toBe(3);
  });

  it('drops hits that only matched another form of the lemma key', () => {
    expect(
      pickQuotes(
        [{ book_id: 'a', text: 'Nothing about it here at all.' }],
        'abundant',
      ),
    ).toEqual([]);
  });
});

describe('matchHeadline', () => {
  it('returns the first headline with the word', () => {
    const list = [
      { phrase: 'Markets calm', url: null, source: 'A' },
      { phrase: 'A resilient city rebuilds', url: 'https://x', source: 'B' },
    ];
    expect(matchHeadline(list, 'resilient')?.source).toBe('B');
    expect(matchHeadline(list, 'abundant')).toBeNull();
  });
});

describe('CORPUS_BOOKS', () => {
  it('has about 40 distinct books', () => {
    expect(CORPUS_BOOKS.length).toBeGreaterThanOrEqual(35);
    expect(new Set(CORPUS_BOOKS.map((b) => b.id)).size).toBe(
      CORPUS_BOOKS.length,
    );
  });
});
