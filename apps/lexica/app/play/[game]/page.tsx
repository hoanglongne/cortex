'use client';

import Link from 'next/link';
import { use, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { blitzRounds, detectiveRounds, liarRounds, listenRounds } from '../../lib/games/rounds';
import ChainGame from '../ChainGame';
import MatchGame from '../MatchGame';
import McqGame, { type McqMode } from '../McqGame';
import SpellGame from '../SpellGame';
import { MIN_WORDS, usePool } from '../usePool';

const MCQ: Record<McqMode, { make: typeof blitzRounds; n: number }> = {
    blitz: { make: blitzRounds, n: 60 },
    detective: { make: detectiveRounds, n: 8 },
    liar: { make: liarRounds, n: 8 },
    listen: { make: listenRounds, n: 8 },
};
const IDS = ['blitz', 'detective', 'liar', 'listen', 'match', 'spell', 'chain'];

export default function GamePage({ params }: { params: Promise<{ game: string }> }) {
    const { game } = use(params);
    if (!IDS.includes(game)) notFound();
    return <Play game={game} />;
}

function Play({ game }: { game: string }) {
    const { known, bank } = usePool();
    // A new number gives a fresh set of rounds for "Chơi lại"
    const [round, setRound] = useState(0);
    const again = () => setRound((r) => r + 1);
    const mcq = game in MCQ ? MCQ[game as McqMode] : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const rounds = useMemo(() => (mcq ? mcq.make(known, bank, mcq.n) : []), [mcq, known, bank, round]);

    let body: React.ReactNode;
    if (known.length < MIN_WORDS || (mcq && rounds.length === 0)) {
        body = (
            <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-2">
                Chưa đủ từ để chơi game này. <Link href="/play" className="text-accent underline">Chọn game khác</Link>
            </p>
        );
    } else if (mcq) {
        body = <McqGame key={round} mode={game as McqMode} rounds={rounds} onAgain={again} />;
    } else if (game === 'match') {
        body = <MatchGame key={round} cards={known} onAgain={again} />;
    } else if (game === 'spell') {
        body = <SpellGame key={round} cards={known} onAgain={again} />;
    } else {
        body = <ChainGame key={round} known={known} bank={bank} onAgain={again} />;
    }
    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-xl mx-auto">{body}</div>
        </div>
    );
}
