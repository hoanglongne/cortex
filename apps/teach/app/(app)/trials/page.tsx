'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { classJoinLink, trialInviteMessage, trialLevelLabel, trialLink, type Trial, type TrialGuest, type TrialGuestStatus } from '@cortex/classroom';
import QrCode from '../../components/arena/QrCode';
import { Badge, Button, Card, CopyChip, CopyField, Empty, ErrorNote, Field, PageHeader, errorText, inputClass } from '../../components/ui';
import { LEXICA_URL } from '../../lib/config';
import { useSession } from '../../lib/session';
import { api } from '../../lib/supabase';
import { useTeaching } from '../../lib/teaching';

const STATUS: Record<TrialGuestStatus, string> = { new: 'Mới', invited: 'Đã mời', enrolled: 'Đã ghi danh' };
const tone = (s: TrialGuestStatus) => (s === 'enrolled' ? 'accent' : s === 'invited' ? 'lilac' : 'warm');

/**
 * "Buổi học thử" (docs/TEACH_TRIAL_PLAN.md): open a trial, show the code and QR,
 * and see who came and how their placement test went. Guests need no account.
 */
export default function TrialsPage() {
    const { me } = useSession();
    const { data } = useTeaching();
    const org = me?.orgs[0] ?? null;
    const [trials, setTrials] = useState<Trial[] | null>(null);
    const [title, setTitle] = useState('');
    const [classId, setClassId] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!org) return;
        try {
            setTrials(await api.trialsList(org.id));
        } catch (e) {
            setError(errorText(e));
        }
    }, [org]);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    const classes = useMemo(() => (data?.classes ?? []).filter((c) => c.org_id === org?.id), [data, org]);

    if (!org) {
        return (
            <>
                <PageHeader title="Buổi học thử" />
                <Empty title="Cần thuộc một trung tâm">Buổi học thử mở trong một trung tâm. Tạo trung tâm của bạn ở trang đăng ký, hoặc nhờ quản lý mời bạn.</Empty>
            </>
        );
    }

    const create = async () => {
        setBusy(true);
        setError('');
        try {
            await api.trialCreate(org.id, title, classId || null);
            setTitle('');
            await load();
        } catch (e) {
            setError(errorText(e));
        }
        setBusy(false);
    };
    const act = async (fn: () => Promise<unknown>) => {
        setError('');
        try {
            await fn();
            await load();
        } catch (e) {
            setError(errorText(e));
        }
    };

    return (
        <>
            <PageHeader title="Buổi học thử" sub="Chiếu mã QR hoặc gửi link. Phụ huynh và học viên vào làm bài xếp lớp, không cần tài khoản." />
            <ErrorNote error={error} />
            <Card className="mb-8">
                <form
                    className="grid gap-3 sm:grid-cols-[1fr_14rem_auto] sm:items-end"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void create();
                    }}
                >
                    <Field label="Tên buổi học thử">
                        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Học thử IELTS thứ Bảy" maxLength={80} />
                    </Field>
                    <Field label="Mời vào lớp (không bắt buộc)">
                        <select className={inputClass} value={classId} onChange={(e) => setClassId(e.target.value)}>
                            <option value="">Chưa chọn lớp</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Button type="submit" disabled={busy || title.trim().length < 2}>
                        <Plus className="h-4 w-4" /> Mở buổi học thử
                    </Button>
                </form>
            </Card>

            {trials === null ? (
                <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
            ) : trials.length === 0 ? (
                <Empty title="Chưa có buổi học thử nào">Mở một buổi, chiếu mã QR lên màn hình, và xem ai vào làm bài.</Empty>
            ) : (
                <div className="space-y-8">
                    {trials.map((t) => (
                        <TrialCard key={t.id} trial={t} center={org.name} onClose={() => act(() => api.trialClose(t.id))} onGuest={(g, patch) => act(() => api.trialGuestUpdate(g.id, patch))} />
                    ))}
                </div>
            )}
        </>
    );
}

function TrialCard({ trial: t, center, onClose, onGuest }: { trial: Trial; center: string; onClose: () => void; onGuest: (g: TrialGuest, patch: { status?: TrialGuestStatus; remove?: boolean }) => void }) {
    const link = LEXICA_URL ? trialLink(LEXICA_URL, t.code) : '';
    const classLink = LEXICA_URL && t.class_code ? classJoinLink(LEXICA_URL, t.class_code) : null;
    return (
        <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-ink">{t.title}</h2>
                        {t.closed ? <Badge>Đã đóng</Badge> : <Badge tone="accent">Đang mở</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                        Mã <b className="tabular text-ink-2">{t.code}</b>
                        {t.class_name && <> · mời vào lớp {t.class_name}</>} · {t.guests.length} khách
                    </p>
                    {link && !t.closed && (
                        <div className="mt-3 max-w-md">
                            <CopyField value={link} label="Link cho khách" />
                        </div>
                    )}
                    {!t.closed && (
                        <div className="mt-3">
                            <Button kind="ghost" size="sm" onClick={onClose}>
                                Đóng buổi này
                            </Button>
                        </div>
                    )}
                </div>
                {link && !t.closed && <QrCode text={link} label={`Mã QR của ${t.title}`} className="h-36 w-36 rounded-[10px] border border-line bg-white" />}
            </div>

            {t.guests.length > 0 && (
                <ul className="mt-5 divide-y divide-line border-t border-line">
                    {t.guests.map((g) => (
                        <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                                <p className="text-[15px] font-medium text-ink">
                                    {g.name} <Badge tone={tone(g.status)}>{STATUS[g.status]}</Badge>
                                </p>
                                <p className="text-sm text-muted">
                                    {trialLevelLabel(g.level)}
                                    {g.score !== null && <> · {g.score} điểm vốn từ</>}
                                    {g.phone && <> · {g.phone}</>}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <CopyChip text={trialInviteMessage(g, center, classLink)} label="Chép tin mời vào lớp" primary={g.status === 'new'} />
                                {g.status !== 'invited' && g.status !== 'enrolled' && (
                                    <Button kind="ghost" size="sm" onClick={() => onGuest(g, { status: 'invited' })}>
                                        Đã mời
                                    </Button>
                                )}
                                {g.status !== 'enrolled' && (
                                    <Button kind="ghost" size="sm" onClick={() => onGuest(g, { status: 'enrolled' })}>
                                        Đã ghi danh
                                    </Button>
                                )}
                                <Button
                                    kind="danger"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm(`Xoá ${g.name} và số điện thoại khỏi danh sách?`)) onGuest(g, { remove: true });
                                    }}
                                >
                                    Xoá
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
