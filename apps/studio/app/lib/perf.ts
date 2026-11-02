/** Records every Studio API call so /system can show where time goes. */

export interface CallSample {
    key: string;
    total: number;
    server: number | null;
    guard: number | null;
    bytes: number;
    status: number;
}

export interface CallSummary {
    key: string;
    count: number;
    medianTotal: number;
    p95Total: number;
    medianServer: number | null;
    medianGuard: number | null;
    medianBytes: number;
    errors: number;
}

const MAX = 200;
const samples: CallSample[] = [];

/** `/cards/123?x=1` and `/cards/456?x=2` both become `GET /cards/:id`. */
export function perfKey(method: string, path: string): string {
    const clean = path
        .split('?')[0]
        .split('/')
        .map(seg => (/^(\d+|[0-9a-f]{8}-[0-9a-f-]{27,})$/i.test(seg) ? ':id' : seg))
        .join('/');
    return `${method} ${clean}`;
}

export function recordCall(sample: CallSample) {
    samples.push(sample);
    if (samples.length > MAX) samples.shift();
}

export function allSamples(): CallSample[] {
    return samples.slice();
}

export function clearSamples() {
    samples.length = 0;
}

function pct(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)];
}

function median(values: number[]): number | null {
    if (values.length === 0) return null;
    return pct([...values].sort((a, b) => a - b), 0.5);
}

/** Groups by path, slowest median first. */
export function summarize(list: CallSample[]): CallSummary[] {
    const groups = new Map<string, CallSample[]>();
    for (const s of list) groups.set(s.key, [...(groups.get(s.key) ?? []), s]);
    return [...groups.entries()]
        .map(([key, g]) => {
            const totals = g.map(s => s.total).sort((a, b) => a - b);
            return {
                key,
                count: g.length,
                medianTotal: pct(totals, 0.5),
                p95Total: pct(totals, 0.95),
                medianServer: median(g.flatMap(s => (s.server === null ? [] : [s.server]))),
                medianGuard: median(g.flatMap(s => (s.guard === null ? [] : [s.guard]))),
                medianBytes: median(g.map(s => s.bytes)) ?? 0,
                errors: g.filter(s => s.status >= 400 || s.status === 0).length,
            };
        })
        .sort((a, b) => b.medianTotal - a.medianTotal);
}
