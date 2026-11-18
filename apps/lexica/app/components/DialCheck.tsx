'use client';

import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { checkCandidates, checkDue } from '../lib/learner/dialSignal';
import { VOCAB_DATABASE } from '../data/vocabCards';

const CARDS = new Map(VOCAB_DATABASE.map((c) => [c.id, c]));

function shuffle<T>(a: T[], seed: number): T[] {
    const out = [...a];
    let x = seed || 1;
    for (let i = out.length - 1; i > 0; i--) {
        x = (x * 1103515245 + 12345) & 0x7fffffff;
        const j = x % (i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * Weekly Blend check (issue #142): a few words the learner only read past
 * are asked for real. Right answers count as recall; the share right sets how
 * much "read past" is worth from then on.
 */
export default function DialCheck() {
    const learner = useLexicaStore((s) => s.learner);
    const finish = useLexicaStore((s) => s.finishDialCheck);
    const [now] = useState(() => Date.now());
    const ids = useMemo(() => checkCandidates(learner?.log ?? [], now).filter((id) => CARDS.has(id)), [learner?.log, now]);
    const [started, setStarted] = useState(false);
    const [i, setI] = useState(0);
    const [results, setResults] = useState<{ cardId: string; right: boolean }[]>([]);
    const [picked, setPicked] = useState<number | null>(null);

    const fresh = useMemo(() => ids.map((id, k) => {
        const card = CARDS.get(id)!;
        const others = shuffle(VOCAB_DATABASE.filter((c) => c.id !== id && c.translationHint !== card.translationHint), now + k).slice(0, 3);
        const options = shuffle([card.translationHint, ...others.map((o) => o.translationHint)], now * 7 + k);
        return { id, word: card.word.toLowerCase(), options, answer: options.indexOf(card.translationHint) };
    }), [ids, now]);
    // Frozen once started: answering changes the log, which would change the list.
    const [frozen, setFrozen] = useState<typeof fresh | null>(null);
    const questions = frozen ?? fresh;

    if (!checkDue(learner?.dial, ids.length, now) && !started) return null;
    if (questions.length === 0) return null;

    if (!started) {
        return (
            <section className="mb-4 rounded-xl border border-accent/30 bg-accent/5 p-3" data-testid="dial-check">
                <p className="text-sm text-ink font-semibold">Kiểm tra nhanh tuần này</p>
                <p className="text-xs text-muted mt-0.5">{questions.length} từ bạn đã đọc lướt qua mà không chạm. Còn nhớ không? Kết quả giúp Lexica biết đọc lướt có làm bạn nhớ lâu hơn.</p>
                <button onClick={() => { setFrozen(fresh); setStarted(true); }} className="mt-2 rounded-lg bg-accent text-on-accent text-sm font-semibold px-3 py-1.5">Bắt đầu (1 phút)</button>
            </section>
        );
    }

    if (i >= questions.length) {
        const right = results.filter((r) => r.right).length;
        return (
            <section className="mb-4 rounded-xl border border-line bg-surface p-3" data-testid="dial-check-done">
                <p className="text-sm text-ink font-semibold">Đúng {right}/{results.length}</p>
                <p className="text-xs text-muted mt-0.5">Từ chưa nhớ đã được đưa vào lượt ôn tới.</p>
            </section>
        );
    }

    const q = questions[i];
    const answer = (k: number) => {
        if (picked !== null) return;
        setPicked(k);
        const next = [...results, { cardId: q.id, right: k === q.answer }];
        setTimeout(() => {
            setResults(next);
            setPicked(null);
            setI(i + 1);
            if (i + 1 >= questions.length) finish(next);
        }, 700);
    };
    return (
        <section className="mb-4 rounded-xl border border-line bg-surface p-3" data-testid="dial-check-q">
            <div className="flex items-center justify-between text-xs text-muted"><span>Kiểm tra nhanh</span><span className="font-mono">{i + 1}/{questions.length}</span></div>
            <p className="mt-1 text-xl font-semibold text-ink">{q.word}</p>
            <div className="mt-2 grid gap-1.5">
                {q.options.map((o, k) => (
                    <button
                        key={k}
                        onClick={() => answer(k)}
                        className={`text-left text-sm rounded-lg border px-3 py-2 flex items-center justify-between ${picked === null ? 'border-line hover:border-line-strong' : k === q.answer ? 'border-accent text-accent' : k === picked ? 'border-danger text-danger' : 'border-line opacity-60'}`}
                    >
                        {o}
                        {picked !== null && k === q.answer && <Check className="w-4 h-4" />}
                        {picked === k && k !== q.answer && <X className="w-4 h-4" />}
                    </button>
                ))}
            </div>
        </section>
    );
}
