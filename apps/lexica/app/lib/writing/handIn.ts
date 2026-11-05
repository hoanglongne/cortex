/**
 * Writing handed in to a class (issue #105, W6). The student chooses to hand a
 * piece in; only the teacher of that class reads it; it is deleted after 30
 * days or when the student takes it back. Calls the security definer
 * functions of packages/classroom-lexica/sql/classroom_writing.sql.
 */
import { getSupabaseClient } from '../supabase';

export type WritingKind = 'sentence' | 'paragraph' | 'task1' | 'task2';

export interface HandedPiece {
    id: string;
    class_id: string;
    kind: WritingKind;
    prompt: string | null;
    body: string;
    words: number;
    submitted_at: string;
    expires_at: string;
    teacher_scores: { task: number; coherence: number; vocabulary: number; grammar: number; overall: number } | null;
    teacher_comment: string | null;
    teacher_rated_at: string | null;
    peers_ok: boolean;
    /** What classmates said, without names; null when nobody rated yet */
    peer: PeerSummary | null;
}

export interface PeerSummary {
    raters: number;
    task: number;
    coherence: number;
    vocabulary: number;
    grammar: number;
    comments: string[];
}

/** A classmate's piece to rate: no name, no id of the author. */
export interface PeerPiece {
    id: string;
    kind: WritingKind;
    prompt: string | null;
    body: string;
    words: number;
}

const MESSAGES: Record<string, string> = {
    'not in this class': 'Bạn không còn trong lớp này.',
    'too many today': 'Hôm nay bạn đã nộp nhiều rồi (tối đa 10 bài). Mai nộp tiếp nhé.',
    'bad body': 'Bài viết trống hoặc quá dài (tối đa 6000 ký tự).',
    'not signed in': 'Hãy đăng nhập để nộp bài.',
    'already rated': 'Bạn đã chấm bài này rồi.',
    'not available': 'Bài này không còn để chấm nữa.',
    'peers off': 'Giáo viên chưa bật việc chấm chéo cho lớp này.',
    'bad scores': 'Điểm không hợp lệ, chọn từ 1 đến 9.',
};

/** A message in Vietnamese for a failed call. */
export function handInError(message: string): string {
    const key = Object.keys(MESSAGES).find((k) => message.includes(k));
    if (key) return MESSAGES[key];
    if (/Could not find|schema cache/i.test(message)) return 'Chức năng nộp bài chưa được bật trên máy chủ. Báo giáo viên hoặc nhóm Lexica.';
    return /fetch|network/i.test(message) ? 'Không kết nối được. Thử lại khi có mạng.' : 'Chưa nộp được. Thử lại sau nhé.';
}

/** Hands a piece in. Returns an error in Vietnamese, or null. */
export async function handIn(classId: string, kind: WritingKind, prompt: string, body: string, peers = false): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return 'Chưa kết nối được máy chủ. Thử lại sau nhé.';
    const { error } = await client.rpc('writing_submit', { p_class: classId, p_kind: kind, p_prompt: prompt, p_body: body, p_peers: peers });
    return error ? handInError(error.message) : null;
}

export async function myHandedPieces(): Promise<HandedPiece[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data, error } = await client.rpc('writing_mine', { p_class: null });
    return error || !Array.isArray(data) ? [] : (data as HandedPiece[]);
}

export async function takeBack(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client.rpc('writing_delete', { p_id: id });
    return !error;
}

/** 7 → "7", 6.5 → "6,5" */
export const bandText = (n: number) => String(n).replace('.', ',');

/** The next classmate's piece to rate in this class, or null when there is none (or the class does not allow it). */
export async function nextToRate(classId: string): Promise<{ piece: PeerPiece | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) return { piece: null, error: 'Chưa kết nối được máy chủ. Thử lại sau nhé.' };
    const { data, error } = await client.rpc('writing_peer_next', { p_class: classId });
    if (error) return { piece: null, error: handInError(error.message) };
    return { piece: (data as PeerPiece | null) ?? null, error: null };
}

export type PeerScores = { task: number; coherence: number; vocabulary: number; grammar: number };

/** Sends the four bands (1 to 9) and a comment for a classmate's piece. Returns an error in Vietnamese, or null. */
export async function ratePiece(id: string, scores: PeerScores, comment: string): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return 'Chưa kết nối được máy chủ. Thử lại sau nhé.';
    const { error } = await client.rpc('writing_peer_rate', { p_id: id, p_scores: scores, p_comment: comment });
    return error ? handInError(error.message) : null;
}
