import { NextResponse } from 'next/server';
import { APP_ORIGINS } from '../../../lib/apiBase';
import { allowedUrl, extractArticle } from '../../../lib/dial/extract';

/**
 * Blend: fetch one shared article and return its paragraphs for the reader.
 * Only listed news sites (no open proxy), nothing is stored, small per-IP limit.
 */
const MAX_BYTES = 3_000_000;
const PER_HOUR = 60;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > PER_HOUR;
}

/** The packaged app calls this from its own origin, so it needs CORS (nothing else is allowed in). */
function cors(req: Request): Record<string, string> {
    const origin = req.headers.get('origin') ?? '';
    return APP_ORIGINS.includes(origin) ? { 'access-control-allow-origin': origin, vary: 'origin' } : {};
}

export function OPTIONS(req: Request) {
    return new Response(null, { status: 204, headers: { ...cors(req), 'access-control-allow-methods': 'GET', 'access-control-max-age': '86400' } });
}

export async function GET(req: Request) {
    const res = await handle(req);
    for (const [k, v] of Object.entries(cors(req))) res.headers.set(k, v);
    return res;
}

async function handle(req: Request): Promise<Response> {
    const raw = new URL(req.url).searchParams.get('url') ?? '';
    const url = allowedUrl(raw);
    if (!url) return NextResponse.json({ error: 'site' }, { status: 400 });
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    if (limited(ip)) return NextResponse.json({ error: 'limit' }, { status: 429 });

    try {
        const res = await fetch(url, {
            headers: { 'user-agent': 'Mozilla/5.0 (compatible; LexicaReader/1.0)', accept: 'text/html' },
            redirect: 'follow',
            signal: AbortSignal.timeout(10_000),
            cache: 'no-store',
        });
        // A redirect must stay on an allowed site.
        if (!res.ok || !allowedUrl(res.url)) return NextResponse.json({ error: 'fetch' }, { status: 502 });
        const len = Number(res.headers.get('content-length') ?? 0);
        if (len > MAX_BYTES) return NextResponse.json({ error: 'size' }, { status: 413 });
        const html = (await res.text()).slice(0, MAX_BYTES);
        const article = extractArticle(html);
        if (article.paragraphs.length === 0) return NextResponse.json({ error: 'empty' }, { status: 422 });
        return NextResponse.json({ ...article, url: res.url }, { headers: { 'cache-control': 'no-store' } });
    } catch {
        return NextResponse.json({ error: 'fetch' }, { status: 502 });
    }
}
