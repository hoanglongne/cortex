/**
 * Word duels between study buddies (docs: issue #70, direction B;
 * supabase/migration_duels.sql). A buddy challenges another with 5–10
 * questions built from words the challenger knows; both play the same
 * questions in their own time. The server keeps the answers and counts the
 * scores. This file: the calls, and the pure parts (building the questions,
 * what to show). Unit tested.
 */
import { detectiveRounds, liarRounds, type GameCard } from './games/rounds';
import type { ArenaResult } from '@cortex/classroom';
import { getSupabaseClient } from './supabase';
import { makeItem, type BankCard } from './placement/engine';

export const DUEL_MIN = 5;
export const DUEL_MAX = 10;

export interface DuelQuestionInput {
    card_id: string;
    kind: 'meaning' | 'phrase' | 'liar' | 'clue';
    prompt: string;
    options: string[];
    answer: number;
}

export type DuelState = 'open' | 'expired' | 'done';

export interface DuelListItem {
    id: string;
    created_at: string;
    expires_at: string;
    /** I made it. */
    mine: boolean;
    with_id: string;
    with_name: string | null;
    state: DuelState;
    total: number;
    i_finished: boolean;
    their_finished: boolean;
    my_correct: number | null;
    /** Only once I finished too. */
    their_correct: number | null;
}

export interface DuelQuestion {
    idx: number;
    card_id?: string;
    kind: string;
    prompt: string;
    options: string[];
    /** Only after I finished. */
    answer?: number;
    choice?: number;
}

export interface DuelTake {
    id: string;
    state: DuelState;
    expires_at: string;
    mine: boolean;
    with_name: string | null;
    finished: boolean;
    questions: DuelQuestion[];
}

export interface DuelResult {
    id: string;
    state: DuelState;
    with_name: string | null;
    total: number;
    mine: { correct: number; ms: number };
    /** Once both finished. */
    theirs: { correct: number; ms: number } | null;
    winner: 'me' | 'them' | 'tie' | null;
    questions: { idx: number; card_id?: string; prompt: string; options: string[]; answer: number; mine?: number; theirs?: number }[];
}

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Cần đăng nhập và có mạng.');
    const { data, error } = await client.rpc(name, args);
    if (error) throw new Error(duelMessage(error.message));
    return data as T;
}

const MESSAGES: Record<string, string> = {
    'not buddies': 'Chỉ thách đấu được bạn học của mình.',
    'too many duels': 'Hai bạn đang có 3 thách đấu chưa xong. Chơi xong rồi thách tiếp nhé.',
    'duel expired': 'Thách đấu này đã hết hạn.',
    'no such duel': 'Không thấy thách đấu này.',
    'already finished': 'Bạn đã nộp bài này rồi.',
    'bad questions': 'Chưa đủ từ để ra bài (cần ít nhất 5).',
};
export function duelMessage(raw: string): string {
    const key = Object.keys(MESSAGES).find((k) => raw.includes(k));
    return key ? MESSAGES[key] : raw;
}

export const duelCreate = (opponent: string, questions: DuelQuestionInput[]) => rpc<{ id: string }>('duel_create', { p_opponent: opponent, p_questions: questions });
export const duelInbox = () => rpc<DuelListItem[]>('duel_inbox');
export const duelTake = (id: string) => rpc<DuelTake>('duel_take', { p_duel: id });
export const duelAnswer = (id: string, idx: number, choice: number, ms: number) => rpc<{ received: boolean }>('duel_answer', { p_duel: id, p_idx: idx, p_choice: choice, p_ms: Math.round(ms) });
export const duelFinish = (id: string) => rpc<DuelResult>('duel_finish', { p_duel: id });
export const duelResult = (id: string) => rpc<DuelResult>('duel_result', { p_duel: id });

// ── pure parts ──────────────────────────────────────────────────────────

