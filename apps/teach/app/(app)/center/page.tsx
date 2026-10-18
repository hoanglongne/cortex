'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { OpenInvite, OrgOverview } from '@cortex/classroom';
import { Badge, Button, Card, CardTitle, ErrorNote, errorText, inputClass, PageHeader } from '../../components/ui';
import InviteDrawer from '../../components/InviteDrawer';
import { moduleFor } from '../../modules';
import { api } from '../../lib/supabase';
import { useSession } from '../../lib/session';

/** "Trung tâm có ổn không?": seats, people, classes; inviting a teacher is a link. */
export default function CenterPage() {
    const { me } = useSession();
    const orgs = me?.admin ? me.orgs : (me?.orgs.filter((o) => o.role === 'admin') ?? []);
    const [orgId, setOrgId] = useState(orgs[0]?.id ?? '');
    if (!orgId) return <PageHeader title="Trung tâm" sub="Bạn chưa quản lý trung tâm nào." />;
    return (
        <>
            {orgs.length > 1 && (
                <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className={`${inputClass} mb-4 max-w-xs`} aria-label="Chọn trung tâm">
                    {orgs.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.name}
                        </option>
                    ))}
                </select>
            )}
            <Center key={orgId} orgId={orgId} />
        </>
    );
}

function Center({ orgId }: { orgId: string }) {
    const [org, setOrg] = useState<OrgOverview | null>(null);
    const [invites, setInvites] = useState<OpenInvite[]>([]);
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            const [o, i] = await Promise.all([api.orgOverview(orgId), api.openInvites(orgId)]);
            setOrg(o);
            setInvites(i);
        } catch (e) {
            setError(errorText(e));
        }
    }, [orgId]);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    if (!org) return <>{error ? <ErrorNote error={error} /> : <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />}</>;
    const full = org.used / Math.max(1, org.seats);

    return (
        <>
            <PageHeader
                title={org.name}
                sub={`${org.classes.length} lớp · ${org.people.filter((p) => p.role === 'teacher').length} giáo viên`}
                actions={
                    <Button onClick={() => setInviting(true)}>
                        <UserPlus className="h-4 w-4" /> Mời giáo viên
                    </Button>
                }
            />
            <ErrorNote error={error} />
            <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
                <div className="space-y-5">
                    <Card tone={full >= 0.9 ? 'warm' : undefined}>
                        <CardTitle>Chỗ học viên</CardTitle>
                        <p className="text-2xl font-semibold text-ink tabular">
                            {org.used}
                            <span className="text-base font-normal text-muted"> / {org.seats}</span>
                        </p>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                            <div className={`h-full rounded-full ${full >= 0.9 ? 'bg-warm' : 'bg-accent'}`} style={{ width: `${Math.min(100, full * 100)}%` }} />
                        </div>
                        {full >= 0.9 && <p className="mt-2 text-sm text-warm">Sắp hết chỗ. Liên hệ đội Lexica để thêm chỗ.</p>}
                    </Card>
                    <Card>
                        <CardTitle>Người trong trung tâm</CardTitle>
                        <ul className="divide-y divide-line">
                            {org.people.map((p) => (
                                <li key={p.user_id} className="flex items-center justify-between gap-2 py-2.5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm text-ink">{p.email}</p>
                                        <p className="text-xs text-muted">
                                            {p.role === 'admin' ? 'Quản lý' : 'Giáo viên'} · {p.classes} lớp
                                        </p>
                                    </div>
                                    {p.role === 'teacher' && (
                                        <Button
                                            kind="danger"
                                            size="sm"
                                            onClick={async () => {
                                                if (!window.confirm(`Gỡ ${p.email} khỏi trung tâm? Các lớp của họ vẫn còn, quản lý trung tâm tiếp tục quản lý.`)) return;
                                                try {
                                                    await api.removeMember(orgId, p.user_id);
                                                    await load();
                                                } catch (e) {
                                                    setError(errorText(e));
                                                }
                                            }}
                                        >
                                            Gỡ
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {invites.length > 0 && (
                            <div className="mt-4 border-t border-line pt-3">
                                <p className="mb-2 text-xs font-medium text-muted">Lời mời chưa nhận</p>
                                <ul className="space-y-2">
                                    {invites.map((i) => (
                                        <li key={i.token} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="truncate text-ink-2">{i.note || 'Giáo viên'} · hết hạn {new Date(i.expires_at).toLocaleDateString('vi-VN')}</span>
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
                            </div>
                        )}
                    </Card>
                </div>
                <Card flush>
                    <div className="px-5 pt-5">
                        <CardTitle>Các lớp</CardTitle>
                    </div>
                    <ul className="divide-y divide-line">
                        {org.classes.map((c) => {
                            const quiet = c.members > 0 && c.active_week / c.members < 0.5;
                            return (
                                <li key={c.id}>
                                    <Link href={`/classes/${c.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-2/60">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-ink">{c.name}</p>
                                            <p className="truncate text-xs text-muted">
                                                {c.teacher ?? '—'} · {c.members} em · {c.apps.map((a) => moduleFor(a)?.core.name ?? a).join(', ')}
                                            </p>
                                        </div>
                                        <Badge tone={quiet ? 'warm' : 'accent'}>
                                            {c.active_week}/{c.members} học tuần này
                                        </Badge>
                                    </Link>
                                </li>
                            );
                        })}
                        {org.classes.length === 0 && <li className="px-5 py-6 text-sm text-muted">Chưa có lớp. Giáo viên tạo lớp trong “Lớp của tôi”.</li>}
                    </ul>
                </Card>
            </div>
            <InviteDrawer
                open={inviting}
                onClose={() => {
                    setInviting(false);
                    void load();
                }}
                make={(note) => api.createInvite('org_teacher', orgId, note)}
                title="Mời giáo viên"
                hint="Gửi link này cho giáo viên. Link dùng một lần, hết hạn sau 7 ngày."
            />
        </>
    );
}
