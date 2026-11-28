// British (RP) IPA for words, from Wiktionary (CC BY-SA); falls back to the first unlabelled
// transcription. Prints JSON {word: ipa | null}. Usage: node scripts/deck/ipa.mjs word1 word2 ...
// Polite: one request at a time, a pause between them, a descriptive user agent.
import { execFileSync } from 'node:child_process';

const words = process.argv.slice(2);
const out = {};
/** Wiktionary's symbols to the deck's (Oxford-like): ɹ → r, ɛ → e, ɛə → eə, tie bars and syllable dots off. */
const deckStyle = (ipa) => ipa.replace(/\./g, '').replace(/\u0361/g, '').replace(/\(ɹ\)/g, '(r)').replace(/ɹ/g, 'r').replace(/ɛə/g, 'eə').replace(/ɛ/g, 'e').replace(/ɝ/g, 'ɜː');
const pick = (raw) => {
    const lines = [...raw.matchAll(/\{\{IPA\|en\|([^}]*)\}\}/g)].map((m) => m[1]);
    const rp = lines.find((l) => /a=[^|]*\b(RP|UK)\b/.test(l)) ?? lines.find((l) => !/a=/.test(l)) ?? null;
    if (!rp) return null;
    const first = rp.split('|').find((p) => p.startsWith('/'));
    return first ? deckStyle(first.replace(/^\/|\/$/g, '')) : null;
};
for (const w of words) {
    try {
        // curl, not fetch: Node's fetch ignores the environment's HTTPS proxy
        const raw = execFileSync('curl', ['-s', '--max-time', '20', '-A', 'LexicaDeckBuilder/1.0 (educational vocabulary app)', `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(w)}&action=raw`], { encoding: 'utf8' });
        out[w] = pick(raw);
    } catch {
        out[w] = null;
    }
    await new Promise((res) => setTimeout(res, 400));
}
console.log(JSON.stringify(out, null, 1));
