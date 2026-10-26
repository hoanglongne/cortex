/**
 * Parents (docs/TEACH_PLAN.md, section 3): what a weekly report holds, the
 * week it covers, and what the parent and teacher calls return
 * (sql/classroom_parents.sql). The SQL keeps only these fields, at these sizes.
 */
import type { AppId } from './types';

/** One thing the child did this week, with real examples (class words) when there are some. */
export interface ReportItem {
    text: string;
    words?: string[];
}

/** An approved weekly report, as the parent sees it. Plain Vietnamese, few numbers. */
export interface ReportContent {
    v: 1;
    /** Days studied that week, 0–7. */
    days: number;
    /** The opening sentence. */
    summary: string;
    /** Up to 3. */
    did: ReportItem[];
    /** The one number: the verified vocabulary score, its IELTS range, the change since the test before. */
    score?: { score: number; ielts: string; delta?: number; at?: string };
    /** One concrete way the parent can help. */
    help?: string;
    /** The teacher's own words. */
    note?: string;
}

export interface ParentLink {
    code: string;
    /** The link asks for a PIN. */
    pin: boolean;
    created_at: string;
}

export interface ApprovedReport {
    content: ReportContent;
    approved_at: string;
    opens: number;
    first_opened_at: string | null;
}

/** The teacher's view of a class's parents for one week. */
export interface ClassParents {
    pin: boolean;
    links: Record<string, ParentLink>;
    reports: Record<string, ApprovedReport>;
}

/** A finished week's numbers per student (classroom_week_metrics). */
export type WeekMetrics = Record<string, { days: string[]; apps: Record<AppId, { end: unknown; start: unknown }> }>;

/** What the parent page gets. */
export type ParentView =
    | { need_pin: true; wrong?: boolean; locked?: boolean }
    | { need_pin?: undefined; name: string; class: string; reports: { week: string; content: ReportContent }[] };

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** The Monday ("YYYY-MM-DD") of the last finished week before `today` ("YYYY-MM-DD"), and `back` weeks earlier. */
export function lastWeek(today: string, back = 0): string {
    const t = new Date(`${today}T00:00:00Z`);
    const dow = (t.getUTCDay() + 6) % 7; // Monday 0
    return ymd(new Date(t.getTime() - (dow + 7 * (back + 1)) * DAY_MS));
}

/** "19/10 – 25/10" for a week's Monday. */
export function weekLabel(monday: string): string {
    const a = new Date(`${monday}T00:00:00Z`);
    const b = new Date(a.getTime() + 6 * DAY_MS);
    return `${a.getUTCDate()}/${a.getUTCMonth() + 1} – ${b.getUTCDate()}/${b.getUTCMonth() + 1}`;
}

/** The parent page address. */
export const parentLink = (teachUrl: string, code: string) => `${teachUrl.replace(/\/$/, '')}/p/${code}`;
