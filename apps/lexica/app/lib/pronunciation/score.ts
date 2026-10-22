/**
 * Scoring a spoken attempt in three levels from what speech recognition
 * heard (docs/LEXICA_FEEDBACK_TASKS.md T8). Recognition is not pronunciation
 * grading: it tends to "correct" a near miss into the right word, so a
 * match is only "Rõ" when the engine was also confident.
 */

export type SpeakLevel = 'clear' | 'close' | 'unclear';

export const LEVEL_LABEL: Record<SpeakLevel, string> = {
    clear: 'Rõ',
    close: 'Gần đúng',
    unclear: 'Chưa rõ',
};

export interface Alternative {
    transcript: string;
    /** 0–1; some browsers report 0 when they don't know. */
    confidence: number;
}

const letters = (s: string) => s.toLowerCase().replace(/[^a-z' ]/g, '').trim();

export function editDistance(a: string, b: string): number {
    const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = dp[j];
            dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return dp[b.length];
}

/** The word (or phrase) inside a transcript closest to the target. */
function closest(transcript: string, target: string): { text: string; distance: number } {
    const t = letters(target);
    const words = letters(transcript).split(/\s+/).filter(Boolean);
    const n = t.split(/\s+/).length;
    let best = { text: letters(transcript), distance: editDistance(letters(transcript), t) };
    for (let i = 0; i + n <= words.length; i++) {
        const piece = words.slice(i, i + n).join(' ');
        const d = editDistance(piece, t);
        if (d < best.distance) best = { text: piece, distance: d };
    }
    return best;
}

/** Confidence at or above this, with an exact match, counts as clear. */
export const CLEAR_CONFIDENCE = 0.6;

export function scoreAttempt(target: string, alternatives: readonly Alternative[]): { level: SpeakLevel; heard: string } {
    if (alternatives.length === 0) return { level: 'unclear', heard: '' };
    const t = letters(target);
    const top = alternatives[0];
    const topHit = closest(top.transcript, t);
    // Browsers that report 0 confidence give no signal; trust a top exact match then.
    const confident = top.confidence >= CLEAR_CONFIDENCE || top.confidence === 0;
    if (topHit.distance === 0 && confident) return { level: 'clear', heard: topHit.text };
    const anyExact = alternatives.some((a) => closest(a.transcript, t).distance === 0);
    const near = topHit.distance <= Math.max(1, Math.floor(t.length * 0.25));
    if (anyExact || near) return { level: 'close', heard: topHit.text };
    return { level: 'unclear', heard: topHit.text };
}

export interface DiffPart {
    text: string;
    ok: boolean;
}

/**
 * What was heard, with the letters that differ from the target marked
 * ("cognative" against "cognitive": the "a" is off).
 */
export function diffHeard(heard: string, target: string): DiffPart[] {
    const a = letters(heard);
    const b = letters(target);
    // Align by an LCS table; letters of `heard` not in the alignment are off.
    const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--)
        for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out: DiffPart[] = [];
    const push = (ch: string, ok: boolean) => {
        const last = out[out.length - 1];
        if (last && last.ok === ok) last.text += ch;
        else out.push({ text: ch, ok });
    };
    let i = 0;
    let j = 0;
    while (i < a.length) {
        if (j < b.length && a[i] === b[j]) {
            push(a[i], true);
            i++;
            j++;
        } else if (j < b.length && dp[i][j + 1] >= dp[i + 1][j]) {
            j++;
        } else {
            push(a[i], false);
            i++;
        }
    }
    return out;
}

/**
 * How clearly the target came through, 0–1, from recognition alone: how close
 * the best reading is to the target (letters), how sure the engine was, and
 * whether the right reading came first or only among the alternatives.
 * Smooth where the three levels are steps, so the score moves with the attempt.
 */
export function clarity(target: string, alternatives: readonly Alternative[]): number {
    if (alternatives.length === 0) return 0;
    const t = letters(target);
    if (!t) return 0;
    let best = 0;
    alternatives.forEach((a, rank) => {
        const hit = closest(a.transcript, t);
        const match = Math.max(0, 1 - hit.distance / Math.max(t.length, 1));
        // 0 means "the browser does not say": treat as fairly sure, not as unsure.
        const sure = a.confidence > 0 ? a.confidence : 0.85;
        const value = match * (0.7 + 0.3 * sure) * (rank === 0 ? 1 : 0.85);
        best = Math.max(best, value);
    });
    return best;
}
