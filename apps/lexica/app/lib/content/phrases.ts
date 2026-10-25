/**
 * Finding a phrase card ("look forward to", "push back") in real text: the
 * first word in any form (looking, pushed, ran) and the other words in
 * order, with a word or two between them ("push the show back"). Shared by
 * Bắt gặp (lib/journey/outside.ts) and the reader (lib/content/passages.ts).
 */

/** Words in a text with where they are, lowercased. */
export const tokens = (text: string) => [...text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)].map((m) => ({ word: m[0].toLowerCase(), start: m.index!, end: m.index! + m[0].length }));

/** Past forms of the verbs phrases start with; regular ones are handled by the suffix rules. */
const IRREGULAR: Record<string, string> = {
    ran: 'run', fell: 'fall', fallen: 'fall', got: 'get', gotten: 'get', brought: 'bring', took: 'take', taken: 'take',
    gave: 'give', given: 'give', came: 'come', went: 'go', gone: 'go', made: 'make', did: 'do', done: 'do', kept: 'keep',
    thought: 'think', found: 'find', held: 'hold', told: 'tell', said: 'say', saw: 'see', seen: 'see', broke: 'break',
    broken: 'break', caught: 'catch', left: 'leave', felt: 'feel', stood: 'stand', wore: 'wear', sought: 'seek', ate: 'eat',
};

/** Whether `tok` is a form of the phrase's first word: looking/looked/looks for look, ran for run. */
export function sameHead(tok: string, head: string): boolean {
    if (tok === head || IRREGULAR[tok] === head) return true;
    const undouble = (x: string) => (/([b-df-hj-np-tv-z])\1$/.test(x) ? x.slice(0, -1) : x);
    for (const suffix of ['ing', 'ed', 'es', 's']) {
        if (!tok.endsWith(suffix)) continue;
        const base = tok.slice(0, -suffix.length);
        if (base === head || undouble(base) === head || `${base}e` === head || (suffix === 'ed' && base.endsWith('i') && `${base.slice(0, -1)}y` === head)) return true;
    }
    return false;
}

/** Up to this many words may sit inside a phrase: "push the show back", "on very short notice". */
const PHRASE_GAP = 2;

/** A phrase in a text: its first word in any form, the rest in order with small gaps. */
export function phraseHits(toks: { word: string; start: number; end: number }[], phrase: string): { start: number; end: number }[] {
    const parts = phrase.split(/\s+/);
    const hits: { start: number; end: number }[] = [];
    for (let i = 0; i < toks.length; i++) {
        if (!sameHead(toks[i].word, parts[0])) continue;
        let at = i;
        let ok = true;
        for (const part of parts.slice(1)) {
            let next = -1;
            for (let j = at + 1; j <= Math.min(toks.length - 1, at + 1 + PHRASE_GAP); j++) {
                if (toks[j].word === part) {
                    next = j;
                    break;
                }
            }
            if (next === -1) {
                ok = false;
                break;
            }
            at = next;
        }
        if (ok) {
            hits.push({ start: toks[i].start, end: toks[at].end });
            i = at;
        }
    }
    return hits;
}

