'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { api, cached, errorText } from './lib/api';
import { TYPE_LABEL, type ReviewType } from './lib/review';
import { Card, ErrorNote } from './components/ui';

interface Overview {
    pending: Record<string, number>;
    unpublished: Record<string, number>;
}
interface Health {
    generationsLast24h: number;
    maxGenerationsPerDay: number;
    recentRuns: { started_at: string; ok: boolean | null; job: string }[];
}

const KINDS: ReviewType[] = ['drafts', 'variants', 'quotes', 'passages', 'talk'];
const NOUN: Record<string, string> = { drafts: 'thẻ mới', variants: 'câu mẫu', quotes: 'câu ngoài đời', passages: 'bài đọc', talk: 'thẻ giao tiếp' };

/** The first page: what needs doing today, each with one button that goes straight to it. */
export default function TodayPage() {
    const [data, setData] = useState<Overview | null>(() => cached<Overview>('/overview') ?? null);
    const [health, setHealth] = useState<Health | null>(() => cached<Health>('/health') ?? null);
    const [error, setError] = useState('');

    useEffect(() => {
        api<Overview>('/overview').then(setData, err => setError(errorText(err)));
        api<Health>('/health').then(setHealth, () => undefined);
    }, []);

    const pending = data ? KINDS.filter(k => (data.pending[k] ?? 0) > 0) : [];
    const totalPending = data ? KINDS.reduce((n, k) => n + (data.pending[k] ?? 0), 0) : 0;
    const unpublished = data ? data.unpublished.quotes + data.unpublished.passages + data.unpublished.talk : 0;
    const allDone = data !== null && totalPending === 0 && unpublished === 0;

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
            <div>
                <h1 className="text-2xl font-bold text-ink">Hôm nay</h1>
                <p className="text-sm text-muted">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <ErrorNote error={error} />

            {!data ? (
                <p className="text-muted">Đang tải…</p>
            ) : allDone ? (
                <Card className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                        <Check className="h-6 w-6" />
                    </div>
                    <p className="text-lg font-bold text-ink">Xong hôm nay</p>
                    <p className="text-sm text-muted">Không còn gì chờ duyệt hay chờ xuất bản.</p>
                    <Link href="/create" className="mt-2 flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-bold text-on-accent hover:bg-accent-strong">
                        Tạo thêm nội dung
                    </Link>
                </Card>
            ) : (
                <>
                    {totalPending > 0 && (
                        <Link href="/review" className="flex items-center gap-3 rounded-2xl bg-accent px-5 py-4 text-on-accent hover:bg-accent-strong">
                            <div className="mr-auto">
                                <p className="text-lg font-bold">Bắt đầu duyệt</p>
                                <p className="text-sm opacity-80">{totalPending} mục chờ duyệt, các loại xen kẽ</p>
                            </div>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    )}

                    <Card className="flex flex-col divide-y divide-line !p-0">
                        {pending.map(k => (
                            <Row key={k} href={`/review?type=${k}`} count={data.pending[k]} text={`Duyệt ${NOUN[k]}`} action="Duyệt" />
                        ))}
                        {unpublished > 0 && <Row href="/publish" count={unpublished} text="Thay đổi chưa xuất bản lên Lexica" action="Xuất bản" />}
                        {pending.length === 0 && unpublished === 0 && <p className="p-4 text-sm text-muted">Không có việc nào.</p>}
                    </Card>
                </>
            )}

            {health && (
                <p className="font-mono text-xs text-subtle">
                    Đã sinh {health.generationsLast24h}/{health.maxGenerationsPerDay} nháp trong 24 giờ
                    {health.recentRuns[0] && <> · lần chạy gần nhất: {health.recentRuns[0].job} {health.recentRuns[0].ok === false ? '(lỗi)' : ''}</>}
                </p>
            )}
            <p className="text-xs text-subtle">
                Cần thêm nội dung? <Link href="/create" className="underline">Tạo</Link>. Mọi loại: {KINDS.map(k => TYPE_LABEL[k]).join(', ')}.
            </p>
        </div>
    );
}

function Row({ href, count, text, action }: { href: string; count: number; text: string; action: string }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3">
            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-surface-2 px-2 font-mono text-sm text-ink">{count}</span>
            <span className="mr-auto text-sm text-ink">{text}</span>
            <Link href={href} className="flex h-9 items-center rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-surface-2">
                {action}
            </Link>
        </div>
    );
}
