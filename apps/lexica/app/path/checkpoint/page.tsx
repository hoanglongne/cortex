'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Share2, X } from 'lucide-react';
import { useLexicaStore } from '../../store/lexicaStore';
import StepNumbers from '../../components/StepNumbers';
import { BRANCH_LABEL, expectedBy, finalTestWords, finishLine, mostMissed, pathDays, PATH_DAYS } from '../../lib/journey/path';
import { countSteps } from '../../lib/journey/steps';
import { getAllCards, getCard } from '../../lib/content/repository';
import { sharePathImage } from '../../lib/engagement/shareCard';

/**
 * Path checkpoints (docs/LEXICA_DIRECTION.md): days 7, 14, 21 show how far
 * the learner got against the pace, and the five words forgotten most. Day
 * 30 is a 30-word test, then a result to share.
 */
function CheckpointContent() {
    const day = Number(useSearchParams().get('day') ?? 7);
    const path = useLexicaStore((s) => s.path);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const seeCheckpoint = useLexicaStore((s) => s.seeCheckpoint);
    const reached = path ? pathDays(path, daysDone).length >= day : false;

    useEffect(() => {
        if (reached && day !== 30) seeCheckpoint(day);
    }, [reached, day, seeCheckpoint]);

    if (!path || !reached) {
        return (
            <Shell>
                <p className="text-ink">Chưa tới mốc này.</p>
                <Link href="/path" className="text-accent underline">
                    Về lộ trình
                </Link>
            </Shell>
        );
    }
    return <Shell>{day === 30 ? <FinalTest /> : <Weekly day={day} />}</Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-5">
                <Link href="/path" className="text-muted hover:text-accent text-sm">
                    ← Lộ trình
                </Link>
                {children}
            </div>
        </div>
    );
}

function Weekly({ day }: { day: number }) {
    const path = useLexicaStore((s) => s.path)!;
    const journeys = useLexicaStore((s) => s.journeys);
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const startMs = Date.parse(`${path.startDate}T00:00:00`);
    const inPath = useMemo(() => new Set(Object.keys(journeys).filter((id) => journeys[id].understoodAt >= startMs)), [journeys, startMs]);
    const counts = countSteps(journeys, inPath);
    const expected = expectedBy(path.pace, day);
    const pct = expected.nho > 0 ? Math.round((counts.nho / expected.nho) * 100) : 100;
    const missed = mostMissed(cardProgress).filter((id) => getCard(id));

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} data-testid="checkpoint" className="space-y-5">
            <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Mốc ngày {day}</p>
                <h1 className="mt-2 text-2xl font-semibold text-ink">
                    {counts.nho} từ Nhớ sau {day} ngày
                </h1>
                <p className="mt-1 text-sm text-muted">
                    Mục tiêu tới mốc này là {expected.nho} từ ({pct}%). {pct >= 90 ? 'Bạn đang đi đúng nhịp.' : 'Nhớ cần hai lần ôn cách nhau vài ngày, nên con số này sẽ đuổi kịp nếu bạn giữ nhịp.'}
                </p>
            </div>
            <StepNumbers counts={counts} href={null} />
            <p className="text-xs text-muted">Chỉ tính từ học trong lộ trình này ({BRANCH_LABEL[path.branch]}).</p>
            {missed.length > 0 && (
                <section className="rounded-2xl border border-line bg-surface p-4">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">5 từ hay sai nhất</p>
                    <p className="mt-2 text-ink lowercase">{missed.map((id) => getCard(id)?.word).join(' · ')}</p>
                    <Link href={`/review?ids=${missed.join(',')}`} className="mt-3 inline-flex h-10 px-4 rounded-xl bg-accent text-on-accent font-bold items-center">
                        Ôn 5 từ này
                    </Link>
                </section>
            )}
            <Link href="/" className="block text-center h-12 leading-[3rem] rounded-xl border border-line text-ink">
                Tiếp tục học
            </Link>
        </motion.div>
    );
}

