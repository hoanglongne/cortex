/**
 * Cuts text into parts a voice can make quickly: whole sentences, grouped up
 * to `max` characters. A sentence longer than `max` is kept whole.
 */
export function speechChunks(paragraphs: readonly string[], max = 220): string[] {
    const out: string[] = [];
    for (const para of paragraphs) {
        const sentences = para.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]*["')\]]*\s*/g) ?? [];
        let cur = '';
        for (const sentence of sentences.map((x) => x.trim()).filter(Boolean)) {
            if (cur && cur.length + 1 + sentence.length > max) {
                out.push(cur);
                cur = sentence;
            } else {
                cur = cur ? `${cur} ${sentence}` : sentence;
            }
        }
        if (cur) out.push(cur);
    }
    return out;
}
