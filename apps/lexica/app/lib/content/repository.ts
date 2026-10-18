import { useSyncExternalStore } from 'react';
import { VOCAB_DATABASE } from '../../data/vocabCards';
import { TALK_CARDS } from '../../data/talkCards';
import type { CardQuote, CardQuotes, CardVariants, ContentCard, ContentPack, VariantArchetype } from './pack';
import { deckWordsIn, type Passage } from './passages';
import { CORE_PASSAGES } from '../../data/passages';

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
let currentDropTitle: string | null = null;

let variants: CardVariants = {};
let quotes: CardQuotes = {};
let remotePassages: Passage[] = [];
let passageCache: Passage[] | null = null;

/** Bundled cards: the IELTS deck and the first Giao tiếp deck. */
const CORE: readonly ContentCard[] = [...VOCAB_DATABASE, ...TALK_CARDS];

let all: readonly ContentCard[] = CORE;
let byId = new Map<string, ContentCard>(CORE.map(c => [c.id, c]));
let byWord = new Map<string, ContentCard>(CORE.map(c => [c.word.trim().toLowerCase(), c]));

let version = 0;
const listeners = new Set<() => void>();

const CORE_IDS = new Set(CORE.map(c => c.id));

function rebuild() {
    all = [...CORE, ...remote].map(c => withVariants(c, variants[c.id]));
    byId = new Map(all.map(c => [c.id, c]));
    byWord = new Map();
    for (const c of all) {
        const key = c.word.trim().toLowerCase();
        if (!byWord.has(key)) byWord.set(key, c);
    }
    passageCache = null;
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

/** Every card id with the same word as this one (the deck has a few duplicates). */
export function sameWordIds(id: string): string[] {
    const word = byId.get(id)?.word.trim().toLowerCase();
    if (!word) return [id];
    return all.filter(c => c.word.trim().toLowerCase() === word).map(c => c.id);
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

/** The live Trend Drop, if one is loaded: title, end date and its dealable cards. */
export function getCurrentDrop(now = Date.now()): { id: string; title: string; expiresAt?: string; cards: ContentCard[] } | null {
    if (!currentDropId) return null;
    const cards = getCurrentDropCards(now);
    if (cards.length === 0) return null;
    return { id: currentDropId, title: currentDropTitle ?? currentDropId, expiresAt: cards[0].trend?.expiresAt, cards };
}

/** Replaces the remote layer. Called by the content loader. */
export function applyRemoteContent(input: {
    packs: ContentPack[];
    retired: string[];
    currentDropId: string | null;
    variants?: CardVariants;
    quotes?: CardQuotes;
    passages?: Passage[];
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
    currentDropTitle = input.packs.find(p => p.id === input.currentDropId)?.title ?? null;
    variants = input.variants ?? {};
    quotes = input.quotes ?? {};
    remotePassages = input.passages ?? [];
    rebuild();
}

/** "Ngoài đời" quotes for a card; empty when Studio has published none. */
export function getQuotes(cardId: string): CardQuote[] {
    return quotes[cardId] ?? [];
}

/**
 * Every "Đọc" passage: core ones first, then Studio's. Core passages get
 * their `words` (other deck words in the text) from the deck here.
 */
export function getPassages(): readonly Passage[] {
    if (passageCache) return passageCache;
    // Giao tiếp phrases ("to go", "on sale") are common English: only dialogues mark them.
    const deck = [...byWord.values()].filter(c => c.branch !== 'talk').map(c => ({ id: c.id, word: c.word }));
    const talkDeck = [...byWord.values()].map(c => ({ id: c.id, word: c.word }));
    const seen = new Set<string>();
    passageCache = [];
    for (const p of [...CORE_PASSAGES, ...remotePassages]) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        const words = p.words.length > 0 ? p.words : deckWordsIn(p.text, p.kind === 'dialogue' ? talkDeck : deck).filter(id => !p.newWords.includes(id));
        passageCache.push({ ...p, words });
    }
    return passageCache;
}

export function getPassage(id: string): Passage | undefined {
    return getPassages().find(p => p.id === id);
}

/** Test helper: back to core-only content. */
export function resetContent() {
    remote = [];
    variants = {};
    quotes = {};
    remotePassages = [];
    retired = new Set();
    currentDropId = null;
    currentDropTitle = null;
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

/**
 * Adds a card's archetype sentences as `scenarios` (its own scenario is the
 * casual one). A sentence that does not contain the card's word is dropped:
 * recall checks hide the word in it.
 */
export function withVariants(card: ContentCard, entry: CardVariants[string] | undefined): ContentCard {
    if (!entry) return card;
    const word = card.word.toLowerCase();
    const scenarios: NonNullable<ContentCard['scenarios']> = { casual: card.scenario };
    let added = false;
    for (const [archetype, sentence] of Object.entries(entry)) {
        if (sentence && sentence.toLowerCase().includes(word)) {
            scenarios[archetype as VariantArchetype] = sentence;
            added = true;
        }
    }
    return added ? { ...card, scenarios } : card;
}
