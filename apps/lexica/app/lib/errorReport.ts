/**
 * Error reports for the people who run Lexica, without the Sentry SDK (about
 * 70 kB of script for every learner, and one more thing that can break the
 * page). Sentry's own HTTP "envelope" format is small: one POST per error.
 * Off unless NEXT_PUBLIC_SENTRY_DSN is set.
 *
 * What leaves the device: the error's name, message and stack, the page path
 * (no query string, no hash), the browser's user agent and the app version.
 * Nothing from the learner's cards, answers or account.
 * Stacks come from the minified build, so they show where, not readable names.
 */

export interface Dsn {
    key: string;
    host: string;
    project: string;
    protocol: string;
}

/** `https://<key>@<host>/<project>`, or null when it is not one. */
export function parseDsn(raw: string | undefined | null): Dsn | null {
    if (!raw) return null;
    try {
        const u = new URL(raw.trim());
        const project = u.pathname.replace(/^\/+/, '');
        if (!u.username || !project || !/^\d+$/.test(project)) return null;
        return { key: u.username, host: u.host, project, protocol: u.protocol.replace(':', '') };
    } catch {
        return null;
    }
}

export interface Frame {
    function?: string;
    filename: string;
    lineno?: number;
    colno?: number;
}

/** Frames out of a Chrome ("at f (url:1:2)") or Safari/Firefox ("f@url:1:2") stack, oldest call first (Sentry's order). */
export function parseStack(stack: string | undefined): Frame[] {
    if (!stack) return [];
    const frames: Frame[] = [];
    for (const line of stack.split('\n')) {
        const chrome = /^\s*at (?:(.*?) \()?(.*?):(\d+):(\d+)\)?\s*$/.exec(line);
        const gecko = /^\s*(.*?)@(.*?):(\d+):(\d+)\s*$/.exec(line);
        const m = chrome ?? gecko;
        if (!m) continue;
        frames.push({ function: m[1] || undefined, filename: m[2], lineno: Number(m[3]), colno: Number(m[4]) });
    }
    return frames.reverse();
}

/** Noise that is not a fault of the app: extensions, resize loops, cross-origin "Script error." */
export function shouldIgnore(message: string, stack?: string): boolean {
    if (/ResizeObserver loop|^Script error\.?$|Non-Error promise rejection|AbortError|NotAllowedError|The user aborted a request/i.test(message)) return true;
    if (stack && /(chrome|moz|safari)-extension:\/\//.test(stack)) return true;
    return false;
}

const clean = (s: string, max: number) => s.slice(0, max);

export function buildEnvelope(dsn: Dsn, input: { name: string; message: string; stack?: string; path: string; userAgent: string; release: string; id: string; now: Date }): string {
    const event = {
        event_id: input.id,
        timestamp: input.now.getTime() / 1000,
        platform: 'javascript',
        level: 'error',
        release: input.release,
        exception: { values: [{ type: clean(input.name, 100), value: clean(input.message, 500), stacktrace: { frames: parseStack(input.stack).slice(-40) } }] },
        request: { url: input.path, headers: { 'User-Agent': clean(input.userAgent, 300) } },
    };
    const header = { event_id: input.id, sent_at: input.now.toISOString(), dsn: `${dsn.protocol}://${dsn.key}@${dsn.host}/${dsn.project}` };
    return [JSON.stringify(header), JSON.stringify({ type: 'event' }), JSON.stringify(event)].join('\n');
}

const MAX_PER_PAGE = 5;
let sent = 0;
const seen = new Set<string>();

/** Reports one error. Never throws and never reports more than a few per page load. */
export function reportError(error: unknown, extra?: { source?: string }): void {
    try {
        const dsn = parseDsn(process.env.NEXT_PUBLIC_SENTRY_DSN);
        if (!dsn || typeof window === 'undefined' || sent >= MAX_PER_PAGE) return;
        const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Non-Error value');
        if (shouldIgnore(err.message, err.stack)) return;
        const fingerprint = `${err.name}|${err.message}`;
        if (seen.has(fingerprint)) return;
        seen.add(fingerprint);
        sent++;
        const id = (crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/-/g, '').slice(0, 32).padEnd(32, '0');
        const body = buildEnvelope(dsn, {
            name: extra?.source ? `${err.name} (${extra.source})` : err.name,
            message: err.message,
            stack: err.stack,
            path: window.location.pathname,
            userAgent: navigator.userAgent,
            release: process.env.NEXT_PUBLIC_APP_VERSION || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'unknown',
            id,
            now: new Date(),
        });
        void fetch(`${dsn.protocol}://${dsn.host}/api/${dsn.project}/envelope/?sentry_key=${dsn.key}&sentry_version=7`, { method: 'POST', body, keepalive: true, mode: 'no-cors' }).catch(() => undefined);
    } catch {
        // Reporting must never break the app.
    }
}

/** Starts listening for errors nobody caught. Returns a function that stops. */
export function installErrorReporting(): () => void {
    const onError = (e: ErrorEvent) => reportError(e.error ?? e.message, { source: 'window' });
    const onRejection = (e: PromiseRejectionEvent) => reportError(e.reason, { source: 'promise' });
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
        window.removeEventListener('error', onError);
        window.removeEventListener('unhandledrejection', onRejection);
    };
}
