/**
 * Oratio's IELTS questions (table ielts_questions, readable by any signed-in
 * user), loaded once per page to pick questions and topics and to name them.
 */
import { getSupabase } from '../../lib/supabase';

export interface Question {
    id: string;
    part: 1 | 2 | 3;
    category: string;
    question_text: string;
}

export interface QuestionBank {
    all: Question[];
    byId: Map<string, Question>;
    /** Categories with how many questions each part has. */
    categories: { name: string; parts: Record<1 | 2 | 3, number> }[];
}

let loading: Promise<QuestionBank> | null = null;

export function questionBank(): Promise<QuestionBank> {
    loading ??= (async () => {
        const sb = getSupabase();
        const { data, error } = sb ? await sb.from('ielts_questions').select('id, part, category, question_text').order('part').order('category') : { data: [], error: null };
        if (error) {
            loading = null;
            throw new Error(error.message);
        }
        const all = (data ?? []) as Question[];
        const cats = new Map<string, Record<1 | 2 | 3, number>>();
        for (const q of all) {
            const c = cats.get(q.category) ?? { 1: 0, 2: 0, 3: 0 };
            c[q.part]++;
            cats.set(q.category, c);
        }
        return {
            all,
            byId: new Map(all.map((q) => [q.id, q])),
            categories: [...cats.entries()].map(([name, parts]) => ({ name, parts })).sort((a, b) => a.name.localeCompare(b.name)),
        };
    })();
    return loading;
}

/** Part 2 cue cards are long: the first line is the topic. */
export const firstLine = (text: string) => text.split('\n')[0].trim();
