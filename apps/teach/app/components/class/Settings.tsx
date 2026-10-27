'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Board } from '@cortex/classroom';
import { Button, Card, CardTitle, ErrorNote, errorText, Field, inputClass } from '../ui';
import { api } from '../../lib/supabase';
import { useSession } from '../../lib/session';
import { moduleFor, MODULES } from '../../modules';
import { useClassParents } from '../../lib/useParents';
import { localDay } from '../../lib/forecasts';
import { lastWeek } from '@cortex/classroom';

/** The class's name, its apps and their settings; the leaderboard switch (off by default); archiving. */
export default function Settings({ board, onChanged }: { board: Board; onChanged: () => void }) {
    const c = board.class;
    const router = useRouter();
    const { me } = useSession();
    const [name, setName] = useState(c.name);
    const [apps, setApps] = useState<string[]>(c.apps);
    const [settings, setSettings] = useState<Record<string, unknown>>(c.settings);
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const available = (me?.apps ?? []).filter((a) => MODULES[a.id]);

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
        <div className="max-w-xl space-y-8">
            <Card>
                <CardTitle>Thông tin lớp</CardTitle>
                <div className="space-y-8">
                    <Field label="Tên lớp">
                        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
                    </Field>
                    <Field label="Ứng dụng của lớp" hint="Học viên dùng các ứng dụng này; bài giao và tiến độ theo từng ứng dụng.">
                        <div className="space-y-2">
                            {available.map((a) => (
                                <label key={a.id} className="flex items-center gap-3 rounded-xl border border-line-strong bg-surface px-3 py-2.5">
                                    <input
                                        type="checkbox"
                                        checked={apps.includes(a.id)}
                                        onChange={(e) => setApps((prev) => (e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id)))}
                                        className="h-5 w-5 accent-[var(--color-accent)]"
                                    />
                                    <span className="text-ink">{a.name}</span>
                                    <span className="truncate text-xs text-muted">{MODULES[a.id].core.tagline}</span>
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
                    <Button onClick={() => void save({ name, apps, settings })} disabled={busy || name.trim().length < 2 || apps.length === 0}>
                        {saved ? 'Đã lưu' : 'Lưu'}
                    </Button>
                </div>
            </Card>
            <ParentPin classId={c.id} />
            <Card>
                <CardTitle>Bảng xếp hạng trong lớp</CardTitle>
                <p className="text-sm text-muted">Học viên thấy lớp xếp theo tiến bộ thật trong ứng dụng (với Lexica: số từ Dùng), không theo điểm. Tắt nếu lớp bạn không hợp với so sánh.</p>
                <label className="mt-3 flex items-center gap-3">
                    <input type="checkbox" checked={c.leaderboard} onChange={(e) => void save({ leaderboard: e.target.checked })} disabled={busy} className="h-5 w-5 accent-[var(--color-accent)]" />
                    <span className="text-ink">{c.leaderboard ? 'Đang bật' : 'Đang tắt'}</span>
                </label>
                {c.leaderboard && c.apps.length > 1 && (
                    <Field label="Xếp theo ứng dụng">
                        <select value={c.leaderboard_app ?? ''} onChange={(e) => void save({ leaderboardApp: e.target.value })} className={inputClass}>
                            {c.apps.map((a) => (
                                <option key={a} value={a}>
                                    {moduleFor(a)?.core.name ?? a}
                                </option>
                            ))}
                        </select>
                    </Field>
                )}
            </Card>
            <Card>
                <CardTitle>Lưu trữ lớp</CardTitle>
                <p className="text-sm text-muted">Lớp đã kết thúc: ẩn khỏi danh sách của bạn và của học viên, không còn vào được bằng mã. Tiến độ học của các em vẫn giữ trong ứng dụng.</p>
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

/** Parents' links ask for a 4-digit PIN (off by default). Links made before keep how they were made. */
function ParentPin({ classId }: { classId: string }) {
    const [week] = useState(() => lastWeek(localDay(Date.now())));
    const { parents, reload } = useClassParents(classId, week);
    const [error, setError] = useState('');
    if (!parents) return null;
    return (
        <Card>
            <CardTitle>Link cho phụ huynh</CardTitle>
            <p className="text-sm text-ink-2">Mỗi em có một link riêng cho phụ huynh (lấy ở trang của em). Bật mã PIN nếu trung tâm muốn chắc chỉ phụ huynh mở được.</p>
            <label className="mt-3 flex items-center gap-2 text-ink">
                <input
                    type="checkbox"
                    checked={parents.pin}
                    onChange={async (e) => {
                        setError('');
                        try {
                            await api.setParentPin(classId, e.target.checked);
                            await reload();
                        } catch (err) {
                            setError(errorText(err));
                        }
                    }}
                    className="h-5 w-5 accent-[var(--color-accent)]"
                />
                {parents.pin ? 'Link mới cần mã PIN 4 số' : 'Không cần mã PIN'}
            </label>
            <p className="mt-1 text-xs text-muted">Chỉ áp dụng cho link tạo sau khi đổi. Sai mã 5 lần thì link tạm khoá 15 phút.</p>
            <ErrorNote error={error} />
        </Card>
    );
}
