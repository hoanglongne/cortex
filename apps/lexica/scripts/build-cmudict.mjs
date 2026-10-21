/**
 * Builds the reduced pronouncing dictionary the app loads for the speaking
 * drill (docs/LEXICA_PRONUNCIATION_DESIGN.md, 5.1): public/pron/cmudict-v1.json,
 * { word: "TH IH1 NG K" }, first pronunciation only. It holds every English
 * word in the app's own content (cards, phrases, model sentences, passages,
 * minimal pairs, the recording kit), then the most frequent English words
 * up to TOTAL, so a word the recognizer hears instead can be looked up too.
 *
 *   node scripts/build-cmudict.mjs [cmudict.dict] [count_1w.txt]
 *
 * Without paths it downloads both:
 *  - CMUdict (BSD-2): https://github.com/cmusphinx/cmudict
 *  - word counts from Peter Norvig (MIT): https://norvig.com/ngrams/
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const TOTAL = 12000;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CMU_URL = 'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict';
const COUNTS_URL = 'https://norvig.com/ngrams/count_1w.txt';

const read = async (file, url) => (file ? readFileSync(file, 'utf8') : (await fetch(url)).text());
const [cmuText, countText] = await Promise.all([read(process.argv[2], CMU_URL), read(process.argv[3], COUNTS_URL)]);

const cmu = new Map();
for (const line of cmuText.split('\n')) {
    const [head, ...phones] = line.split('#')[0].trim().split(/\s+/);
    if (!head || head.includes('(') || phones.length === 0) continue;
    cmu.set(head.toLowerCase(), phones.join(' '));
}

// English-looking words in the app's content files (Vietnamese words rarely sit in CMUdict).
const sources = ['app/data/vocabCards.ts', 'app/data/talkCards.ts', 'app/data/passages.ts', 'app/data/recordingKit.ts', 'app/lib/pronunciation/pairs.ts'];
const wanted = new Set();
for (const f of sources)
    for (const w of readFileSync(path.join(root, f), 'utf8').toLowerCase().replace(/[’]/g, "'").match(/[a-z]+(?:'[a-z]+)?/g) ?? []) if (cmu.has(w)) wanted.add(w);
const fromContent = wanted.size;

for (const line of countText.split('\n')) {
    if (wanted.size >= TOTAL) break;
    const w = line.split('\t')[0];
    if (w && cmu.has(w)) wanted.add(w);
}

const out = Object.fromEntries([...wanted].sort().map((w) => [w, cmu.get(w)]));
mkdirSync(path.join(root, 'public/pron'), { recursive: true });
const file = path.join(root, 'public/pron/cmudict-v1.json');
writeFileSync(file, JSON.stringify(out));
console.log(`${Object.keys(out).length} words (${fromContent} from content) → ${path.relative(root, file)}, ${Math.round(readFileSync(file).length / 1024)} KB`);
