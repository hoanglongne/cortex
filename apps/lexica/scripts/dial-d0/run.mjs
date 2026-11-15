// Núm vặn D0: run the layer-1 matcher over the fetched corpus and write the
// hits (with their sentence) for labelling, plus a labelling page.
// Usage: node scripts/dial-d0/run.mjs <dir> <dev|test>   (reads <dir>/corpus-<set>.json)
import fs from 'node:fs';
import { compileRules, findHits } from '../../app/lib/dial/match.ts';
import { DIAL_RULES_D0 } from '../../app/lib/dial/rules.ts';

const [dir, set = 'dev'] = process.argv.slice(2);
const corpus = JSON.parse(fs.readFileSync(`${dir}/corpus-${set}.json`, 'utf8'));
const idx = compileRules(DIAL_RULES_D0);

const hits = [];
let words = 0;
for (const [ai, a] of corpus.entries()) {
    for (const para of a.text.split('\n')) {
        words += para.split(/\s+/).length;
        for (const h of findHits(para, idx)) {
            // The sentence around the hit.
            const s0 = Math.max(para.lastIndexOf('. ', h.start) + 1, 0);
            let s1 = para.indexOf('. ', h.end);
            s1 = s1 < 0 ? para.length : s1 + 1;
            const sentence = para.slice(s0, s1).trim();
            hits.push({ id: hits.length, article: ai, cardId: h.cardId, en: h.en, vi: h.vi, before: para.slice(s0, h.start).trimStart(), after: para.slice(h.end, s1).trimEnd(), sentence });
        }
    }
}
fs.writeFileSync(`${dir}/hits-${set}.json`, JSON.stringify(hits, null, 1));
const byWord = {};
for (const h of hits) byWord[h.en] = (byWord[h.en] ?? 0) + 1;
console.log(`${corpus.length} articles, ~${words} syllables, ${hits.length} hits, ${Object.keys(byWord).length}/${DIAL_RULES_D0.length} rules fired`);
console.log(Object.entries(byWord).sort((a, b) => b[1] - a[1]).map(([w, n]) => `${w}:${n}`).join(' '));
