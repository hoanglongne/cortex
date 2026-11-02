'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, cached } from '../lib/api';
import { quoteError } from '../lib/quotes';
import { Badge, Button, Card, ErrorNote } from '../components/ui';
import { BulkBar } from '../components/BulkBar';
import { IconAction, KeyHint, ReviewRow, StatusTabs, Tools, useRowKeys } from '../components/review';
import { useBulkReview } from '../lib/bulk';

/**
 * Giao tiếp phrase cards for Lexica (docs/LEXICA_DIRECTION.md): an everyday
 * phrase in a code-switched Vietnamese sentence, a situation to say it in and
 * a model sentence. Generate a batch, review each card, publish the approved
 * ones as the `talk` pack. The 40 phrases bundled in the app are known here
 * and never generated again.
 */

type Status = 'pending' | 'approved' | 'rejected';
const LEVELS = [
    { id: 'beginner', label: 'Cơ bản' },
    { id: 'intermediate', label: 'Trung cấp' },
    { id: 'advanced', label: 'Nâng cao' },
    { id: 'expert', label: 'Chuyên gia' },
] as const;
const TOPICS = ['Đi làm', 'Du lịch', 'Ăn uống', 'Mua sắm', 'Bạn bè', 'Tin nhắn & điện thoại', 'Sức khoẻ'];
const TABS: { id: Status; label: string }[] = [
    { id: 'pending', label: 'Chờ duyệt' },
    { id: 'approved', label: 'Đã duyệt' },
    { id: 'rejected', label: 'Đã loại' },
];

interface TalkCard {
    id: string;
    card_id: string;
    level: string;
    topic: string;
    phrase: string;
    scenario: string;
    translation_hint: string;
    situation_prompt: string;
    situation_model: string;
    status: Status;
    published_at: string | null;
}

type Fields = Pick<TalkCard, 'phrase' | 'scenario' | 'translation_hint' | 'situation_prompt' | 'situation_model'>;

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    core: number;
    unpublished: number;
    byLevel: Record<string, number>;
}

const INPUT = 'rounded-lg border border-line bg-surface px-3 py-2 text-sm';

export default function TalkPage() {
    const [tab, setTab] = useState<Status>('pending');
    const [list, setList] = useState<TalkCard[]>(() => cached<TalkCard[]>('/talk?status=pending') ?? []);
    const [stats, setStats] = useState<Stats | null>(() => cached<Stats>('/talk/stats') ?? null);
    const [level, setLevel] = useState<string>('beginner');
    const [topic, setTopic] = useState(TOPICS[0]);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [note, setNote] = useState('');

    const load = useCallback(async (status: Status) => {
        try {
            const [rows, s] = await Promise.all([api<TalkCard[]>(`/talk?status=${status}&limit=20`), api<Stats>('/talk/stats')]);
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
            const r = await api<{ saved: number; failed: { phrase: string; reason: string }[] }>('/talk/generate', { method: 'POST', body: { level, topic, count: 5 } });
            const skipped = r.failed.length ? ` Bỏ ${r.failed.length}: ${r.failed.map((f) => `${f.phrase} (${f.reason})`).join('; ')}.` : '';
            return `Đã viết ${r.saved} thẻ, chờ duyệt.${skipped}`;
        });
    const publish = () =>
        run('publish', async () => {
            const r = await api<{ cards: number }>('/talk/publish', { method: 'POST' });
            return `Đã xuất bản ${r.cards} thẻ giao tiếp.`;
        });
    const refreshStats = useCallback(() => void api<Stats>('/talk/stats').then(setStats, () => undefined), []);
    const { sel, progress, bulk, removeOne } = useBulkReview({
        list,
        setList,
        path: (id, action) => `/talk/${id}/${action}`,
        refreshCounts: refreshStats,
        setError: (m) => setError(m),
        setNote,
    });
    const review = async (c: TalkCard, action: 'approve' | 'reject', edits?: Partial<Fields>) => {
        setBusy(c.id);
        setError('');
        try {
            await api(`/talk/${c.id}/${action}`, { method: 'POST', body: edits ?? {} });
            removeOne(c.id);
        } catch (err) {
            setError(quoteError(err));
        } finally {
            setBusy('');
        }
    };

    const focused = useRowKeys({
        ids: list.map(c => c.id),
        onApprove: id => {
            const c = list.find(x => x.id === id);
            if (c && tab !== 'approved') void review(c, 'approve');
        },
        onReject: id => {
            const c = list.find(x => x.id === id);
            if (c && tab === 'pending') void review(c, 'reject');
        },
        onToggle: id => tab !== 'approved' && sel.toggle(id),
    });

    return (
        <div className="flex flex-col gap-3">
            <StatusTabs tabs={TABS} value={tab} onChange={t => { setList([]); setTab(t); }} counts={stats ? { pending: stats.pending, approved: stats.approved, rejected: stats.rejected } : null} />

            <Tools
                summary={stats ? `${stats.core} cụm có sẵn · ${stats.approved} cụm Studio đã duyệt` : undefined}
                actions={
                    <>
                        <Button variant="primary" onClick={generate} disabled={!!busy}>
                            {busy === 'generate' ? 'Đang viết…' : 'Viết 5 thẻ'}
                        </Button>
                        <Button onClick={publish} disabled={!!busy || !stats || stats.approved === 0}>
                            {busy === 'publish' ? 'Đang xuất bản…' : `Xuất bản${stats?.unpublished ? ` (${stats.unpublished})` : ''}`}
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-ink-2">
                    Thẻ cụm từ cho nhánh Giao tiếp của Lexica: cụm tiếng Anh đời thường chêm trong câu tiếng Việt, kèm một tình huống để người học tự nói và một câu mẫu. Hội
                    thoại cho nhánh này viết ở tab Đọc (chọn &ldquo;Hội thoại&rdquo;).
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted">Viết thẻ mới cho:</span>
                    <select className={INPUT} value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
                        {LEVELS.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.label}
                                {stats ? ` (${stats.byLevel[l.id] ?? 0})` : ''}
                            </option>
                        ))}
                    </select>
                    <select className={INPUT} value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Chủ đề">
                        {TOPICS.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </Tools>

            <ErrorNote error={error} />
            {note && <p className="text-sm text-accent">{note}</p>}

            {list.length === 0 && <p className="text-sm text-muted">Chưa có thẻ nào.</p>}
            {tab !== 'approved' && (
                <BulkBar
                    total={list.length}
                    selected={sel.selected.size}
                    all={sel.all}
                    onToggleAll={sel.setAll}
                    onApprove={() => void bulk('approve')}
                    onReject={tab === 'pending' ? () => void bulk('reject') : undefined}
                    progress={progress}
                />
            )}
            {list.map((c) => (
                <TalkCardView key={c.id} card={c} busy={busy === c.id} focused={focused === c.id} selected={sel.selected.has(c.id)} onToggle={tab === 'approved' ? undefined : () => sel.toggle(c.id)} onReview={(a, e) => review(c, a, e)} />
            ))}
            {list.length > 0 && <KeyHint />}
        </div>
    );
}

