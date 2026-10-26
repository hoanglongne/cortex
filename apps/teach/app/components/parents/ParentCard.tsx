'use client';

import { useState } from 'react';
import { lastWeek, parentLink, type Board } from '@cortex/classroom';
import { Button, Card, CardTitle, CopyChip, ErrorNote, errorText } from '../ui';
import { api } from '../../lib/supabase';
import { TEACH_URL } from '../../lib/config';
import { localDay } from '../../lib/forecasts';
import { useClassParents } from '../../lib/useParents';

/**
 * A student's parent link (docs/TEACH_PLAN.md 3.1): get it, copy it for
 * Zalo, make a new one (the old stops working). A PIN, when the class uses
 * them, is shown once when the link is made.
 */
export default function ParentCard({ board, userId, name }: { board: Board; userId: string; name: string }) {
    const [week] = useState(() => lastWeek(localDay(Date.now())));
    const { parents, error, reload } = useClassParents(board.class.id, week);
    const [fresh, setFresh] = useState<{ code: string; pin?: string } | null>(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const link = fresh ?? (parents?.links[userId] ? { code: parents.links[userId].code } : null);
    const url = link ? parentLink(TEACH_URL, link.code) : '';
    const report = parents?.reports[userId];

    const make = async () => {
        if (link && !window.confirm('Tạo link mới? Link cũ sẽ không mở được nữa.')) return;
        setBusy(true);
        setErr('');
        try {
            setFresh(await api.newParentLink(board.class.id, userId));
            await reload();
        } catch (e) {
            setErr(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card>
            <CardTitle>Phụ huynh</CardTitle>
            {!parents ? (
                <div className="h-16 animate-pulse rounded-xl bg-surface-2" />
            ) : link ? (
                <>
                    <p className="break-all rounded-xl bg-surface-2 px-3 py-2 font-mono text-xs text-ink-2">{url}</p>
                    {fresh?.pin && (
                        <p className="mt-2 text-sm text-ink">
                            Mã PIN: <b className="font-mono tabular">{fresh.pin}</b> <span className="text-xs text-muted">· chỉ hiện lần này, gửi kèm link</span>
                        </p>
                    )}
                    {!fresh && parents.links[userId]?.pin && <p className="mt-2 text-xs text-muted">Link có mã PIN. Quên mã thì tạo link mới.</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <CopyChip text={`Phụ huynh em ${name}: ${url}${fresh?.pin ? ` (mã PIN ${fresh.pin})` : ''}`} label="Chép link gửi Zalo" />
                        <Button kind="ghost" size="sm" onClick={make} disabled={busy}>
                            Tạo link mới
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                        {report ? (report.opens ? `Báo cáo tuần trước: phụ huynh đã xem ${report.opens} lần.` : 'Báo cáo tuần trước đã duyệt, phụ huynh chưa xem.') : 'Tuần trước chưa duyệt báo cáo (tab Báo cáo của lớp).'}
                    </p>
                </>
            ) : (
                <>
                    <p className="text-sm text-ink-2">Phụ huynh mở link riêng, không cần tài khoản, chỉ thấy các báo cáo tuần bạn đã duyệt. Không thấy ghi chú riêng.</p>
                    <Button size="sm" className="mt-3" onClick={make} disabled={busy}>
                        Lấy link phụ huynh
                    </Button>
                </>
            )}
            <ErrorNote error={error || err} />
        </Card>
    );
}
