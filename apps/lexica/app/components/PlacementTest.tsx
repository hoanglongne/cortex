'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Check, Headphones, Loader2, Volume2, X } from 'lucide-react';
import { getDeckCards, useContentVersion } from '../lib/content/repository';
import { VOICE_CACHE_URL } from '../lib/audio/AudioService';
import { playRecording, sayModel, stopSpeaking } from '../lib/pronunciation/speech';
import { isDone, MAX_ITEMS, nextItem, result, type BankCard, type Item, type ItemKind, type PlacementResult, type Response } from '../lib/placement/engine';
import { answerVerified, startVerified, VerifiedError } from '../lib/placement/verified';

/** Seconds per question; running out counts as "không biết". */
const SECONDS = 20;

const KIND_LABEL: Record<ItemKind, string> = {
    meaning: 'Chọn nghĩa đúng',
    phrase: 'Điền từ vào cụm',
    real: 'Đây có phải từ tiếng Anh?',
    listen: 'Nghe và chọn nghĩa đúng',
};

/** What a question shows; `answer` is known at once in a practice test, after answering in a verified one. */
interface Shown {
    kind: ItemKind;
    prompt: string | null;
    /** A practice test speaks this word; a verified one plays `audio`. */
    say: string | null;
    audio: string | null;
    options: string[];
    answer: number | null;
}

const fromLocal = (i: Item): Shown => ({ kind: i.kind, prompt: i.kind === 'listen' ? null : i.prompt, say: i.kind === 'listen' ? i.prompt : null, audio: null, options: i.options, answer: i.answer });
const EMPTY_KINDS = { meaning: { right: 0, total: 0 }, phrase: { right: 0, total: 0 }, real: { right: 0, total: 0 }, listen: { right: 0, total: 0 } };

export type TestOutcome = PlacementResult & { code?: string };

/**
 * The adaptive vocabulary test, one question at a time with a clock and
 * "Không biết". Verified (signed in, docs/LEXICA_LEVEL_TEST_DESIGN.md PR C):
 * the database picks and scores every question. Practice: the same test
 * run by lib/placement/engine.ts on this device, when the learner is signed
 * out or the server cannot be reached.
 */
