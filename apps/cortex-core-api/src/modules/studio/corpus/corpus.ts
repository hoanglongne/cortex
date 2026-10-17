/**
 * "Ngoài đời" sentence corpus: public-domain books are downloaded once, cut to
 * the story itself (no Project Gutenberg header or licence), split into
 * sentences and stored with the lemmas of their words, so finding quotes for
 * a card is one indexed query instead of a web search.
 *
 * Pure functions only; the service does the I/O.
 */

/** Sentence length kept in the corpus, in characters. */
export const SENTENCE_MIN = 40;
export const SENTENCE_MAX = 220;
/** Quotes kept per card, each from a different book. */
export const QUOTES_PER_CARD = 3;

const VOWEL = /[aeiouy]/;

/**
 * A crude stem used as a matching key: the same function runs on the card's
 * word and on every word of the corpus, so "dilemmas" and "dilemma" meet.
 * Strips one of -s/-es/-ies/-ed/-ied/-ing/-ly, then a final -e, then a
 * doubled final consonant ("planned" → "plan", "making" → "mak" = "make").
 */
export function lemma(word: string): string {
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return w;
  const strip = (suffix: string, add = '') => {
    const base = w.slice(0, -suffix.length);
    // Keep at least 3 letters and a vowel, so "need" or "sing" stay whole.
    if (base.length < 3 || !VOWEL.test(base)) return false;
    w = base + add;
    return true;
  };
  if (w.endsWith('ies')) strip('ies', 'y');
  else if (w.endsWith('ied')) strip('ied', 'y');
  else if (w.endsWith('ily')) strip('ily', 'y');
  else if (/(ss|x|ch|sh)es$/.test(w)) strip('es');
  else if (w.endsWith('ing')) strip('ing');
  else if (w.endsWith('ed')) strip('ed');
  else if (w.endsWith('ly')) strip('ly');
  else if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) strip('s');
  if (w.length > 3 && w.endsWith('e')) w = w.slice(0, -1);
  if (/([b-df-hj-np-tv-z])\1$/.test(w)) w = w.slice(0, -1);
  return w;
}

/** The distinct lemmas of a sentence, words of 3+ letters only. */
export function sentenceLemmas(text: string): string[] {
  const out = new Set<string>();
  for (const token of text.toLowerCase().split(/[^a-z]+/)) {
    if (token.length >= 3) out.add(lemma(token));
  }
  return [...out];
}

/** True when the text has the word in any of its simple forms. */
export function hasWord(text: string, word: string): boolean {
  if (/\s/.test(word.trim())) return hasPhrase(text, word);
  const key = lemma(word);
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .some((t) => t && lemma(t) === key);
}

/**
 * A phrase ("follow up", "make sense") in a text: the first word in any
 * simple form ("followed up", "makes sense"), the others as written.
 */
export function hasPhrase(text: string, phrase: string): boolean {
  const want = phrase.toLowerCase().trim().split(/\s+/);
  const tokens = text
    .toLowerCase()
    .split(/[^a-z']+/)
    .filter(Boolean);
  const head = lemma(want[0]);
  return tokens.some(
    (t, i) =>
      (t === want[0] || lemma(t) === head) &&
      want.slice(1).every((w, k) => tokens[i + 1 + k] === w),
  );
}

const START =
  /\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG E-?BOOK[^*]*\*{3}/i;
const END = /\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG E-?BOOK[^*]*\*{3}/i;

/**
 * The book itself: the text between the "*** START OF … ***" and
 * "*** END OF … ***" lines. Throws when either is missing, so a file whose
 * licence we cannot cut off never enters the corpus.
 */
export function stripGutenberg(raw: string): string {
  const start = START.exec(raw);
  if (!start)
    throw new Error('Không thấy dòng *** START của Project Gutenberg');
  const rest = raw.slice(start.index + start[0].length);
  const end = END.exec(rest);
  if (!end) throw new Error('Không thấy dòng *** END của Project Gutenberg');
  return rest.slice(0, end.index);
}

/** Lines that are front matter, not prose. */
const SKIP_LINE =
  /^\s*(produced by|transcribed by|e-?text prepared by|updated editions|\[illustration|chapter [ivxlc\d]+\.?\s*$|contents\s*$)/i;

/**
 * Sentences of 40–220 characters from a book body. Paragraphs are joined
 * first (Gutenberg wraps lines at ~70 characters), italics underscores are
 * dropped, and anything that still mentions Gutenberg is skipped.
 */
export function splitSentences(body: string): string[] {
  const paragraphs = body
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .split('\n')
        .filter((line) => !SKIP_LINE.test(line))
        .join(' ')
        .replace(/_/g, '')
        .replace(/--/g, '—')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of paragraphs) {
    for (const raw of joinAbbreviations(
      p.split(/(?<=[.!?]["”’']?)\s+(?=["“‘']?[A-Z])/),
    )) {
      const s = raw.trim();
      if (s.length < SENTENCE_MIN || s.length > SENTENCE_MAX) continue;
      if (/gutenberg/i.test(s)) continue;
      // Mostly letters, ends like a sentence, not a heading in capitals.
      if (!/[.!?]["”’']?$/.test(s)) continue;
      if (s === s.toUpperCase()) continue;
      if (seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

/** Titles and initials that end in a full stop without ending a sentence. */
const ABBREVIATION =
  /(?:^|[\s(“"'])(?:Mr|Mrs|Ms|Messrs|Mme|Mlle|Dr|St|Capt|Col|Gen|Lt|Sgt|Rev|Prof|Hon|Sr|Jr|No|vs|etc|[A-Z])\.$/;

/** Glues back pieces that were split after "Mr." or an initial like "H.". */
function joinAbbreviations(pieces: string[]): string[] {
  const out: string[] = [];
  for (const piece of pieces) {
    const last = out.length - 1;
    if (last >= 0 && ABBREVIATION.test(out[last]))
      out[last] = `${out[last]} ${piece}`;
    else out.push(piece);
  }
  return out;
}

export interface CorpusHit {
  book_id: string;
  text: string;
}

/**
 * Up to `max` sentences from different books. Prefers mid-length sentences
 * (easiest to read on a card) and keeps the input order otherwise.
 */
export function pickQuotes(
  hits: readonly CorpusHit[],
  word: string,
  max = QUOTES_PER_CARD,
): CorpusHit[] {
  const score = (t: string) => Math.abs(t.length - 110);
  const sorted = hits
    .filter((h) => hasWord(h.text, word))
    .map((h, i) => ({ h, i }))
    .sort((a, b) => score(a.h.text) - score(b.h.text) || a.i - b.i)
    .map((x) => x.h);
  const out: CorpusHit[] = [];
  const books = new Set<string>();
  for (const h of sorted) {
    if (books.has(h.book_id)) continue;
    books.add(h.book_id);
    out.push(h);
    if (out.length >= max) break;
  }
  return out;
}

export interface Headline {
  phrase: string;
  url: string | null;
  source: string;
}

/** A recent headline that contains the word, if any (first one wins). */
export function matchHeadline(
  headlines: readonly Headline[],
  word: string,
): Headline | null {
  return headlines.find((h) => hasWord(h.phrase, word)) ?? null;
}
