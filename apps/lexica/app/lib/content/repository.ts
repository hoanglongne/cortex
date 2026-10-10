import { useSyncExternalStore } from 'react';
import { VOCAB_DATABASE } from '../../data/vocabCards';
import type { ContentCard, ContentPack } from './pack';

/**
 * Single source of vocabulary cards for the whole app.
 *
 * Core cards (VOCAB_DATABASE) are bundled and always available, offline too.
 * Packs published from Lexica Studio are layered on top once the content
 * loader has fetched them. Retired cards stay resolvable by id, so learned
 * words and reviews keep working, but they are no longer dealt as new cards.
 */

let remote: ContentCard[] = [];
let retired = new Set<string>();
let currentDropId: string | null = null;

let all: readonly ContentCard[] = VOCAB_DATABASE;
let byId = new Map<string, ContentCard>(VOCAB_DATABASE.map(c => [c.id, c]));
let byWord = new Map<string, ContentCard>(VOCAB_DATABASE.map(c => [c.word.trim().toLowerCase(), c]));

let version = 0;
const listeners = new Set<() => void>();

const CORE_IDS = new Set(VOCAB_DATABASE.map(c => c.id));

function rebuild() {
    all = [...VOCAB_DATABASE, ...remote];
    byId = new Map(all.map(c => [c.id, c]));
    byWord = new Map();
    for (const c of all) {
        const key = c.word.trim().toLowerCase();
        if (!byWord.has(key)) byWord.set(key, c);
    }
    version++;
    listeners.forEach(l => l());
}

/** Every known card, including retired ones. Use for lookups and distractor pools. */
export function getAllCards(): readonly ContentCard[] {
    return all;
}

export function getCard(id: string): ContentCard | undefined {
    return byId.get(id);
}

export function getCardByWord(word: string): ContentCard | undefined {
    return byWord.get(word.trim().toLowerCase());
}

function isDealable(card: ContentCard, now: number): boolean {
    if (retired.has(card.id)) return false;
    const expiresAt = card.trend?.expiresAt;
    if (expiresAt && Date.parse(expiresAt) < now) return false;
    return true;
}

/** Cards that may be dealt as new cards: not retired, trend not expired. */
export function getDeckCards(now = Date.now()): ContentCard[] {
    return all.filter(c => isDealable(c, now));
}

/** Cards of the drop that is currently live, if any. */
export function getCurrentDropCards(now = Date.now()): ContentCard[] {
    if (!currentDropId) return [];
    return remote.filter(c => c.trend?.dropId === currentDropId && isDealable(c, now));
}

export function getCurrentDropId(): string | null {
    return currentDropId;
}

/** Replaces the remote layer. Called by the content loader. */
export function applyRemoteContent(input: {
    packs: ContentPack[];
    retired: string[];
    currentDropId: string | null;
}) {
    // Core cards win on id collisions (Studio ids never start with "v").
    const seen = new Set<string>(CORE_IDS);
    remote = [];
    for (const pack of input.packs) {
        for (const card of pack.cards) {
            if (seen.has(card.id)) continue;
            seen.add(card.id);
            remote.push(card);
        }
    }
    retired = new Set(input.retired);
    currentDropId = input.currentDropId;
    rebuild();
}

/** Test helper: back to core-only content. */
export function resetContent() {
    remote = [];
    retired = new Set();
    currentDropId = null;
    rebuild();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const getVersion = () => version;

/** Re-renders the caller when remote content changes. */
export function useContentVersion(): number {
    return useSyncExternalStore(subscribe, getVersion, getVersion);
}
