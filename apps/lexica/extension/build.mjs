// Builds the Lexica Blend Chrome extension into extension/dist (load it unpacked, or zip it).
// Usage (from apps/lexica): node extension/build.mjs
import fs from 'node:fs';
import ts from 'typescript';
import { dedupeRules } from '../app/lib/dial/match.ts';
import { DIAL_RULES_D0 } from '../app/lib/dial/rules.ts';
import { DIAL_RULES_MORE } from '../app/lib/dial/rulesMore.ts';
import { DIAL_RULES_EN } from '../app/lib/dial/rulesEn.ts';
// Same list as app/lib/dial/allRules.ts (scripts import .ts files directly).
const DIAL_RULES = dedupeRules([...DIAL_RULES_D0, ...DIAL_RULES_MORE]);

const here = new URL('.', import.meta.url).pathname;
const out = `${here}dist`;
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// The matcher and the shared prefs (intensity, display mode, blocklist, page language), as plain JS without exports.
const plain = (file) => ts.transpileModule(fs.readFileSync(`${here}../app/lib/dial/${file}`, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText.replace(/^export /gm, '').replace(/^\s*import .*$/gm, '');
const matcher = plain('match.ts');
const prefs = plain('prefs.ts');

// Only the card fields the tooltip shows, for cards that have rules.
const src = fs.readFileSync(`${here}../app/data/vocabCards.ts`, 'utf8');
const ids = new Set([...DIAL_RULES, ...DIAL_RULES_EN].map((r) => r.cardId));
const cards = {};
for (const m of src.matchAll(/"id":\s*"(v\d+)"[\s\S]*?"ipa":\s*"([^"]*)"[\s\S]*?"translationHint":\s*"([^"]*)"/g)) {
    if (ids.has(m[1]) && !cards[m[1]]) cards[m[1]] = { ipa: m[2], hint: m[3] };
}

const body = fs.readFileSync(`${here}src/content.body.js`, 'utf8');
fs.writeFileSync(`${out}/content.js`, `(() => {\n${matcher}\n${prefs}\nconst RULES = ${JSON.stringify(DIAL_RULES)};\nconst RULES_EN = ${JSON.stringify(DIAL_RULES_EN)};\nconst CARDS = ${JSON.stringify(cards)};\n${body}\n})();\n`);
fs.writeFileSync(`${out}/prefs.js`, prefs);
for (const f of ['manifest.json', 'content.css', 'popup.html', 'popup.js', 'bridge.js']) fs.copyFileSync(`${here}src/${f}`, `${out}/${f}`);
// The API the worker talks to (must match manifest host_permissions).
const API = (process.env.CORTEX_API_URL || 'https://cortexapi-production-964a.up.railway.app').replace(/\/+$/, '');
fs.writeFileSync(`${out}/sw.js`, fs.readFileSync(`${here}src/sw.js`, 'utf8').replace('__CORTEX_API_URL__', API));
fs.copyFileSync(`${here}src/icon-128.png`, `${out}/icon-128.png`);
console.log(`built ${out}: ${DIAL_RULES.length} rules, ${Object.keys(cards).length} cards`);
