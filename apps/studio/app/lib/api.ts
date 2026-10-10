import { getSupabase } from './supabase';

const API_URL =
    process.env.NEXT_PUBLIC_CORTEX_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');

export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly body: unknown,
    ) {
        super(message);
    }
}

/** Calls the Cortex API /studio endpoints as the signed-in editor. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    if (!API_URL) throw new ApiError('NEXT_PUBLIC_CORTEX_API_URL chưa được cấu hình', 0, null);
    const session = (await getSupabase()?.auth.getSession())?.data.session;
    if (!session) throw new ApiError('Chưa đăng nhập', 401, null);

    const res = await fetch(`${API_URL}/studio${path}`, {
        method: init.method ?? 'GET',
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    const body: unknown = text ? JSON.parse(text) : null;
    if (!res.ok) {
        const msg = (body as { message?: unknown } | null)?.message;
        throw new ApiError(
            typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join(', ') : `Lỗi ${res.status}`,
            res.status,
            body,
        );
    }
    return body as T;
}

export function errorText(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}
