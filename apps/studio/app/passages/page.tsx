'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, cached } from '../lib/api';
import { quoteError } from '../lib/quotes';
import { Badge, Button, Card, ErrorNote, Textarea } from '../components/ui';
import PlanPanel from './PlanPanel';

/**
 * "Đọc" passages for Lexica: short English texts written around 3–5 deck
 * words at one level, on one topic. Generate one, read it, approve, edit or
 * reject it like a card, then publish the approved ones as a pack.
 */

type Status = 'pending' | 'approved' | 'rejected';
const LEVELS = [
    { id: 'beginner', label: 'Cơ bản' },
    { id: 'intermediate', label: 'Trung cấp' },
    { id: 'advanced', label: 'Nâng cao' },
    { id: 'expert', label: 'Chuyên gia' },
] as const;
const TOPICS = ['Đời sống', 'Công việc', 'Tiền bạc', 'Công nghệ', 'Giáo dục', 'Sức khoẻ', 'Du lịch', 'Môi trường', 'Xã hội'];
const TABS: { id: Status; label: string }[] = [
    { id: 'pending', label: 'Chờ duyệt' },
    { id: 'approved', label: 'Đã duyệt' },
    { id: 'rejected', label: 'Đã loại' },
];

interface Passage {
    id: string;
    level: string;
    /** 'dialogue' for the Giao tiếp branch. */
    kind?: 'text' | 'dialogue';
    topic: string;
    title: string;
    text: string;
    translation: string;
    questions: { question: string; options: string[]; answer: number }[];
    new_word_list: { id: string; word: string }[];
    words: string[];
    status: Status;
    published_at: string | null;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    unpublished: number;
    byLevel: Record<string, number>;
}

const INPUT = 'rounded-lg border border-line bg-surface px-3 py-2 text-sm';
const words = (t: string) => t.split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;

export default function PassagesPage() {
    const [tab, setTab] = useState<Status>('pending');
    const [list, setList] = useState<Passage[]>(() => cached<Passage[]>('/passages?status=pending') ?? []);
    const [stats, setStats] = useState<Stats | null>(() => cached<Stats>('/passages/stats') ?? null);
    const [level, setLevel] = useState<string>('beginner');
    const [topic, setTopic] = useState(TOPICS[0]);
    const [kind, setKind] = useState<'text' | 'dialogue'>('text');
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [note, setNote] = useState('');

    const load = useCallback(async (status: Status) => {
        try {
            const [rows, s] = await Promise.all([api<Passage[]>(`/passages?status=${status}`), api<Stats>('/passages/stats')]);
            setList(rows);
            setStats(s);
        } catch (err) {
            setError(quoteError(err));
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => void load(tab), 0);
        return () => clearTimeout(t);
    }, [load, tab]);

    const run = async (label: string, fn: () => Promise<string | void>) => {
        setBusy(label);
        setError('');
        setNote('');
        try {
            const msg = await fn();
            if (msg) setNote(msg);
            await load(tab);
        } catch (err) {
            setError(quoteError(err));
        } finally {
            setBusy('');
        }
    };

    const generate = () =>
        run('generate', async () => {
            const r = await api<{ saved: number; failed?: string; note?: string }>('/passages/generate', { method: 'POST', body: { level, topic, kind } });
            const what = kind === 'dialogue' ? 'hội thoại' : 'đoạn';
            if (r.saved === 0) return `${what === 'đoạn' ? 'Đoạn' : 'Hội thoại'} vừa viết chưa đạt (${r.failed}). Bấm viết lại.`;
            return r.note ? `Đã viết 1 ${what}, chờ duyệt. Lưu ý: ${r.note}.` : `Đã viết 1 ${what}, chờ duyệt.`;
        });
    const publish = () =>
        run('publish', async () => {
            const r = await api<{ passages: number }>('/passages/publish', { method: 'POST' });
            return `Đã xuất bản ${r.passages} đoạn văn.`;
        });
    const review = (p: Passage, action: 'approve' | 'reject', edits?: Partial<Pick<Passage, 'title' | 'text' | 'translation'>>) =>
        run(p.id, async () => {
            await api(`/passages/${p.id}/${action}`, { method: 'POST', body: edits ?? {} });
        });

    return (
        <div className="flex flex-col gap-4">
            <PlanPanel onWritten={() => void load(tab)} />
            <Card>
                <p className="text-sm text-ink-2">
                    Đoạn văn ngắn (120–200 từ) cho trang &ldquo;Đọc&rdquo; của Lexica, hoặc hội thoại 6–10 lượt (60–170 từ) cho nhánh Giao tiếp. Máy chọn 3–5 từ (hoặc cụm
                    giao tiếp) của level ít được dùng nhất và viết quanh chúng; bạn đọc, sửa nếu cần, rồi duyệt.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <select className={INPUT} value={kind} onChange={(e) => setKind(e.target.value as 'text' | 'dialogue')} aria-label="Loại">
                        <option value="text">Đoạn văn (Chứng chỉ)</option>
                        <option value="dialogue">Hội thoại (Giao tiếp)</option>
                    </select>
                    <select className={INPUT} value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
                        {LEVELS.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.label}
                                {stats ? ` (${stats.byLevel[l.id] ?? 0} đã duyệt)` : ''}
                            </option>
                        ))}
                    </select>
                    <select className={INPUT} value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Chủ đề">
                        {TOPICS.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                    <Button variant="primary" onClick={generate} disabled={!!busy}>
                        {busy === 'generate' ? 'Đang viết…' : kind === 'dialogue' ? 'Viết 1 hội thoại' : 'Viết 1 đoạn'}
                    </Button>
                    <Button onClick={publish} disabled={!!busy || !stats || stats.approved === 0}>
                        {busy === 'publish' ? 'Đang xuất bản…' : `Xuất bản${stats?.unpublished ? ` (${stats.unpublished} mới)` : ''}`}
                    </Button>
                </div>
                {note && <p className="mt-3 text-sm text-accent">{note}</p>}
            </Card>

            <ErrorNote error={error} />

            <div className="flex gap-1 border-b border-line" role="tablist">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        role="tab"
                        aria-selected={tab === t.id}
                        onClick={() => {
                            setList([]);
                            setTab(t.id);
                        }}
                        className={`px-3 py-2 text-sm -mb-px border-b-2 ${tab === t.id ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'}`}
                    >
                        {t.label}
                        {stats && <span className="ml-1.5 font-mono text-[11px] text-subtle">{stats[t.id]}</span>}
                    </button>
                ))}
            </div>

            {list.length === 0 && <p className="text-sm text-muted">Chưa có đoạn nào.</p>}
            {list.map((p) => (
                <PassageCard key={p.id} passage={p} busy={busy === p.id} onReview={(a, e) => review(p, a, e)} />
            ))}
        </div>
    );
}

