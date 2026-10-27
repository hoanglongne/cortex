'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Shuffle, Users } from 'lucide-react';
import type { Board } from '@cortex/classroom';
import { BAND_DESCRIPTORS, CRITERIA, CRITERION_LABEL, ORATIO, oratioModule, parseCueCard } from '@cortex/classroom-oratio';
import { questionBank, type Question, type QuestionBank } from '../../modules/oratio/questions';
import { mmss, pickQuestion, speakingClock, speakingPairs, type SpeakPart } from '../../lib/speaking';
import type { Person } from '../../lib/classroom/tools';

const BANDS = [5, 6, 7, 8];

/** A short tone when a phase ends (prepare → speak → stop). */
function beep() {
    try {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.5);
        setTimeout(() => void ctx.close(), 800);
    } catch {
        // no sound: the clock still shows the phase
    }
}

/**
 * "Luyện nói" (docs/TEACH_PLAN.md, T5): Oratio's IELTS questions on the
 * projector with exam timing (Part 2: a minute to prepare, two to talk),
 * speaking pairs (one speaks, one rates with the descriptors, then swap),
 * and the band descriptors at the class's target band.
 */
export default function Speaking({ board, people }: { board: Board; people: Person[] }) {
    const [bank, setBank] = useState<QuestionBank | null>(null);
    const [bankError, setBankError] = useState('');
    const [part, setPart] = useState<SpeakPart>(1);
    // A topic, or an Oratio assignment ("a:<id>"), or any
    const [topic, setTopic] = useState<string>('');
    const [q, setQ] = useState<Question | null>(null);
    const seen = useRef<string[]>([]);
    const [running, setRunning] = useState(false);
    const [acc, setAcc] = useState(0);
    const [since, setSince] = useState(0);
    const [clock, setClock] = useState(0);
    const [panel, setPanel] = useState<'pairs' | 'rubric' | null>(null);
    const [pairs, setPairs] = useState<Person[][] | null>(null);
    const [swapped, setSwapped] = useState(false);
    const target = oratioModule.parseSettings(board.class.settings[ORATIO]).target_band;
    const [band, setBand] = useState(() => (target ? Math.min(8, Math.max(5, Math.round(target))) : 6));

    useEffect(() => {
        questionBank().then(setBank, (e: unknown) => setBankError(e instanceof Error ? e.message : String(e)));
    }, []);

    const assigned = useMemo(
        () =>
            board.assignments
                .filter((a) => a.app === ORATIO)
                .map((a) => ({ a, p: oratioModule.parsePayload(a.kind, a.payload) }))
                .filter(({ p }) => p.kind === 'questions' || p.kind === 'topic'),
        [board.assignments],
    );
    const filter = useMemo(() => {
        if (topic.startsWith('a:')) {
            const x = assigned.find(({ a }) => a.id === topic.slice(2));
            if (x?.p.kind === 'questions') return { part, category: null, ids: x.p.question_ids };
            if (x?.p.kind === 'topic') return { part: (x.p.part ?? part) as SpeakPart, category: x.p.category };
        }
        return { part, category: topic || null };
    }, [topic, part, assigned]);

    const elapsed = acc + (running ? Math.max(0, clock - since) : 0);
    const c = speakingClock(filter.part, elapsed);
    const lastPhase = useRef(c.phase);
    const speakPart = filter.part;
    // The clock ticks while running; a phase ending beeps, the end stops it
    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => {
            const now = Date.now();
            const el = acc + Math.max(0, now - since);
            const phase = speakingClock(speakPart, el).phase;
            if (phase !== lastPhase.current) beep();
            lastPhase.current = phase;
            setClock(now);
            if (phase === 'done') {
                setRunning(false);
                setAcc(el);
            }
        }, 200);
        return () => clearInterval(t);
    }, [running, acc, since, speakPart]);

    const reset = () => {
        setRunning(false);
        setAcc(0);
        lastPhase.current = speakingClock(speakPart, 0).phase;
    };
    const next = () => {
        if (!bank) return;
        const n = pickQuestion(bank.all, filter, seen.current, Math.random);
        if (n) seen.current = [...seen.current, n.id];
        setQ(n);
        reset();
    };
    const start = () => {
        const now = Date.now();
        setSince(now);
        setClock(now);
        setRunning(true);
    };
    const pause = () => {
        setAcc(elapsed);
        setRunning(false);
    };

    const topics = bank ? bank.categories.filter((x) => x.parts[part] > 0) : [];
    const card = q && q.part === 2 ? parseCueCard(q.question_text) : null;
    const chip = (on: boolean) => `h-10 rounded-xl px-3 text-sm ${on ? 'bg-accent-soft font-semibold text-accent-strong' : 'text-muted hover:text-ink'}`;
    const phaseLabel = c.phase === 'prep' ? 'Chuẩn bị' : c.phase === 'talk' ? 'Nói' : 'Hết giờ';

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
                {([1, 2, 3] as const).map((p) => (
                    <button key={p} onClick={() => { setPart(p); setQ(null); reset(); }} aria-pressed={part === p} className={chip(part === p)}>
                        Part {p}
                    </button>
                ))}
                <select value={topic} onChange={(e) => { setTopic(e.target.value); setQ(null); reset(); }} aria-label="Chủ đề" className="h-10 max-w-[16rem] rounded-xl border border-line bg-surface px-2 text-sm text-ink-2">
                    <option value="">Mọi chủ đề</option>
                    {assigned.map(({ a }) => (
                        <option key={a.id} value={`a:${a.id}`}>
                            Bài giao: {a.title}
                        </option>
                    ))}
                    {topics.map((x) => (
                        <option key={x.name} value={x.name}>
                            {x.name} ({x.parts[part]})
                        </option>
                    ))}
                </select>
                <button onClick={next} disabled={!bank} className="flex h-10 items-center gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-strong disabled:opacity-40">
                    <Shuffle className="h-4 w-4" /> {q ? 'Câu khác' : 'Lấy câu hỏi'}
                </button>
                <span className="ml-auto flex gap-1">
                    <button onClick={() => { setPanel((x) => (x === 'pairs' ? null : 'pairs')); if (!pairs) setPairs(speakingPairs(people, Math.random)); }} aria-pressed={panel === 'pairs'} className={`flex items-center gap-1.5 ${chip(panel === 'pairs')}`}>
                        <Users className="h-4 w-4" /> Ghép cặp
                    </button>
                    <button onClick={() => setPanel((x) => (x === 'rubric' ? null : 'rubric'))} aria-pressed={panel === 'rubric'} className={chip(panel === 'rubric')}>
                        Tiêu chí chấm
                    </button>
                </span>
            </div>

            <div className={`grid min-h-0 flex-1 ${panel ? 'lg:grid-cols-[minmax(0,1fr)_380px]' : ''}`}>
                <div className="flex min-h-0 flex-col items-center justify-center overflow-y-auto px-6 py-8 text-center">
                    {bankError ? (
                        <p className="text-danger">Không tải được câu hỏi của Oratio: {bankError}</p>
                    ) : !bank ? (
                        <div className="h-40 w-full max-w-3xl animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
                    ) : !q ? (
                        <div className="max-w-xl">
                            <p className="font-serif text-[34px] font-semibold text-ink">Luyện nói IELTS</p>
                            <p className="mt-3 text-ink-2">Chọn Part và chủ đề, rồi bấm “Lấy câu hỏi”. Đồng hồ theo đúng nhịp thi: Part 2 có một phút chuẩn bị và hai phút nói. Ghép cặp để một em nói, một em chấm theo tiêu chí, rồi đổi vai.</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl">
                            <p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-muted">
                                Part {q.part} · {q.category}
                            </p>
                            {card ? (
                                <div className="mx-auto mt-4 max-w-3xl rounded-[var(--radius-card)] bg-surface p-8 text-left shadow-[var(--shadow-card)]">
                                    <p lang="en" className="font-serif text-[34px] font-semibold leading-snug text-ink">
                                        {card.task}
                                    </p>
                                    {card.points.length > 0 && (
                                        <>
                                            <p className="mt-5 text-[17px] text-muted" lang="en">
                                                You should say:
                                            </p>
                                            <ul lang="en" className="mt-2 list-disc space-y-1.5 pl-6 text-[24px] text-ink-2">
                                                {card.points.map((x) => (
                                                    <li key={x}>{x}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <p lang="en" className="mt-4 font-serif text-[40px] font-semibold leading-tight text-ink sm:text-[52px]">
                                    {q.question_text}
                                </p>
                            )}
                            <div className="mt-10 flex flex-col items-center">
                                <p className={`text-[15px] font-semibold uppercase tracking-[0.08em] ${c.phase === 'done' ? 'text-warm' : c.phase === 'prep' ? 'text-muted' : 'text-accent-strong'}`}>{phaseLabel}</p>
                                <p className={`font-mono text-[88px] font-bold leading-none tabular ${c.phase === 'talk' && c.left <= 10_000 ? 'text-warm' : 'text-ink'}`}>{mmss(c.left)}</p>
                                <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-surface-2">
                                    <div className={`h-full ${c.phase === 'prep' ? 'bg-line-strong' : 'bg-accent'}`} style={{ width: `${c.total ? (c.left / c.total) * 100 : 0}%` }} />
                                </div>
                                <div className="mt-6 flex gap-3">
                                    {running ? (
                                        <button onClick={pause} className="flex h-12 items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-5 text-ink hover:bg-surface-2">
                                            <Pause className="h-5 w-5" /> Tạm dừng
                                        </button>
                                    ) : (
                                        <button onClick={start} disabled={c.phase === 'done'} className="flex h-12 items-center gap-2 rounded-[10px] bg-accent px-6 font-semibold text-on-accent hover:bg-accent-strong disabled:opacity-40">
                                            <Play className="h-5 w-5" /> {elapsed > 0 ? 'Tiếp tục' : 'Bắt đầu'}
                                        </button>
                                    )}
                                    <button onClick={reset} aria-label="Làm lại" className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-line-strong bg-surface text-ink hover:bg-surface-2">
                                        <RotateCcw className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {panel && (
                    <aside className="min-h-0 overflow-y-auto border-t border-line bg-surface p-5 lg:border-l lg:border-t-0">
                        {panel === 'pairs' ? (
                            <>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Cặp luyện nói</p>
                                    <span className="flex gap-3 text-[15px]">
                                        <button onClick={() => setSwapped((x) => !x)} className="text-accent-strong hover:underline">
                                            Đổi vai
                                        </button>
                                        <button onClick={() => setPairs(speakingPairs(people, Math.random))} className="text-accent-strong hover:underline">
                                            Ghép lại
                                        </button>
                                    </span>
                                </div>
                                {(pairs ?? []).length === 0 ? (
                                    <p className="text-[15px] text-muted">Chưa có em nào có mặt.</p>
                                ) : (
                                    <ol className="space-y-2">
                                        {(pairs ?? []).map((g, i) => {
                                            const order = swapped ? [...g.slice(1), g[0]] : g;
                                            return (
                                                <li key={i} className="rounded-[12px] bg-bg px-4 py-3 text-[17px]">
                                                    <span className="font-semibold text-ink">{order[0].name}</span> <span className="text-muted">nói</span>
                                                    <span className="text-muted"> · </span>
                                                    <span className="text-ink-2">{order.slice(1).map((p) => p.name).join(', ')}</span> <span className="text-muted">chấm</span>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Band {band} nghĩa là</p>
                                    <span className="flex gap-1">
                                        {BANDS.map((b) => (
                                            <button key={b} onClick={() => setBand(b)} aria-pressed={band === b} className={`h-8 w-8 rounded-lg text-sm ${band === b ? 'bg-accent text-on-accent font-semibold' : 'text-ink-2 hover:bg-surface-2'}`}>
                                                {b}
                                            </button>
                                        ))}
                                    </span>
                                </div>
                                <ul className="space-y-4">
                                    {CRITERIA.map((k) => (
                                        <li key={k}>
                                            <p className="font-semibold text-ink">{CRITERION_LABEL[k]}</p>
                                            <p className="mt-0.5 text-[15px] text-ink-2">{BAND_DESCRIPTORS[k][band]}</p>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </aside>
                )}
            </div>
        </div>
    );
}
