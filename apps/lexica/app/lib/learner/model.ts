/**
 * Lexica learner model (issue #143): four facets per word, each its own FSRS
 * memory, fed by an evidence log. Runs in shadow: the SM-2 schedule in
 * lib/srs.ts still decides reviews; this model only predicts, and its
 * predictions are scored against outcomes (`metrics`) so we can tell whether
 * it predicts better before letting it schedule.
 */
import type { ReportMark } from './report';
import { firstReview, retrievability, review, type Memory, type Rating } from './fsrs';

/** recog: sees it and knows it; recall: brings it up from a cue; produce: uses it in own sentence; wild: used it in real life. */
export const FACETS = ['recog', 'recall', 'produce', 'wild'] as const;
export type Facet = (typeof FACETS)[number];

export type Outcome = 'right' | 'wrong' | 'seen';
export type Source = 'swipe' | 'review' | 'speak' | 'write' | 'lived' | 'dial' | 'check';

export interface Evidence {
    cardId: string;
    facet: Facet;
    source: Source;
    outcome: Outcome;
    /** How much to trust it: 1 = a graded answer; below 1 = a weak, implicit signal. */
    weight: number;
    at: number;
}

/** Compact log row: [cardId, facet index, source, outcome, weight, at]. */
export type EvidenceRow = [string, number, Source, Outcome, number, number];

export interface ModelScore { n: number; logLoss: number; brier: number }

export interface LearnerState {
    /** cardId -> facet -> memory. */
    memories: Record<string, Partial<Record<Facet, Memory>>>;
    /** Last evidence, newest last, capped (the backup has a size limit). */
    log: EvidenceRow[];
    /** Prediction scores on graded recognition answers: FSRS vs the SM-2 schedule. */
    metrics: { fsrs: ModelScore; sm2: ModelScore };
    /** Núm vặn weekly check results (lib/learner/dialSignal.ts). */
    dial?: { asked: number; correct: number; lastCheck?: number };
    /** Random per learner, for the experiment split. */
    seed?: string;
    /** Last weekly F0 report sent (lib/learner/report.ts). */
    reported?: ReportMark;
    /** When FSRS started scheduling this learner (F2); unset while on SM-2. */
    fsrsSince?: number;
}

export const LOG_CAP = 1500;
/** Only evidence at least this strong updates a memory; weaker evidence is only logged. */
export const UPDATE_WEIGHT = 1;

export const emptyLearner = (): LearnerState => ({
    memories: {},
    log: [],
    metrics: { fsrs: { n: 0, logLoss: 0, brier: 0 }, sm2: { n: 0, logLoss: 0, brier: 0 } },
});

/** Unlocking: a facet is scheduled only once the one before it holds for a week (≥ 85%). */
export function unlocked(mem: Partial<Record<Facet, Memory>> | undefined, facet: Facet, now: number): boolean {
    const i = FACETS.indexOf(facet);
    if (i === 0) return true;
    const prev = mem?.[FACETS[i - 1]];
    if (!prev) return false;
    return retrievability({ s: prev.s, last: now - 7 * 86_400_000 }, now) >= 0.85;
}

const score = (s: ModelScore, p: number, y: 0 | 1): ModelScore => {
    const q = Math.min(1 - 1e-6, Math.max(1e-6, p));
    return { n: s.n + 1, logLoss: s.logLoss - (y ? Math.log(q) : Math.log(1 - q)), brier: s.brier + (q - y) ** 2 };
};

/** What the SM-2 schedule implies about recall now: 90% at the due date, decaying the same shape. */
export function sm2Recall(lastReviewedAt: number, nextReviewAt: number, now: number): number {
    const interval = Math.max(0.5, (nextReviewAt - lastReviewedAt) / 86_400_000);
    const s = interval; // FSRS-shaped curve with R = 0.9 at the interval
    return retrievability({ s, last: lastReviewedAt }, now);
}

export function record(
    state: LearnerState,
    e: Evidence,
    sm2?: { lastReviewedAt: number; nextReviewAt: number },
): LearnerState {
    const row: EvidenceRow = [e.cardId, FACETS.indexOf(e.facet), e.source, e.outcome, Math.round(e.weight * 100) / 100, e.at];
    const log = [...state.log, row].slice(-LOG_CAP);
    if (e.weight < UPDATE_WEIGHT || e.outcome === 'seen') return { ...state, log };

    const mems = { ...(state.memories[e.cardId] ?? {}) };
    const prev = mems[e.facet];
    const rating: Rating = e.outcome === 'right' ? 3 : 1;
    let metrics = state.metrics;
    // Score both models on graded recognition answers, before learning from them.
    if (e.facet === 'recog' && prev && sm2 && sm2.nextReviewAt > sm2.lastReviewedAt) {
        const y = e.outcome === 'right' ? 1 : 0;
        metrics = {
            fsrs: score(metrics.fsrs, retrievability(prev, e.at), y),
            sm2: score(metrics.sm2, sm2Recall(sm2.lastReviewedAt, sm2.nextReviewAt, e.at), y),
        };
    }
    mems[e.facet] = prev ? review(prev, rating, e.at) : firstReview(rating, e.at);
    return { ...state, memories: { ...state.memories, [e.cardId]: mems }, log, metrics };
}

