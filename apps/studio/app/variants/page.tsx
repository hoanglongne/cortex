'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, cached, errorText } from '../lib/api';
import Scenario from '../components/Scenario';
import { Badge, Button, Card, ErrorNote, Textarea } from '../components/ui';

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

    const review = (v: Variant, action: 'approve' | 'reject', scenario?: string) =>
        run(`${v.card_id}:${v.archetype}`, async () => {
            await api(`/variants/${v.card_id}/${v.archetype}`, { method: 'POST', body: { action, ...(scenario !== undefined ? { scenario } : {}) } });
        });

    const approveAll = (g: Group) =>
        run(`all:${g.card.id}`, async () => {
            for (const v of g.variants) await api(`/variants/${v.card_id}/${v.archetype}`, { method: 'POST', body: { action: 'approve' } });
        });

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <p className="text-sm text-ink-2">
                    Mỗi thẻ có thêm 3 câu ví dụ cho dân tech, văn phòng và sinh viên, bên cạnh câu gốc (đời thường). Người học chọn kiểu của mình trong Lexica, mục Tôi.
                </p>
                {coverage && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
                        <Stat label="Thẻ đã có câu" value={`${coverage.cardsWithApproved}/${coverage.cards}`} />
                        <Stat label="Chưa sinh" value={String(coverage.cardsWithout)} />
                        <Stat label="Chờ duyệt" value={String(coverage.pending)} />
                        <Stat label="Đã duyệt" value={String(coverage.approved)} />
                    </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={generate} disabled={!!busy}>
                        {busy === 'generate' ? 'Đang viết…' : 'Sinh câu cho 10 thẻ'}
                    </Button>
                    <Button onClick={publish} disabled={!!busy || !coverage?.approved}>
                        {busy === 'publish' ? 'Đang xuất bản…' : `Xuất bản ${coverage?.approved ?? 0} câu đã duyệt`}
                    </Button>
                </div>
                {note && <p className="mt-3 text-sm text-accent">{note}</p>}
            </Card>
            <ErrorNote error={error} />

            {groups.length === 0 && coverage && <p className="text-sm text-muted">Không có câu nào chờ duyệt.</p>}
            {groups.map(g => (
                <Card key={g.card.id}>
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-ink lowercase">{g.card.word}</span>
                        <span className="text-sm text-muted">{g.card.translation_hint}</span>
                        <span className="ml-auto font-mono text-[11px] text-subtle">{g.card.id}</span>
                    </div>
                    <div className="mt-2 rounded-lg bg-surface-2 p-3">
                        <Badge>Gốc · đời thường</Badge>
                        <Scenario text={g.card.scenario} className="mt-1 text-sm" />
                    </div>
                    <div className="mt-2 space-y-2">
                        {g.variants.map(v => (
                            <VariantRow key={v.archetype} variant={v} busy={busy === `${v.card_id}:${v.archetype}`} onReview={(a, s) => review(v, a, s)} />
                        ))}
                    </div>
                    {g.variants.length > 1 && (
                        <Button className="mt-3" onClick={() => approveAll(g)} disabled={!!busy}>
                            Duyệt cả {g.variants.length} câu
                        </Button>
                    )}
                </Card>
            ))}
        </div>
    );
}

function VariantRow({ variant, busy, onReview }: { variant: Variant; busy: boolean; onReview: (action: 'approve' | 'reject', scenario?: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(variant.scenario);
    return (
        <div className="rounded-lg border border-line p-3">
            <Badge tone="accent">{LABEL[variant.archetype]}</Badge>
            {editing ? (
                <Textarea value={text} onChange={e => setText(e.target.value)} rows={2} className="mt-2 w-full" />
            ) : (
                <Scenario text={variant.scenario} className="mt-1 text-sm" />
            )}
            <div className="mt-2 flex flex-wrap gap-2">
                {editing ? (
                    <>
                        <Button variant="primary" disabled={busy} onClick={() => onReview('approve', text)}>Lưu và duyệt</Button>
                        <Button disabled={busy} onClick={() => { setEditing(false); setText(variant.scenario); }}>Huỷ</Button>
                    </>
                ) : (
                    <>
                        <Button variant="primary" disabled={busy} onClick={() => onReview('approve')}>Duyệt</Button>
                        <Button disabled={busy} onClick={() => setEditing(true)}>Sửa</Button>
                        <Button disabled={busy} onClick={() => onReview('reject')}>Loại</Button>
                    </>
                )}
            </div>
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
