import { getSupabase } from './supabase';

/** Adds https:// when the env var was set as a bare host, drops trailing slashes. */
export function normalizeBaseUrl(value: string | undefined): string {
    const v = value?.trim().replace(/\/+$/, '') ?? '';
    if (!v) return '';
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

const API_URL =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_CORTEX_API_URL) ||
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

/**
 * The last answer to each GET, so a page opened again shows what it showed
 * before at once while it asks the API again. Any write empties it: after a
 * change nothing stale is shown.
 */
const lastGet = new Map<string, unknown>();

/** What `api(path)` last returned, if nothing has been written since. */
export function cached<T>(path: string): T | undefined {
    return lastGet.get(path) as T | undefined;
}

export function clearCache() {
    lastGet.clear();
}

/** Calls the Cortex API /studio endpoints as the signed-in editor. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const get = (init.method ?? 'GET') === 'GET';
    if (!get) lastGet.clear();
    if (!API_URL) throw new ApiError('NEXT_PUBLIC_CORTEX_API_URL chưa được cấu hình', 0, null);
    const session = (await getSupabase()?.auth.getSession())?.data.session;
    if (!session) throw new ApiError('Chưa đăng nhập', 401, null);

    let res: Response;
    try {
        res = await fetch(`${API_URL}/studio${path}`, {
            method: init.method ?? 'GET',
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            },
            body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        });
    } catch {
        // fetch only throws when the request never got an answer.
        throw new ApiError('Lỗi mạng: không kết nối được tới Cortex API. Kiểm tra mạng rồi thử lại.', 0, null);
    }
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    let body: unknown = null;
    try {
        body = text ? JSON.parse(text) : null;
    } catch {
        // An HTML page instead of JSON: wrong API URL, or an API build without /studio.
        throw new ApiError(
            `Cortex API trả về trang không phải JSON (HTTP ${res.status}) tại ${API_URL}/studio${path}. Kiểm tra NEXT_PUBLIC_CORTEX_API_URL và bản deploy của API.`,
            res.status,
            null,
        );
    }
    if (!res.ok) {
        const msg = (body as { message?: unknown } | null)?.message;
        throw new ApiError(
            typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join(', ') : `Lỗi ${res.status}`,
            res.status,
            body,
        );
    }
    if (get) lastGet.set(path, body);
    return body as T;
}

export function errorText(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}
