'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Headphones, Turtle, Volume2 } from 'lucide-react';
import { AudioService } from '../lib/audio/AudioService';
import { checkDictation, dictationPoints, fillOk, gotWord, PACE_LABEL, PACES, paceRate, type Checked, type DictationRound, type FillRound, type LinkedRound, type Pace } from '../lib/games/listen';
import type { GameAnswer } from '../lib/games/rounds';
import { Bar, Over } from './Shell';
import { ANSWER_LETTER, ANSWER_TILE, edge, GAME_COLOR, tint, type GameId } from './theme';

/** The honest line under every listening game. */
function Limit() {
    return <p className="text-center text-[11px] leading-snug text-subtle">Giọng đọc là giọng tổng hợp, chỉ vài giọng Mỹ. Đây là luyện nghe hiểu, không thay cho bài thi Listening thật.</p>;
}

const useStopOnLeave = () =>
    useEffect(
        () => () => {
            AudioService.stop();
        },
        [],
    );

function PlayBar({ game, onPlay, plays, label = 'Nghe' }: { game: GameId; onPlay: () => void; plays: number; label?: string }) {
    const c = GAME_COLOR[game];
    return (
        <button onClick={onPlay} className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl text-lg font-bold text-on-status" style={{ background: c }}>
            <Volume2 className="h-6 w-6" /> {plays === 0 ? label : 'Nghe lại'}
            {plays > 0 && <span className="font-mono text-xs opacity-75">lần {plays}</span>}
        </button>
    );
}

// ── Nghe chép ──────────────────────────────────────────────────────────

/**
 * Nghe chép: hear a sentence from a text with one of my words, type what you
 * heard, and see which words you missed. A faster pace scores more.
 */
