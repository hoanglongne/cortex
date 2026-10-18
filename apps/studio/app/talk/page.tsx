'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { quoteError } from '../lib/quotes';
import { Badge, Button, Card, ErrorNote } from '../components/ui';

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
    const [list, setList] = useState<TalkCard[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [level, setLevel] = useState<string>('beginner');
    const [topic, setTopic] = useState(TOPICS[0]);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [note, setNote] = useState('');

    const load = useCallback(async (status: Status) => {
        try {
            const [rows, s] = await Promise.all([api<TalkCard[]>(`/talk?status=${status}`), api<Stats>('/talk/stats')]);
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
    const review = (c: TalkCard, action: 'approve' | 'reject', edits?: Partial<Fields>) =>
        run(c.id, async () => {
            await api(`/talk/${c.id}/${action}`, { method: 'POST', body: edits ?? {} });
        });

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <p className="text-sm text-ink-2">
                    Thẻ cụm từ cho nhánh Giao tiếp của Lexica: cụm tiếng Anh đời thường chêm trong câu tiếng Việt, kèm một tình huống để người học tự nói và một câu mẫu. Hội
                    thoại cho nhánh này viết ở trang Đọc (chọn &ldquo;Hội thoại&rdquo;).
                </p>
                {stats && <p className="mt-1 text-xs text-muted">{stats.core} cụm có sẵn trong app · {stats.approved} cụm Studio đã duyệt</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2">
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
                    <Button variant="primary" onClick={generate} disabled={!!busy}>
                        {busy === 'generate' ? 'Đang viết…' : 'Viết 5 thẻ'}
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

            {list.length === 0 && <p className="text-sm text-muted">Chưa có thẻ nào.</p>}
            {list.map((c) => (
                <TalkCardView key={c.id} card={c} busy={busy === c.id} onReview={(a, e) => review(c, a, e)} />
            ))}
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

function TalkCardView({ card, busy, onReview }: { card: TalkCard; busy: boolean; onReview: (action: 'approve' | 'reject', edits?: Partial<Fields>) => void }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Fields>({
        phrase: card.phrase,
        scenario: card.scenario,
        translation_hint: card.translation_hint,
        situation_prompt: card.situation_prompt,
        situation_model: card.situation_model,
    });
    return (
        <Card>
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-ink">{card.phrase}</span>
                <span className="text-sm text-muted">{card.translation_hint}</span>
                <Badge>{LEVELS.find((l) => l.id === card.level)?.label ?? card.level}</Badge>
                <Badge>{card.topic}</Badge>
                {card.status === 'approved' && !card.published_at && <Badge tone="warning">Chưa xuất bản</Badge>}
            </div>
            {editing ? (
                <div className="mt-3 grid gap-2">
                    {FIELDS.map((f) => (
                        <label key={f.key} className="grid gap-1 text-xs text-muted">
                            {f.label}
                            <input className={INPUT} value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
                        </label>
                    ))}
                </div>
            ) : (
                <dl className="mt-3 grid gap-1.5 text-sm">
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
            <div className="mt-3 flex flex-wrap gap-2">
                {editing ? (
                    <>
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
                    </>
                ) : (
                    <>
                        {card.status !== 'approved' && (
                            <Button variant="primary" disabled={busy} onClick={() => onReview('approve')}>
                                Duyệt
                            </Button>
                        )}
                        <Button disabled={busy} onClick={() => setEditing(true)}>
                            Sửa
                        </Button>
                        {card.status !== 'rejected' && (
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
