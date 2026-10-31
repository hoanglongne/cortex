import { NextResponse } from 'next/server';

const DEFAULT_CORE_API_URL = 'http://localhost:3001';

/**
 * Passes Synapse's authored missions on from the Cortex API (the story
 * questions of the Đấu trường). `?missions=1` lists them; `?lore=…&mission=…`
 * returns one. Content only: no student data goes through here.
 */
export async function GET(req: Request) {
    try {
        const raw = process.env.CORTEX_CORE_API_URL || DEFAULT_CORE_API_URL;
        const withProtocol = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
        const base = withProtocol.endsWith('/') ? withProtocol.slice(0, -1) : withProtocol;
        const q = new URL(req.url).searchParams;
        const lore = q.get('lore');
        const mission = q.get('mission');
        const path = q.get('missions') ? 'missions' : lore && mission && /^[\w-]+$/.test(lore) && /^[\w-]+$/.test(mission) ? `arc/${lore}/${mission}` : null;
        if (!path) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
        const upstream = await fetch(`${base}/synapse/${path}`, { cache: 'no-store' });
        const text = await upstream.text();
        if (!upstream.ok) return NextResponse.json({ error: text || `Upstream error: ${upstream.status}` }, { status: upstream.status });
        return NextResponse.json(JSON.parse(text));
    } catch {
        return NextResponse.json({ error: 'Không lấy được truyện từ máy chủ' }, { status: 502 });
    }
}