export function DictateGame({ rounds, onAgain }: { rounds: DictationRound[]; onAgain: () => void }) {
    const c = GAME_COLOR.dictate;
    const [i, setI] = useState(0);
    const [typed, setTyped] = useState('');
    const [pace, setPace] = useState<Pace>(1);
    const [plays, setPlays] = useState(0);
    const [checked, setChecked] = useState<Checked | null>(null);
    const [score, setScore] = useState(0);
    const [gain, setGain] = useState(0);
    const [answers, setAnswers] = useState<GameAnswer[]>([]);
    const input = useRef<HTMLTextAreaElement>(null);
    const q = rounds[i];
    useStopOnLeave();

    if (!q) {
        return (
            <div className="space-y-4">
                <Bar game="dictate" title="Nghe chép" score={score} progress={1} />
                <Over game="dictate" score={score} answers={answers} onAgain={onAgain} />
            </div>
        );
    }
    const play = (p: Pace = pace) => {
        setPace(p);
        setPlays((n) => n + 1);
        void AudioService.playText(q.sentence, 'en', paceRate(p));
        input.current?.focus();
    };
    const check = () => {
        if (!typed.trim() || checked) return;
        const r = checkDictation(q.sentence, typed);
        const pts = dictationPoints(r.accuracy, pace, plays);
        AudioService.stop();
        setChecked(r);
        setGain(pts);
        setScore((s) => s + pts);
        setAnswers((a) => [...a, { cardId: q.cardId, correct: gotWord(r, q.word) }]);
    };
    const next = () => {
        setI(i + 1);
        setTyped('');
        setPlays(0);
        setChecked(null);
    };

    return (
        <div className="space-y-4">
            <Bar game="dictate" title="Nghe chép" score={score} progress={i / rounds.length} />
            <p className="text-center text-xs text-subtle">
                Câu {i + 1}/{rounds.length}
            </p>
            <div className="space-y-3 rounded-3xl border p-5" style={{ background: tint(c, 8), borderColor: edge(c, 30) }}>
                {!checked ? (
                    <>
                        <PlayBar game="dictate" onPlay={() => play()} plays={plays} />
                        <div className="flex items-center justify-center gap-1.5" role="group" aria-label="Tốc độ">
                            <Turtle aria-hidden className="h-4 w-4 text-subtle" />
                            {PACES.map((p) => (
                                <button key={p} onClick={() => play(p)} aria-pressed={pace === p} className={`h-8 rounded-lg border px-3 font-mono text-xs ${pace === p ? 'border-transparent text-on-status' : 'border-line text-ink-2'}`} style={pace === p ? { background: c } : undefined}>
                                    {PACE_LABEL[p]}
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-[11px] text-muted">Chậm thì dễ, nhanh thì điểm cao hơn. Nghe quá 2 lần bị trừ điểm.</p>
                    </>
                ) : (
                    <p lang="en" className="flex flex-wrap gap-x-1.5 gap-y-1 text-lg leading-snug">
                        {checked.words.map((w, k) => (
                            <span key={k} className={w.ok ? 'text-ink' : 'rounded px-0.5 text-danger underline decoration-wavy underline-offset-4'} style={w.ok ? undefined : { background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)' }}>
                                {w.text}
                            </span>
                        ))}
                    </p>
                )}
            </div>
            <textarea
                ref={input}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={Boolean(checked)}
                lang="en"
                rows={3}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Câu bạn nghe được"
                placeholder="Gõ câu bạn nghe được"
                className="w-full rounded-2xl border border-line bg-surface p-3 text-ink disabled:opacity-70"
            />
            {checked ? (
                <div className="space-y-2">
                    <p className="text-sm text-ink-2">
                        Đúng {Math.round(checked.accuracy * 100)}% · <span className="font-semibold" style={{ color: c }}>+{gain} điểm</span>
                        {checked.extra.length > 0 && <span className="text-muted"> · bạn gõ thừa: {checked.extra.slice(0, 4).join(', ')}</span>}
                    </p>
                    <button onClick={() => void AudioService.playText(q.sentence, 'en', paceRate(1))} className="flex items-center gap-1.5 text-xs text-muted hover:text-ink">
                        <Headphones className="h-3.5 w-3.5" /> Nghe lại câu đúng
                    </button>
                    <button onClick={next} className="h-12 w-full rounded-2xl font-bold text-on-status" style={{ background: c }}>
                        {i + 1 >= rounds.length ? 'Xem kết quả' : 'Câu tiếp'}
                    </button>
                </div>
            ) : (
                <button onClick={check} disabled={!typed.trim() || plays === 0} className="h-12 w-full rounded-2xl font-bold text-on-status disabled:opacity-40" style={{ background: c }}>
                    Kiểm tra
                </button>
            )}
            <Limit />
        </div>
    );
}

// ── Nghe và điền ───────────────────────────────────────────────────────

/** Nghe và điền: hear a short text, fill the gaps in its transcript (like IELTS note completion). */
export function FillGame({ rounds, onAgain }: { rounds: FillRound[]; onAgain: () => void }) {
    const c = GAME_COLOR.fill;
    const [i, setI] = useState(0);
    const [vals, setVals] = useState<string[]>([]);
    const [plays, setPlays] = useState(0);
    const [slow, setSlow] = useState(false);
    const [done, setDone] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<GameAnswer[]>([]);
    const q = rounds[i];
    useStopOnLeave();

    if (!q) {
        return (
            <div className="space-y-4">
                <Bar game="fill" title="Nghe và điền" score={score} progress={1} />
                <Over game="fill" score={score} answers={answers} onAgain={onAgain} />
            </div>
        );
    }
    const spoken = q.spoken;
    const play = (s = slow) => {
        setSlow(s);
        setPlays((n) => n + 1);
        void AudioService.playText(spoken, 'en', s ? 0.7 : undefined);
    };
    const right = q.answers.map((a, k) => fillOk(vals[k] ?? '', a));
    const submit = () => {
        AudioService.stop();
        setDone(true);
        const got = right.filter(Boolean).length;
        setScore((s) => s + Math.max(0, got * 10 - Math.max(0, plays - 2) * 2));
        // Only my words go to review; plain words are just for the score
        setAnswers((a) => [...a, ...q.cardIds.flatMap((id, k) => (id ? [{ cardId: id, correct: right[k] }] : []))]);
    };
    const next = () => {
        setI(i + 1);
        setVals([]);
        setPlays(0);
        setDone(false);
    };

    return (
        <div className="space-y-4">
            <Bar game="fill" title="Nghe và điền" score={score} progress={i / rounds.length} />
            <p className="text-center text-xs text-subtle">
                Bài {i + 1}/{rounds.length}
            </p>
            <div className="space-y-2 rounded-3xl border p-5" style={{ background: tint(c, 8), borderColor: edge(c, 30) }}>
                <PlayBar game="fill" onPlay={() => play()} plays={plays} label="Nghe cả bài" />
                <div className="flex justify-center">
                    <button onClick={() => play(!slow)} aria-pressed={slow} className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs ${slow ? 'border-transparent text-on-status' : 'border-line text-ink-2'}`} style={slow ? { background: c } : undefined}>
                        <Turtle className="h-3.5 w-3.5" /> {slow ? 'Đang nghe chậm' : 'Nghe chậm'}
                    </button>
                </div>
            </div>
            <p lang="en" className="rounded-2xl border border-line bg-surface p-4 text-[17px] leading-loose text-ink">
                {q.parts.map((p, k) =>
                    'text' in p ? (
                        <span key={k}>{p.text}</span>
                    ) : (
                        <span key={k} className="whitespace-nowrap">
                            <input
                                value={vals[p.blank] ?? ''}
                                onChange={(e) => setVals((v) => Object.assign([...v], { [p.blank]: e.target.value }))}
                                disabled={done}
                                aria-label={`Chỗ trống ${p.blank + 1}`}
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                                size={Math.max(6, q.answers[p.blank].length + 1)}
                                className={`mx-0.5 h-8 rounded-lg border px-2 text-center text-base ${done ? (right[p.blank] ? 'border-accent bg-accent/10 text-accent' : 'border-danger bg-danger/10 text-danger') : 'border-line-strong bg-surface-2 text-ink'}`}
                            />
                            {done && !right[p.blank] && <span className="mr-1 text-sm font-semibold text-accent">{q.answers[p.blank]}</span>}
                        </span>
                    ),
                )}
            </p>
            {done ? (
                <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-sm text-ink-2">
                        <Check className="h-4 w-4 text-accent" /> Đúng {right.filter(Boolean).length}/{q.answers.length} chỗ
                    </p>
                    <button onClick={next} className="h-12 w-full rounded-2xl font-bold text-on-status" style={{ background: c }}>
                        {i + 1 >= rounds.length ? 'Xem kết quả' : 'Bài tiếp'}
                    </button>
                </div>
            ) : (
                <button onClick={submit} disabled={plays === 0 || vals.filter((v) => v?.trim()).length === 0} className="h-12 w-full rounded-2xl font-bold text-on-status disabled:opacity-40" style={{ background: c }}>
                    Kiểm tra
                </button>
            )}
            <Limit />
        </div>
    );
}

// ── Âm nối và âm rút ───────────────────────────────────────────────────

/** Âm nối và âm rút: hear "gonna", "lemme", "a nice day", pick what was said in full. */
export function LinkedGame({ rounds, onAgain }: { rounds: LinkedRound[]; onAgain: () => void }) {
    const c = GAME_COLOR.linked;
    const [i, setI] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const [plays, setPlays] = useState(0);
    const [score, setScore] = useState(0);
    const [right, setRight] = useState(0);
    const q = rounds[i];
    const played = useRef(false);
    useStopOnLeave();
    const answers = useMemo<GameAnswer[]>(() => [], []);

    if (!q) {
        return (
            <div className="space-y-4">
                <Bar game="linked" title="Âm nối, âm rút" score={score} progress={1} />
                <Over game="linked" score={score} answers={answers} onAgain={onAgain} line={`${right}/${rounds.length} câu`} />
                <Link href="/speak" className="block text-center text-sm text-accent underline">
                    Luyện phát âm ở Nói
                </Link>
            </div>
        );
    }
    const play = (slow = false) => {
        played.current = true;
        setPlays((n) => n + 1);
        void AudioService.playText(q.said, 'en', slow ? 0.7 : undefined);
    };
    const choose = (n: number) => {
        if (picked !== null) return;
        setPicked(n);
        if (n === q.answer) {
            setRight((r) => r + 1);
            setScore((s) => s + (plays <= 1 ? 15 : 10));
        }
    };
    const next = () => {
        setI(i + 1);
        setPicked(null);
        setPlays(0);
    };
    return (
        <div className="space-y-4">
            <Bar game="linked" title="Âm nối, âm rút" score={score} progress={i / rounds.length} />
            <p className="text-center text-xs text-subtle">
                Câu {i + 1}/{rounds.length}
            </p>
            <div className="space-y-3 rounded-3xl border p-5" style={{ background: tint(c, 8), borderColor: edge(c, 30) }}>
                <PlayBar game="linked" onPlay={() => play()} plays={plays} />
                <div className="flex justify-center">
                    <button onClick={() => play(true)} className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-xs text-ink-2">
                        <Turtle className="h-3.5 w-3.5" /> Nghe chậm
                    </button>
                </div>
                <p className="text-center text-sm text-ink-2">{q.twin ? 'Bạn nghe được câu nào?' : 'Câu này đầy đủ là gì?'}</p>
            </div>
            <div className="grid gap-2.5">
                {q.options.map((o, n) => {
                    const isRight = picked !== null && n === q.answer;
                    const isWrong = picked === n && n !== q.answer;
                    return (
                        <button key={o} onClick={() => choose(n)} disabled={picked !== null} className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-2 text-left text-ink transition-colors ${picked !== null && !isRight && !isWrong ? 'opacity-40' : ''} ${isRight ? 'border-accent bg-accent text-on-accent' : isWrong ? 'border-danger bg-danger/15' : 'border-line bg-surface hover:border-line-strong'}`}>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold text-on-arena" style={{ background: isRight ? 'rgb(0 0 0 / 0.25)' : ANSWER_TILE[n % 4] }}>
                                {ANSWER_LETTER[n % 4]}
                            </span>
                            <span lang="en">{o}</span>
                        </button>
                    );
                })}
            </div>
            {picked !== null && (
                <div className="space-y-2">
                    <p className="rounded-xl border border-line bg-surface-2/50 p-3 text-sm text-ink-2">
                        <span lang="en" className="font-semibold text-ink">“{q.said}”</span>
                        <br />
                        {q.note}
                    </p>
                    <button onClick={next} className="h-12 w-full rounded-2xl font-bold text-on-status" style={{ background: c }}>
                        {i + 1 >= rounds.length ? 'Xem kết quả' : 'Câu tiếp'}
                    </button>
                </div>
            )}
            <Limit />
        </div>
    );
}
