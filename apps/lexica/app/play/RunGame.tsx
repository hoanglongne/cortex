'use client';

import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Eye, Gift, Heart, Shield, Skull, Sparkles, Swords, Tent, type LucideIcon } from 'lucide-react';
import { doors, ended, finishRoom, FLOORS, newRun, offer, questionsIn, RELICS, rest, ROOM_LABEL, runScore, take, victory, type RelicId, type RoomKind, type Run } from '../lib/games/run';
import { mixedRounds, type BossRound, type GameAnswer, type GameCard } from '../lib/games/rounds';
import QuestionView from './QuestionView';
import { Bar, Over } from './Shell';
import { edge, GAME_COLOR, tint } from './theme';

const ROOM_ICON: Record<RoomKind, LucideIcon> = { fight: Swords, elite: Skull, treasure: Gift, rest: Tent, boss: Skull };
const ROOM_HUE: Record<RoomKind, string> = { fight: 'var(--color-game-sky)', elite: 'var(--color-game-coral)', treasure: 'var(--color-warning)', rest: 'var(--color-game-mint)', boss: 'var(--color-danger)' };
const RELIC_ICON: Record<RelicId, LucideIcon> = { shield: Shield, double: Sparkles, eye: Eye, heart: Heart, coin: Coins };

type Screen = { at: 'doors' } | { at: 'room'; kind: RoomKind; rounds: BossRound[]; i: number; right: number } | { at: 'treasure'; relics: RelicId[] };

/**
 * Hành trình: seven floors, two doors on each. Fights and elites ask questions,
 * treasures hand out relics, rests heal; the boss waits on the last floor.
 * Hearts do not come back by themselves, so every door is a choice.
 */