function PassageCard({
    passage,
    busy,
    onReview,
}: {
    passage: Passage;
    busy: boolean;
    onReview: (action: 'approve' | 'reject', edits?: Partial<Pick<Passage, 'title' | 'text' | 'translation'>>) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(passage.title);
    const [text, setText] = useState(passage.text);
    const [translation, setTranslation] = useState(passage.translation);
    const n = words(editing ? text : passage.text);
    const dialogue = passage.kind === 'dialogue';
    const [min, max] = dialogue ? [60, 170] : [120, 200];
    return (
        <Card>
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-ink">{passage.title}</span>
                <Badge>{LEVELS.find((l) => l.id === passage.level)?.label ?? passage.level}</Badge>
                <Badge>{passage.topic}</Badge>
                {dialogue && <Badge>Hội thoại</Badge>}
                <Badge tone={n >= min && n <= max ? 'muted' : 'warning'}>{n} từ</Badge>
                {passage.status === 'approved' && !passage.published_at && <Badge tone="warning">Chưa xuất bản</Badge>}
            </div>
            <p className="mt-2 text-xs text-muted">
                Từ mới:{' '}
                {passage.new_word_list.map((w) => (
                    <span key={w.id} className="mr-1.5 font-mono text-accent lowercase">
                        {w.word}
                    </span>
                ))}
                · {passage.words.length} từ khác của bộ thẻ
            </p>
            {editing ? (
                <div className="mt-3 flex flex-col gap-2">
                    <input className={INPUT} value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Tiêu đề" />
                    <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className="w-full" aria-label="Đoạn văn" />
                    <Textarea rows={8} value={translation} onChange={(e) => setTranslation(e.target.value)} className="w-full" aria-label="Bản dịch" />
                </div>
            ) : (
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink-2">{passage.text}</p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{passage.translation}</p>
                </div>
            )}
            {passage.questions.length > 0 && (
                <ol className="mt-3 space-y-1 text-xs text-muted list-decimal list-inside">
                    {passage.questions.map((q) => (
                        <li key={q.question}>
                            {q.question} <span className="text-accent">→ {q.options[q.answer]}</span>
                        </li>
                    ))}
                </ol>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
                {editing ? (
                    <>
                        <Button
                            variant="primary"
                            disabled={busy}
                            onClick={() => {
                                onReview('approve', { title, text, translation });
                                setEditing(false);
                            }}
                        >
                            Lưu và duyệt
                        </Button>
                        <Button disabled={busy} onClick={() => setEditing(false)}>
                            Huỷ
                        </Button>
                    </>
                ) : (
                    <>
                        {passage.status !== 'approved' && (
                            <Button variant="primary" disabled={busy} onClick={() => onReview('approve')}>
                                Duyệt
                            </Button>
                        )}
                        <Button disabled={busy} onClick={() => setEditing(true)}>
                            Sửa
                        </Button>
                        {passage.status !== 'rejected' && (
                            <Button disabled={busy} onClick={() => onReview('reject')}>
                                Loại
                            </Button>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}
