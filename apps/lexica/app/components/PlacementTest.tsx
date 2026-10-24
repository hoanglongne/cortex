'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Headphones, Volume2, X } from 'lucide-react';
import { sayModel, stopSpeaking } from '../lib/pronunciation/speech';
import { getDeckCards, useContentVersion } from '../lib/content/repository';
import { isDone, MAX_ITEMS, nextItem, result, scoredCount, type BankCard, type Item, type PlacementResult, type Response } from '../lib/placement/engine';

/** Seconds per question; running out counts as "không biết". */
const SECONDS = 20;

const KIND_LABEL: Record<Item['kind'], string> = {
    meaning: 'Chọn nghĩa đúng',
    phrase: 'Điền từ vào cụm',
    real: 'Đây có phải từ tiếng Anh?',
    listen: 'Nghe và chọn từ bạn nghe',
};

/**
 * The adaptive vocabulary test (lib/placement/engine.ts): one question at a
 * time near the learner's estimated level, a timer, and "Không biết" so
 * nobody has to guess. Shows right or wrong for a moment, then moves on.
 */
export default function PlacementTest({ start, onDone, onBack }: { start: number; onDone: (r: PlacementResult) => void; onBack: () => void }) {
    const version = useContentVersion();
    const bank = useMemo<BankCard[]>(() => {
        void version;
        return getDeckCards().filter((c) => (c.branch ?? 'cert') === 'cert');
    }, [version]);
    const [responses, setResponses] = useState<Response[]>([]);
    // null until the learner says whether they can play sound.
    const [sound, setSound] = useState<boolean | null>(null);
    const [item, setItem] = useState<Item | null>(null);
    const [picked, setPicked] = useState<number | 'skip' | null>(null);
    const [left, setLeft] = useState(SECONDS);

    const answer = (choice: number | 'skip') => {
        if (!item || picked !== null) return;
        setPicked(choice);
        const a = choice === 'skip' ? 'skip' : choice === item.answer ? 'right' : 'wrong';
        const next = [...responses, { item, answer: a } as Response];
        setTimeout(
            () => {
                setResponses(next);
                if (isDone(next, start)) {
                    onDone(result(next, start));
                    return;
                }
                setItem(nextItem(bank, next, Math.random, start, sound === true));
                setPicked(null);
                setLeft(SECONDS);
            },
            choice === 'skip' ? 300 : 700,
        );
    };

    // A listening question plays its word as it opens; leaving stops the voice.
    useEffect(() => {
        if (item?.kind === 'listen') void sayModel(item.prompt);
    }, [item]);
    useEffect(() => () => stopSpeaking(), []);

    // The clock: a second at a time while a question is open; at zero it is "không biết".
    useEffect(() => {
        if (!item || picked !== null) return;
        const t = setTimeout(() => (left <= 1 ? answer('skip') : setLeft(left - 1)), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [left, item, picked]);

    const n = scoredCount(responses);
    const begin = (withSound: boolean) => {
        setSound(withSound);
        setItem(nextItem(bank, [], Math.random, start, withSound));
    };

    if (sound === null) {
        return (
            <div className="min-h-screen bg-bg px-4 py-10">
                <section className="max-w-md mx-auto rounded-3xl border border-line bg-surface p-6 space-y-4">
                    <span className="w-11 h-11 rounded-2xl bg-accent/12 text-accent flex items-center justify-center">
                        <Headphones className="w-5 h-5" />
                    </span>
                    <div>
                        <p className="text-lg font-semibold text-ink">Bạn có nghe được tiếng không?</p>
                        <p className="mt-1 text-sm text-muted">Có thì bài có thêm câu nghe: app đọc một từ, bạn chọn từ vừa nghe. Đo được cả việc nhận ra từ khi nghe. Đang ở nơi đông người thì bỏ qua.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => begin(true)} className="h-12 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold">
                            Có, có câu nghe
                        </button>
                        <button onClick={() => begin(false)} className="h-12 rounded-xl border border-line text-sm text-ink-2 hover:border-line-strong">
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
    if (!item) return <div className="min-h-screen bg-bg" />;

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} aria-label="Thoát" className="w-9 h-9 rounded-lg border border-line flex items-center justify-center text-muted hover:text-ink">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                            <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${Math.min(100, (n / MAX_ITEMS) * 100)}%` }} />
                        </div>
                    </div>
                    <span className="font-mono text-xs text-muted w-12 text-right">Câu {responses.length + 1}</span>
                </div>

                <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">{KIND_LABEL[item.kind]}</p>
                        <span className={`font-mono text-xs ${left <= 5 ? 'text-danger' : 'text-muted'}`}>{left}s</span>
                    </div>
                    <div className="mt-1 h-0.5 rounded-full bg-surface-3 overflow-hidden">
                        <div className="h-full bg-accent/60 transition-all duration-1000 ease-linear" style={{ width: `${(left / SECONDS) * 100}%` }} />
                    </div>
                    {item.kind === 'listen' ? (
                        <div className="my-6 flex justify-center">
                            <button onClick={() => void sayModel(item.prompt)} aria-label="Nghe lại" className="w-20 h-20 rounded-full bg-accent/12 border border-accent/40 text-accent flex items-center justify-center hover:bg-accent/20">
                                <Volume2 className="w-8 h-8" />
                            </button>
                        </div>
                    ) : (
                        <p className={`mt-6 mb-6 text-center font-semibold text-ink ${item.kind === 'phrase' ? 'text-2xl' : 'text-3xl'} ${item.kind !== 'phrase' ? 'lowercase' : ''}`}>{item.prompt}</p>
                    )}

                    <div className={`grid gap-2 ${item.kind === 'real' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {item.options.map((o, i) => {
                            const shown = picked !== null;
                            const right = i === item.answer;
                            const mine = picked === i;
                            const tone = !shown ? 'border-line hover:border-accent/60 bg-bg/40' : right ? 'border-accent bg-accent/12' : mine ? 'border-danger/60 bg-danger/10' : 'border-line opacity-50';
                            return (
                                <button key={o} disabled={shown} onClick={() => answer(i)} className={`min-h-12 px-4 py-3 rounded-xl border text-left text-sm text-ink flex items-center gap-2 transition-colors ${tone}`}>
                                    <span className="flex-1">{o}</span>
                                    {shown && right && <Check className="w-4 h-4 text-accent shrink-0" />}
                                    {shown && mine && !right && <X className="w-4 h-4 text-danger shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                    <button disabled={picked !== null} onClick={() => answer('skip')} className="mt-3 w-full h-10 rounded-xl text-sm text-muted hover:text-ink disabled:opacity-40">
                        Không biết
                    </button>
                </section>

                <p className="text-center text-xs text-subtle">Câu hỏi khó dần hoặc dễ dần theo câu trả lời. Không biết thì bấm “Không biết”, đừng đoán.</p>
            </div>
        </div>
    );
}
