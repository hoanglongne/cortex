import { VOCAB_DATABASE } from '../../data/vocabCards';
import { TALK_CARDS } from '../../data/talkCards';

/**
 * The bundled deck as a word list, for the teacher app (apps/lexica-teach)
 * to match a lesson's words to cards. Words it does not find go to Studio.
 */
export const dynamic = 'force-static';

export function GET() {
    const cards = [...VOCAB_DATABASE, ...TALK_CARDS].map((c) => ({
        id: c.id,
        word: c.word,
        meaning: c.translationHint,
        level: c.level,
        branch: 'branch' in c && c.branch === 'talk' ? 'talk' : 'cert',
    }));
    return Response.json(
        { cards },
        { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' } },
    );
}
