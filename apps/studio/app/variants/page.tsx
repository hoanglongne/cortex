'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, cached, errorText } from '../lib/api';
import Scenario from '../components/Scenario';
import { Badge, Button, Card, ErrorNote, Textarea } from '../components/ui';
import { BulkBar } from '../components/BulkBar';
import { IconAction, KeyHint, ReviewRow, Tools, useRowKeys } from '../components/review';
import { bulkSummary, runBulk, useSelection } from '../lib/bulk';

/**
 * Câu ví dụ theo hình mẫu: each card gets a tech, a business and a student
 * sentence next to its own (casual) one. Generate a batch, review, publish.
 * Learners pick their archetype in Lexica (Tôi → Câu ví dụ theo kiểu).
 */

type Archetype = 'tech' | 'business' | 'student';

const LABEL: Record<Archetype, string> = { tech: 'Dân tech', business: 'Văn phòng', student: 'Sinh viên' };

interface Variant {
    card_id: string;
    archetype: Archetype;
    scenario: string;
    status: 'pending' | 'approved' | 'rejected';
    model: string | null;
}

interface Group {
    card: { id: string; word: string; scenario: string; translation_hint: string };
    variants: Variant[];
}

interface Coverage {
    cards: number;
    cardsWithApproved: number;
    cardsWithout: number;
    pending: number;
    approved: number;
    rejected: number;
}

