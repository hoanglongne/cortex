'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ScanSearch } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards, useContentVersion } from '../lib/content/repository';
import { spotWords } from '../lib/journey/outside';

/**
 * "Bắt gặp" (lib/journey/outside.ts): paste something met outside the app
 * (an email, a post, lyrics) and see the learned words in it, in any form.
 * Recording them counts as Gặp. On Android the PWA receives shared text here.
 */
export default function SpotPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
            <Spot />
        </Suspense>
    );
}

function Spot() {
    const params = useSearchParams();
    const shared = [params.get('title'), params.get('text'), params.get('url')].filter(Boolean).join('\n');
    const [text, setText] = useState(shared);
    const [saved, setSaved] = useState<number | null>(null);
    const version = useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    const markMet = useLexicaStore((s) => s.markMet);

    const spotted = useMemo(() => {
        void version;
        return spotWords(text, getAllCards().filter((c) => journeys[c.id]));
    }, [text, journeys, version]);
    const ids = [...new Set(spotted.map((s) => s.cardId))];
    const words = ids.map((id) => getAllCards().find((c) => c.id === id)?.word.toLowerCase()).filter(Boolean);

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-muted hover:text-accent text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Bắt gặp</p>
                    <span className="w-10" />
                </div>
                <section className="rounded-2xl border border-line bg-surface p-4">
                    <p className="flex items-center gap-2 font-semibold text-ink">
                        <ScanSearch className="w-4 h-4 text-accent" /> Từ của bạn ngoài đời
                    </p>
                    <p className="mt-1 text-sm text-muted">Dán một đoạn tiếng Anh bạn vừa đọc được: email, bài đăng, lời bài hát. App tìm những từ bạn đã học trong đó.</p>
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setSaved(null);
                        }}
                        rows={5}
                        maxLength={5000}
                        placeholder="Dán đoạn văn vào đây"
                        aria-label="Đoạn văn"
                        className="mt-3 w-full rounded-xl border border-line bg-bg px-3 py-2 text-ink outline-none focus:border-accent"
                    />
                </section>

                {text.trim() && (
                    <section data-testid="spot-result" className="rounded-2xl border border-line bg-surface p-4">
                        {spotted.length === 0 ? (
                            <p className="text-sm text-muted">Chưa thấy từ nào bạn đã học trong đoạn này.</p>
                        ) : (
                            <>
                                <p className="text-sm text-ink">
                                    Bạn bắt gặp <b>{ids.length}</b> từ đã học: {words.join(', ')}
                                </p>
                                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink-2">
                                    <Highlighted text={text} spans={spotted} />
                                </p>
                                {saved === null ? (
                                    <button
                                        onClick={() => {
                                            markMet(ids);
                                            setSaved(ids.length);
                                        }}
                                        className="mt-4 h-11 px-4 rounded-xl bg-accent text-on-accent font-bold"
                                    >
                                        Ghi nhận đã gặp {ids.length} từ
                                    </button>
                                ) : (
                                    <p className="mt-4 flex items-center gap-1.5 text-sm text-accent">
                                        <Check className="w-4 h-4" /> Đã ghi nhận. Gặp một từ ngoài app là lúc nó bắt đầu thành của bạn.
                                    </p>
                                )}
                            </>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}

function Highlighted({ text, spans }: { text: string; spans: { start: number; end: number }[] }) {
    const parts: React.ReactNode[] = [];
    let at = 0;
    for (const s of spans) {
        if (s.start < at) continue;
        parts.push(text.slice(at, s.start));
        parts.push(
            <mark key={s.start} className="rounded bg-accent/25 px-0.5 text-ink">
                {text.slice(s.start, s.end)}
            </mark>,
        );
        at = s.end;
    }
    parts.push(text.slice(at));
    return <>{parts}</>;
}
