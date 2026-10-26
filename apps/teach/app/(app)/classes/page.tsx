'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Users } from 'lucide-react';
import { studentState, type AppId } from '@cortex/classroom';
import { Badge, Button, Card, Drawer, Empty, ErrorNote, errorText, Field, inputClass, PageHeader } from '../../components/ui';
import AppDot from '../../components/class/AppDot';
import { api } from '../../lib/supabase';
import { useSession } from '../../lib/session';
import { useTeaching } from '../../lib/teaching';
import { moduleFor, MODULES } from '../../modules';

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
                    Một lớp có tên và các ứng dụng học viên sẽ dùng (ví dụ Lexica cho từ vựng). Tạo xong, bạn gửi link mời cho học viên.
                </Empty>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {data.classes.map((c) => {
                        const b = data.boards[c.id];
                        const nudge = b?.students.filter((s) => studentState(s, now) === 'nudge').length ?? 0;
                        const first = moduleFor(c.apps[0]);
                        return (
                            <Link key={c.id} href={`/classes/${c.id}`} className="block rounded-[var(--radius-card)] transition-transform hover:-translate-y-0.5">
                                <Card className="h-full">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[17px] font-semibold text-ink">{c.name}</p>
                                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                {c.apps.map((a) => (
                                                    <AppDot key={a} app={a} />
                                                ))}
                                                <span className="text-xs text-muted">{c.org ?? 'Lớp riêng'}</span>
                                            </p>
                                        </div>
                                        <span className="flex items-center gap-1 text-sm text-muted tabular">
                                            <Users className="h-4 w-4" /> {c.members}
                                        </span>
                                    </div>
                                    <div className="mt-4">{b && b.students.length > 0 && first ? <first.ClassSummary board={b} /> : <p className="text-sm text-muted">Chưa có học viên. Mở lớp để lấy link mời.</p>}</div>
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
    const available = (me?.apps ?? []).filter((a) => MODULES[a.id]);
    const [name, setName] = useState('');
    const [apps, setApps] = useState<AppId[]>(available.length === 1 ? [available[0].id] : []);
    const [settings, setSettings] = useState<Record<AppId, unknown>>({});
    const [place, setPlace] = useState(places[0]?.id ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const create = async () => {
        setBusy(true);
        setError('');
        try {
            const r = await api.createClass(name.trim(), apps, settings, place || null);
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
            <div className="space-y-8">
                <Field label="Tên lớp" hint="Học viên sẽ thấy tên này, ví dụ “IELTS tối 2-4-6”.">
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} autoFocus />
                </Field>
                <Field label="Ứng dụng học viên sẽ dùng">
                    <div className="space-y-2">
                        {available.map((a) => (
                            <label key={a.id} className={`flex items-start gap-3 rounded-xl border p-3 ${apps.includes(a.id) ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface'}`}>
                                <input
                                    type="checkbox"
                                    checked={apps.includes(a.id)}
                                    onChange={(e) => setApps((prev) => (e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id)))}
                                    className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                                />
                                <span>
                                    <span className="block font-medium text-ink">{a.name}</span>
                                    <span className="block text-sm text-muted">{MODULES[a.id].core.tagline}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </Field>
                {apps.map((app) => {
                    const m = moduleFor(app);
                    return m ? (
                        <div key={app} className="rounded-xl border border-line p-4">
                            <p className="mb-3 text-sm font-medium text-ink">{m.core.name}</p>
                            <m.SettingsFields value={settings[app]} onChange={(v) => setSettings((s) => ({ ...s, [app]: v }))} />
                        </div>
                    ) : null;
                })}
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
                <Button onClick={() => void create()} disabled={busy || name.trim().length < 2 || apps.length === 0} className="w-full">
                    {busy ? 'Đang tạo…' : 'Tạo lớp'}
                </Button>
            </div>
        </Drawer>
    );
}
