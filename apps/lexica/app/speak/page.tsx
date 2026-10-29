'use client';

import BackLink from '../components/BackLink';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { getCard, useContentVersion } from '../lib/content/repository';
import { hardToSay, pickDrillWords } from '../lib/pronunciation/drill';
import { recognitionCtor } from '../lib/pronunciation/speech';
import { CORTEX_API_URL } from '../lib/cortexConfig';
import SpeakDrill from '../components/SpeakDrill';
import { PackOffer } from '../components/pron/SoundTips';
import SoundBook from '../components/pron/SoundBook';
import SoundPractice from '../components/pron/SoundPractice';
import { SOUND_KINDS } from '@cortex/classroom-lexica';
import type { ErrorKind } from '../lib/pronunciation/pairs';
import { setPronBeta } from '../lib/pronunciation/model/client';
import { loadDict } from '../lib/pronunciation/phones';

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
    const spokenAt = useLexicaStore((s) => s.spokenAt);
    const journeys = useLexicaStore((s) => s.journeys);
    const [words, setWords] = useState<string[] | null>(null);
    const [run, setRun] = useState(0);
    // Fixed while the page is open, so the suggested words do not reshuffle under the learner.
    const [now] = useState(() => Date.now());
    const [beta, setBeta] = useState(0);
    const [practice, setPractice] = useState<ErrorKind | null>(null);

    useEffect(() => {
        // Phone scoring stays hidden until it passes the Vietnamese-voice check: `?pron=1` turns it on for a tester.
        const params = new URLSearchParams(window.location.search);
        // "Luyện 2 phút" from the Home tip.
        const sound = params.get('sound');
        if (sound && (SOUND_KINDS as readonly string[]).includes(sound)) {
            const t = setTimeout(() => setPractice(sound as ErrorKind), 0);
            return () => clearTimeout(t);
        }
        const flag = params.get('pron');
        if (flag === '1' || flag === '0') {
            setPronBeta(flag === '1');
            const t = setTimeout(() => setBeta((b) => b + 1), 0);
            return () => clearTimeout(t);
        }
    }, []);
    useEffect(() => {
        void loadDict();
    }, []);

    const suggested = useMemo(
        () => pickDrillWords(progress, misses, now, undefined, { spokenAt, said: (id) => Boolean(journeys[id]?.usedAt), seed: Math.floor(now / 60_000) }),
        [progress, misses, now, spokenAt, journeys],
    );
    const hard = hardToSay(misses).filter((h) => getCard(h.cardId));

    const start = (ids: string[]) => {
        setWords(ids.filter((id) => getCard(id)).slice(0, 5));
        setRun((r) => r + 1);
    };

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            {/* Wide on desktop while practising: the result sits beside the panel (Panel's two-column mode needs 768px) */}
            <div className={`mx-auto max-w-2xl ${words || practice ? 'lg:max-w-5xl' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                    <BackLink fallback="/practice" />
                    <p className="text-ink font-bold">Luyện nói</p>
                    <div className="w-12" />
                </div>

                {practice ? (
                    <SoundPractice key={practice} kind={practice} onDone={() => setPractice(null)} />
                ) : !words ? (
                    <>
                        <Intro suggested={suggested} hard={hard} onStart={start} />
                        <div className="mt-4 space-y-4">
                            <SoundBook onPractice={setPractice} />
                            <PackOffer key={beta} />
                        </div>
                    </>
                ) : (
                    <SpeakDrill key={run} words={words} onRestart={start} />
                )}
            </div>
        </div>
    );
}

function Intro({ suggested, hard, onStart }: { suggested: string[]; hard: { cardId: string; misses: number }[]; onStart: (ids: string[]) => void }) {
    const supported = typeof window !== 'undefined' && (!!recognitionCtor() || Boolean(CORTEX_API_URL));
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface p-5">
                <h1 className="text-xl font-semibold text-ink">Luyện nói 2 phút</h1>
                <p className="mt-2 text-sm text-muted">
                    5 từ bạn đã học, mỗi lần một nhóm khác: từ chưa nói rõ và lâu chưa luyện trước. Mỗi từ 3 bước ngắn: nghe phân biệt âm gần giống, nghe mẫu rồi nói và xem máy nghe được gì, rồi một mẹo và nói trong cụm.
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
                {!supported && <p className="mt-3 text-xs text-warning">Trình duyệt này không nhận giọng nói. Bạn vẫn luyện nghe và nghe mẫu được; phần chấm cần Chrome hoặc Edge, hoặc kết nối mạng.</p>}
                <p className="mt-3 text-xs text-subtle">Giọng nói được gửi đi để nhận dạng (máy chủ Google trên Chrome, hoặc máy chủ Lexica); Lexica không lưu bản ghi.</p>
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