export default function PlacementTest({ start, verify, onDone, onBack }: { start: number; verify: boolean; onDone: (r: TestOutcome) => void; onBack: () => void }) {
    const version = useContentVersion();
    const bank = useMemo<BankCard[]>(() => {
        void version;
        return getDeckCards().filter((c) => (c.branch ?? 'cert') === 'cert');
    }, [version]);
    // null until the learner says whether they can play sound.
    const [sound, setSound] = useState<boolean | null>(null);
    const [mode, setMode] = useState<'verified' | 'practice'>(verify ? 'verified' : 'practice');
    const [note, setNote] = useState<string | null>(null);
    const [session, setSession] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    // Practice: the engine's current item and the answers so far.
    const [local, setLocal] = useState<{ item: Item; responses: Response[] } | null>(null);
    const [shown, setShown] = useState<Shown | null>(null);
    const [count, setCount] = useState(0);
    const [picked, setPicked] = useState<number | 'skip' | null>(null);
    const [left, setLeft] = useState(SECONDS);

    const begin = async (withSound: boolean) => {
        if (mode === 'verified') {
            setBusy(true);
            try {
                const r = await startVerified(withSound);
                setSession(r.session);
                setShown({ kind: r.item.kind, prompt: r.item.prompt, say: null, audio: r.item.audio, options: r.item.options, answer: null });
                setSound(withSound);
                setBusy(false);
                return;
            } catch (e) {
                setBusy(false);
                const err = e instanceof VerifiedError ? e : new VerifiedError(String(e), true);
                setMode('practice');
                if (!err.unavailable) {
                    // e.g. too soon: say why, and offer a practice test instead.
                    setNote(`${err.message} Bạn vẫn làm được bài luyện tập.`);
                    return;
                }
                setNote('Chưa kết nối được máy chủ chấm điểm, nên đây là bài luyện tập (chấm trên máy).');
            }
        }
        const item = nextItem(bank, [], Math.random, start, withSound);
        if (!item) return;
        setLocal({ item, responses: [] });
        setShown(fromLocal(item));
        setSound(withSound);
    };

    const next = (s: Shown) => {
        setShown(s);
        setPicked(null);
        setLeft(SECONDS);
        setCount((n) => n + 1);
    };

    const answer = async (choice: number | 'skip') => {
        if (!shown || picked !== null || busy) return;
        setPicked(choice);
        if (session) {
            setBusy(true);
            try {
                const r = await answerVerified(session, choice === 'skip' ? null : choice);
                setShown({ ...shown, answer: r.answer });
                setBusy(false);
                setTimeout(
                    () => {
                        if (r.done) onDone({ ...r.result, byKind: { ...EMPTY_KINDS, ...r.result.byKind } });
                        else next({ kind: r.item.kind, prompt: r.item.prompt, say: null, audio: r.item.audio, options: r.item.options, answer: null });
                    },
                    choice === 'skip' ? 300 : 700,
                );
            } catch (e) {
                setBusy(false);
                setNote(e instanceof Error ? e.message : 'Mất kết nối. Thử lại nhé.');
                setPicked(null);
            }
            return;
        }
        if (!local) return;
        const a = choice === 'skip' ? 'skip' : choice === local.item.answer ? 'right' : 'wrong';
        const responses = [...local.responses, { item: local.item, answer: a } as Response];
        setTimeout(
            () => {
                const item = isDone(responses, start) ? null : nextItem(bank, responses, Math.random, start, sound === true);
                if (!item) return onDone(result(responses, start));
                setLocal({ item, responses });
                next(fromLocal(item));
            },
            choice === 'skip' ? 300 : 700,
        );
    };

    const play = () => {
        if (!shown) return;
        if (shown.say) void sayModel(shown.say);
        else if (shown.audio && VOICE_CACHE_URL) playRecording(`${VOICE_CACHE_URL}/${shown.audio}`);
    };
    // A listening question plays its word as it opens; leaving stops the voice.
    useEffect(() => {
        if (shown?.kind === 'listen' && picked === null) play();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, shown?.kind]);
    useEffect(() => () => stopSpeaking(), []);

    // The clock: a second at a time while a question is open; at zero it is "không biết".
    useEffect(() => {
        if (!shown || picked !== null || busy) return;
        const t = setTimeout(() => (left <= 1 ? void answer('skip') : setLeft(left - 1)), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [left, shown, picked, busy]);

    if (sound === null || !shown) {
        return (
            <div className="min-h-screen bg-bg px-4 py-10">
                <section className="max-w-md mx-auto rounded-3xl border border-line bg-surface p-6 space-y-4">
                    <span className="w-11 h-11 rounded-2xl bg-accent/12 text-accent flex items-center justify-center">
                        <Headphones className="w-5 h-5" />
                    </span>
                    <div>
                        <p className="text-lg font-semibold text-ink">Bạn có nghe được tiếng không?</p>
                        <p className="mt-1 text-sm text-muted">Có thì bài có thêm câu nghe: app đọc một từ, bạn chọn nghĩa của từ đó. Đang ở nơi đông người thì bỏ qua.</p>
                    </div>
                    <p className="flex items-start gap-2 text-xs text-muted">
                        <BadgeCheck className={`w-4 h-4 shrink-0 ${mode === 'verified' ? 'text-accent' : 'text-subtle'}`} />
                        {mode === 'verified' ? 'Điểm đã xác minh: máy chủ chọn câu và chấm, có link để người khác kiểm tra.' : 'Điểm luyện tập: chấm trên máy bạn. Đăng nhập để có điểm đã xác minh.'}
                    </p>
                    {note && <p className="rounded-lg bg-bg px-3 py-2 text-xs text-ink-2">{note}</p>}
                    <div className="flex flex-col gap-2">
                        <button disabled={busy} onClick={() => void begin(true)} className="h-12 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Có, có câu nghe
                        </button>
                        <button disabled={busy} onClick={() => void begin(false)} className="h-12 rounded-xl border border-line text-sm text-ink-2 hover:border-line-strong disabled:opacity-60">
                            Không, chỉ câu đọc
                        </button>
                    </div>
                    <button onClick={onBack} className="text-xs text-muted hover:text-ink">
                        Để sau
                    </button>
                </section>
            </div>
        );
    }

    // Right and wrong show once the answer is known: at once in practice, when the server replies if verified.
    const reveal = picked !== null && shown.answer !== null && !busy;

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} aria-label="Thoát" className="w-9 h-9 rounded-lg border border-line flex items-center justify-center text-muted hover:text-ink">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                            <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${Math.min(100, (count / MAX_ITEMS) * 100)}%` }} />
                        </div>
                    </div>
                    <span className="font-mono text-xs text-muted w-12 text-right">Câu {count + 1}</span>
                </div>

                <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">{KIND_LABEL[shown.kind]}</p>
                        <span className={`font-mono text-xs ${left <= 5 ? 'text-danger' : 'text-muted'}`}>{left}s</span>
                    </div>
                    <div className="mt-1 h-0.5 rounded-full bg-surface-3 overflow-hidden">
                        <div className="h-full bg-accent/60 transition-all duration-1000 ease-linear" style={{ width: `${(left / SECONDS) * 100}%` }} />
                    </div>
                    {shown.kind === 'listen' ? (
                        <div className="my-6 flex justify-center">
                            <button onClick={play} aria-label="Nghe lại" className="w-20 h-20 rounded-full bg-accent/12 border border-accent/40 text-accent flex items-center justify-center hover:bg-accent/20">
                                <Volume2 className="w-8 h-8" />
                            </button>
                        </div>
                    ) : (
                        <p className={`mt-6 mb-6 text-center font-semibold text-ink ${shown.kind === 'phrase' ? 'text-2xl' : 'text-3xl lowercase'}`}>{shown.prompt}</p>
                    )}

                    <div className={`grid gap-2 ${shown.kind === 'real' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {shown.options.map((o, i) => {
                            const right = i === shown.answer;
                            const mine = picked === i;
                            const tone = picked === null ? 'border-line hover:border-accent/60 bg-bg/40' : reveal && right ? 'border-accent bg-accent/12' : reveal && mine ? 'border-danger/60 bg-danger/10' : mine ? 'border-accent/60 bg-accent/5' : 'border-line opacity-50';
                            return (
                                <button key={o} disabled={picked !== null || busy} onClick={() => void answer(i)} className={`min-h-12 px-4 py-3 rounded-xl border text-left text-sm text-ink flex items-center gap-2 transition-colors ${tone}`}>
                                    <span className="flex-1">{o}</span>
                                    {reveal && right && <Check className="w-4 h-4 text-accent shrink-0" />}
                                    {reveal && mine && !right && <X className="w-4 h-4 text-danger shrink-0" />}
                                    {mine && busy && <Loader2 className="w-4 h-4 animate-spin text-muted shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                    <button disabled={picked !== null || busy} onClick={() => void answer('skip')} className="mt-3 w-full h-10 rounded-xl text-sm text-muted hover:text-ink disabled:opacity-40">
                        Không biết
                    </button>
                    {note && session && <p className="mt-2 text-center text-xs text-danger">{note}</p>}
                </section>

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-subtle">
                    {session ? (
                        <>
                            <BadgeCheck className="w-3.5 h-3.5 text-accent" /> Điểm đã xác minh · máy chủ chấm
                        </>
                    ) : (
                        'Điểm luyện tập · không biết thì bấm “Không biết”, đừng đoán'
                    )}
                </p>
            </div>
        </div>
    );
}
