'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, errorText } from '../lib/api';
import { buildSummary, findSummary, quoteError, type BuildResult, type FindResult } from '../lib/quotes';
import { Button, Card, ErrorNote, Select } from '../components/ui';

const LEVELS = [
    { id: 'beginner', label: 'Cơ bản' },
    { id: 'intermediate', label: 'Trung cấp' },
    { id: 'advanced', label: 'Nâng cao' },
    { id: 'expert', label: 'Chuyên gia' },
] as const;
const TOPICS = ['Đời sống', 'Công việc', 'Tiền bạc', 'Công nghệ', 'Giáo dục', 'Sức khoẻ', 'Du lịch', 'Môi trường', 'Xã hội'];

/** Every way to make new content, in one place. Each one ends at the review queue. */
export default function CreatePage() {
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ text: string; type: string } | null>(null);
    const [level, setLevel] = useState<string>('beginner');
    const [topic, setTopic] = useState(TOPICS[0]);
    const [kind, setKind] = useState<'text' | 'dialogue'>('text');

    const run = async (id: string, type: string, fn: () => Promise<string>) => {
        setBusy(id);
        setError('');
        setResult(null);
        try {
            setResult({ text: await fn(), type });
        } catch (err) {
            setError(id === 'quotes' || id === 'talk' || id === 'passages' ? quoteError(err) : errorText(err));
        } finally {
            setBusy('');
        }
    };

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <div>
                <h1 className="text-xl font-bold text-ink">Tạo nội dung</h1>
                <p className="text-sm text-muted">Chọn loại, bấm tạo. Nội dung mới sẽ vào hàng chờ Duyệt.</p>
            </div>

            <ErrorNote error={error} />
            {result && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-ink">
                    <span>{result.text}</span>
                    <Link href={`/review?type=${result.type}`} className="ml-auto flex h-9 items-center rounded-lg bg-accent px-3 font-bold text-on-accent hover:bg-accent-strong">
                        Duyệt ngay
                    </Link>
                </div>
            )}

            <Card className="flex flex-col gap-3">
                <div>
                    <h2 className="font-bold text-ink">Thẻ mới từ trend</h2>
                    <p className="text-sm text-muted">Thẻ được sinh từ trend đang hot. Chọn trend ở mục Quản lý → Trend rồi bấm sinh nháp.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/trends" className="flex h-10 items-center rounded-xl border border-line px-4 text-sm font-medium text-ink hover:bg-surface-2">
                        Mở Trend
                    </Link>
                    <Link href="/radar" className="flex h-10 items-center rounded-xl border border-line px-4 text-sm font-medium text-ink hover:bg-surface-2">
                        Mở Radar
                    </Link>
                </div>
            </Card>

            <Card className="flex flex-col gap-3">
                <div>
                    <h2 className="font-bold text-ink">Câu mẫu theo hình mẫu</h2>
                    <p className="text-sm text-muted">Viết thêm câu cho dân tech, văn phòng, sinh viên cho 10 thẻ chưa có câu.</p>
                </div>
                <div>
                    <Button
                        variant="primary"
                        disabled={!!busy}
                        onClick={() =>
                            run('variants', 'variants', async () => {
                                const r = await api<{ cards: number; saved: number; rejected: number }>('/variants/generate', { method: 'POST', body: { limit: 10 } });
                                return r.cards === 0 ? 'Thẻ nào cũng đã có câu mẫu.' : `${r.cards} thẻ: ${r.saved} câu chờ duyệt, ${r.rejected} câu bị loại tự động.`;
                            })
                        }
                    >
                        {busy === 'variants' ? 'Đang viết…' : 'Tạo câu cho 10 thẻ'}
                    </Button>
                </div>
            </Card>

            <Card className="flex flex-col gap-3">
                <div>
                    <h2 className="font-bold text-ink">Câu trích ngoài đời</h2>
                    <p className="text-sm text-muted">Tìm câu thật từ sách và báo có chứa từ của thẻ. Cần dựng kho câu trước (một lần).</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="primary"
                        disabled={!!busy}
                        onClick={() =>
                            run('quotes', 'quotes', async () => {
                                return findSummary(await api<FindResult>('/quotes/find', { method: 'POST', body: { limit: 50 } }));
                            })
                        }
                    >
                        {busy === 'quotes' ? 'Đang tìm…' : 'Tìm câu (50 thẻ)'}
                    </Button>
                    <Button
                        disabled={!!busy}
                        onClick={() => run('corpus', 'quotes', async () => {
                            return buildSummary(await api<BuildResult>('/quotes/build-corpus', { method: 'POST', body: { books: 6 } }));
                        })}
                    >
                        {busy === 'corpus' ? 'Đang tải sách…' : 'Dựng kho câu (6 sách)'}
                    </Button>
                </div>
            </Card>

            <Card className="flex flex-col gap-3">
                <div>
                    <h2 className="font-bold text-ink">Bài đọc và hội thoại</h2>
                    <p className="text-sm text-muted">Đoạn văn 120–200 từ, hoặc hội thoại 6–10 lượt, viết quanh các từ ít được dùng nhất.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={kind} onChange={e => setKind(e.target.value as 'text' | 'dialogue')} aria-label="Loại">
                        <option value="text">Đoạn văn (Chứng chỉ)</option>
                        <option value="dialogue">Hội thoại (Giao tiếp)</option>
                    </Select>
                    <Select value={level} onChange={e => setLevel(e.target.value)} aria-label="Level">
                        {LEVELS.map(l => (
                            <option key={l.id} value={l.id}>
                                {l.label}
                            </option>
                        ))}
                    </Select>
                    <Select value={topic} onChange={e => setTopic(e.target.value)} aria-label="Chủ đề">
                        {TOPICS.map(t => (
                            <option key={t}>{t}</option>
                        ))}
                    </Select>
                    <Button
                        variant="primary"
                        disabled={!!busy}
                        onClick={() =>
                            run('passages', 'passages', async () => {
                                const r = await api<{ saved: number; failed?: string; note?: string }>('/passages/generate', { method: 'POST', body: { level, topic, kind } });
                                if (r.saved === 0) return `Bài vừa viết chưa đạt (${r.failed}). Bấm tạo lại.`;
                                return r.note ? `Đã viết 1 bài, chờ duyệt. Lưu ý: ${r.note}.` : 'Đã viết 1 bài, chờ duyệt.';
                            })
                        }
                    >
                        {busy === 'passages' ? 'Đang viết…' : 'Tạo 1 bài'}
                    </Button>
                </div>
            </Card>

            <Card className="flex flex-col gap-3">
                <div>
                    <h2 className="font-bold text-ink">Thẻ giao tiếp</h2>
                    <p className="text-sm text-muted">Cụm tiếng Anh đời thường chêm trong câu tiếng Việt, kèm tình huống để người học tự nói.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={level} onChange={e => setLevel(e.target.value)} aria-label="Level">
                        {LEVELS.map(l => (
                            <option key={l.id} value={l.id}>
                                {l.label}
                            </option>
                        ))}
                    </Select>
                    <Select value={topic} onChange={e => setTopic(e.target.value)} aria-label="Chủ đề">
                        {TOPICS.map(t => (
                            <option key={t}>{t}</option>
                        ))}
                    </Select>
                    <Button
                        variant="primary"
                        disabled={!!busy}
                        onClick={() =>
                            run('talk', 'talk', async () => {
                                const r = await api<{ saved: number; failed: { phrase: string; reason: string }[] }>('/talk/generate', { method: 'POST', body: { level, topic, count: 5 } });
                                const skipped = r.failed.length ? ` Bỏ ${r.failed.length}: ${r.failed.map(f => `${f.phrase} (${f.reason})`).join('; ')}.` : '';
                                return `Đã viết ${r.saved} thẻ, chờ duyệt.${skipped}`;
                            })
                        }
                    >
                        {busy === 'talk' ? 'Đang viết…' : 'Tạo 5 thẻ'}
                    </Button>
                </div>
            </Card>

            <p className="text-xs text-subtle">
                Thêm câu trích tay (bài hát có YouTube) và các nguồn thu thập khác ở <Link href="/quotes" className="underline">Quản lý → Ngoài đời</Link>.
            </p>
        </div>
    );
}
