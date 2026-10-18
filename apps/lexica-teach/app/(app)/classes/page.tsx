'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Users } from 'lucide-react';
import { studentState } from '@cortex/lexica-classes';
import { Badge, Button, Card, Drawer, Empty, ErrorNote, errorText, Field, inputClass, PageHeader, StepBar } from '../../components/ui';
import { api } from '../../lib/supabase';
import { useSession } from '../../lib/session';
import { useTeaching } from '../../lib/teaching';
import { BRANCH_LABEL, LEVELS, levelLabel } from '../../lib/labels';

/** "Lớp của tôi": one card per class with its health in a line; making a class is a side panel. */
export default function ClassesPage() {
    return (
        <Suspense>
            <Classes />
        </Suspense>
    );
}

function Classes() {
    const { data, reload } = useTeaching();
    const params = useSearchParams();
    const router = useRouter();
    const [creating, setCreating] = useState(params.get('new') === '1');
    const [now] = useState(() => Date.now());

    return (
        <>
            <PageHeader
                title="Lớp của tôi"
                sub={data ? `${data.classes.length} lớp đang dạy` : undefined}
                actions={
                    <Button onClick={() => setCreating(true)}>
                        <Plus className="h-4 w-4" /> Tạo lớp
                    </Button>
                }
            />
            {!data ? (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
                    <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
                </div>
            ) : data.classes.length === 0 ? (
                <Empty title="Chưa có lớp nào" action={<Button onClick={() => setCreating(true)}>Tạo lớp đầu tiên</Button>}>
                    Một lớp có tên, nhánh học (Chứng chỉ hoặc Giao tiếp) và level. Tạo xong, bạn gửi link mời cho học viên.
                </Empty>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {data.classes.map((c) => {
                        const b = data.boards[c.id];
                        const states = b?.students.map((s) => studentState(s, now)) ?? [];
                        const nudge = states.filter((s) => s === 'nudge').length;
                        const total = b?.students.reduce((acc, s) => ({ hieu: (acc.hieu ?? 0) + (s.counts.hieu ?? 0), nho: (acc.nho ?? 0) + (s.counts.nho ?? 0), gap: (acc.gap ?? 0) + (s.counts.gap ?? 0), dung: (acc.dung ?? 0) + (s.counts.dung ?? 0) }), {} as Record<string, number>);
                        return (
                            <Link key={c.id} href={`/classes/${c.id}`} className="block rounded-[var(--radius-card)] transition-transform hover:-translate-y-0.5">
                                <Card className="h-full">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[17px] font-semibold text-ink">{c.name}</p>
                                            <p className="mt-0.5 text-sm text-muted">
                                                {BRANCH_LABEL[c.branch]}
                                                {levelLabel(c.level) ? ` · ${levelLabel(c.level)}` : ''}
                                                {c.org ? ` · ${c.org}` : ' · Lớp riêng'}
                                            </p>
                                        </div>
                                        <span className="flex items-center gap-1 text-sm text-muted tabular">
                                            <Users className="h-4 w-4" /> {c.members}
                                        </span>
                                    </div>
                                    <div className="mt-4">{total && b && b.students.length > 0 ? <StepBar counts={{ hieu: Math.round(total.hieu / b.students.length), nho: Math.round(total.nho / b.students.length), gap: Math.round(total.gap / b.students.length), dung: Math.round(total.dung / b.students.length) }} /> : <p className="text-sm text-muted">Chưa có học viên. Mở lớp để lấy link mời.</p>}</div>
                                    {b && b.students.length > 0 && <p className="mt-1 text-xs text-subtle">trung bình mỗi em</p>}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {nudge > 0 && <Badge tone="warm">{nudge} em cần nhắc</Badge>}
                                        {c.assignments[0] && <Badge>Bài mới nhất: {c.assignments[0].title}</Badge>}
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
            <CreateClass
                open={creating}
                onClose={() => setCreating(false)}
                onCreated={async (id) => {
                    await reload();
                    router.push(`/classes/${id}?tab=students&welcome=1`);
                }}
            />
        </>
    );
}

function CreateClass({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
    const { me } = useSession();
    const places = [...(me?.orgs.map((o) => ({ id: o.id, label: o.name })) ?? []), ...(me?.indie ? [{ id: '', label: 'Lớp riêng (không thuộc trung tâm)' }] : [])];
    const [name, setName] = useState('');
    const [branch, setBranch] = useState<'cert' | 'talk'>('cert');
    const [level, setLevel] = useState('');
    const [place, setPlace] = useState(places[0]?.id ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const create = async () => {
        setBusy(true);
        setError('');
        try {
            const r = await api.createClass(name.trim(), branch, level || null, place || null);
            setName('');
            onCreated(r.id);
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Drawer open={open} title="Tạo lớp" onClose={onClose}>
            <div className="space-y-5">
                <Field label="Tên lớp" hint="Học viên sẽ thấy tên này, ví dụ “IELTS tối 2-4-6”.">
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} autoFocus />
                </Field>
                <Field label="Nhánh học">
                    <div className="grid grid-cols-2 gap-2">
                        {(['cert', 'talk'] as const).map((b) => (
                            <button key={b} onClick={() => setBranch(b)} className={`h-11 rounded-xl border text-sm ${branch === b ? 'border-accent bg-accent-soft font-semibold text-accent-strong' : 'border-line-strong bg-surface text-ink-2'}`}>
                                {BRANCH_LABEL[b]}
                            </button>
                        ))}
                    </div>
                </Field>
                <Field label="Level (không bắt buộc)">
                    <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
                        <option value="">Không đặt</option>
                        {LEVELS.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.label}
                            </option>
                        ))}
                    </select>
                </Field>
                {places.length > 1 && (
                    <Field label="Thuộc">
                        <select value={place} onChange={(e) => setPlace(e.target.value)} className={inputClass}>
                            {places.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                )}
                <ErrorNote error={error} />
                <Button onClick={() => void create()} disabled={busy || name.trim().length < 2} className="w-full">
                    {busy ? 'Đang tạo…' : 'Tạo lớp'}
                </Button>
            </div>
        </Drawer>
    );
}
