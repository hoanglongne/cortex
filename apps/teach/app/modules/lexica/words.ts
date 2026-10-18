import { LEXICA_URL } from '../../lib/config';

export interface IndexCard {
    id: string;
    word: string;
    meaning: string;
    level: string;
    branch: 'cert' | 'talk';
}

export interface WordIndex {
    byWord: Map<string, IndexCard>;
    byId: Map<string, IndexCard>;
}

let cache: Promise<WordIndex> | null = null;

/** Lexica's bundled deck (lexica /api/word-index), loaded once per visit. */
export function wordIndex(): Promise<WordIndex> {
    cache ??= fetch(`${LEXICA_URL}/api/word-index`)
        .then((r) => (r.ok ? r.json() : { cards: [] }))
        .then((body: { cards: IndexCard[] }) => {
            const byWord = new Map<string, IndexCard>();
            for (const c of body.cards) {
                const k = c.word.trim().toLowerCase();
                if (!byWord.has(k)) byWord.set(k, c);
            }
            return { byWord, byId: new Map(body.cards.map((c) => [c.id, c])) };
        })
        .catch(() => {
            cache = null;
            return { byWord: new Map(), byId: new Map() };
        });
    return cache;
}
