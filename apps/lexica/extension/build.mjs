// Builds the Núm vặn Chrome extension into extension/dist (load it unpacked, or zip it).
// Usage (from apps/lexica): node extension/build.mjs
import fs from 'node:fs';
import ts from 'typescript';
import { DIAL_RULES_D0 } from '../app/lib/dial/rules.ts';

const here = new URL('.', import.meta.url).pathname;
const out = `${here}dist`;
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// The matcher, as plain JS without exports.
const matcher = ts.transpileModule(fs.readFileSync(`${here}../app/lib/dial/match.ts`, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText.replace(/^export /gm, '');

// Only the card fields the tooltip shows, for cards that have rules.
const src = fs.readFileSync(`${here}../app/data/vocabCards.ts`, 'utf8');
const ids = new Set(DIAL_RULES_D0.map((r) => r.cardId));
const cards = {};
for (const m of src.matchAll(/"id":\s*"(v\d+)"[\s\S]*?"ipa":\s*"([^"]*)"[\s\S]*?"translationHint":\s*"([^"]*)"/g)) {
    if (ids.has(m[1]) && !cards[m[1]]) cards[m[1]] = { ipa: m[2], hint: m[3] };
}

const body = fs.readFileSync(`${here}src/content.body.js`, 'utf8');
fs.writeFileSync(`${out}/content.js`, `(() => {\n${matcher}\nconst RULES = ${JSON.stringify(DIAL_RULES_D0)};\nconst CARDS = ${JSON.stringify(cards)};\n${body}\n})();\n`);
for (const f of ['manifest.json', 'content.css', 'popup.html', 'popup.js']) fs.copyFileSync(`${here}src/${f}`, `${out}/${f}`);
fs.copyFileSync(`${here}../public/icon-192.png`, `${out}/icon-128.png`);
console.log(`built ${out}: ${DIAL_RULES_D0.length} rules, ${Object.keys(cards).length} cards`);