export default function VariantsPage() {
    const [coverage, setCoverage] = useState<Coverage | null>(() => cached<Coverage>('/variants/coverage') ?? null);
    const [groups, setGroups] = useState<Group[]>(() => cached<Group[]>('/variants?status=pending&limit=20') ?? []);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [note, setNote] = useState('');

    const load = useCallback(async () => {
        try {
            const [cov, list] = await Promise.all([
                api<Coverage>('/variants/coverage'),
                api<Group[]>('/variants?status=pending&limit=20'),
            ]);
            setCoverage(cov);
            setGroups(list);
        } catch (err) {
            setError(errorText(err));
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    const run = async (label: string, fn: () => Promise<string | void>) => {
        setBusy(label);
        setError('');
        setNote('');
        try {
            const msg = await fn();
            if (msg) setNote(msg);
            await load();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy('');
        }
    };

    const generate = () =>
        run('generate', async () => {
            const r = await api<{ cards: number; saved: number; rejected: number }>('/variants/generate', { method: 'POST', body: { limit: 10 } });
            return r.cards === 0 ? 'Thẻ nào cũng đã có câu mẫu.' : `${r.cards} thẻ: ${r.saved} câu chờ duyệt, ${r.rejected} câu bị loại tự động.`;
        });

    const publish = () =>
        run('publish', async () => {
            const r = await api<{ variants: number; cards: number }>('/variants/publish', { method: 'POST' });
            return `Đã xuất bản ${r.variants} câu cho ${r.cards} thẻ. Lexica nhận trong lần mở app tới.`;
        });

    const refreshCoverage = useCallback(() => void api<Coverage>('/variants/coverage').then(setCoverage, () => undefined), []);
    const countsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const coverageSoon = () => {
        if (countsTimer.current) clearTimeout(countsTimer.current);
        countsTimer.current = setTimeout(refreshCoverage, 1500);
    };
    const sel = useSelection(groups.map(g => g.card.id));
    const [progress, setProgress] = useState('');

    /** Takes the reviewed variants out of the list; a card with none left goes too. */
    const drop = (done: Set<string>) => {
        const key = (v: Variant) => `${v.card_id}:${v.archetype}`;
        setGroups(gs => gs.map(g => ({ ...g, variants: g.variants.filter(v => !done.has(key(v))) })).filter(g => g.variants.length > 0));
        coverageSoon();
    };

    // One variant leaves the list at once, without reloading everything
    const review = async (v: Variant, action: 'approve' | 'reject', scenario?: string) => {
        const key = `${v.card_id}:${v.archetype}`;
        setBusy(key);
        setError('');
        try {
            await api(`/variants/${v.card_id}/${v.archetype}`, { method: 'POST', body: { action, ...(scenario !== undefined ? { scenario } : {}) } });
            drop(new Set([key]));
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy('');
        }
    };

    const reviewMany = async (chosen: Group[], action: 'approve' | 'reject') => {
        const items = chosen.flatMap(g => g.variants);
        if (items.length === 0) return;
        setError('');
        setNote('');
        setProgress(`0/${items.length}`);
        const r = await runBulk(
            items.map((_, i) => String(i)),
            i => {
                const v = items[Number(i)];
                return api(`/variants/${v.card_id}/${v.archetype}`, { method: 'POST', body: { action } });
            },
            n => setProgress(`${n}/${items.length}`),
        );
        setProgress('');
        drop(new Set(r.done.map(i => `${items[Number(i)].card_id}:${items[Number(i)].archetype}`)));
        sel.clear();
        setNote(bulkSummary(action === 'approve' ? 'duyệt' : 'loại', r));
        if (r.failed.length) setError(r.failed[0].error);
    };

    const approveAll = (g: Group) => reviewMany([g], 'approve');

    const focused = useRowKeys({
        ids: groups.map(g => g.card.id),
        onApprove: id => {
            const g = groups.find(x => x.card.id === id);
            if (g) void reviewMany([g], 'approve');
        },
        onReject: id => {
            const g = groups.find(x => x.card.id === id);
            if (g) void reviewMany([g], 'reject');
        },
        onToggle: id => sel.toggle(id),
    });

    return (
        <div className="flex flex-col gap-3">
            <Tools
                summary={coverage ? `${coverage.pending} chờ duyệt · ${coverage.approved} đã duyệt` : undefined}
                actions={
                    <>
                        <Button variant="primary" onClick={generate} disabled={!!busy}>
                            {busy === 'generate' ? 'Đang viết…' : 'Sinh câu cho 10 thẻ'}
                        </Button>
                        <Button onClick={publish} disabled={!!busy || !coverage?.approved}>
                            {busy === 'publish' ? 'Đang xuất bản…' : `Xuất bản ${coverage?.approved ?? 0}`}
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-ink-2">
                    Mỗi thẻ có thêm 3 câu ví dụ cho dân tech, văn phòng và sinh viên, bên cạnh câu gốc (đời thường). Người học chọn kiểu của mình trong Lexica, mục Tôi.
                </p>
                {coverage && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
                        <Stat label="Thẻ đã có câu" value={`${coverage.cardsWithApproved}/${coverage.cards}`} />
                        <Stat label="Chưa sinh" value={String(coverage.cardsWithout)} />
                        <Stat label="Chờ duyệt" value={String(coverage.pending)} />
                        <Stat label="Đã duyệt" value={String(coverage.approved)} />
                    </div>
                )}
            </Tools>
            {note && <p className="text-sm text-accent">{note}</p>}
            <ErrorNote error={error} />

            {groups.length === 0 && coverage && <p className="text-sm text-muted">Không có câu nào chờ duyệt.</p>}
            <BulkBar
                total={groups.length}
                selected={sel.selected.size}
                all={sel.all}
                onToggleAll={sel.setAll}
                onApprove={() => void reviewMany(groups.filter(g => sel.selected.has(g.card.id)), 'approve')}
                onReject={() => void reviewMany(groups.filter(g => sel.selected.has(g.card.id)), 'reject')}
                progress={progress}
                approveLabel="Duyệt thẻ"
                rejectLabel="Loại thẻ"
            />
            {groups.map(g => (
                <ReviewRow
                    key={g.card.id}
                    id={g.card.id}
                    focused={focused === g.card.id}
                    selected={sel.selected.has(g.card.id)}
                    onToggle={() => sel.toggle(g.card.id)}
                    actions={
                        g.variants.length > 1 ? (
                            <Button onClick={() => void approveAll(g)} disabled={!!busy || !!progress}>
                                Duyệt cả {g.variants.length}
                            </Button>
                        ) : undefined
                    }
                >
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-bold text-ink lowercase">{g.card.word}</span>
                        <span className="text-sm text-muted">{g.card.translation_hint}</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2 text-sm text-muted">
                        <Badge>Gốc</Badge>
                        <Scenario text={g.card.scenario} className="text-sm" />
                    </div>
                    <div className="mt-2 divide-y divide-line rounded-lg border border-line">
                        {g.variants.map(v => (
                            <VariantRow key={v.archetype} variant={v} busy={busy === `${v.card_id}:${v.archetype}`} onReview={(a, sc) => review(v, a, sc)} />
                        ))}
                    </div>
                </ReviewRow>
            ))}
            {groups.length > 0 && <KeyHint />}
        </div>
    );
}

function VariantRow({ variant, busy, onReview }: { variant: Variant; busy: boolean; onReview: (action: 'approve' | 'reject', scenario?: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(variant.scenario);
    return (
        <div className="flex items-start gap-3 px-3 py-2">
            <div className="min-w-0 flex-1">
                <Badge tone="accent">{LABEL[variant.archetype]}</Badge>
                {editing ? (
                    <>
                        <Textarea value={text} onChange={e => setText(e.target.value)} rows={2} className="mt-2 w-full" />
                        <div className="mt-2 flex gap-2">
                            <Button variant="primary" disabled={busy} onClick={() => { onReview('approve', text); setEditing(false); }}>Lưu và duyệt</Button>
                            <Button disabled={busy} onClick={() => { setEditing(false); setText(variant.scenario); }}>Huỷ</Button>
                        </div>
                    </>
                ) : (
                    <Scenario text={variant.scenario} className="mt-1 text-sm" />
                )}
            </div>
            {!editing && (
                <div className="flex shrink-0 gap-1.5">
                    <IconAction kind="edit" disabled={busy} onClick={() => setEditing(true)} />
                    <IconAction kind="reject" disabled={busy} onClick={() => onReview('reject')} />
                    <IconAction kind="approve" disabled={busy} onClick={() => onReview('approve')} />
                </div>
            )}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] uppercase text-subtle">{label}</p>
            <p className="text-lg text-ink">{value}</p>
        </div>
    );
}
