/**
 * Backs up Lexica progress to Cortex Core API (/v1/sync/backup) for users
 * connected to Cortex, and restores it on a new device.
 *
 * The backup is the exact zustand-persisted blob in localStorage
 * ('lexica-storage'), so no store fields need to be mapped by hand.
 * Conflicts are last-write-wins on the client-side save time.
 */

import { CORTEX_API_URL } from './cortexConfig';
import { useLexicaStore } from '../store/lexicaStore';

const STORE_KEY = 'lexica-storage';
const META_KEY = 'lexica_sync_meta';
const USER_KEY = 'cortex_user_id';
const UPLOAD_DEBOUNCE_MS = 10_000;
/** Browsers cap keepalive request bodies at 64 KB. */
const KEEPALIVE_LIMIT = 60_000;

export type SyncMeta = {
    /** Cortex user the local progress was last synced for */
    userId: string | null;
    /** savedAt of the backup this device last uploaded or restored */
    lastSyncedAt: string | null;
    /** last time local progress changed */
    localModifiedAt: string | null;
};

export type BackupData = { savedAt: string; state: unknown };

export type SyncAction = 'restore' | 'upload' | 'none';

const t = (iso: string | null | undefined) => (iso ? Date.parse(iso) || 0 : 0);

/** Pure decision logic, unit tested. */
export function decideSync(input: {
    userId: string;
    remoteSavedAt: string | null;
    meta: SyncMeta;
    localHasProgress: boolean;
}): SyncAction {
    const { userId, remoteSavedAt, meta, localHasProgress } = input;
    const localDirty = t(meta.localModifiedAt) > t(meta.lastSyncedAt);

    if (!remoteSavedAt) return localHasProgress ? 'upload' : 'none';
    // Local progress belongs to another Cortex account on this browser:
    // never push it into this account.
    if (meta.userId && meta.userId !== userId) return 'restore';
    // Fresh install or cleared storage: take whatever the cloud has.
    if (!localHasProgress) return 'restore';

    const remoteChangedElsewhere = t(remoteSavedAt) > t(meta.lastSyncedAt);
    if (remoteChangedElsewhere && !localDirty) return 'restore';
    if (remoteChangedElsewhere && localDirty) {
        return t(remoteSavedAt) > t(meta.localModifiedAt) ? 'restore' : 'upload';
    }
    return localDirty ? 'upload' : 'none';
}

/**
 * Fingerprint of the fields that are real learning progress. Opening the app
 * changes other persisted fields (energy reset, daily counters), which must
 * not count as "newer" or a reopened device would overwrite another device.
 */
export function progressFingerprint(rawState: string | null): string {
    if (!rawState) return '';
    try {
        const s = (JSON.parse(rawState) as { state?: Record<string, unknown> }).state ?? {};
        return JSON.stringify([
            s.cardProgress,
            s.learnedWords,
            s.userStats,
            s.unlockedStories,
            s.unlockedStoryPart1,
            s.readStories,
            s.readStoryPart1,
            s.studyHistory,
        ]);
    } catch {
        return '';
    }
}

export function hasProgress(rawState: string | null): boolean {
    if (!rawState) return false;
    try {
        const parsed = JSON.parse(rawState) as { state?: { cardProgress?: object } };
        return Object.keys(parsed.state?.cardProgress ?? {}).length > 0;
    } catch {
        return false;
    }
}

// ---------------------------------------------------------------------------
// Browser wiring
// ---------------------------------------------------------------------------

let started = false;
let applyingRemote = false;
let inFlight: Promise<void> | null = null;
let rerun = false;
let uploadTimer: ReturnType<typeof setTimeout> | null = null;
let lastFingerprint = '';

function read(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function write(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // storage full or blocked; sync is best-effort
    }
}

function readMeta(): SyncMeta {
    try {
        const parsed = JSON.parse(read(META_KEY) || '{}') as Partial<SyncMeta>;
        return {
            userId: parsed.userId ?? null,
            lastSyncedAt: parsed.lastSyncedAt ?? null,
            localModifiedAt: parsed.localModifiedAt ?? null,
        };
    } catch {
        return { userId: null, lastSyncedAt: null, localModifiedAt: null };
    }
}

function writeMeta(meta: SyncMeta) {
    write(META_KEY, JSON.stringify(meta));
}

