// Blend N7 (#165): run the English → English rules over a corpus and write every hit with its sentence, for labelling.
// Usage: node scripts/dial-en/run.mjs <corpus.json> <set> [out.json]
//   sets: dev (first part of each corpus, used to fix rules), test (the next part, used to find more errors)
//   test2 (a third part, used for the first measurement) and test3 (a fourth part, the first final number) and test4 (only what is left of the long CNN articles, for the final number after round 2)
import fs from 'node:fs';
import { compileRules, findHits } from '../../app/lib/dial/match.ts';
import { DIAL_RULES_EN } from '../../app/lib/dial/rulesEn.ts';

const [file, set = 'dev', out] = process.argv.slice(2);
const corpus = JSON.parse(fs.readFileSync(file, 'utf8'));
// Fixed split: every corpus is cut at the same share, so a rule is never fixed and measured on the same text.
const SHARE = { agnews: 0.3, cnn: 0.02, wiki: 0.3 };
const idx = compileRules(DIAL_RULES_EN);
const hits = [];
let words = 0;
for (const [name, docs] of Object.entries(corpus)) {
    const cut = Math.floor(docs.length * (SHARE[name] ?? 0.3));
    const part = set === 'dev' ? docs.slice(0, cut) : set === 'test' ? docs.slice(cut, 2 * cut) : set === 'test2' ? docs.slice(2 * cut, 3 * cut) : set === 'test3' ? docs.slice(3 * cut, 4 * cut) : set === 'test4' ? docs.slice(4 * cut, 8 * cut) : docs;
    for (const text of part) {
        words += text.split(/\s+/).length;
        for (const h of findHits(text, idx)) {
            const s0 = Math.max(text.lastIndexOf('. ', h.start) + 2, 0);
            let s1 = text.indexOf('. ', h.end);
            s1 = s1 < 0 ? text.length : s1 + 1;
            hits.push({ id: hits.length, corpus: name, cardId: h.cardId, en: h.en, was: h.vi, before: text.slice(Math.max(s0, h.start - 90), h.start), after: text.slice(h.end, Math.min(s1, h.end + 70)) });
        }
    }
}
if (out) fs.writeFileSync(out, JSON.stringify(hits, null, 1));
const byRule = {};
for (const h of hits) byRule[`${h.was.toLowerCase()} → ${h.en}`] = (byRule[`${h.was.toLowerCase()} → ${h.en}`] ?? 0) + 1;
console.log(`${set}: ~${words} words, ${hits.length} hits (${((hits.length / words) * 1000).toFixed(2)} per 1,000 words), ${Object.keys(byRule).length} phrases fired`);
console.log(Object.entries(byRule).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join('\n'));
