/**
 * Grammar signals from the words an answer was transcribed into.
 *
 * Two honest limits. First, the machine that writes the words (Whisper) tends
 * to tidy grammar as it writes ("she go" can come back as "she goes"), so
 * mistakes are under-reported: what is found here is a floor, and the rater's
 * own taps count more. Second, this is a handful of high-precision rules, not a
 * grammar checker; it never says a sentence is right, only what it can see.
 *
 * Range is the other half of the IELTS grammar band ("a mix of simple and
 * complex structures"): which kinds of structure the speaker tried at all.
 * Pure, unit tested.
 */

export type Structure = "subordinate" | "relative" | "past" | "perfect" | "future" | "modal" | "passive" | "conditional" | "ing-clause";

export const STRUCTURE_LABEL: Record<Structure, string> = {
  subordinate: "mệnh đề phụ (because, although, when…)",
  relative: "mệnh đề quan hệ (who, which…)",
  past: "thì quá khứ",
  perfect: "thì hoàn thành (have/has + V3)",
  future: "thì tương lai",
  modal: "động từ khuyết thiếu (could, should, might…)",
  passive: "câu bị động",
  conditional: "câu điều kiện",
  "ing-clause": "cụm V-ing nối ý",
};

export interface ErrorCandidate {
  /** Short rule name for the reader */
  rule: string;
  /** What was said, a few words around the problem */
  snippet: string;
  /** What it may need to be */
  hint: string;
  /** Index of the first word of the snippet in the list given */
  at: number;
}

export interface GrammarProfile {
  words: number;
  structures: Structure[];
  /** Sentences the transcript has (counted from the punctuation; 0 when there is none) */
  sentences: number;
  candidates: ErrorCandidate[];
}

const SUBORDINATORS = new Set(["because", "although", "though", "while", "whereas", "unless", "since", "whenever", "wherever", "whether"]);
const RELATIVES = new Set(["who", "whom", "whose", "which"]);
const MODALS = new Set(["could", "should", "might", "may", "must", "ought", "would", "can't", "couldn't", "shouldn't", "wouldn't"]);
const BE = new Set(["is", "are", "was", "were", "be", "been", "being"]);
const IRREGULAR_PAST = new Set(["went", "was", "were", "had", "did", "made", "took", "saw", "came", "got", "gave", "found", "thought", "told", "felt", "knew", "said", "bought", "met", "ate", "wrote", "ran", "began", "left", "brought", "kept", "lost", "spoke", "heard", "taught", "sat", "stood", "read", "built", "paid", "sent"]);
const IRREGULAR_PP = new Set(["gone", "been", "had", "done", "made", "taken", "seen", "come", "gotten", "given", "found", "thought", "told", "felt", "known", "said", "bought", "met", "eaten", "written", "run", "begun", "left", "brought", "kept", "lost", "spoken", "heard", "taught", "built", "paid", "sent"]);
// Verbs the "he go" rule looks for: plain forms that need an -s after he, she, it
const BASE_VERBS = new Set(["go", "have", "do", "make", "take", "get", "come", "want", "like", "need", "think", "know", "say", "see", "work", "live", "love", "feel", "look", "play", "study", "use", "help", "try", "tell", "give", "find", "become", "believe", "enjoy"]);
const PAST_FORMS = new Set(["went", "had", "did", "made", "took", "got", "came", "saw", "gave", "found", "thought", "told", "felt", "knew", "said", "bought", "ate", "wrote", "ran", "began", "left", "brought", "kept", "lost", "spoke"]);
const VOWEL_START = /^(a|e|i|o)[a-z]*$/;
// Words that start with a vowel letter but a consonant sound, or the other way: never flag a/an before them
const ODD_SOUND = new Set(["university", "uniform", "union", "unique", "united", "unit", "useful", "usual", "use", "used", "user", "european", "one", "once", "hour", "honest", "honor", "honour", "heir", "ubiquitous", "utensil", "utility"]);

