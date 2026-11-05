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
}

const MESSAGES: Record<string, string> = {
    'not in this class': 'Bạn không còn trong lớp này.',
    'too many today': 'Hôm nay bạn đã nộp nhiều rồi (tối đa 10 bài). Mai nộp tiếp nhé.',
    'bad body': 'Bài viết trống hoặc quá dài (tối đa 6000 ký tự).',
    'not signed in': 'Hãy đăng nhập để nộp bài.',
};

/** A message in Vietnamese for a failed call. */
export function handInError(message: string): string {
    const key = Object.keys(MESSAGES).find((k) => message.includes(k));
    if (key) return MESSAGES[key];
    if (/Could not find|schema cache/i.test(message)) return 'Chức năng nộp bài chưa được bật trên máy chủ. Báo giáo viên hoặc nhóm Lexica.';
    return /fetch|network/i.test(message) ? 'Không kết nối được. Thử lại khi có mạng.' : 'Chưa nộp được. Thử lại sau nhé.';
}

/** Hands a piece in. Returns an error in Vietnamese, or null. */
export async function handIn(classId: string, kind: WritingKind, prompt: string, body: string): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return 'Chưa kết nối được máy chủ. Thử lại sau nhé.';
    const { error } = await client.rpc('writing_submit', { p_class: classId, p_kind: kind, p_prompt: prompt, p_body: body });
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
