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
    if (typeof v.revision === 'number') card.revision = v.revision;
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
