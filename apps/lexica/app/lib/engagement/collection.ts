import type { ContentCard } from '../content/pack';
import type { UserCardProgress } from '../eloAlgorithm';

/**
 * Album sets (docs/LEXICA_ENGAGEMENT_SPEC.md §2.1, §2.4). Every word is a
 * collectible card; sets are either a topic (permanent) or a Trend Drop
 * season (new cards only learnable while the drop is live).
 */

export type TopicId = 'money' | 'work' | 'love' | 'study' | 'social' | 'food' | 'people' | 'life';

export const TOPICS: { id: TopicId; label: string; pattern: RegExp | null }[] = [
    { id: 'money', label: 'Tiền bạc', pattern: /lương|tiền|bill|giá|mua|sale|ví |nợ|tiêu|ngân hàng|shopee|đầu tư|tiết kiệm|crypto|chứng khoán|giàu|nghèo|trả góp|voucher/i },
    { id: 'work', label: 'Công sở', pattern: /sếp|deadline|họp|công ty|đồng nghiệp|kpi|công việc|văn phòng|dự án|khách hàng|phỏng vấn|tăng ca|\bOT\b|nghỉ việc|startup|thực tập/i },
    { id: 'love', label: 'Hẹn hò', pattern: /crush|người yêu|hẹn hò|\bny\b|tình|yêu|chia tay|tỏ tình|thả thính|ghen|độc thân|vợ|chồng|cưới/i },
    { id: 'study', label: 'Học hành', pattern: /thi |học|ielts|trường|bài |giáo viên|thầy|cô giáo|điểm|đại học|sinh viên|luận|môn|lớp/i },
    { id: 'social', label: 'Mạng xã hội', pattern: /story|post|like|follow|tiktok|facebook|mạng|insta|trend|viral|comment|livestream|idol|youtube|reels|threads|group/i },
    { id: 'food', label: 'Ăn uống', pattern: /ăn|uống|trà sữa|quán|cơm|cafe|cà phê|bún|phở|nhậu|bia|đồ ăn|nấu/i },
    { id: 'people', label: 'Bạn bè & nhà', pattern: /bạn thân|mẹ|bố|ba |gia đình|anh |chị |em |hàng xóm|đứa bạn|tụi bạn|họ hàng/i },
    { id: 'life', label: 'Đời sống', pattern: null },
];

/** Largest set size; bigger topics are split into parts by difficulty. */
export const MAX_SET_SIZE = 36;

export interface CollectionSet {
    id: string;
    label: string;
    kind: 'topic' | 'season';
    cardIds: string[];
    /** Season sets: when new cards stop being learnable. */
    expiresAt?: string;
}

export function topicOf(card: Pick<ContentCard, 'scenario'>): TopicId {
    const text = card.scenario ?? '';
    return TOPICS.find((t) => t.pattern?.test(text))?.id ?? 'life';
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function splitEvenly<T>(items: T[], max: number): T[][] {
    const parts = Math.max(1, Math.ceil(items.length / max));
    const size = Math.ceil(items.length / parts);
    return Array.from({ length: parts }, (_, i) => items.slice(i * size, (i + 1) * size)).filter((p) => p.length);
}

/** Builds every set from the cards currently in content. Stable for the same cards. */
export function buildSets(cards: readonly ContentCard[], dropTitles: Record<string, string> = {}): CollectionSet[] {
    const byTopic = new Map<TopicId, ContentCard[]>();
    const bySeason = new Map<string, { label: string; expiresAt?: string; cards: ContentCard[] }>();

    const seen = new Set<string>();
    for (const card of cards) {
        // Core data repeats a few cards verbatim; one album slot per id.
        if (seen.has(card.id)) continue;
        seen.add(card.id);
        if (card.trend) {
            const key = card.trend.dropId ?? 'trend';
            const season = bySeason.get(key) ?? { label: card.trend.dropId ? (dropTitles[card.trend.dropId] ?? `Mùa ${card.trend.dropId}`) : 'Trend', expiresAt: card.trend.expiresAt, cards: [] };
            season.cards.push(card);
            bySeason.set(key, season);
            continue;
        }
        const topic = topicOf(card);
        byTopic.set(topic, [...(byTopic.get(topic) ?? []), card]);
    }

    const sets: CollectionSet[] = [];
    for (const topic of TOPICS) {
        const list = (byTopic.get(topic.id) ?? []).slice().sort((a, b) => a.elo - b.elo || a.id.localeCompare(b.id));
        const parts = splitEvenly(list, MAX_SET_SIZE);
        parts.forEach((part, i) => {
            sets.push({
                id: parts.length > 1 ? `${topic.id}-${i + 1}` : topic.id,
                label: parts.length > 1 ? `${topic.label} ${ROMAN[i] ?? i + 1}` : topic.label,
                kind: 'topic',
                cardIds: part.map((c) => c.id),
            });
        });
    }
    for (const [key, season] of bySeason) {
        sets.unshift({
            id: `season-${key}`,
            label: season.label,
            kind: 'season',
            expiresAt: season.expiresAt,
            cardIds: season.cards.map((c) => c.id),
        });
    }
    return sets;
}

export type CardLevel = 'none' | UserCardProgress['state'];

export const LEVEL_ORDER: CardLevel[] = ['none', 'seed', 'sprout', 'gold', 'mastered'];

export interface SetProgress {
    owned: number;
    mastered: number;
    total: number;
    complete: boolean;
}

/** A card is "owned" once the user has learned it (any state). */
export function setProgress(set: CollectionSet, progress: Record<string, UserCardProgress>): SetProgress {
    let owned = 0;
    let mastered = 0;
    for (const id of set.cardIds) {
        const p = progress[id];
        if (!p) continue;
        owned++;
        if (p.state === 'mastered') mastered++;
    }
    return { owned, mastered, total: set.cardIds.length, complete: owned === set.cardIds.length && owned > 0 };
}

/** Whether new cards of a season set can still be learned. */
export function seasonOpen(set: CollectionSet, now = Date.now()): boolean {
    return set.kind !== 'season' || !set.expiresAt || Date.parse(set.expiresAt) > now;
}
