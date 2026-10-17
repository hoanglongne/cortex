'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { getCard, useContentVersion } from '../lib/content/repository';
import { hardToSay, pickDrillWords } from '../lib/pronunciation/drill';
import { recognitionCtor } from '../lib/pronunciation/speech';
import SpeakDrill from '../components/SpeakDrill';

/**
 * "Luyện nói 2 phút" (docs/LEXICA_FEEDBACK_TASKS.md T8): five words, three
 * short steps each. Hear the difference, hear the model then say it and see
 * what the machine heard, then a tip and the word in a phrase. A practice of
 * its own; it never blocks swiping.
 */

export default function SpeakPage() {
    useContentVersion();
    const progress = useLexicaStore((s) => s.cardProgress);
    const misses = useLexicaStore((s) => s.speakMisses);
    const [words, setWords] = useState<string[] | null>(null);
    const [run, setRun] = useState(0);

    const suggested = useMemo(() => pickDrillWords(progress, misses), [progress, misses]);
    const hard = hardToSay(misses).filter((h) => getCard(h.cardId));

    const start = (ids: string[]) => {
        setWords(ids.filter((id) => getCard(id)).slice(0, 5));
        setRun((r) => r + 1);
    };

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="text-muted hover:text-accent text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Luyện nói</p>
                    <div className="w-12" />
                </div>

                {!words ? <Intro suggested={suggested} hard={hard} onStart={start} /> : <SpeakDrill key={run} words={words} onRestart={start} />}
            </div>
        </div>
    );
}

function Intro({ suggested, hard, onStart }: { suggested: string[]; hard: { cardId: string; misses: number }[]; onStart: (ids: string[]) => void }) {
    const supported = typeof window !== 'undefined' && !!recognitionCtor();
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface p-5">
                <h1 className="text-xl font-semibold text-ink">Luyện nói 2 phút</h1>
                <p className="mt-2 text-sm text-muted">
                    5 từ bạn vừa học hoặc đến hạn. Mỗi từ 3 bước ngắn: nghe phân biệt âm gần giống, nghe mẫu rồi nói và xem máy nghe được gì, rồi một mẹo và nói trong cụm.
                </p>
                {suggested.length > 0 ? (
                    <>
                        <p className="mt-4 text-sm text-ink-2">
                            {suggested.map((id) => getCard(id)?.word.toLowerCase()).join(' · ')}
                        </p>
                        <button onClick={() => onStart(suggested)} className="mt-4 h-12 px-6 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold">
                            Bắt đầu
                        </button>
                    </>
                ) : (
                    <p className="mt-4 text-sm text-ink-2">
                        Học vài từ trước đã.{' '}
                        <Link href="/" className="text-accent underline">
                            Về học từ mới
                        </Link>
                    </p>
                )}
                {!supported && <p className="mt-3 text-xs text-warning">Trình duyệt này không nhận giọng nói. Bạn vẫn luyện nghe và nghe mẫu được; phần chấm cần Chrome hoặc Edge.</p>}
                <p className="mt-3 text-xs text-subtle">Trên Chrome, giọng nói được gửi tới máy chủ của Google để nhận dạng.</p>
            </div>
            {hard.length > 0 && (
                <div data-testid="hard-to-say" className="rounded-2xl border border-line bg-surface p-5">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Từ khó nói</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                        {hard.slice(0, 12).map((h) => (
                            <li key={h.cardId} className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-ink">
                                {getCard(h.cardId)?.word.toLowerCase()} <span className="font-mono text-[11px] text-warning">×{h.misses}</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => onStart(hard.map((h) => h.cardId))} className="mt-3 h-10 px-4 rounded-xl border border-line text-sm text-ink hover:border-line-strong">
                        Luyện các từ này
                    </button>
                </div>
            )}
        </div>
    );
}