function endpoint(): { base: string; userId: string } | null {
    const userId = read(USER_KEY);
    if (!CORTEX_API_URL || !userId) return null;
    return { base: CORTEX_API_URL, userId };
}

async function upload(opts: { keepalive?: boolean } = {}): Promise<void> {
    const target = endpoint();
    const raw = read(STORE_KEY);
    if (!target || !raw) return;

    const savedAt = readMeta().localModifiedAt ?? new Date().toISOString();
    const body = JSON.stringify({
        userId: target.userId,
        appSource: 'lexica',
        data: { savedAt, state: JSON.parse(raw) } satisfies BackupData,
    });

    const res = await fetch(`${target.base}/v1/sync/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: Boolean(opts.keepalive) && body.length < KEEPALIVE_LIMIT,
    });
    if (!res.ok) throw new Error(`Backup failed: ${res.status}`);
    writeMeta({ ...readMeta(), userId: target.userId, lastSyncedAt: savedAt });
}

async function fetchRemote(): Promise<BackupData | null> {
    const target = endpoint();
    if (!target) return null;
    const res = await fetch(
        `${target.base}/v1/sync/backup/${encodeURIComponent(target.userId)}/lexica`,
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Fetch backup failed: ${res.status}`);
    const body = (await res.json()) as { data?: BackupData };
    return body.data?.savedAt && body.data.state ? body.data : null;
}

async function restore(remote: BackupData, userId: string) {
    applyingRemote = true;
    try {
        write(STORE_KEY, JSON.stringify(remote.state));
        await useLexicaStore.persist.rehydrate();
        lastFingerprint = progressFingerprint(read(STORE_KEY));
        writeMeta({ userId, lastSyncedAt: remote.savedAt, localModifiedAt: remote.savedAt });
    } finally {
        applyingRemote = false;
    }
}

/**
 * Pull/push once. A call made while a sync is running is not dropped: the
 * running sync is followed by one more pass, and both callers wait for it.
 */
export function syncNow(): Promise<void> {
    if (inFlight) {
        rerun = true;
        return inFlight;
    }
    inFlight = (async () => {
        try {
            do {
                rerun = false;
                await syncOnce();
            } while (rerun);
        } finally {
            inFlight = null;
        }
    })();
    return inFlight;
}

async function syncOnce(): Promise<void> {
    const target = endpoint();
    if (!target) return;
    try {
        const remote = await fetchRemote();
        const action = decideSync({
            userId: target.userId,
            remoteSavedAt: remote?.savedAt ?? null,
            meta: readMeta(),
            localHasProgress: hasProgress(read(STORE_KEY)),
        });
        if (action === 'restore' && remote) await restore(remote, target.userId);
        else if (action === 'upload') await upload();
    } catch (err) {
        if (process.env.NODE_ENV === 'development') console.warn('[CloudSync]', err);
    }
}

function scheduleUpload() {
    if (uploadTimer) clearTimeout(uploadTimer);
    uploadTimer = setTimeout(() => {
        uploadTimer = null;
        if (endpoint()) upload().catch(() => {});
    }, UPLOAD_DEBOUNCE_MS);
}

/** Wire up once per page load (called from <CloudSync />). */
export function startCloudSync(): () => void {
    if (started || typeof window === 'undefined') return () => {};
    started = true;

    lastFingerprint = progressFingerprint(read(STORE_KEY));
    const unsubscribe = useLexicaStore.subscribe(() => {
        if (applyingRemote) return;
        // persist middleware has already written the new state synchronously
        const fingerprint = progressFingerprint(read(STORE_KEY));
        if (fingerprint === lastFingerprint) return;
        lastFingerprint = fingerprint;
        writeMeta({ ...readMeta(), localModifiedAt: new Date().toISOString() });
        scheduleUpload();
    });

    const onVisibility = () => {
        if (document.visibilityState === 'visible') {
            void syncNow();
        } else if (uploadTimer && endpoint()) {
            // Leaving the page with an upload pending: flush it now
            clearTimeout(uploadTimer);
            uploadTimer = null;
            upload({ keepalive: true }).catch(() => {});
        }
    };
    document.addEventListener('visibilitychange', onVisibility);

    void syncNow();

    return () => {
        started = false;
        unsubscribe();
        document.removeEventListener('visibilitychange', onVisibility);
        if (uploadTimer) clearTimeout(uploadTimer);
    };
}
