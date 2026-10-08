import { describe, expect, it, vi } from 'vitest';

// cloudSync imports the store; the decision logic under test doesn't need it
vi.mock('@/app/store/lexicaStore', () => ({ useLexicaStore: {} }));

import { decideSync, hasProgress, progressFingerprint, type SyncMeta } from '@/app/lib/cloudSync';

const U = 'user-1';
const meta = (m: Partial<SyncMeta> = {}): SyncMeta => ({
    userId: U,
    lastSyncedAt: null,
    localModifiedAt: null,
    ...m,
});

describe('decideSync', () => {
    it('uploads local progress when the cloud has nothing', () => {
        expect(decideSync({ userId: U, remoteSavedAt: null, meta: meta(), localHasProgress: true })).toBe('upload');
    });

    it('does nothing when both sides are empty', () => {
        expect(decideSync({ userId: U, remoteSavedAt: null, meta: meta(), localHasProgress: false })).toBe('none');
    });

    it('restores on a fresh device', () => {
        expect(
            decideSync({ userId: U, remoteSavedAt: '2026-10-01T00:00:00Z', meta: meta(), localHasProgress: false }),
        ).toBe('restore');
    });

    it('restores when another device synced since and nothing changed here', () => {
        expect(
            decideSync({
                userId: U,
                remoteSavedAt: '2026-10-02T00:00:00Z',
                meta: meta({ lastSyncedAt: '2026-10-01T00:00:00Z', localModifiedAt: '2026-10-01T00:00:00Z' }),
                localHasProgress: true,
            }),
        ).toBe('restore');
    });

    it('uploads local changes when the cloud has not moved', () => {
        expect(
            decideSync({
                userId: U,
                remoteSavedAt: '2026-10-01T00:00:00Z',
                meta: meta({ lastSyncedAt: '2026-10-01T00:00:00Z', localModifiedAt: '2026-10-03T00:00:00Z' }),
                localHasProgress: true,
            }),
        ).toBe('upload');
    });

    it('is in sync when neither side changed', () => {
        expect(
            decideSync({
                userId: U,
                remoteSavedAt: '2026-10-01T00:00:00Z',
                meta: meta({ lastSyncedAt: '2026-10-01T00:00:00Z', localModifiedAt: '2026-10-01T00:00:00Z' }),
                localHasProgress: true,
            }),
        ).toBe('none');
    });

    it('resolves a conflict by the newer save', () => {
        const base = { lastSyncedAt: '2026-10-01T00:00:00Z' };
        expect(
            decideSync({
                userId: U,
                remoteSavedAt: '2026-10-05T00:00:00Z',
                meta: meta({ ...base, localModifiedAt: '2026-10-03T00:00:00Z' }),
                localHasProgress: true,
            }),
        ).toBe('restore');
        expect(
            decideSync({
                userId: U,
                remoteSavedAt: '2026-10-03T00:00:00Z',
                meta: meta({ ...base, localModifiedAt: '2026-10-05T00:00:00Z' }),
                localHasProgress: true,
            }),
        ).toBe('upload');
    });

    it("never pushes another account's local progress over this account's backup", () => {
        expect(
            decideSync({
                userId: 'user-2',
                remoteSavedAt: '2026-10-01T00:00:00Z',
                meta: meta({ userId: U, lastSyncedAt: '2026-10-01T00:00:00Z', localModifiedAt: '2026-10-09T00:00:00Z' }),
                localHasProgress: true,
            }),
        ).toBe('restore');
    });

    it('compares Supabase-style and Z timestamps by time, not text', () => {
        expect(
            decideSync({
                userId: U,
                remoteSavedAt: '2026-10-01T00:00:00.000+00:00',
                meta: meta({ lastSyncedAt: '2026-10-01T00:00:00Z', localModifiedAt: '2026-10-01T00:00:00Z' }),
                localHasProgress: true,
            }),
        ).toBe('none');
    });
});

describe('progressFingerprint', () => {
    const raw = (state: object) => JSON.stringify({ state, version: 0 });

    it('ignores fields that change just from opening the app', () => {
        const a = raw({ cardProgress: { v001: 1 }, energy: 30, lastEnergyReset: 1 });
        const b = raw({ cardProgress: { v001: 1 }, energy: 12, lastEnergyReset: 2 });
        expect(progressFingerprint(a)).toBe(progressFingerprint(b));
    });

    it('changes when learning progress changes', () => {
        const a = raw({ cardProgress: { v001: 1 } });
        const b = raw({ cardProgress: { v001: 2 } });
        expect(progressFingerprint(a)).not.toBe(progressFingerprint(b));
    });
});

describe('hasProgress', () => {
    it('detects learned cards', () => {
        expect(hasProgress(JSON.stringify({ state: { cardProgress: { v001: {} } } }))).toBe(true);
        expect(hasProgress(JSON.stringify({ state: { cardProgress: {} } }))).toBe(false);
        expect(hasProgress(null)).toBe(false);
        expect(hasProgress('not json')).toBe(false);
    });
});
