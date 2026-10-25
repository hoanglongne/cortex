/**
 * Verified scores (supabase/migration_placement.sql): the database picks
 * each question, keeps the right answer, times the answer and scores the
 * test. The page only shows what it is sent.
 */
import { getSupabaseClient } from '../supabase';
import type { DifficultyLevel } from '../../types/vocab';
import type { ItemKind, PlacementResult } from './engine';

export interface ServerItem {
    n: number;
    kind: ItemKind;
    /** null for a listening question: the word is only in `audio`. */
    prompt: string | null;
    /** File name of the spoken word in the voice cache. */
    audio: string | null;
    options: string[];
    seconds: number;
}

export type ServerAnswer =
    | { done: false; answer: number; response: 'right' | 'wrong' | 'skip'; item: ServerItem }
    | { done: true; answer: number; response: 'right' | 'wrong' | 'skip'; result: PlacementResult & { code: string; at: string } };

export class VerifiedError extends Error {
    constructor(
        message: string,
        /** The database functions are missing (SQL not run yet) or the network is down: use a practice test. */
        readonly unavailable = false,
    ) {
        super(message);
    }
}

function explain(raw: string): VerifiedError {
    const soon = /too soon: (\d+)/.exec(raw);
    if (soon) return new VerifiedError(`Điểm xác minh mới được tính sau ${soon[1]} ngày nữa.`);
    if (/too many tries/.test(raw)) return new VerifiedError('Hôm nay bạn đã bắt đầu bài thi nhiều lần. Mai thử lại nhé.');
    if (/not signed in/.test(raw)) return new VerifiedError('Đăng nhập để có điểm đã xác minh.');
    if (/no open (test|question)/.test(raw)) return new VerifiedError('Bài thi này đã kết thúc. Bắt đầu lại nhé.');
    return new VerifiedError(raw, /function|schema cache|fetch|network|Failed/i.test(raw));
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const client = getSupabaseClient();
    if (!client) throw new VerifiedError('no client', true);
    const { data: session } = await client.auth.getSession();
    if (!session.session) throw new VerifiedError('Đăng nhập để có điểm đã xác minh.', true);
    const { data, error } = await client.rpc(name, args);
    if (error) throw explain(error.message);
    return data as T;
}

export function startVerified(sound: boolean): Promise<{ session: string; item: ServerItem }> {
    return rpc('lexica_placement_start', { p_sound: sound });
}

export function answerVerified(session: string, choice: number | null): Promise<ServerAnswer> {
    return rpc('lexica_placement_answer', { p_session: session, p_choice: choice });
}

export interface PublicScore {
    score: number;
    sd: number;
    level: DifficultyLevel;
    at: string;
    sound: boolean;
}

/** A verified score by its code, for anyone (signed in or not). null when there is none. */
export async function publicScore(code: string): Promise<PublicScore | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client.rpc('lexica_score_public', { p_code: code });
    if (error) throw new Error(error.message);
    return (data as PublicScore | null) ?? null;
}
