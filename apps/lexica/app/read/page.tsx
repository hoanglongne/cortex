'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpen, Check, ChevronRight } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getPassages, useContentVersion } from '../lib/content/repository';
import { recommendPassages, readPassages, unknownIn, knownIn } from '../lib/engagement/reading';
import { levelDef } from '../lib/levels';
import { wordCount, type Passage } from '../lib/content/passages';

/**
 * /read: short passages to read, always open. The one that suits the
 * learner's level best is suggested on top; the rest can be filtered by topic.
 */
export default function ReadPage() {
    const version = useContentVersion();
    const progress = useLexicaStore((s) => s.cardProgress);
    const level = useLexicaStore((s) => s.selectedLevel);
    const [read] = useState(() => (typeof window === 'undefined' ? new Set<string>() : readPassages()));
    const [topic, setTopic] = useState<string | null>(null);

    const branch = useLexicaStore((s) => s.path?.branch ?? 'cert');
    const ordered = useMemo(() => {
        void version;
        // The learner's branch first: dialogues for Giao tiếp, passages for Chứng chỉ.
        const all = recommendPassages(getPassages(), { level, progress, read });
        const mine = (p: Passage) => (p.kind === 'dialogue') === (branch === 'talk');
        return [...all.filter(mine), ...all.filter((p) => !mine(p))];
    }, [version, level, progress, read, branch]);
    const topics = [...new Set(ordered.map((p) => p.topic))];
    const suggested = ordered[0];
    const rest = ordered.slice(1).filter((p) => !topic || p.topic === topic);

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="text-muted hover:text-accent text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Đọc</p>
                    <div className="w-12" />
                </div>
                <p className="text-sm text-muted mb-5">
                    Đoạn văn ngắn, 1–2 phút. Từ mới được tô màu, bấm vào để xem nghĩa và thêm vào phiên học. Đọc xong, từ bạn đã biết trong đoạn được tính một lượt ôn.
                </p>

                {suggested && (
                    <div className="mb-6">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-subtle mb-2">Đề xuất cho bạn</p>
                        <PassageRow passage={suggested} progress={progress} read={read.has(suggested.id)} featured />
                    </div>
                )}

                {topics.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Chủ đề">
                        {[null, ...topics].map((t) => (
                            <button
                                key={t ?? 'all'}
                                role="tab"
                                aria-selected={topic === t}
                                onClick={() => setTopic(t)}
                                className={`h-8 px-3 rounded-lg border text-xs ${topic === t ? 'border-accent text-accent' : 'border-line text-muted hover:text-ink'}`}
                            >
                                {t ?? 'Tất cả'}
                            </button>
                        ))}
                    </div>
                )}
                <div className="space-y-2">
                    {rest.map((p) => (
                        <PassageRow key={p.id} passage={p} progress={progress} read={read.has(p.id)} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PassageRow({ passage, progress, read, featured }: { passage: Passage; progress: Parameters<typeof unknownIn>[1]; read: boolean; featured?: boolean }) {
    const fresh = unknownIn(passage, progress).length;
    const known = knownIn(passage, progress).length;
    const minutes = Math.max(1, Math.round(wordCount(passage.text) / 120));
    return (
        <Link
            href={`/read/${passage.id}`}
            data-testid={`passage-${passage.id}`}
            className={`flex items-center gap-3 rounded-2xl bg-surface border p-4 transition-colors hover:border-line-strong ${featured ? 'border-accent/50' : 'border-line'}`}
        >
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${read ? 'bg-accent/10 text-accent' : 'bg-surface-2 text-muted'}`}>
                {read ? <Check className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </span>
            <span className="flex-1 min-w-0">
                <span className="block font-medium text-ink truncate">{passage.title}</span>
                <span className="block mt-0.5 font-mono text-[11px] text-muted">
                    {levelDef(passage.level).label} · {passage.kind === 'dialogue' ? 'Hội thoại' : passage.topic} · {minutes} phút
                </span>
                <span className="block mt-0.5 text-xs text-ink-2">
                    {fresh > 0 ? <span className="text-accent">{fresh} từ mới</span> : 'Không có từ mới'}
                    {known > 0 && ` · ${known} từ đã học`}
                </span>
            </span>
            <ChevronRight className="w-4 h-4 text-subtle shrink-0" />
        </Link>
    );
}
