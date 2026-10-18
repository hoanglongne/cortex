'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Board } from '@cortex/lexica-classes';
import { Button, Card, CardTitle, ErrorNote, errorText, Field, inputClass } from '../ui';
import { api } from '../../lib/supabase';
import { BRANCH_LABEL, LEVELS } from '../../lib/labels';

/** The class's name, branch, level; the leaderboard switch (off by default); archiving. */
export default function Settings({ board, onChanged }: { board: Board; onChanged: () => void }) {
    const c = board.class;
    const router = useRouter();
    const [name, setName] = useState(c.name);
    const [branch, setBranch] = useState(c.branch);
    const [level, setLevel] = useState(c.level ?? '');
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const save = async (patch: Parameters<typeof api.updateClass>[1]) => {
        setBusy(true);
        setError('');
        try {
            await api.updateClass(c.id, patch);
            setSaved(true);
            setTimeout(() => setSaved(false), 1600);
            onChanged();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-xl space-y-5">
            <Card>
                <CardTitle>Thông tin lớp</CardTitle>
                <div className="space-y-4">
                    <Field label="Tên lớp">
                        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
                    </Field>
                    <Field label="Nhánh học">
                        <select value={branch} onChange={(e) => setBranch(e.target.value as 'cert' | 'talk')} className={inputClass}>
                            {(['cert', 'talk'] as const).map((b) => (
                                <option key={b} value={b}>
                                    {BRANCH_LABEL[b]}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Level">
                        <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
                            <option value="">Không đặt</option>
                            {LEVELS.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Button onClick={() => void save({ name, branch, level })} disabled={busy || name.trim().length < 2}>
                        {saved ? 'Đã lưu' : 'Lưu'}
                    </Button>
                </div>
            </Card>
            <Card>
                <CardTitle>Bảng xếp hạng trong lớp</CardTitle>
                <p className="text-sm text-muted">Học viên thấy lớp xếp theo số từ Dùng (nói được), không theo điểm. Tắt nếu lớp bạn không hợp với so sánh.</p>
                <label className="mt-3 flex items-center gap-3">
                    <input type="checkbox" checked={Boolean(c.leaderboard)} onChange={(e) => void save({ leaderboard: e.target.checked })} disabled={busy} className="h-5 w-5 accent-[var(--color-accent)]" />
                    <span className="text-ink">{c.leaderboard ? 'Đang bật' : 'Đang tắt'}</span>
                </label>
            </Card>
            <Card>
                <CardTitle>Lưu trữ lớp</CardTitle>
                <p className="text-sm text-muted">Lớp đã kết thúc: ẩn khỏi danh sách của bạn và của học viên, không còn vào được bằng mã. Tiến độ học của các em vẫn giữ trong Lexica.</p>
                <Button
                    kind="danger"
                    className="mt-3"
                    onClick={async () => {
                        if (!window.confirm(`Lưu trữ lớp “${c.name}”?`)) return;
                        await save({ archived: true });
                        router.push('/classes');
                    }}
                >
                    Lưu trữ lớp
                </Button>
            </Card>
            <ErrorNote error={error} />
        </div>
    );
}