export default function RunGame({ cards, bank, sentences, onAgain }: { cards: GameCard[]; bank: GameCard[]; sentences: string[]; onAgain: () => void }) {
    const [run, setRun] = useState<Run>(newRun);
    const [screen, setScreen] = useState<Screen>({ at: 'doors' });
    const [picked, setPicked] = useState<number | null>(null);
    const [hidden, setHidden] = useState<number[]>([]);
    const [eyeUsed, setEyeUsed] = useState(false);
    const [answers, setAnswers] = useState<GameAnswer[]>([]);
    const used = useRef(new Set<string>());
    const c = GAME_COLOR.run;
    const fork = useMemo(() => doors(run.floor), [run.floor]);

    const enter = (kind: RoomKind) => {
        if (kind === 'treasure') return setScreen({ at: 'treasure', relics: offer(run) });
        if (kind === 'rest') {
            setRun(rest(run));
            return setScreen({ at: 'doors' });
        }
        // Words not asked yet this run first; when they run out, any
        const fresh = cards.filter((x) => !used.current.has(x.id));
        const pool = fresh.length >= questionsIn(kind) + 3 ? fresh : cards;
        const rounds = mixedRounds(kind === 'fight' ? 'easy' : 'hard', pool, bank, sentences, questionsIn(kind));
        rounds.forEach((r) => used.current.add(r.cardId));
        setEyeUsed(false);
        setHidden([]);
        setScreen({ at: 'room', kind, rounds, i: 0, right: 0 });
    };

    const pick = (n: number) => {
        if (screen.at !== 'room' || picked !== null) return;
        const q = screen.rounds[screen.i];
        const ok = n === q.answer;
        setPicked(n);
        setAnswers((a) => [...a, { cardId: q.cardId, correct: ok }]);
        setTimeout(() => {
            setPicked(null);
            setHidden([]);
            const right = screen.right + (ok ? 1 : 0);
            if (screen.i + 1 < screen.rounds.length) return setScreen({ ...screen, i: screen.i + 1, right });
            setRun((r) => finishRoom(r, screen.kind, right, screen.rounds.length));
            setScreen({ at: 'doors' });
        }, ok ? 700 : 1300);
    };

    const eye = () => {
        if (screen.at !== 'room' || eyeUsed || picked !== null) return;
        const q = screen.rounds[screen.i];
        setHidden(q.options.map((_, n) => n).filter((n) => n !== q.answer).sort(() => Math.random() - 0.5).slice(0, 2));
        setEyeUsed(true);
    };

    if (ended(run)) {
        const score = runScore(run);
        return (
            <div className="space-y-4">
                <Bar game="run" title="Hành trình" score={score} progress={1} />
                <Over game="run" score={score} answers={answers} onAgain={onAgain} line={victory(run) ? 'Hạ được trùm, về đích!' : `Gục ở tầng ${Math.min(run.floor, FLOORS)}/${FLOORS}`} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Bar game="run" title="Hành trình" score={run.score} progress={(run.floor - 1) / FLOORS} />
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                    {Array.from({ length: Math.max(3, run.hearts) }, (_, n) => (
                        <Heart key={n} className={`h-4 w-4 ${n < run.hearts ? 'fill-danger text-danger' : 'text-subtle'}`} />
                    ))}
                </span>
                <span className="font-mono text-muted">
                    Tầng {Math.min(run.floor, FLOORS)}/{FLOORS}
                </span>
                <span className="flex items-center gap-1" aria-label="Vật phẩm đang có">
                    {run.relics.map((r) => {
                        const Icon = RELIC_ICON[r];
                        return <Icon key={r} className="h-4 w-4" style={{ color: c }} aria-label={RELICS[r].name} />;
                    })}
                </span>
            </div>

            {screen.at === 'doors' && (
                <section>
                    <p className="mb-3 text-center text-sm text-muted">{run.floor >= FLOORS ? 'Trùm đang chờ. Không còn đường lui.' : 'Chọn một cánh cửa'}</p>
                    <div className={`grid gap-3 ${fork.length > 1 ? 'grid-cols-2' : ''}`}>
                        {fork.map((k, n) => {
                            const Icon = ROOM_ICON[k];
                            const hue = ROOM_HUE[k];
                            return (
                                <motion.button key={`${run.floor}-${k}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: n * 0.08 }} onClick={() => enter(k)} className="relative overflow-hidden rounded-3xl border p-5 text-left active:scale-[0.97]" style={{ background: tint(hue, 14), borderColor: edge(hue, 45) }}>
                                    <Icon aria-hidden className="pointer-events-none absolute -bottom-4 -right-3 h-24 w-24 -rotate-12 opacity-[0.1]" style={{ color: hue }} />
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-on-status" style={{ background: hue }}>
                                        <Icon className="h-6 w-6" />
                                    </span>
                                    <span className="mt-3 block text-lg font-bold text-ink">{ROOM_LABEL[k].name}</span>
                                    <span className="mt-0.5 block text-xs text-muted">{ROOM_LABEL[k].hint}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                    {run.doubleNext && <p className="mt-3 text-center text-xs text-warning">Nhân đôi: phòng chiến đấu kế tiếp gấp đôi điểm</p>}
                </section>
            )}

            {screen.at === 'treasure' && (
                <section>
                    <p className="mb-3 text-center text-sm text-muted">Chọn một vật phẩm</p>
                    <div className="grid gap-3">
                        {screen.relics.map((r) => {
                            const Icon = RELIC_ICON[r];
                            return (
                                <button
                                    key={r}
                                    onClick={() => {
                                        setRun(take(run, r));
                                        setScreen({ at: 'doors' });
                                    }}
                                    className="flex items-center gap-4 rounded-3xl border p-4 text-left active:scale-[0.98]"
                                    style={{ background: tint('var(--color-warning)', 10), borderColor: edge('var(--color-warning)', 40) }}
                                >
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-on-status" style={{ background: 'var(--color-warning)' }}>
                                        <Icon className="h-6 w-6" />
                                    </span>
                                    <span>
                                        <span className="block font-bold text-ink">{RELICS[r].name}</span>
                                        <span className="block text-sm text-ink-2">{RELICS[r].text}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {screen.at === 'room' && (
                <section className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted">
                        <span className="rounded-md px-2 py-0.5 font-mono uppercase tracking-wide" style={{ background: edge(ROOM_HUE[screen.kind], 18), color: ROOM_HUE[screen.kind] }}>
                            {ROOM_LABEL[screen.kind].name} · {screen.i + 1}/{screen.rounds.length}
                        </span>
                        {run.relics.includes('eye') && (
                            <button onClick={eye} disabled={eyeUsed || picked !== null} className="h-7 rounded-lg border border-line px-2 font-semibold text-ink-2 disabled:opacity-40">
                                50/50
                            </button>
                        )}
                    </div>
                    <QuestionView q={screen.rounds[screen.i]} picked={picked} hidden={hidden} onPick={pick} />
                </section>
            )}
        </div>
    );
}
