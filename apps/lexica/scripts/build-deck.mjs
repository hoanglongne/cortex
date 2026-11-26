// Writes public/deck/core.json: the IELTS deck and the core passages, which the app
// fetches at start (app/lib/content/repository.ts, issue #178). The layout preloads it,
// so it downloads alongside the main JavaScript instead of after it. Generated from
// app/data/*.ts before dev and build (package.json); not committed.
// Usage (from apps/lexica): node scripts/build-deck.mjs
import fs from 'node:fs';
import ts from 'typescript';

const root = new URL('..', import.meta.url).pathname;
const load = (file) => {
    const out = ts.transpileModule(fs.readFileSync(`${root}${file}`, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
    const mod = { exports: {} };
    const req = (p) => (p.startsWith('./morePassages/') ? load(`app/data/${p.slice(2)}.ts`) : {});
    new Function('exports', 'module', 'require', out)(mod.exports, mod, req);
    return mod.exports;
};
const { VOCAB_DATABASE } = load('app/data/vocabCards.ts');
const { CORE_PASSAGES } = load('app/data/passages.ts');
if (!Array.isArray(VOCAB_DATABASE) || VOCAB_DATABASE.length < 100 || !Array.isArray(CORE_PASSAGES)) throw new Error('deck not read');
fs.mkdirSync(`${root}public/deck`, { recursive: true });
fs.writeFileSync(`${root}public/deck/core.json`, JSON.stringify({ cards: VOCAB_DATABASE, passages: CORE_PASSAGES }));
console.log(`public/deck/core.json: ${VOCAB_DATABASE.length} cards, ${CORE_PASSAGES.length} passages`);