const FIELDS: { key: keyof Fields; label: string }[] = [
    { key: 'phrase', label: 'Cụm' },
    { key: 'scenario', label: 'Câu chêm' },
    { key: 'translation_hint', label: 'Nghĩa' },
    { key: 'situation_prompt', label: 'Tình huống' },
    { key: 'situation_model', label: 'Câu mẫu' },
];

function TalkCardView({
    card,
    busy,
    focused,
    selected,
    onToggle,
    onReview,
}: {
    card: TalkCard;
    busy: boolean;
    focused?: boolean;
    selected?: boolean;
    onToggle?: () => void;
    onReview: (action: 'approve' | 'reject', edits?: Partial<Fields>) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Fields>({
        phrase: card.phrase,
        scenario: card.scenario,
        translation_hint: card.translation_hint,
        situation_prompt: card.situation_prompt,
        situation_model: card.situation_model,
    });
    const actions = editing ? undefined : (
        <>
            <IconAction kind="edit" disabled={busy} onClick={() => setEditing(true)} />
            {card.status !== 'rejected' && <IconAction kind="reject" label="Loại" disabled={busy} onClick={() => onReview('reject')} />}
            {card.status !== 'approved' && <IconAction kind="approve" disabled={busy} onClick={() => onReview('approve')} />}
        </>
    );
    return (
        <ReviewRow id={card.id} focused={focused} selected={selected} onToggle={onToggle} actions={actions}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-bold text-ink">{card.phrase}</span>
                <span className="text-sm text-muted">{card.translation_hint}</span>
                <Badge>{LEVELS.find((l) => l.id === card.level)?.label ?? card.level}</Badge>
                <Badge>{card.topic}</Badge>
                {card.status === 'approved' && !card.published_at && <Badge tone="warning">Chưa xuất bản</Badge>}
            </div>
            {editing ? (
                <div className="mt-2 grid gap-2">
                    {FIELDS.map((f) => (
                        <label key={f.key} className="grid gap-1 text-xs text-muted">
                            {f.label}
                            <input className={INPUT} value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
                        </label>
                    ))}
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            disabled={busy}
                            onClick={() => {
                                onReview('approve', draft);
                                setEditing(false);
                            }}
                        >
                            Lưu và duyệt
                        </Button>
                        <Button disabled={busy} onClick={() => setEditing(false)}>
                            Huỷ
                        </Button>
                    </div>
                </div>
            ) : (
                <dl className="mt-1 grid gap-0.5 text-sm">
                    <div>
                        <dt className="inline text-muted">Câu chêm: </dt>
                        <dd className="inline text-ink-2">{card.scenario}</dd>
                    </div>
                    <div>
                        <dt className="inline text-muted">Tình huống: </dt>
                        <dd className="inline text-ink-2">{card.situation_prompt}</dd>
                    </div>
                    <div>
                        <dt className="inline text-muted">Câu mẫu: </dt>
                        <dd className="inline text-ink">{card.situation_model}</dd>
                    </div>
                </dl>
            )}
        </ReviewRow>
    );
}
