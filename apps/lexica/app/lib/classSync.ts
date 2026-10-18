/**
 * Keeps a student's classes in step (lib/classes.ts): fetches the classes and
 * their assigned words now and then, and reports the four numbers when they
 * change. Nothing runs for learners who are not signed in or in no class.
 */
import { useLexicaStore } from '../store/lexicaStore';
import { getSupabaseClient } from './supabase';
import { cacheClasses, lexicaReport, myClasses, readCachedClasses, reportProgress, type ClassInfo } from './classes';

const FETCH_EVERY_MS = 10 * 60_000;
const REPORT_DEBOUNCE_MS = 20_000;

let started = false;
let lastFetch = 0;
let lastReport = '';
let timer: ReturnType<typeof setTimeout> | null = null;

async function signedIn(): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { data } = await client.auth.getSession();
    return Boolean(data.session);
}

/** Fetches the classes when the cached list is old (or `force`). */
export async function refreshClasses(force = false): Promise<ClassInfo[]> {
    if (!force && Date.now() - lastFetch < FETCH_EVERY_MS) return readCachedClasses();
    if (!(await signedIn())) return readCachedClasses();
    try {
        const list = await myClasses();
        lastFetch = Date.now();
        cacheClasses(list);
        return list;
    } catch {
        return readCachedClasses();
    }
}

/** Sends the numbers to every class the student is in, when they changed. */
export async function reportNow(): Promise<void> {
    const classes = readCachedClasses().filter((c) => c.role === 'student');
    if (classes.length === 0 || !(await signedIn())) return;
    const { journeys, currentStreak } = useLexicaStore.getState();
    const report = lexicaReport(journeys, classes);
    const key = JSON.stringify([report, currentStreak]);
    if (key === lastReport) return;
    try {
        await reportProgress(report, currentStreak);
        lastReport = key;
    } catch {
        // Offline: the next change or visit reports again.
    }
}

function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        timer = null;
        void reportNow();
    }, REPORT_DEBOUNCE_MS);
}

/** Wire up once per page load (called from <ClassSync />). */
export function startClassSync(): () => void {
    if (started || typeof window === 'undefined') return () => {};
    started = true;
    void refreshClasses(true).then(() => reportNow());
    let lastJourneys = useLexicaStore.getState().journeys;
    const unsubscribe = useLexicaStore.subscribe((s) => {
        if (s.journeys === lastJourneys) return;
        lastJourneys = s.journeys;
        schedule();
    });
    const onVisibility = () => {
        if (document.visibilityState === 'visible') void refreshClasses().then(() => reportNow());
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
        started = false;
        unsubscribe();
        document.removeEventListener('visibilitychange', onVisibility);
        if (timer) clearTimeout(timer);
    };
}
