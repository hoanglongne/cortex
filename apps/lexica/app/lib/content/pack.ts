import type { DifficultyLevel, VocabCardData } from '../../types/vocab';

/** A card as shipped in content: progress state is added per user at runtime. */
export type ContentCard = Omit<VocabCardData, 'state'>;

export interface ContentPack {
    schema: 1;
    id: string;
    title: string;
    publishedAt: string;
    cards: ContentCard[];
}

export interface PackRef {
    id: string;
    url: string;
    sha256: string;
}

export interface ContentManifest {
    schema: 1;
    updatedAt: string;
    current: PackRef | null;
    library: PackRef | null;
    retired: string[];
    /** Example sentences per archetype, laid over every card (see variants below). */
    variants: PackRef | null;
    /** "Đọc" passages (lib/content/passages.ts). */
    passages: PackRef | null;
    /** Giao tiếp phrase cards: an ordinary card pack whose cards have branch 'talk'. */
    talk: PackRef | null;
}

const LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

function parsePackRef(v: unknown): PackRef | null {
    if (!isObj(v) || !isStr(v.id) || !isStr(v.url) || !isStr(v.sha256)) return null;
    return { id: v.id, url: v.url, sha256: v.sha256 };
}

/** Returns null when the manifest is not one this app version understands. */
export function parseManifest(v: unknown): ContentManifest | null {
    if (!isObj(v) || v.schema !== 1 || !isStr(v.updatedAt)) return null;
    return {
        schema: 1,
        updatedAt: v.updatedAt,
        current: parsePackRef(v.current),
        library: parsePackRef(v.library),
        retired: Array.isArray(v.retired) ? v.retired.filter(isStr) : [],
        variants: parsePackRef(v.variants),
        passages: parsePackRef(v.passages),
        talk: parsePackRef(v.talk),
    };
}

/** Validates one card; invalid cards are dropped rather than failing the pack. */
export function parseCard(v: unknown): ContentCard | null {
    if (!isObj(v)) return null;
    const { id, word, elo, level, scenario, translationHint } = v;
    if (!isStr(id) || !isStr(word) || !isStr(scenario) || !isStr(translationHint)) return null;
    if (typeof elo !== 'number' || !Number.isFinite(elo)) return null;
    if (!LEVELS.includes(level as DifficultyLevel)) return null;

    const card: ContentCard = {
        id,
        word,
        elo,
        level: level as DifficultyLevel,
        scenario,
        translationHint,
    };
    if (isStr(v.ipa)) card.ipa = v.ipa;
    if (Array.isArray(v.collocations)) {
        const cols = v.collocations.filter(isStr).slice(0, 3);
        if (cols.length > 0) card.collocations = cols;
    }
    if (typeof v.revision === 'number') card.revision = v.revision;
    if (v.branch === 'talk') card.branch = 'talk';
    if (isObj(v.situation) && isStr(v.situation.prompt) && isStr(v.situation.model)) {
        card.situation = { prompt: v.situation.prompt.slice(0, 200), model: v.situation.model.slice(0, 200) };
    }
    if (isObj(v.trend) && isStr(v.trend.label)) {
        card.trend = {
            label: v.trend.label,
            expiresAt: isStr(v.trend.expiresAt) ? v.trend.expiresAt : undefined,
            dropId: isStr(v.trend.dropId) ? v.trend.dropId : undefined,
        };
    }
    if (isObj(v.audio)) {
        const audio: NonNullable<ContentCard['audio']> = {};
        for (const clip of ['word', 'meaning', 'scenario'] as const) {
            if (isStr(v.audio[clip])) audio[clip] = v.audio[clip] as string;
        }
        card.audio = audio;
    }
    return card;
}

export function parsePack(v: unknown): ContentPack | null {
    if (!isObj(v) || v.schema !== 1 || !isStr(v.id) || !Array.isArray(v.cards)) return null;
    return {
        schema: 1,
        id: v.id,
        title: isStr(v.title) ? v.title : v.id,
        publishedAt: isStr(v.publishedAt) ? v.publishedAt : '',
        cards: v.cards.map(parseCard).filter((c): c is ContentCard => c !== null),
    };
}

/** Archetypes with their own example sentence; a card's own scenario is the casual one. */
export const VARIANT_ARCHETYPES = ['tech', 'business', 'student'] as const;
export type VariantArchetype = (typeof VARIANT_ARCHETYPES)[number];

/** cardId → sentence per archetype, published by Studio (variants.ts in the API). */
export type CardVariants = Record<string, Partial<Record<VariantArchetype, string>>>;

/** A real quote that contains the card's word ("Ngoài đời"), reviewed in Studio. */
export interface CardQuote {
    kind: 'book' | 'news' | 'song';
    text: string;
    source: string;
    url?: string;
    translation?: string;
    /** Songs: a short clip of the official video, loaded only on tap. */
    media?: { provider: 'youtube'; id: string; start: number; end: number };
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function parseMedia(v: unknown): CardQuote['media'] | undefined {
    if (!isObj(v) || v.provider !== 'youtube' || !isStr(v.id) || !YOUTUBE_ID.test(v.id)) return undefined;
    const { start, end } = v;
    if (typeof start !== 'number' || typeof end !== 'number' || start < 0 || end <= start) return undefined;
    return { provider: 'youtube', id: v.id, start, end };
}

/** cardId → quotes, published with the variants overlay (quotes.ts in the API). */
export type CardQuotes = Record<string, CardQuote[]>;

const QUOTE_KINDS = ['book', 'news', 'song'];

/** Parses the quotes in the overlay; malformed entries are skipped. */
export function parseQuotes(v: unknown): CardQuotes {
    const out: CardQuotes = {};
    if (!isObj(v) || !isObj(v.quotes)) return out;
    for (const [cardId, list] of Object.entries(v.quotes)) {
        if (!Array.isArray(list)) continue;
        const kept: CardQuote[] = [];
        for (const q of list) {
            if (!isObj(q) || !QUOTE_KINDS.includes(q.kind as string)) continue;
            if (!isStr(q.text) || !isStr(q.source)) continue;
            kept.push({
                kind: q.kind as CardQuote['kind'],
                text: q.text,
                source: q.source,
                ...(isStr(q.url) ? { url: q.url } : {}),
                ...(isStr(q.translation) ? { translation: q.translation } : {}),
                ...(parseMedia(q.media) ? { media: parseMedia(q.media) } : {}),
            });
            if (kept.length === 2) break;
        }
        if (kept.length > 0) out[cardId] = kept;
    }
    return out;
}

/** Parses the variants overlay; sentences that lose the card's word are dropped later. */
export function parseVariants(v: unknown): CardVariants | null {
    if (!isObj(v) || v.schema !== 1 || !isObj(v.variants)) return null;
    const out: CardVariants = {};
    for (const [cardId, entry] of Object.entries(v.variants)) {
        if (!isObj(entry)) continue;
        const kept: Partial<Record<VariantArchetype, string>> = {};
        for (const a of VARIANT_ARCHETYPES) if (isStr(entry[a])) kept[a] = entry[a] as string;
        if (Object.keys(kept).length > 0) out[cardId] = kept;
    }
    return out;
}