const words = (s: string) => s.toLowerCase().replace(/[^a-z' ]+/g, " ").split(/\s+/).filter(Boolean);

function isParticiple(w: string): boolean {
  return /ed$/.test(w) || IRREGULAR_PP.has(w);
}

/** Structures the speaker used, over the whole answer. */
function structuresOf(list: readonly string[]): Structure[] {
  const found = new Set<Structure>();
  for (let i = 0; i < list.length; i++) {
    const w = list[i];
    const next = list[i + 1] ?? "";
    const next2 = list[i + 2] ?? "";
    if (SUBORDINATORS.has(w)) found.add("subordinate");
    if (RELATIVES.has(w)) found.add("relative");
    if (w === "that" && /^(is|was|has|have|had|makes|helps|can|will|would)$/.test(next)) found.add("relative");
    if (w === "when" || w === "if" || w === "after" || w === "before") found.add("subordinate");
    if (MODALS.has(w)) found.add("modal");
    if (w === "will" || w === "won't" || (w === "going" && next === "to") || w === "gonna") found.add("future");
    if (IRREGULAR_PAST.has(w) && w !== "was" && w !== "were" && w !== "had") found.add("past");
    if (/ed$/.test(w) && w.length > 4 && !BE.has(list[i - 1] ?? "") && !/^(need|indeed|speed|bed|red|feed|seed|hundred|weed)$/.test(w)) found.add("past");
    if (w === "was" || w === "were") found.add("past");
    if (/^(have|has|had|haven't|hasn't|ve)$/.test(w) && (isParticiple(next) || next === "been" || (/^(already|just|never|ever|not)$/.test(next) && isParticiple(next2)))) found.add("perfect");
    if (BE.has(w) && isParticiple(next) && next !== "been" && w !== "been") found.add("passive");
    if ((w === "been" || w === "being") && isParticiple(next)) found.add("passive");
    if (w === "if" && list.slice(i + 1, i + 9).some((x) => x === "would" || x === "will" || x === "could" || x === "'d")) found.add("conditional");
    if (/ing$/.test(w) && w.length > 5 && (i === 0 || /^(,|and|by|while|after|before|when)$/.test(list[i - 1] ?? "")) && !/^(during|morning|evening|nothing|something|anything|everything|thing|king|spring)$/.test(w)) found.add("ing-clause");
  }
  return [...found];
}

/** Rules that rarely fire on a correct sentence. The cost of a false alarm is a rater listening once more. */
function candidatesOf(list: readonly string[]): ErrorCandidate[] {
  const out: ErrorCandidate[] = [];
  const add = (rule: string, at: number, len: number, hint: string) => out.push({ rule, at, snippet: list.slice(at, at + len).join(" "), hint });
  for (let i = 0; i < list.length - 1; i++) {
    const w = list[i];
    const n = list[i + 1];
    const n2 = list[i + 2] ?? "";
    if (/^(he|she|it)$/.test(w) && BASE_VERBS.has(n)) add("Chia động từ", i, 2, `${w} ${n}s / ${w} ${n === "have" ? "has" : n === "go" ? "goes" : n === "do" ? "does" : n + "s"}`);
    if (/^(he|she|it)$/.test(w) && /^(don't|dont)$/.test(n)) add("Chia động từ", i, 2, `${w} doesn't`);
    if (/^(i|you|we|they)$/.test(w) && /^(is)$/.test(n)) add("Chia động từ", i, 2, w === "i" ? "I am" : `${w} are`);
    if (w === "i" && n === "are") add("Chia động từ", i, 2, "I am");
    if (/^(he|she|it)$/.test(w) && /^(are|were)$/.test(n)) add("Chia động từ", i, 2, `${w} ${n === "are" ? "is" : "was"}`);
    if (/^(they|we|you|people|children)$/.test(w) && /^(was)$/.test(n)) add("Chia động từ", i, 2, `${w} were`);
    if (/^(people|children|friends|parents)$/.test(w) && /^(is)$/.test(n)) add("Chia động từ", i, 2, `${w} are`);
    if (w === "a" && VOWEL_START.test(n) && !ODD_SOUND.has(n)) add("a / an", i, 2, `an ${n}`);
    if (w === "an" && !VOWEL_START.test(n) && !ODD_SOUND.has(n) && !/^(h)/.test(n)) add("a / an", i, 2, `a ${n}`);
    if (/^(didn't|didnt)$/.test(w) && PAST_FORMS.has(n)) add("Thì sau did not", i, 2, `didn't ${n === "went" ? "go" : n === "had" ? "have" : "+ động từ nguyên mẫu"}`);
    if (w === "did" && /^(not)$/.test(n) && PAST_FORMS.has(n2)) add("Thì sau did not", i, 3, "did not + động từ nguyên mẫu");
    if (w === "to" && PAST_FORMS.has(n) && !/^(had)$/.test(n)) add("Sau to dùng nguyên mẫu", i, 2, `to + động từ nguyên mẫu`);
    if (/^(more|most)$/.test(w) && /^(better|worse|bigger|smaller|easier|harder|faster|cheaper|happier)$/.test(n)) add("So sánh hơn", i, 2, n);
    if (/^(can|could|will|would|should|must|might)$/.test(w) && /^(to)$/.test(n)) add("Sau khuyết thiếu không có to", i, 2, `${w} + động từ nguyên mẫu`);
    if (/^(much)$/.test(w) && /^(people|friends|things|books|students|years|times|ideas)$/.test(n)) add("much / many", i, 2, `many ${n}`);
    if (/^(many)$/.test(w) && /^(water|money|time|information|advice|traffic|homework|music)$/.test(n)) add("much / many", i, 2, `much ${n}`);
  }
  return out;
}

/** Sentences counted from the punctuation the transcript carries. */
function sentenceCount(texts: readonly string[]): number {
  let n = 0;
  for (const t of texts) if (/[.!?]["')\]]?$/.test(t)) n++;
  return n;
}

/** `texts` are the words as written (with their punctuation), in order. */
export function grammarProfile(texts: readonly string[]): GrammarProfile {
  const list = words(texts.join(" "));
  return { words: list.length, structures: structuresOf(list), sentences: sentenceCount(texts), candidates: candidatesOf(list) };
}
