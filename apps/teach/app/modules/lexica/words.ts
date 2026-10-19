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
    /** Why the list is empty, in Vietnamese; then no lesson can be matched and none should be given. */
    error: string | null;
}

let cache: Promise<WordIndex> | null = null;

const empty = (error: string): WordIndex => ({ byWord: new Map(), byId: new Map(), error });

/**
 * Lexica's word list (lexica /api/word-index), loaded once per visit. A
 * failed or empty load is an error, never "every word is missing": that
 * once sent whole lessons to Studio and gave students unrelated words.
 */
export function wordIndex(): Promise<WordIndex> {
    if (!LEXICA_URL) return Promise.resolve(empty('App giáo viên chưa biết địa chỉ Lexica (biến NEXT_PUBLIC_LEXICA_URL). Báo quản trị để đặt biến này.'));
    cache ??= fetch(`${LEXICA_URL}/api/word-index`)
        .then((r) => {
            if (!r.ok) throw new Error(String(r.status));
            return r.json() as Promise<{ cards?: IndexCard[] }>;
        })
        .then((body) => {
            const cards = body.cards ?? [];
            if (cards.length === 0) throw new Error('empty');
            const byWord = new Map<string, IndexCard>();
            for (const c of cards) {
                const k = c.word.trim().toLowerCase();
                if (!byWord.has(k)) byWord.set(k, c);
            }
            return { byWord, byId: new Map(cards.map((c) => [c.id, c])), error: null };
        })
        .catch(() => {
            cache = null;
            return empty('Không tải được danh sách từ của Lexica. Kiểm tra mạng rồi thử lại.');
        });
    return cache;
}
