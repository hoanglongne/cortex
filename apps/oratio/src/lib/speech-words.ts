/**
 * "Soi lời nói" (issue #130): from the words Whisper heard, with the time each
 * one started and ended, find what a rater would otherwise have to listen for:
 * where the speaker paused, whether the pause came at the edge of an idea or in
 * the middle of one, filler sounds, and words said twice.
 *
 * The one rule that matters comes from research on perceived fluency (Bosker et
 * al. 2013; Kahng 2018): a pause between two ideas sounds normal, a pause in
 * the middle of an idea sounds hesitant. So the two are counted separately.
 * Pure, unit tested; the words come from the device and stay there.
 */

export interface Word {
  text: string;
  /** Seconds into the recording */
  start: number;
  end: number;
}

export type GapKind = "boundary" | "mid";

export interface Token {
  i: number;
  /** Index of this word in the list given to `tokenize` (to edit it) */
  src: number;
  text: string;
  /** Lower case without punctuation */
  clean: string;
  start: number;
  end: number;
  /** um, uh, er: sounds that fill a pause */
  filler: boolean;
  /** you know, I mean, like: words used to fill time */
  marker: boolean;
  /** Said again straight after itself ("the the", "I think I think") */
  repeat: boolean;
}

export interface Gap {
  /** The gap follows the token with this index */
  after: number;
  start: number;
  end: number;
  seconds: number;
  kind: GapKind;
}

export interface SpeechStats {
  /** Words that carry meaning (fillers are not counted) */
  words: number;
  /** First word to last word, in seconds */
  span: number;
  /** Words a minute over the whole span */
  wordsPerMinute: number;
  /** Words a minute with the pauses taken out: how fast it sounds when they do speak */
  articulationRate: number;
  /** Average number of words said between two pauses */
  meanRun: number;
  /** Pauses of at least `minGap` in the middle of an idea (counted per minute below) */
  midPauses: number;
  boundaryPauses: number;
  fillers: number;
  markers: number;
  repeats: number;
  midPausesPerMinute: number;
  fillersPerMinute: number;
  repeatsPerMinute: number;
}

/** A silence this long between two words is a pause worth showing. */
export const MIN_GAP = 0.5;
/** A silence this long ends a "run" of speech (the usual research threshold). */
export const RUN_GAP = 0.25;

const FILLERS = new Set(["um", "umm", "uh", "uhh", "er", "erm", "hmm", "hm", "mm", "mmm", "ah", "eh"]);
const MARKERS = new Set(["like", "actually", "basically", "literally"]);
/** A pause before one of these starts a new idea, so it is not a stumble. */
const STARTERS = new Set(["and", "but", "so", "because", "which", "that", "when", "if", "then", "also", "however", "well", "or", "while", "although", "first", "firstly", "second", "finally", "overall", "for", "in", "on", "after", "before"]);
const SENTENCE_END = /[.!?;:,]["')\]]?$/;

const clean = (t: string) => t.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "");

/** Tokens with their flags. Words with no timing or no letters are left out. */
export function tokenize(words: readonly Word[]): Token[] {
  const kept = words.map((w, src) => ({ w, src })).filter(({ w }) => Number.isFinite(w.start) && Number.isFinite(w.end) && clean(w.text) !== "");
  const tokens: Token[] = kept.map(({ w, src }, i) => {
    const c = clean(w.text);
    return { i, src, text: w.text.trim(), clean: c, start: w.start, end: Math.max(w.end, w.start), filler: FILLERS.has(c), marker: MARKERS.has(c), repeat: false };
  });
  const body = tokens.filter((t) => !t.filler);
  for (let k = 1; k < body.length; k++) {
    if (body[k].clean === body[k - 1].clean && body[k].clean.length > 1) body[k].repeat = true;
    // "I think I think": the second pair repeats the first
    if (k >= 3 && body[k].clean === body[k - 2].clean && body[k - 1].clean === body[k - 3].clean && body[k].clean !== body[k - 1].clean) {
      body[k].repeat = true;
      body[k - 1].repeat = true;
    }
  }
  return tokens;
}

/** Edge of an idea (previous word ends a clause, or the next one starts a new one) or the middle of one. */
export function gapKind(prev: Token, next: Token): GapKind {
  if (SENTENCE_END.test(prev.text)) return "boundary";
  if (STARTERS.has(next.clean)) return "boundary";
  return "mid";
}