/** Recall probability now per facet (undefined: no evidence yet). */
export function facetRecall(state: LearnerState, cardId: string, now: number): Partial<Record<Facet, number>> {
    const out: Partial<Record<Facet, number>> = {};
    for (const f of FACETS) {
        const m = state.memories[cardId]?.[f];
        if (m) out[f] = retrievability(m, now);
    }
    return out;
}

/** Mean log loss per answer (lower is better), or null with too few answers. */
export function meanLogLoss(s: ModelScore, min = 30): number | null {
    return s.n >= min ? s.logLoss / s.n : null;
}

/** Starts the recognition facet from the SM-2 schedule for words learned before the model existed. */
export function seedFromSm2(
    state: LearnerState,
    progress: Record<string, { lastReviewedAt: number; nextReviewAt: number; reviewCount: number; wrongCount: number }>,
): LearnerState {
    let changed = false;
    const memories = { ...state.memories };
    for (const [id, p] of Object.entries(progress)) {
        if (memories[id]?.recog || !p.lastReviewedAt) continue;
        const interval = Math.max(0.5, (p.nextReviewAt - p.lastReviewedAt) / 86_400_000);
        memories[id] = { ...(memories[id] ?? {}), recog: { s: interval, d: 5, last: p.lastReviewedAt, reps: p.reviewCount, lapses: p.wrongCount } };
        changed = true;
    }
    return changed ? { ...state, memories } : state;
}

type Progress = Record<string, { reviewCount: number; wrongCount: number; lastReviewedAt: number; nextReviewAt: number }>;
interface Watched {
    cardProgress: Progress;
    spokenAt: Record<string, number>;
    speakMisses: Record<string, number>;
    mySentences: Record<string, unknown>;
    journeys: Record<string, { livedAt?: number }>;
}

/**
 * Evidence implied by a store change, so review paths need no edits:
 * a right/wrong count going up is a graded recognition answer; a new
 * spokenAt is a speaking try (a new miss means unclear); a new own sentence
 * is production; livedAt set is use in real life.
 */
export function evidenceFromChange(prev: Watched, next: Watched, now: number): { e: Evidence; sm2?: { lastReviewedAt: number; nextReviewAt: number } }[] {
    const out: { e: Evidence; sm2?: { lastReviewedAt: number; nextReviewAt: number } }[] = [];
    if (next.cardProgress !== prev.cardProgress) {
        for (const [id, p] of Object.entries(next.cardProgress)) {
            const q = prev.cardProgress[id];
            const right = p.reviewCount - (q?.reviewCount ?? 0);
            const wrong = p.wrongCount - (q?.wrongCount ?? 0);
            const sm2 = q ? { lastReviewedAt: q.lastReviewedAt, nextReviewAt: q.nextReviewAt } : undefined;
            if (wrong > 0) out.push({ e: { cardId: id, facet: 'recog', source: 'review', outcome: 'wrong', weight: 1, at: now }, sm2 });
            else if (right > 0) out.push({ e: { cardId: id, facet: 'recog', source: 'review', outcome: 'right', weight: 1, at: now }, sm2 });
        }
    }
    if (next.spokenAt !== prev.spokenAt) {
        for (const [id, t] of Object.entries(next.spokenAt)) {
            if (t === prev.spokenAt[id]) continue;
            const missed = (next.speakMisses[id] ?? 0) > (prev.speakMisses[id] ?? 0);
            out.push({ e: { cardId: id, facet: 'produce', source: 'speak', outcome: missed ? 'wrong' : 'right', weight: 1, at: now } });
        }
    }
    if (next.mySentences !== prev.mySentences) {
        for (const id of Object.keys(next.mySentences)) {
            if (next.mySentences[id] !== prev.mySentences[id] && next.mySentences[id]) {
                out.push({ e: { cardId: id, facet: 'produce', source: 'write', outcome: 'right', weight: 1, at: now } });
            }
        }
    }
    if (next.journeys !== prev.journeys) {
        for (const [id, j] of Object.entries(next.journeys)) {
            if (j?.livedAt && !prev.journeys[id]?.livedAt) {
                out.push({ e: { cardId: id, facet: 'wild', source: 'lived', outcome: 'right', weight: 1, at: now } });
            }
        }
    }
    return out;
}
