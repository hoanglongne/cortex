'use client';

import Link from 'next/link';
import { use, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { getPassages } from '../../lib/content/repository';
import { bossRounds, blitzRounds, clozeRounds, detectiveRounds, liarRounds, listenRounds, sentencesOf, upgradeRounds } from '../../lib/games/rounds';
import BossGame from '../BossGame';
import ChainGame from '../ChainGame';
import GridGame from '../GridGame';
import RainGame from '../RainGame';
import RunGame from '../RunGame';
import MatchGame from '../MatchGame';
import McqGame, { type McqMode } from '../McqGame';
import SpellGame from '../SpellGame';
import { MIN_WORDS, usePool } from '../usePool';
import type { Choice, GameCard } from '../../lib/games/rounds';

type Make = (known: GameCard[], bank: GameCard[], n: number) => Choice[];
const MCQ: Record<McqMode, { make: Make; n: number }> = {
    blitz: { make: (k, b, n) => blitzRounds(k, b, n), n: 60 },
    detective: { make: (k, b, n) => detectiveRounds(k, b, n), n: 8 },
    liar: { make: (k, b, n) => liarRounds(k, b, n), n: 8 },
    listen: { make: (k, b, n) => listenRounds(k, b, n), n: 8 },
    cloze: { make: (k, b, n) => clozeRounds(k, b, sentencesOf(getPassages().filter((p) => p.kind !== 'dialogue').map((p) => p.text)), n), n: 8 },
    upgrade: { make: (k, _b, n) => upgradeRounds(k, n), n: 8 },
};
const IDS = ['run', 'rain', 'boss', 'grid', 'blitz', 'detective', 'liar', 'listen', 'cloze', 'upgrade', 'match', 'spell', 'chain'];

export default function GamePage({ params }: { params: Promise<{ game: string }> }) {
    const { game } = use(params);
    if (!IDS.includes(game)) notFound();
    return <Play game={game} />;
}

/** Twelve boss questions: meanings, then clues or the liar, then sentences and upgrades. */
function bossFor(known: GameCard[], bank: GameCard[]) {
    return bossRounds(known, bank, sentencesOf(getPassages().filter((p) => p.kind !== 'dialogue').map((p) => p.text)));
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
    } else if (game === 'run') {
        body = <RunGame key={round} cards={known} bank={bank} sentences={sentencesOf(getPassages().filter((p) => p.kind !== 'dialogue').map((p) => p.text))} onAgain={again} />;
    } else if (game === 'rain') {
        body = <RainGame key={round} cards={known} onAgain={again} />;
    } else if (game === 'boss') {
        body = <BossGame key={round} rounds={bossFor(known, bank)} onAgain={again} />;
    } else if (game === 'grid') {
        body = <GridGame key={round} cards={known} onAgain={again} />;
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
