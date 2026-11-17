/**
 * FSRS stage F0 (docs/LEXICA_FSRS_MIGRATION_PLAN.md): a weekly, anonymous,
 * numbers-only report of how well FSRS and SM-2 predicted this learner's
 * answers, plus the review rows needed to fit FSRS weights (F1).
 *
 * Nothing here holds text the learner wrote: only a deck word id, right/wrong
 * and the number of days since the previous review of that word.
 */
import { FACETS, type EvidenceRow, type LearnerState, type ModelScore } from './model';

export const REPORT_EVERY_MS = 7 * 24 * 3600 * 1000;
/** Rows sent per report, so one event stays small. */
export const FIT_ROWS_CAP = 300;

export interface ReportMark { at: number; fsrs: ModelScore; sm2: ModelScore; logAt: number }

const r3 = (x: number) => Math.round(x * 1000) / 1000;
const diff = (a: ModelScore, b?: ModelScore): ModelScore => ({
    n: a.n - (b?.n ?? 0),
    logLoss: a.logLoss - (b?.logLoss ?? 0),
    brier: a.brier - (b?.brier ?? 0),
});

/**
 * Graded recognition reviews as [wordId, right 0/1, days since the previous
 * review of the same word]. First reviews have no gap and are skipped.
 * Only rows newer than `after` are returned (gaps still use older rows).
 */
export function fitRows(log: EvidenceRow[], after = 0, cap = FIT_ROWS_CAP): [string, 0 | 1, number][] {
    const recog = FACETS.indexOf('recog');
    const last = new Map<string, number>();
    const out: [string, 0 | 1, number][] = [];
    for (const [id, facet, , outcome, weight, at] of log) {
        if (facet !== recog || weight < 1 || outcome === 'seen') continue;
        const prev = last.get(id);
        last.set(id, at);
        if (prev === undefined || at <= after) continue;
        out.push([id, outcome === 'right' ? 1 : 0, r3((at - prev) / 86_400_000)]);
    }
    return out.slice(-cap);
}

/**
 * The report due now, or null. Sums (not means) are sent so they add up
 * across weeks and learners; `mark` is what to store once it is sent.
 */
export function weeklyReport(
    state: LearnerState,
    last: ReportMark | undefined,
    now: number,
): { props: Record<string, number | string>; mark: ReportMark } | null {
    if (last && now - last.at < REPORT_EVERY_MS) return null;
    const f = diff(state.metrics.fsrs, last?.fsrs);
    const s = diff(state.metrics.sm2, last?.sm2);
    const rows = fitRows(state.log, last?.logAt ?? 0);
    if (f.n <= 0 && rows.length === 0) return null;
    return {
        props: {
            n: f.n,
            ll_fsrs: r3(f.logLoss),
            ll_sm2: r3(s.logLoss),
            brier_fsrs: r3(f.brier),
            brier_sm2: r3(s.brier),
            n_total: state.metrics.fsrs.n,
            rows: JSON.stringify(rows),
        },
        mark: {
            at: now,
            fsrs: state.metrics.fsrs,
            sm2: state.metrics.sm2,
            logAt: state.log.length ? state.log[state.log.length - 1][5] : last?.logAt ?? 0,
        },
    };
}
