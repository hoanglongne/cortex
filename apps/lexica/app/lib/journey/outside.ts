/**
 * Taking words out of the app (docs/LEXICA_DIRECTION.md, "Ra ngoài đời"):
 *
 * - a pledge: at the end of a session, one remembered word to try in real
 *   life; the next day the app asks how it went (honest self-report, a
 *   sentence welcome but not required);
 * - spotting: learned words found in a text the learner met outside the app;
 * - one sentence about their day with today's words.
 *
 * Pure functions, unit tested.
 */
import { stem } from '../answerMatch';
import { wordsAt, type Journeys } from './steps';
import type { UserArchetype } from '../../types/vocab';

export interface Pledge {
    cardId: string;
    /** Local date (YYYY-MM-DD) it was made. */
    date: string;
}

/** 'today': made today, try it; 'due': made earlier, ask how it went. */
export function pledgeState(pledge: Pledge | null, today: string): 'none' | 'today' | 'due' {
    if (!pledge) return 'none';
    return pledge.date === today ? 'today' : 'due';
}

/**
 * A word worth trying out: remembered (Nhớ or further) and not used yet,
 * most recent first; else a word understood before today. Skips `exclude`
 * (words already offered).
 */
export function pledgeWord(journeys: Journeys, startOfToday: number, exclude: ReadonlySet<string> = new Set()): string | null {
    const fresh = (id: string) => !journeys[id]?.livedAt && !exclude.has(id);
    const remembered = [...wordsAt(journeys, 'dung'), ...wordsAt(journeys, 'gap'), ...wordsAt(journeys, 'nho')].find(fresh);
    if (remembered) return remembered;
    return wordsAt(journeys, 'hieu').find((id) => fresh(id) && journeys[id].understoodAt < startOfToday) ?? null;
}

const IDEAS: Record<UserArchetype | 'any', string[]> = {
    tech: ['trong một tin nhắn Slack với đồng nghiệp', 'khi viết mô tả một task hay một PR', 'khi nói trong buổi họp đứng đầu ngày'],
    business: ['trong một email công việc', 'khi nhắn tin với khách hàng hoặc sếp', 'khi tóm tắt cuộc họp'],
    student: ['khi nhắn tin với bạn cùng lớp', 'trong bài viết hay ghi chú hôm nay', 'khi tự nói về ngày của mình bằng tiếng Anh'],
    casual: ['khi nhắn tin với bạn bè', 'trong một caption hay bình luận', 'khi kể chuyện hôm nay với ai đó'],
    any: ['trong một tin nhắn hôm nay', 'khi nói chuyện với ai đó', 'khi viết ghi chú hay nhật ký'],
};

/** Where to try the word, from the learner's world; a phrase card's own situation first. */
export function pledgeIdea(cardId: string, archetype: UserArchetype | null, situation?: string): string {
    if (situation) return situation;
    const list = IDEAS[archetype ?? 'any'];
    const seed = cardId.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
    return `Thử dùng ${list[seed % list.length]}.`;
}

const tokens = (text: string) => [...text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)].map((m) => ({ word: m[0].toLowerCase(), start: m.index!, end: m.index! + m[0].length }));

/** A word and its stems, one suffix at a time (DECISIONS → DECISION → DECIS), so two forms meet. */
function stems(word: string): string[] {
    const w = word.toUpperCase();
    const one = stem(w);
    return [...new Set([w, one, stem(one)])].filter((k) => k.length >= 3);
}

export interface Spotted {
    cardId: string;
    start: number;
    end: number;
}

/**
 * Learned words in a text, any form (annoyed for annoy, decisions for
 * decision); phrases ("keep in mind") as written. One card per word.
 */
export function spotWords(text: string, cards: readonly { id: string; word: string }[]): Spotted[] {
    const toks = tokens(text);
    const byStem = new Map<string, number[]>();
    toks.forEach((t, i) => {
        for (const k of stems(t.word)) byStem.set(k, [...(byStem.get(k) ?? []), i]);
    });
    const lower = text.toLowerCase();
    const out: Spotted[] = [];
    const seenWord = new Set<string>();
    for (const c of cards) {
        const w = c.word.trim().toLowerCase();
        if (!w || seenWord.has(w)) continue;
        if (w.includes(' ')) {
            const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}\\b`, 'g');
            const hits = [...lower.matchAll(re)];
            if (hits.length) {
                seenWord.add(w);
                for (const h of hits) out.push({ cardId: c.id, start: h.index!, end: h.index! + h[0].length });
            }
            continue;
        }
        if (w.length < 3) continue;
        const idx = [...new Set(stems(w).flatMap((k) => byStem.get(k) ?? []))].sort((a, b) => a - b);
        if (idx.length === 0) continue;
        seenWord.add(w);
        for (const i of idx) out.push({ cardId: c.id, start: toks[i].start, end: toks[i].end });
    }
    return out.sort((a, b) => a.start - b.start);
}

/** The sentence uses the word (any form), or the phrase. */
export function usesWord(sentence: string, word: string): boolean {
    return spotWords(sentence, [{ id: 'x', word }]).length > 0;
}
