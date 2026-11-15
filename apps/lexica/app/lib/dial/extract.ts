/**
 * Pull the readable paragraphs out of an article page (Núm vặn, reading a
 * shared link). Pure: the API route fetches, this only parses.
 */

/** News and reference sites the reader may fetch. Anything else is refused (no open proxy). */
export const DIAL_SITES = [
    'vnexpress.net', 'tuoitre.vn', 'thanhnien.vn', 'dantri.com.vn', 'vietnamnet.vn', 'znews.vn', 'zingnews.vn',
    'laodong.vn', 'nld.com.vn', 'tienphong.vn', 'cafef.vn', 'cafebiz.vn', 'genk.vn', 'kenh14.vn', 'vtv.vn',
    'baomoi.com', 'vov.vn', 'plo.vn', 'sggp.org.vn', 'nhandan.vn', 'vi.wikipedia.org', 'spiderum.com',
];

export function allowedUrl(raw: string): URL | null {
    let u: URL;
    try { u = new URL(raw.trim()); } catch { return null; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (u.username || u.password || (u.port && u.port !== '443' && u.port !== '80')) return null;
    const host = u.hostname.toLowerCase();
    return DIAL_SITES.some((d) => host === d || host.endsWith(`.${d}`)) ? u : null;
}

/** The first http(s) link in shared text ("Bài hay: https://…"). */
export function firstUrl(text: string): string | null {
    return /https?:\/\/[^\s<>"']+/.exec(text)?.[0] ?? null;
}

const MARK: Record<string, string> = { acute: '́', grave: '̀', tilde: '̃', circ: '̂', uml: '̈' };
const NAMED: Record<string, string> = { nbsp: ' ', quot: '"', apos: "'", amp: '&', lt: '<', gt: '>', ndash: '–', mdash: '—', hellip: '…', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’' };

export function decodeEntities(s: string): string {
    return s
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/&([a-zA-Z]+);/g, (all, name: string) => {
            const m = /^([a-zA-Z])(acute|grave|tilde|circ|uml)$/.exec(name);
            if (m) return (m[1] + MARK[m[2]]).normalize('NFC');
            return NAMED[name] ?? all;
        });
}

const VI = /[ăâđêôơư]/i;

export function extractArticle(html: string): { title: string; paragraphs: string[] } {
    const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, '');
    const title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1] ?? '').replace(/\s+/g, ' ').trim();
    const seen = new Set<string>();
    const paragraphs = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
        .map((m) => decodeEntities(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 40 && VI.test(p) && !seen.has(p) && Boolean(seen.add(p)));
    return { title, paragraphs: paragraphs.slice(0, 80) };
}
