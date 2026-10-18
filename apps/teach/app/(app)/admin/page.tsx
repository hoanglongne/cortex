'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, UserPlus } from 'lucide-react';
import type { AdminOverview, OpenInvite } from '@cortex/classroom';
import { Badge, Button, Card, CardTitle, Drawer, Empty, ErrorNote, errorText, Field, inputClass, PageHeader } from '../../components/ui';
import InviteDrawer from '../../components/InviteDrawer';
import { api } from '../../lib/supabase';
import { useSession } from '../../lib/session';

/** System admin: centers and their seats, independent teachers, open invitations. */
export default function AdminPage() {
    const { me } = useSession();
    const [data, setData] = useState<AdminOverview | null>(null);
    const [invites, setInvites] = useState<OpenInvite[]>([]);
    const [creating, setCreating] = useState(false);
    const [invite, setInvite] = useState<{ kind: 'org_admin' | 'indie'; orgId: string | null; title: string } | null>(null);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            const [o, i] = await Promise.all([api.adminOverview(), api.openInvites(null)]);
            setData(o);
            setInvites(i);
        } catch (e) {
            setError(errorText(e));
        }
    }, []);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    if (!me?.admin) return <PageHeader title="Quản trị" sub="Chỉ quản trị Lexica vào được trang này." />;

    return (
        <>
            <PageHeader
                title="Quản trị"
                sub="Trung tâm, giáo viên độc lập và lời mời."
                actions={
                    <>
                        <Button kind="secondary" onClick={() => setInvite({ kind: 'indie', orgId: null, title: 'Mời giáo viên độc lập' })}>
                            <UserPlus className="h-4 w-4" /> Giáo viên độc lập
                        </Button>
                        <Button onClick={() => setCreating(true)}>
                            <Building2 className="h-4 w-4" /> Tạo trung tâm
                        </Button>
                    </>
                }
            />
            <ErrorNote error={error} />
            {!data ? (
                <div className="h-48 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
            ) : (
                <div className="space-y-5">
                    <Card flush>
                        <div className="px-5 pt-5">
                            <CardTitle>Trung tâm</CardTitle>
                        </div>
                        {data.orgs.length === 0 ? (
                            <div className="px-5 pb-5">
                                <Empty title="Chưa có trung tâm nào">Tạo trung tâm, đặt số chỗ, rồi gửi link mời cho quản lý của họ.</Empty>
                            </div>
                        ) : (
                            <ul className="divide-y divide-line">
                                {data.orgs.map((o) => (
                                    <OrgRow key={o.id} org={o} onChanged={load} onInvite={() => setInvite({ kind: 'org_admin', orgId: o.id, title: `Mời quản lý · ${o.name}` })} />
                                ))}
                            </ul>
                        )}
                    </Card>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Card>
                            <CardTitle>Giáo viên độc lập</CardTitle>
                            {data.indie.length === 0 ? (
                                <p className="text-sm text-muted">Chưa có ai. Giáo viên độc lập được tạo lớp riêng, tối đa 60 em mỗi lớp.</p>
                            ) : (
                                <ul className="divide-y divide-line">
                                    {data.indie.map((t) => (
                                        <li key={t.user_id} className="flex items-center justify-between gap-2 py-2.5">
                                            <span className="min-w-0 truncate text-sm text-ink">
                                                {t.email} <span className="text-muted">· {t.classes} lớp</span>
                                            </span>
                                            <Button
                                                kind="danger"
                                                size="sm"
                                                onClick={async () => {
                                                    if (!window.confirm(`Thu quyền tạo lớp của ${t.email}? Lớp hiện có vẫn giữ.`)) return;
                                                    await api.revokeIndie(t.user_id);
                                                    await load();
                                                }}
                                            >
                                                Thu quyền
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                        <Card>
                            <CardTitle>Lời mời chưa nhận</CardTitle>
                            {invites.length === 0 ? (
                                <p className="text-sm text-muted">Không có lời mời nào đang chờ.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {invites.map((i) => (
                                        <li key={i.token} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="min-w-0 truncate text-ink-2">
                                                <Badge>{i.kind === 'indie' ? 'Độc lập' : 'Quản lý'}</Badge> {i.org ?? ''} {i.note ? `· ${i.note}` : ''}
                                            </span>
                                            <Button
                                                kind="ghost"
                                                size="sm"
                                                onClick={async () => {
                                                    await api.revokeInvite(i.token);
                                                    await load();
                                                }}
                                            >
                                                Huỷ
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>
                </div>
            )}
            <CreateOrg
                open={creating}
                onClose={() => setCreating(false)}
                onCreated={async () => {
                    setCreating(false);
                    await load();
                }}
            />
            {invite && (
                <InviteDrawer
                    open
                    title={invite.title}
                    hint="Gửi link này cho người được mời. Link dùng một lần, hết hạn sau 7 ngày."
                    make={(note) => api.createInvite(invite.kind, invite.orgId, note)}
                    onClose={() => {
                        setInvite(null);
                        void load();
                    }}
                />
            )}
        </>
    );
}

function OrgRow({ org, onChanged, onInvite }: { org: AdminOverview['orgs'][number]; onChanged: () => void; onInvite: () => void }) {
    const [seats, setSeats] = useState(String(org.seats));
    return (
        <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
                <p className="font-medium text-ink">{org.name}</p>
                <p className="text-xs text-muted">
                    {org.admins} quản lý · {org.teachers} người · {org.classes} lớp · {org.used}/{org.seats} chỗ
                </p>
            </div>
            <div className="flex items-center gap-2">
                <input value={seats} onChange={(e) => setSeats(e.target.value.replace(/\D/g, ''))} className={`${inputClass} h-9 w-20`} aria-label={`Số chỗ của ${org.name}`} />
                <Button
                    kind="secondary"
                    size="sm"
                    disabled={Number(seats) === org.seats || !Number(seats)}
                    onClick={async () => {
                        await api.updateOrg(org.id, { seats: Number(seats) });
                        onChanged();
                    }}
                >
                    Lưu chỗ
                </Button>
                <Button size="sm" onClick={onInvite}>
                    Mời quản lý
                </Button>
            </div>
        </li>
    );
}

function CreateOrg({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
    const [name, setName] = useState('');
    const [seats, setSeats] = useState('30');
    const [error, setError] = useState('');
    return (
        <Drawer open={open} title="Tạo trung tâm" onClose={onClose}>
            <div className="space-y-4">
                <Field label="Tên trung tâm">
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} autoFocus />
                </Field>
                <Field label="Số chỗ học viên" hint="Tổng số học viên khác nhau trong mọi lớp của trung tâm.">
                    <input value={seats} onChange={(e) => setSeats(e.target.value.replace(/\D/g, ''))} className={inputClass} />
                </Field>
                <ErrorNote error={error} />
                <Button
                    className="w-full"
                    disabled={name.trim().length < 2 || !Number(seats)}
                    onClick={async () => {
                        try {
                            const r = await api.createOrg(name.trim());
                            await api.updateOrg(r.id, { seats: Number(seats) });
                            setName('');
                            onCreated();
                        } catch (e) {
                            setError(errorText(e));
                        }
                    }}
                >
                    Tạo trung tâm
                </Button>
            </div>
        </Drawer>
    );
}
