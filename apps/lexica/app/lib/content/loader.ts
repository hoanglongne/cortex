import { idbGet, idbSet } from './idb';
import { parseManifest, parsePack, parseQuotes, parseVariants, type CardQuotes, type CardVariants, type ContentManifest, type ContentPack, type PackRef } from './pack';
import { applyRemoteContent } from './repository';
import { parsePassages, type Passage } from './passages';

/** Public URL of packs/manifest.json published by Lexica Studio. Unset = core cards only. */
export const CONTENT_MANIFEST_URL = process.env.NEXT_PUBLIC_CONTENT_MANIFEST_URL || null;

const MANIFEST_KEY = 'manifest';
const packKey = (ref: PackRef) => `pack:${ref.id}:${ref.sha256}`;

async function sha256Hex(text: string): Promise<string | null> {
    if (!globalThis.crypto?.subtle) return null;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

async function loadPack(ref: PackRef, allowNetwork: boolean): Promise<ContentPack | null> {
    const cached = await idbGet<unknown>(packKey(ref));
    const fromCache = cached ? parsePack(cached) : null;
    if (fromCache || !allowNetwork) return fromCache;

    const res = await fetch(ref.url);
    if (!res.ok) return null;
    const text = await res.text();
    const hash = await sha256Hex(text);
    if (hash && hash !== ref.sha256) return null; // corrupted or mid-publish
    const pack = parsePack(JSON.parse(text));
    if (pack) await idbSet(packKey(ref), JSON.parse(text));
    return pack;
}

/** Same cache-then-verify path as packs, for the variants overlay (sentences and quotes). */
async function loadOverlay(ref: PackRef | null, allowNetwork: boolean): Promise<{ variants: CardVariants; quotes: CardQuotes } | undefined> {
    if (!ref) return undefined;
    const pick = (raw: unknown) => {
        const variants = parseVariants(raw);
        return variants ? { variants, quotes: parseQuotes(raw) } : undefined;
    };
    const cached = await idbGet<unknown>(packKey(ref));
    const fromCache = cached ? pick(cached) : undefined;
    if (fromCache || !allowNetwork) return fromCache;
    const res = await fetch(ref.url);
    if (!res.ok) return undefined;
    const text = await res.text();
    const hash = await sha256Hex(text);
    if (hash && hash !== ref.sha256) return undefined;
    const parsed = pick(JSON.parse(text));
    if (parsed) await idbSet(packKey(ref), JSON.parse(text));
    return parsed;
}

/** The passages pack, cache-then-verify like the others. */
async function loadPassages(ref: PackRef | null, allowNetwork: boolean): Promise<Passage[] | undefined> {
    if (!ref) return undefined;
    const cached = await idbGet<unknown>(packKey(ref));
    const fromCache = cached ? parsePassages(cached) : [];
    if (fromCache.length > 0 || !allowNetwork) return fromCache.length > 0 ? fromCache : undefined;
    const res = await fetch(ref.url);
    if (!res.ok) return undefined;
    const text = await res.text();
    const hash = await sha256Hex(text);
    if (hash && hash !== ref.sha256) return undefined;
    const list = parsePassages(JSON.parse(text));
    if (list.length > 0) await idbSet(packKey(ref), JSON.parse(text));
    return list;
}

async function apply(manifest: ContentManifest, allowNetwork: boolean) {
    const refs = [manifest.current, manifest.library].filter((r): r is PackRef => r !== null);
    const packs = (await Promise.all(refs.map(r => loadPack(r, allowNetwork).catch(() => null))))
        .filter((p): p is ContentPack => p !== null);
    // Never replace good content with nothing because of a network blip.
    if (refs.length > 0 && packs.length === 0) return false;
    const overlay = await loadOverlay(manifest.variants, allowNetwork).catch(() => undefined);
    const passages = await loadPassages(manifest.passages, allowNetwork).catch(() => undefined);
    applyRemoteContent({
        packs,
        retired: manifest.retired,
        currentDropId: manifest.current?.id ?? null,
        variants: overlay?.variants,
        quotes: overlay?.quotes,
        passages,
    });
    return true;
}

let started = false;

/**
 * Applies cached content immediately, then refreshes from the network
 * (stale-while-revalidate). Safe to call more than once.
 */
export async function loadRemoteContent(): Promise<void> {
    if (started || !CONTENT_MANIFEST_URL || typeof window === 'undefined') return;
    started = true;

    const cachedManifest = parseManifest(await idbGet<unknown>(MANIFEST_KEY));
    if (cachedManifest) await apply(cachedManifest, false);

    try {
        const res = await fetch(CONTENT_MANIFEST_URL, { cache: 'no-cache' });
        if (!res.ok) return;
        const raw = (await res.json()) as unknown;
        const manifest = parseManifest(raw);
        if (!manifest) return;
        if (cachedManifest && cachedManifest.updatedAt === manifest.updatedAt) return;
        if (await apply(manifest, true)) await idbSet(MANIFEST_KEY, raw);
    } catch {
        // Offline: cached or core content stays in place.
    }
}
