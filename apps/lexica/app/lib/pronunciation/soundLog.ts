/**
 * Level 4 (docs/LEXICA_PRONUNCIATION_DESIGN.md, 7): which sound groups a
 * learner misses, over time. Each attempt counts one try for every group
 * the word has a sound of, and one miss for every group the app heard off
 * (levels 2 and 3). Kept 60 days, per local day, synced with the rest of
 * the store. Feeds "Âm hay sai", the 2-minute practice suggestion and the
 * class report (numbers only). Pure, unit tested.
 */
import { oftenMissed, SOUND_KINDS, type Sounds } from '@cortex/classroom-lexica';
import type { ErrorKind } from './pairs';
import { bare, isVowel } from './phones';
import { spelledEnding } from './sounds';

/** Per group, per local day ("2026-10-21"): [tries, misses]. */
export type SoundLog = Partial<Record<ErrorKind, Record<string, [number, number]>>>;

export const KEEP_DAYS = 60;

const SONORANTS = new Set(['L', 'R', 'M', 'N', 'NG', 'W', 'Y']);

/** The groups a word gives a chance to get wrong, from its phones (and spelling, for -s/-ed endings). */
export function exposures(phones: readonly string[], word?: string): Set<ErrorKind> {
    const p = phones.map(bare);
    const out = new Set<ErrorKind>();
    const first = phones.findIndex(isVowel);
    let lastVowel = -1;
    phones.forEach((x, i) => {
        if (isVowel(x)) lastVowel = i;
    });
    const n = p.length;
    const last = p[n - 1];
    if (n > 0 && !isVowel(phones[n - 1])) {
        out.add('final_consonant');
        if (['D', 'Z', 'V', 'G', 'B', 'JH', 'DH'].includes(last)) out.add('final_voicing');
        if (['S', 'Z', 'T', 'D'].includes(last) && n > 1 && !isVowel(phones[n - 2]) && (word === undefined ? !SONORANTS.has(p[n - 2]) : spelledEnding(word))) out.add('ending');
        if (last === 'NG') out.add('final_ng');
    }
    if (p.includes('TH') || p.includes('DH')) out.add('th');
    if (first >= 2) out.add('cluster');
    if (p.some((x) => ['IY', 'IH', 'UW', 'UH'].includes(x))) out.add('long_short');
    if (p.some((x) => ['SH', 'CH', 'JH', 'ZH'].includes(x))) out.add('ch_j');
    if (p.includes('R') || (lastVowel >= 0 && p.slice(lastVowel + 1).includes('L'))) out.add('final_l');
    if (p[0] === 'Z') out.add('initial_z');
    if (p.includes('AE') || p.includes('EH')) out.add('ae_e');
    return out;
}

/** The log with one attempt added: `tried` groups get a try, `missed` ones a miss too. Days older than 60 are dropped. */
export function addAttempt(log: SoundLog, day: string, tried: Iterable<ErrorKind>, missed: Iterable<ErrorKind>): SoundLog {
    const miss = new Set(missed);
    const all = new Set([...tried, ...miss]);
    const out: SoundLog = {};
    const oldest = shiftDay(day, -(KEEP_DAYS - 1));
    for (const kind of SOUND_KINDS) {
        const days = Object.fromEntries(Object.entries(log[kind] ?? {}).filter(([d]) => d >= oldest)) as Record<string, [number, number]>;
        if (all.has(kind)) {
            const [t, m] = days[day] ?? [0, 0];
            days[day] = [t + 1, m + (miss.has(kind) ? 1 : 0)];
        }
        if (Object.keys(days).length) out[kind] = days;
    }
    return out;
}

/** "2026-10-21" moved by `n` days. */
export function shiftDay(day: string, n: number): string {
    const [y, m, d] = day.split('-').map(Number);
    const t = new Date(y, m - 1, d + n);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

/** Tries and misses of one group over the `days` days ending `day` (included), skipping the last `skip` days. */
export function totals(log: SoundLog, kind: ErrorKind, day: string, days: number, skip = 0): [number, number] {
    const to = shiftDay(day, -skip);
    const from = shiftDay(day, -(skip + days - 1));
    let t = 0;
    let m = 0;
    for (const [d, [dt, dm]] of Object.entries(log[kind] ?? {}))
        if (d >= from && d <= to) {
            t += dt;
            m += dm;
        }
    return [t, m];
}

/** What the class report sends: every group over the last 14 days. */
export function reportSounds(log: SoundLog, day: string): Sounds {
    const out: Sounds = {};
    for (const kind of SOUND_KINDS) {
        const pair = totals(log, kind, day, 14);
        if (pair[0] > 0) out[kind] = pair;
    }
    return out;
}

export interface WeakSound {
    kind: ErrorKind;
    tries: number;
    misses: number;
    /** This week against the week before: needs 3 tries in each. */
    trend: 'better' | 'same' | 'worse' | null;
}

const rate = ([t, m]: [number, number]) => (t ? m / t : 0);

/**
 * The groups missed most over the last 14 days (at least 3 tries, at least
 * one miss), up to `top`, highest miss rate first.
 */
export function weakSounds(log: SoundLog, day: string, top = 3): WeakSound[] {
    return SOUND_KINDS.map((kind): WeakSound & { rate: number } => {
        const [tries, misses] = totals(log, kind, day, 14);
        const now = totals(log, kind, day, 7);
        const before = totals(log, kind, day, 7, 7);
        const ok = now[0] >= 3 && before[0] >= 3;
        const delta = rate(now) - rate(before);
        return { kind, tries, misses, rate: tries ? misses / tries : 0, trend: !ok ? null : delta <= -0.15 ? 'better' : delta >= 0.15 ? 'worse' : 'same' };
    })
        .filter((w) => w.tries >= 3 && w.misses > 0)
        .sort((a, b) => b.rate - a.rate || b.misses - a.misses)
        .slice(0, top)
        .map(({ kind, tries, misses, trend }) => ({ kind, tries, misses, trend }));
}

/** Groups that got clearly better this week (for a word of praise). */
export function improved(log: SoundLog, day: string): ErrorKind[] {
    return SOUND_KINDS.filter((kind) => {
        const now = totals(log, kind, day, 7);
        const before = totals(log, kind, day, 7, 7);
        return now[0] >= 3 && before[0] >= 3 && rate(before) >= 0.3 && rate(now) <= rate(before) - 0.2;
    });
}

/** The group to practise for 2 minutes: 5+ tries and over 40% missed in 14 days, the worst first. Null when none. */
export function practiceSuggestion(log: SoundLog, day: string): ErrorKind | null {
    const candidates = SOUND_KINDS.map((kind) => ({ kind, pair: totals(log, kind, day, 14) })).filter((c) => oftenMissed(c.pair));
    candidates.sort((a, b) => rate(b.pair) - rate(a.pair));
    return candidates[0]?.kind ?? null;
}
