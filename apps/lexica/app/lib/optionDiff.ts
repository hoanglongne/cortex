/**
 * Fewer words to read in review questions (issue #146):
 * - the words every option shares at the start or end are shown faint and
 *   the part that differs is bold, so the eye goes straight to the choice;
 * - a long example sentence is cut to the words around the blank.
 * Pure, unit tested.
 */

export interface OptionPart { text: string; differs: boolean }

const words = (s: string) => s.split(/\s+/).filter(Boolean);

/** Each option split into [shared start, differing middle, shared end]; empty parts dropped. */
export function optionDiff(options: readonly string[]): OptionPart[][] {
    const ws = options.map(words);
    if (ws.length < 2 || ws.some((w) => w.length === 0)) return options.map((o) => [{ text: o, differs: true }]);
    const minLen = Math.min(...ws.map((w) => w.length));
    const same = (pick: (w: string[]) => string) => ws.every((w) => pick(w).toLowerCase() === pick(ws[0]).toLowerCase());
    let pre = 0;
    while (pre < minLen - 1 && same((w) => w[pre])) pre++;
    let suf = 0;
    while (suf < minLen - pre - 1 && same((w) => w[w.length - 1 - suf])) suf++;
    return ws.map((w) =>
        [
            { text: w.slice(0, pre).join(' '), differs: false },
            { text: w.slice(pre, w.length - suf).join(' '), differs: true },
            { text: w.slice(w.length - suf).join(' '), differs: false },
        ].filter((p) => p.text),
    );
}

/** The words around the first `______`, at most `max` words, with … where cut. */
export function aroundBlank(sentence: string, max = 12): string {
    const w = words(sentence);
    if (w.length <= max) return sentence;
    const at = Math.max(0, w.findIndex((x) => x.includes('______')));
    let start = Math.max(0, at - Math.floor(max / 2));
    const end = Math.min(w.length, start + max);
    start = Math.max(0, end - max);
    return `${start > 0 ? '… ' : ''}${w.slice(start, end).join(' ')}${end < w.length ? ' …' : ''}`;
}