function shuffle<T>(xs: readonly T[], rand: () => number): T[] {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Questions from the words I know: `known` card ids (most recently learned
 * first), `n` of them, alternating a meaning question and a phrase one when
 * the card has a usable phrase. Needs the whole bank for wrong options.
 */
export function duelQuestions(known: readonly string[], bank: readonly BankCard[], n: number, rand: () => number = Math.random): DuelQuestionInput[] {
    const byId = new Map(bank.map((c) => [c.id, c]));
    const cards = known.map((id) => byId.get(id)).filter((c): c is BankCard => Boolean(c));
    // The newest words come first, but not always the same ten: a shuffle within the freshest 3×n
    const pool = shuffle(cards.slice(0, n * 3), rand);
    const out: DuelQuestionInput[] = [];
    for (const card of pool) {
        if (out.length >= n) break;
        const wantPhrase = out.length % 2 === 1;
        const item = (wantPhrase ? makeItem('phrase', card, bank, rand) : null) ?? makeItem('meaning', card, bank, rand);
        if (!item || item.cardId === null || item.kind === 'real' || item.kind === 'listen') continue;
        out.push({ card_id: item.cardId, kind: item.kind, prompt: item.prompt, options: item.options, answer: item.answer });
    }
    return out;
}

/** The words I missed in a finished duel, as a result the store puts back into review (once per duel). */
export function duelReview(r: DuelResult): ArenaResult {
    return {
        room_id: `duel:${r.id}`,
        seconds: 20,
        finished_at: new Date().toISOString(),
        answers: r.questions.filter((q) => q.card_id).map((q) => ({ card_id: q.card_id!, correct: q.mine === q.answer, ms: 0 })),
    };
}

/** Where a duel stands for me, in words for the list, and what the next step is. */
export function duelLine(d: DuelListItem, now: number): { text: string; action: 'play' | 'wait' | 'result' | 'none'; tone: 'accent' | 'muted' | 'warn' } {
    const left = Date.parse(d.expires_at) - now;
    const hours = Math.max(1, Math.ceil(left / 3_600_000));
    const who = d.with_name ?? 'bạn học';
    if (d.state === 'done') {
        const m = d.my_correct ?? 0;
        const t = d.their_correct ?? 0;
        const verdict = m > t ? 'Bạn thắng' : m < t ? `${who} thắng` : 'Hoà';
        return { text: `${verdict}: ${m}–${t}`, action: 'result', tone: m >= t ? 'accent' : 'muted' };
    }
    if (d.state === 'expired') {
        return d.i_finished ? { text: `${who} không kịp trả lời. Bạn được ${d.my_correct ?? 0}/${d.total}`, action: 'result', tone: 'muted' } : { text: 'Hết hạn', action: 'none', tone: 'muted' };
    }
    if (!d.i_finished) return { text: d.mine ? 'Bạn chưa chơi xong' : `${who} thách bạn · còn ${hours} giờ`, action: 'play', tone: d.mine ? 'muted' : 'warn' };
    return { text: `Đang chờ ${who} · còn ${hours} giờ`, action: 'wait', tone: 'muted' };
}

/** Duels waiting for me to play, first. */
export function sortDuels(list: readonly DuelListItem[]): DuelListItem[] {
    const rank = (d: DuelListItem) => (d.state === 'open' && !d.i_finished ? 0 : d.state === 'open' ? 1 : 2);
    return [...list].sort((a, b) => rank(a) - rank(b) || Date.parse(b.created_at) - Date.parse(a.created_at));
}

/** "Nhắn bạn": the duel as a message to send on Zalo. */
export const duelInviteText = (name: string, origin: string) => `${name} ơi, mình vừa thách bạn một ván từ vựng trên Lexica. Vào xem nhé: ${origin}/buddy`;

/** Which game a duel is played as. */
export type DuelGame = 'words' | 'liar' | 'clue';

export const DUEL_GAMES: { id: DuelGame; label: string }[] = [
    { id: 'words', label: 'Từ vựng' },
    { id: 'liar', label: 'Từ nói dối' },
    { id: 'clue', label: 'Thám tử' },
];

/** What each kind of question asks, for the line above it. */
export function duelKindLabel(kind: string): string {
    if (kind === 'phrase') return 'Điền từ vào cụm';
    if (kind === 'liar') return 'Cụm nào bị tráo từ?';
    if (kind === 'clue') return 'Đoán từ qua manh mối';
    return 'Từ này nghĩa là gì?';
}

/**
 * Questions for a duel in the chosen game, from the words I know. The liar and
 * clue games reuse the solo rounds (lib/games/rounds.ts): the same shape of
 * question, so the server and the duel screen need nothing new. Clues go into
 * the prompt, one per line, weakest first.
 */
export function duelGameQuestions(game: DuelGame, known: readonly string[], bank: readonly BankCard[], n: number, rand: () => number = Math.random): DuelQuestionInput[] {
    if (game === 'words') return duelQuestions(known, bank, n, rand);
    const byId = new Map(bank.map((c) => [c.id, c]));
    const cards = known.map((id) => byId.get(id)).filter((c): c is BankCard => Boolean(c)) as unknown as GameCard[];
    const rounds = game === 'liar' ? liarRounds(cards, bank as unknown as GameCard[], n, rand) : detectiveRounds(cards, bank as unknown as GameCard[], n, rand);
    return rounds.map((r) => ({
        card_id: r.cardId,
        kind: game === 'liar' ? 'liar' : 'clue',
        prompt: game === 'liar' ? 'Cụm nào bị tráo từ?' : (r.clues ?? []).slice(0, -1).join('\n'),
        options: r.options,
        answer: r.answer,
    }));
}

export interface BoardRow {
    id: string;
    name: string;
    wins: number;
    losses: number;
    draws: number;
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

/**
 * Head to head this week: my finished duels of the last 7 days against each
 * buddy, by number right (ties are draws). Most wins first. Only duels both
 * finished count, since the other's score is hidden before that.
 */
export function weekBoard(list: readonly DuelListItem[], now: number): BoardRow[] {
    const rows = new Map<string, BoardRow>();
    for (const d of list) {
        if (d.my_correct === null || d.their_correct === null || !d.i_finished || !d.their_finished) continue;
        if (now - Date.parse(d.created_at) > WEEK_MS) continue;
        const r = rows.get(d.with_id) ?? { id: d.with_id, name: d.with_name ?? 'Bạn học', wins: 0, losses: 0, draws: 0 };
        if (d.my_correct > d.their_correct) r.wins++;
        else if (d.my_correct < d.their_correct) r.losses++;
        else r.draws++;
        rows.set(d.with_id, r);
    }
    return [...rows.values()].sort((a, b) => b.wins - b.losses - (a.wins - a.losses) || b.wins - a.wins);
}
