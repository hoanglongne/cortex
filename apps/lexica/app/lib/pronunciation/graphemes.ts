/**
 * Which letters spell each sound of a word ("think": th·i·n·k), for the row
 * of sound chips (docs/LEXICA_PRONUNCIATION_UI_PLAN.md). English spelling
 * is irregular, so this aligns the letters with the dictionary phones by
 * dynamic programming over a table of common spellings, with silent
 * letters attached to the sound before them. Null when it cannot align
 * cheaply: then the chips show the IPA only. Pure, unit tested.
 */
import { bare } from './phones';

/** Common spellings of each ARPAbet phone, most usual first. */
const SPELL: Record<string, string[]> = {
    AA: ['o', 'a', 'ah', 'au', 'aw', 'ow'],
    AE: ['a', 'ai', 'au'],
    AH: ['u', 'o', 'a', 'e', 'i', 'ou', 'oo', 'oe', 'y', 'ai', 'io', 'ia', 'eo'],
    AO: ['o', 'aw', 'au', 'a', 'ough', 'augh', 'oa', 'ou', 'oo'],
    AW: ['ou', 'ow', 'ough'],
    AY: ['i', 'y', 'igh', 'ie', 'ei', 'ai', 'uy', 'eye', 'ye', 'ey', 'is'],
    EH: ['e', 'ea', 'a', 'ai', 'ie', 'ue', 'ay', 'u'],
    ER: ['er', 'ir', 'ur', 'ear', 'or', 'our', 'ar', 'yr', 're', 'r', 'urr', 'err'],
    EY: ['a', 'ai', 'ay', 'ei', 'ey', 'ea', 'eigh', 'aigh', 'e', 'et'],
    IH: ['i', 'y', 'e', 'ui', 'ee', 'ie', 'a', 'u', 'o'],
    IY: ['e', 'ee', 'ea', 'ie', 'ei', 'y', 'i', 'ey', 'eo', 'ay', 'ae', 'oe'],
    OW: ['o', 'oa', 'ow', 'oe', 'ough', 'ou', 'ew', 'eau', 'au'],
    OY: ['oi', 'oy'],
    UH: ['oo', 'u', 'ou', 'o'],
    UW: ['oo', 'u', 'ew', 'ue', 'o', 'ou', 'ui', 'ough', 'oe', 'eu'],
    B: ['b', 'bb'],
    CH: ['ch', 'tch', 't', 'c', 'cz'],
    D: ['d', 'dd', 'ed', 'de'],
    DH: ['th'],
    F: ['f', 'ff', 'ph', 'gh'],
    G: ['g', 'gg', 'gu', 'gh'],
    HH: ['h', 'wh'],
    JH: ['j', 'g', 'dg', 'dge', 'ge', 'gg', 'd'],
    K: ['k', 'c', 'ck', 'ch', 'q', 'cc', 'qu', 'x'],
    L: ['l', 'll', 'le'],
    M: ['m', 'mm', 'mb', 'mn'],
    N: ['n', 'nn', 'kn', 'gn', 'pn', 'ne'],
    NG: ['ng', 'n'],
    P: ['p', 'pp'],
    R: ['r', 'rr', 'wr', 'rh', 're'],
    S: ['s', 'ss', 'c', 'sc', 'ce', 'se', 'x', 'z'],
    SH: ['sh', 'ti', 'ci', 's', 'ch', 'ss', 'si', 'sci', 'ce', 'ssi'],
    T: ['t', 'tt', 'ed', 'th', 'pt', 'te'],
    TH: ['th'],
    V: ['v', 'f', 'vv', 've'],
    W: ['w', 'u', 'wh', 'o'],
    Y: ['y', 'i', 'j', 'u'],
    Z: ['z', 's', 'zz', 'ss', 'x', 'ze', 'se'],
    ZH: ['s', 'si', 'g', 'z', 'ge'],
};

/** Letters that are often silent, cheap to leave unspoken. */
const SILENT = new Set(['e', 'h', 'u', 'w', 'b', 'k', 'l', 'g', 't', 'n', 'p', 'a', 'o']);

/** Above this total cost the alignment is a guess: better to show none. */
const MAX_COST = 6;

/**
 * The letters for each phone of `word`, in order, joined back to the
 * word ("thought" + TH AO T → th·ough·t). A phone spelled by no letter of
 * its own (the Y in "cute") gets ''. Null when the alignment is too poor.
 */
export function spellPhones(word: string, phones: readonly string[]): string[] | null {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    const p = phones.map(bare);
    const n = w.length;
    const m = p.length;
    if (!n || !m) return null;
    const INF = Infinity;
    // cost[i][j]: letters 0..i spelled phones 0..j; from[i][j] how we got here.
    const cost = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(INF));
    const from = Array.from({ length: n + 1 }, () => new Array<[number, number] | null>(m + 1).fill(null));
    cost[0][0] = 0;
    for (let i = 0; i <= n; i++)
        for (let j = 0; j <= m; j++) {
            const c = cost[i][j];
            if (c === INF) continue;
            const relax = (ni: number, nj: number, add: number) => {
                if (c + add < cost[ni][nj]) {
                    cost[ni][nj] = c + add;
                    from[ni][nj] = [i, j];
                }
            };
            if (j < m) {
                const options = SPELL[p[j]] ?? [];
                options.forEach((s, rank) => {
                    if (w.startsWith(s, i)) relax(i + s.length, j + 1, rank * 0.05);
                });
                // Any single letter, at a price.
                if (i < n) relax(i + 1, j + 1, 2);
                // A sound with no letter of its own ("cute": the Y).
                relax(i, j + 1, 1.5);
            }
            // A silent letter, joined to the sound before it (or after it, at the start: "hour").
            if (i < n) relax(i + 1, j, SILENT.has(w[i]) ? 0.6 : 3);
        }
    if (cost[n][m] > MAX_COST) return null;
    const out = new Array<string>(m).fill('');
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
        const [pi, pj] = from[i][j]!;
        if (pj === j) out[Math.max(0, j - 1)] = w.slice(pi, i) + out[Math.max(0, j - 1)];
        else out[pj] = w.slice(pi, i) + out[pj];
        i = pi;
        j = pj;
    }
    return out;
}
