/**
 * Level 3 remarks for one attempt (docs/LEXICA_PRONUNCIATION_DESIGN.md, 6),
 * from the measures in prosody.ts: a weak final consonant, the stressed
 * syllable, the end of the pitch line, a flat voice, speed and pauses.
 * None has passed the Vietnamese-voice check yet, so the app shows them only
 * to testers and keeps the numbers in an on-device log (prosodyLog.ts). Pure.
 */
import { ipaOf, isVowel } from './phones';
import { contour, dtw, ending, finalConsonant, finalKind, intonationNotes, isYesNoQuestion, pace, paceNote, range, stressCheck, type Frames } from './prosody';
import { spellingSyllables } from './syllables';
import type { WordScores } from './model/client';

export type ProsodyKind = 'final' | 'stress' | 'ending' | 'flat' | 'slow' | 'fast' | 'pause';

export interface ProsodyNote {
    kind: ProsodyKind;
    text: string;
}

/** The raw measures, for the on-device log. */
export interface ProsodyMeasures {
    finalDb?: number | null;
    finalVerdict?: 'clear' | 'weak' | null;
    stress?: { expected: number; said: number | null } | null;
    ending?: number;
    range?: number;
    modelRange?: number;
    rate?: number;
    modelRate?: number;
    pauses?: number;
}

/** "a·BUN·dant" with syllable `k` in capitals, when the spelling splits into the right number of syllables. */
function marked(word: string, k: number, count: number): string | null {
    const parts = spellingSyllables(word);
    return parts.length === count ? parts.map((s, i) => (i === k ? s.toUpperCase() : s.toLowerCase())).join('-') : null;
}

/**
 * Remarks on one attempt at `target`. `words`: its words with dictionary
 * phones. `scored`: the phone-scoring model's output when it ran (then it
 * judges final consonants itself, and its vowel times drive the stress check).
 */
export function prosodyNotes(opts: { target: string; words: { word: string; phones: string[] }[]; mine: Frames; model: Frames | null; scored: WordScores[] | null }): { notes: ProsodyNote[]; measures: ProsodyMeasures } {
    const { words, mine, model, scored } = opts;
    const notes: ProsodyNote[] = [];
    const measures: ProsodyMeasures = {};

    if (words.length === 1) {
        const { word, phones } = words[0];
        // 6.1: only without the model, which scores the final phone directly.
        const kind = finalKind(phones);
        if (kind && !scored) {
            const c = finalConsonant(mine, kind);
            measures.finalDb = c.db;
            measures.finalVerdict = c.verdict;
            if (c.verdict === 'weak') notes.push({ kind: 'final', text: `Âm /${ipaOf(phones[phones.length - 1])}/ cuối của “${word}” nghe còn yếu. Đọc rõ âm cuối rồi mới dừng.` });
        }
        // 6.2
        const vowelSpans = scored?.[0]?.scores.filter((s) => isVowel(s.phone)).map((s) => ({ start: s.start, end: s.end }));
        const s = stressCheck(mine, phones, vowelSpans);
        if (s) {
            measures.stress = { expected: s.expected, said: s.said };
            if (s.verdict === 'off' && s.said !== null) {
                const count = phones.filter(isVowel).length;
                const right = marked(word, s.expected, count);
                const said = marked(word, s.said, count);
                notes.push({
                    kind: 'stress',
                    text: right && said ? `Bạn có vẻ nhấn ${said}. Nên nhấn ${right}.` : `Bạn có vẻ nhấn âm tiết thứ ${s.said + 1}. Nên nhấn âm tiết thứ ${s.expected + 1}.`,
                });
            }
        }
        return { notes, measures };
    }

    // 6.3: phrases and sentences, against the model voice.
    const mineC = contour(mine);
    const modelC = model ? contour(model) : null;
    if (modelC) {
        const question = isYesNoQuestion(opts.target);
        for (const n of intonationNotes(mineC, modelC, question))
            notes.push(
                n === 'ending'
                    ? { kind: 'ending', text: question ? 'Câu hỏi có/không thường lên giọng ở cuối. Bạn đang xuống giọng.' : 'Cuối câu kể thường xuống giọng. Bạn đang lên giọng ở cuối.' }
                    : { kind: 'flat', text: 'Giọng hơi đều. Thử nhấn rõ âm tiết được nhấn để cao độ lên xuống như giọng mẫu.' },
            );
    }

    // 6.4
    const syllables = words.reduce((n, w) => n + w.phones.filter(isVowel).length, 0);
    const p = pace(mine, syllables);
    const mp = model ? pace(model, syllables) : null;
    measures.rate = p ? Math.round(p.rate * 10) / 10 : undefined;
    measures.modelRate = mp ? Math.round(mp.rate * 10) / 10 : undefined;
    measures.pauses = p?.pauses.length;
    const pn = paceNote(p, mp);
    if (pn === 'slow') notes.push({ kind: 'slow', text: 'Bạn nói chậm hơn giọng mẫu khá nhiều. Thử nói liền hơn.' });
    if (pn === 'fast') notes.push({ kind: 'fast', text: 'Bạn nói nhanh hơn giọng mẫu khá nhiều. Chậm lại một chút để rõ từng âm.' });
    // A short phrase is said in one breath; a pause inside it breaks the chunk.
    if (p && p.pauses.length > 0 && words.length <= 6) {
        const after = scored ? pauseWord(scored, p.pauses[0][0]) : null;
        notes.push({ kind: 'pause', text: after ? `Bạn ngắt sau “${after}”. Cụm này nên nói liền một hơi.` : `Bạn ngắt ${p.pauses.length} chỗ giữa cụm. Cụm này nên nói liền một hơi.` });
    }
    measures.ending = mineC.length ? Math.round(ending(mineC) * 10) / 10 : undefined;
    measures.range = mineC.length ? Math.round(range(mineC) * 10) / 10 : undefined;
    measures.modelRange = modelC?.length ? Math.round(range(modelC) * 10) / 10 : undefined;
    return { notes: notes.slice(0, 2), measures };
}

/** The word whose last phone ends nearest before `time` (seconds). */
function pauseWord(scored: WordScores[], time: number): string | null {
    let best: string | null = null;
    for (const w of scored) {
        const end = w.scores[w.scores.length - 1]?.end;
        if (end !== undefined && end <= time + 0.05) best = w.word;
    }
    return best;
}

/**
 * The model voice's pitch line laid over the learner's (dynamic time
 * warping), both as semitones, resampled to `points`. For the drawing.
 */
export function overlay(mine: readonly number[], model: readonly number[], points = 40): { mine: number[]; model: number[] } | null {
    if (mine.length < 5 || model.length < 5) return null;
    const { path } = dtw(mine, model);
    const pick = (a: readonly number[], i: number) => a[Math.min(a.length - 1, Math.floor((i / (points - 1)) * (a.length - 1)))];
    return {
        mine: Array.from({ length: points }, (_, i) => pick(mine, i)),
        model: Array.from({ length: points }, (_, i) => model[path[Math.min(path.length - 1, Math.floor((i / (points - 1)) * (path.length - 1)))]]),
    };
}