function FinalTest() {
    const path = useLexicaStore((s) => s.path)!;
    const journeys = useLexicaStore((s) => s.journeys);
    const finishPath = useLexicaStore((s) => s.finishPath);
    const startMs = Date.parse(`${path.startDate}T00:00:00`);
    const [words] = useState(() => finalTestWords(journeys, startMs, PATH_DAYS, startMs % 9973));
    const questions = useMemo(() => {
        const pool = getAllCards().map((c) => c.translationHint);
        return words
            .map((id, i) => {
                const card = getCard(id);
                if (!card) return null;
                const others = pool.filter((m) => m !== card.translationHint);
                const picks = [0, 1, 2].map((k) => others[(i * 31 + k * 97 + id.length) % others.length]);
                const options = [...new Set([card.translationHint, ...picks])];
                const rot = i % options.length;
                return { id, word: card.word, answer: card.translationHint, options: [...options.slice(rot), ...options.slice(0, rot)] };
            })
            .filter((q): q is NonNullable<typeof q> => q !== null);
    }, [words]);
    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [right, setRight] = useState(0);

    if (path.finished) return <FinalResult />;
    if (questions.length < 5) {
        return <p className="text-ink">Bạn chưa học đủ từ trong lộ trình này để làm bài kiểm tra.</p>;
    }
    const q = questions[index];
    const answer = (o: string) => {
        if (picked) return;
        setPicked(o);
        const ok = o === q.answer;
        if (ok) setRight((r) => r + 1);
        setTimeout(() => {
            if (index + 1 >= questions.length) {
                finishPath({ date: new Date().toISOString().slice(0, 10), score: right + (ok ? 1 : 0), total: questions.length, counts: countSteps(useLexicaStore.getState().journeys) });
            } else {
                setIndex(index + 1);
                setPicked(null);
            }
        }, 700);
    };

    return (
        <div data-testid="final-test" className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Ngày 30 · kiểm tra về đích</p>
            <div className="flex items-center gap-3">
                <div className="flex-1 h-1 rounded-full bg-surface-3 overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(index / questions.length) * 100}%` }} />
                </div>
                <span className="font-mono text-xs text-muted">
                    {index + 1}/{questions.length}
                </span>
            </div>
            <p className="text-3xl font-bold text-ink tracking-wide">{q.word}</p>
            <div className="space-y-2">
                {q.options.map((o) => {
                    const cls = picked ? (o === q.answer ? 'border-accent bg-accent/10' : o === picked ? 'border-danger/60 text-muted' : 'border-line text-subtle') : 'border-line hover:border-line-strong';
                    return (
                        <button key={o} disabled={!!picked} onClick={() => answer(o)} className={`w-full text-left rounded-xl border px-4 py-3 text-ink ${cls}`}>
                            <span className="flex items-center gap-2">
                                {picked && o === q.answer && <Check className="w-4 h-4 text-accent" />}
                                {picked && o === picked && o !== q.answer && <X className="w-4 h-4" />}
                                {o}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function FinalResult() {
    const path = useLexicaStore((s) => s.path)!;
    const f = path.finished!;
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} data-testid="final-result" className="space-y-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Về đích</p>
            <h1 className="text-2xl font-semibold text-ink">{finishLine(f.counts)}</h1>
            <p className="text-muted">
                Kiểm tra cuối: {f.score}/{f.total} từ đúng.
            </p>
            <StepNumbers counts={f.counts} href={null} />
            <button
                onClick={() => void sharePathImage({ counts: f.counts, branch: BRANCH_LABEL[path.branch], score: f.score, total: f.total })}
                className="w-full h-12 rounded-xl border border-line bg-surface text-ink font-medium flex items-center justify-center gap-2"
            >
                <Share2 className="w-4 h-4" /> Chia sẻ kết quả
            </button>
            <div className="grid grid-cols-2 gap-2">
                <Link href="/path/setup?next=1" className="h-12 rounded-xl bg-accent text-on-accent font-bold flex items-center justify-center">
                    Lộ trình mới
                </Link>
                <Link href="/path" className="h-12 rounded-xl border border-line text-ink flex items-center justify-center">
                    Chế độ duy trì
                </Link>
            </div>
        </motion.div>
    );
}

export default function CheckpointPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
            <CheckpointContent />
        </Suspense>
    );
}