export function findGaps(tokens: readonly Token[], minGap = MIN_GAP): Gap[] {
  const gaps: Gap[] = [];
  for (let k = 1; k < tokens.length; k++) {
    const seconds = tokens[k].start - tokens[k - 1].end;
    if (seconds >= minGap) gaps.push({ after: k - 1, start: tokens[k - 1].end, end: tokens[k].start, seconds, kind: gapKind(tokens[k - 1], tokens[k]) });
  }
  return gaps;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function speechStats(tokens: readonly Token[], gaps: readonly Gap[]): SpeechStats {
  const body = tokens.filter((t) => !t.filler);
  const first = tokens[0]?.start ?? 0;
  const last = tokens[tokens.length - 1]?.end ?? 0;
  const span = Math.max(0, last - first);
  const minutes = Math.max(span, 30) / 60;
  // Pauses of 0.25 s and more are taken out of the speaking time
  let paused = 0;
  let runs = 1;
  for (let k = 1; k < tokens.length; k++) {
    const g = tokens[k].start - tokens[k - 1].end;
    if (g >= RUN_GAP) {
      paused += g;
      runs++;
    }
  }
  const speaking = Math.max(1, span - paused);
  const mid = gaps.filter((g) => g.kind === "mid").length;
  const fillers = tokens.filter((t) => t.filler).length;
  const repeats = tokens.filter((t) => t.repeat).length;
  return {
    words: body.length,
    span: round1(span),
    wordsPerMinute: span > 0 ? Math.round((body.length / span) * 60) : 0,
    articulationRate: Math.round((body.length / speaking) * 60),
    meanRun: tokens.length ? round1(body.length / runs) : 0,
    midPauses: mid,
    boundaryPauses: gaps.length - mid,
    fillers,
    markers: tokens.filter((t) => t.marker).length,
    repeats,
    midPausesPerMinute: round1(mid / minutes),
    fillersPerMinute: round1(fillers / minutes),
    repeatsPerMinute: round1(repeats / minutes),
  };
}

export function analyzeWords(words: readonly Word[]): { tokens: Token[]; gaps: Gap[]; stats: SpeechStats } {
  const tokens = tokenize(words);
  const gaps = findGaps(tokens);
  return { tokens, gaps, stats: speechStats(tokens, gaps) };
}

/** What Whisper returns (`chunks` with `timestamp: [start, end]`) as plain words. Null when it gave no usable timing. */
export function wordsFromChunks(chunks: unknown): Word[] | null {
  if (!Array.isArray(chunks)) return null;
  const out: Word[] = [];
  let last = 0;
  for (const c of chunks as { text?: unknown; timestamp?: unknown }[]) {
    const ts = c?.timestamp;
    if (typeof c?.text !== "string" || !Array.isArray(ts)) continue;
    const start = Number(ts[0]);
    // The last word of a recording may come back with no end time
    const end = ts[1] == null ? start + 0.4 : Number(ts[1]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < last - 0.05) continue;
    out.push({ text: c.text, start, end });
    last = start;
  }
  return out.length >= 3 ? out : null;
}

/** One sentence on what the pauses say, for the top of the view. */
export function xrayHeadline(s: SpeechStats): string {
  if (s.words < 8) return "Bản ghi quá ngắn để nhận xét.";
  if (s.midPauses === 0) return `Không có chỗ dừng giữa chừng một ý. Các chỗ dừng (${s.boundaryPauses}) đều ở ranh giới giữa hai ý, nghe tự nhiên.`;
  const share = s.midPauses / Math.max(1, s.midPauses + s.boundaryPauses);
  return share > 0.6 ? `${s.midPauses} trong ${s.midPauses + s.boundaryPauses} chỗ dừng nằm giữa chừng một ý: đây là chỗ nghe ngập ngừng nhất.` : `${s.midPauses} chỗ dừng giữa chừng một ý (đáng chú ý), ${s.boundaryPauses} chỗ ở ranh giới giữa hai ý (bình thường).`;
}


/**
 * The learner fixes a word the machine heard wrongly ("a walk a whole like" for
 * "a workaholic like"). The new text takes the place of the old word and its
 * time; several words share that time evenly; empty text removes the word.
 */
export function replaceWord(words: readonly Word[], index: number, text: string): Word[] {
  const w = words[index];
  if (!w) return [...words];
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return words.filter((_, i) => i !== index);
  const step = (w.end - w.start) / parts.length;
  const fixed = parts.map((p, k) => ({ text: p, start: w.start + k * step, end: w.start + (k + 1) * step }));
  return [...words.slice(0, index), ...fixed, ...words.slice(index + 1)];
}
