// Appends a batch of new core cards (scripts/deck/batches/*.json) to VOCAB_DATABASE in
// app/data/vocabCards.ts. Every card must pass app/lib/content/cardCheck.ts and its word must
// be new to the deck; nothing is written if any card fails. IPA comes from scripts/deck/ipa.mjs.
// Usage (from apps/lexica): node scripts/deck/merge.mjs scripts/deck/batches/001-pilot.json [--dry]
import fs from 'node:fs';
import ts from 'typescript';

const root = new URL('../..', import.meta.url).pathname;
const load = (file) => {
    const out = ts.transpileModule(fs.readFileSync(`${root}${file}`, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
    const mod = { exports: {} };
    new Function('exports', 'module', 'require', out)(mod.exports, mod, () => ({}));
    return mod.exports;
};

const [file, flag] = process.argv.slice(2);
if (!file) throw new Error('usage: merge.mjs <batch.json> [--dry]');
const batch = JSON.parse(fs.readFileSync(file, 'utf8'));
const { checkDeck } = load('app/lib/content/cardCheck.ts');
const { VOCAB_DATABASE } = load('app/data/vocabCards.ts');

const words = new Set(VOCAB_DATABASE.map((c) => c.word.trim().toLowerCase()));
const errors = [];
for (const c of batch) {
    if (words.has(c.word.trim().toLowerCase())) errors.push(`${c.id}: ${c.word} is already in the deck`);
    words.add(c.word.trim().toLowerCase());
}
// Check the batch together with the deck, so duplicate ids and sentences are caught too.
const { problems } = checkDeck([...VOCAB_DATABASE, ...batch]);
for (const p of problems) errors.push(`${p.id}: ${p.rule} ${p.detail}`);
if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
}

const src = fs.readFileSync(`${root}app/data/vocabCards.ts`, 'utf8');
const start = src.indexOf('export const VOCAB_DATABASE');
const end = src.indexOf('\n];', start);
if (start < 0 || end < 0) throw new Error('VOCAB_DATABASE array not found');
const body = batch.map((c) => JSON.stringify(c, null, 2).replace(/^/gm, '  ')).join(',\n');
const next = `${src.slice(0, end)},\n${body}${src.slice(end)}`;
if (flag === '--dry') console.log(`ok: ${batch.length} cards would be added (deck ${VOCAB_DATABASE.length})`);
else {
    fs.writeFileSync(`${root}app/data/vocabCards.ts`, next);
    console.log(`added ${batch.length} cards (deck ${VOCAB_DATABASE.length} → ${VOCAB_DATABASE.length + batch.length})`);
}
