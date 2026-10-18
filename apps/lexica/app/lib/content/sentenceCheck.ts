/**
 * Kind feedback on a sentence the learner wrote with one of their words
 * (POST /v1/lexica/sentence). Null when the API is not there: the caller
 * then only checks that the word is in the sentence.
 */
import { CORTEX_API_URL } from '../cortexConfig';

export interface SentenceFeedback {
    uses: boolean;
    ok: boolean;
    note: string;
    better?: string;
}

export async function checkSentence(word: string, meaning: string, sentence: string): Promise<SentenceFeedback | null> {
    if (!CORTEX_API_URL) return null;
    try {
        const res = await fetch(`${CORTEX_API_URL}/v1/lexica/sentence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: word.toLowerCase(), meaning: meaning.slice(0, 60), sentence }),
        });
        if (!res.ok) return null;
        return (await res.json()) as SentenceFeedback;
    } catch {
        return null;
    }
}
