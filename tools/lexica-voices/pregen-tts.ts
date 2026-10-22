/**
 * Makes the model voices of Lexica's speaking drill in advance with Kokoro-82M
 * and puts them in the Cortex API's voice cache (Supabase Storage,
 * lexica-content/cache/tts/<key>.wav), so the API answers from the cache
 * and never calls Gemini for them (docs/LEXICA_TTS_RESEARCH.md).
 *
 *   pnpm install --filter @cortex/lexica...      # Lexica's own modules, once
 *   cd tools/lexica-voices && npm install         # Kokoro (~600 MB, kept out of the apps)
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *   CONTENT_MANIFEST_URL=…   # optional: Studio's published packs and quotes too
 *   npm run make -- [--dry-run] [--limit 50] [--overwrite]
 *
 * The first run downloads the model (~90 MB) from Hugging Face. Existing clips
 * are skipped unless --overwrite (which replaces the Gemini voices already cached,
 * so the app sounds the same everywhere).
 */
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { KokoroTTS } from 'kokoro-js';
import { cardClips, clipKey, DEFAULT_VOICE, normalizeClipText, type Clip } from '../../apps/lexica/app/lib/audio/clips';
import { applyRemoteContent, getAllCards, getQuotes } from '../../apps/lexica/app/lib/content/repository';
import { parseManifest, parsePack, parseQuotes, parseVariants, type ContentPack } from '../../apps/lexica/app/lib/content/pack';

type KokoroVoice = NonNullable<Parameters<KokoroTTS['generate']>[1]>['voice'];

const BUCKET = 'lexica-content';
const FOLDER = 'cache/tts';
/** The API's voice names (TTS_VOICES) as Kokoro voices: two American, one British. */
const KOKORO_VOICE: Record<string, string> = { Kore: 'af_heart', Puck: 'am_michael', Aoede: 'bf_emma', Charon: 'bm_george' };
/** "Mẫu chậm": slower, still natural. */
const SLOW_SPEED = 0.8;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const overwrite = args.includes('--overwrite');
const limitAt = args.indexOf('--limit');
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;

/** The API's cache name (ttsKey in apps/cortex-core-api/src/modules/lexica/lexica-ai.ts). */
const fileOf = (c: Clip) => `${createHash('sha256').update(clipKey(c), 'utf8').digest('hex').slice(0, 32)}.wav`;

async function loadStudioContent(url: string) {
    const manifest = parseManifest(await (await fetch(url)).json());
    if (!manifest) throw new Error('Content manifest could not be read');
    const get = async (ref: { url: string } | null) => (ref ? ((await (await fetch(ref.url)).json()) as unknown) : null);
    const packs: ContentPack[] = [];
    for (const ref of [manifest.current, manifest.library]) {
        const p = parsePack(await get(ref));
        if (p) packs.push(p);
    }
    const talk = parsePack(await get(manifest.talk));
    if (talk) packs.push({ ...talk, cards: talk.cards.map((c) => ({ ...c, branch: 'talk' as const })) });
    const overlay = await get(manifest.variants);
    applyRemoteContent({
        packs,
        retired: manifest.retired,
        currentDropId: manifest.current?.id ?? null,
        variants: overlay ? (parseVariants(overlay) ?? undefined) : undefined,
        quotes: overlay ? parseQuotes(overlay) : undefined,
    });
    console.log(`Studio: ${packs.reduce((n, p) => n + p.cards.length, 0)} cards in ${packs.length} packs`);
}

type Storage = ReturnType<typeof createClient>['storage'];

async function existing(storage: Storage): Promise<Set<string>> {
    const names = new Set<string>();
    for (let offset = 0; ; offset += 1000) {
        const { data, error } = await storage.from(BUCKET).list(FOLDER, { limit: 1000, offset });
        if (error) throw new Error(`Listing ${FOLDER}: ${error.message}`);
        data.forEach((f) => names.add(f.name));
        if (data.length < 1000) return names;
    }
}

async function main() {
    const manifestUrl = process.env.CONTENT_MANIFEST_URL ?? process.env.NEXT_PUBLIC_CONTENT_MANIFEST_URL;
    if (manifestUrl) await loadStudioContent(manifestUrl);

    // Every clip once, in card order.
    const all = new Map<string, Clip>();
    for (const card of getAllCards()) for (const clip of cardClips(card, getQuotes(card.id))) all.set(fileOf(clip), { ...clip, text: normalizeClipText(clip.text) });
    console.log(`${getAllCards().length} cards, ${all.size} clips`);

    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        if (!dryRun) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or use --dry-run)');
    }
    const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
    const have = supabase && !overwrite ? await existing(supabase.storage) : new Set<string>();
    const todo = [...all.entries()].filter(([file]) => !have.has(file)).slice(0, limit);
    console.log(`${have.size} already cached, ${todo.length} to make${dryRun ? ' (dry run)' : ''}`);
    if (dryRun) {
        todo.slice(0, 20).forEach(([file, c]) => console.log(`  ${file}  ${c.voice ?? DEFAULT_VOICE}${c.slow ? ' slow' : ''}  ${c.text}`));
        return;
    }

    const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
    const started = Date.now();
    let done = 0;
    for (const [file, clip] of todo) {
        const voice = KOKORO_VOICE[clip.voice ?? DEFAULT_VOICE] ?? KOKORO_VOICE[DEFAULT_VOICE];
        // Cards store some words in capitals ("ABUNDANT"); Kokoro would spell those out. The file name keeps the text as asked.
        const spoken = /[a-z]/.test(clip.text) ? clip.text : clip.text.toLowerCase();
        const audio = await tts.generate(spoken, { voice: voice as KokoroVoice, speed: clip.slow ? SLOW_SPEED : 1 });
        const wav = Buffer.from(await audio.toBlob().arrayBuffer());
        const { error } = await supabase!.storage.from(BUCKET).upload(`${FOLDER}/${file}`, wav, { contentType: 'audio/wav', upsert: true });
        if (error) console.warn(`  ✗ ${clip.text}: ${error.message}`);
        done++;
        if (done % 25 === 0 || done === todo.length) {
            const per = (Date.now() - started) / done;
            console.log(`  ${done}/${todo.length}  ~${Math.round(((todo.length - done) * per) / 60000)} min left`);
        }
    }
    console.log('Done.');
}

main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
});
