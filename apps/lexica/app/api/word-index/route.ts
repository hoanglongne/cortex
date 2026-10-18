import { VOCAB_DATABASE } from '../../data/vocabCards';
import { TALK_CARDS } from '../../data/talkCards';
import { parseManifest, parsePack, type ContentCard } from '../../lib/content/pack';
import { CONTENT_MANIFEST_URL } from '../../lib/content/loader';

/**
 * Every card Lexica deals, as a word list, for the teacher app
 * (apps/teach) to match a lesson's words: the bundled deck plus the
 * packs Studio published (current drop, library, Giao tiếp), minus retired
 * cards. Refreshed hourly; a Studio outage leaves the bundled deck.
 */
export const revalidate = 3600;

type Entry = { id: string; word: string; meaning: string; level: string; branch: 'cert' | 'talk' };

const entry = (c: ContentCard, branch?: 'talk'): Entry => ({
    id: c.id,
    word: c.word,
    meaning: c.translationHint,
    level: c.level,
    branch: branch ?? (c.branch === 'talk' ? 'talk' : 'cert'),
});

async function published(): Promise<Entry[]> {
    if (!CONTENT_MANIFEST_URL) return [];
    try {
        const manifest = parseManifest(await (await fetch(CONTENT_MANIFEST_URL, { next: { revalidate } })).json());
        if (!manifest) return [];
        const retired = new Set(manifest.retired);
        const refs = [
            { ref: manifest.current, talk: false },
            { ref: manifest.library, talk: false },
            { ref: manifest.talk, talk: true },
        ].filter((r) => r.ref);
        const packs = await Promise.all(
            refs.map(async ({ ref, talk }) => {
                const pack = parsePack(await (await fetch(ref!.url, { next: { revalidate } })).json());
                return (pack?.cards ?? []).filter((c) => !retired.has(c.id)).map((c) => entry(c, talk ? 'talk' : undefined));
            }),
        );
        return packs.flat();
    } catch {
        return [];
    }
}

export async function GET() {
    const core = [...VOCAB_DATABASE.map((c) => entry(c as ContentCard)), ...TALK_CARDS.map((c) => entry(c as ContentCard, 'talk'))];
    const seen = new Set(core.map((c) => c.id));
    const cards = [...core, ...(await published()).filter((c) => !seen.has(c.id) && seen.add(c.id))];
    return Response.json({ cards }, { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' } });
}
