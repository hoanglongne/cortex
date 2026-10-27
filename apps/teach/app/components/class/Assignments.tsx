'use client';

import { useState } from 'react';
import { Plus, Presentation, Trash2 } from 'lucide-react';
import { assignmentStudents, daysUntil, type Board } from '@cortex/classroom';
import { Badge, Button, Card, Drawer, Empty, ErrorNote, errorText, LinkButton } from '../ui';
import { api } from '../../lib/supabase';
import { moduleFor, modulesOf, type ModuleUI } from '../../modules';
import AppDot from './AppDot';
import { dueText } from './Overview';
import Suggestions from './Suggestions';

/** "Giao gì, tới đâu rồi?": every app's work, newest first, each with its due date and how far the class got. */
export default function Assignments({ board, onChanged, startOpen }: { board: Board; onChanged: () => void; startOpen: boolean }) {
    const mods = modulesOf(board);
    const [picking, setPicking] = useState(startOpen);
    const [mod, setMod] = useState<ModuleUI | null>(startOpen && mods.length === 1 ? mods[0] : null);
    const [error, setError] = useState('');
    const many = board.class.apps.length > 1;
    const open = () => {
        setPicking(true);
        setMod(mods.length === 1 ? mods[0] : null);
    };
    const close = () => {
        setPicking(false);
        setMod(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={open} disabled={mods.length === 0}>
                    <Plus className="h-4 w-4" /> Giao bài mới
                </Button>
            </div>
            <ErrorNote error={error} />
            <Suggestions board={board} onChanged={onChanged} />
            {board.assignments.length === 0 ? (
                <Empty title="Chưa có bài nào" action={<Button onClick={open}>Giao bài đầu tiên</Button>}>
                    Một bài là phần việc của một buổi học. Phiên học của học viên trong ứng dụng sẽ đưa bài này lên trước.
                </Empty>
            ) : (
                board.assignments.map((a) => {
                    const m = moduleFor(a.app);
                    const p = m?.core.assignmentProgress({ ...a, payload: m.core.parsePayload(a.kind, a.payload) }, assignmentStudents(a, board.students));
                    const forName = a.for_user ? (board.students.find((s) => s.user_id === a.for_user)?.name ?? 'một em') : null;
                    const late = a.due_on ? daysUntil(a.due_on) : null;
                    return (
                        <Card key={a.id}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-[16px] font-semibold text-ink">{a.title}</p>
                                    <p className="mt-1 flex flex-wrap items-center gap-2">
                                        {many && <AppDot app={a.app} />}
                                        {forName && <Badge tone="lilac">Riêng cho {forName}</Badge>}
                                        {a.due_on && <Badge tone={late !== null && late <= 1 && p && p.done < p.total ? 'warm' : 'neutral'}>{dueText(a.due_on)}</Badge>}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {a.app === 'lexica' && (
                                        <LinkButton href={`/present/${board.class.id}?tool=slides&assignment=${a.id}`} kind="secondary" size="sm">
                                            <Presentation className="h-4 w-4" /> Trình chiếu
                                        </LinkButton>
                                    )}
                                    <Button
                                        kind="danger"
                                        size="sm"
                                        onClick={async () => {
                                            if (!window.confirm(`Xoá bài “${a.title}”? Học viên sẽ không còn được giao phần này (tiến độ các em vẫn giữ).`)) return;
                                            try {
                                                await api.unassign(a.id);
                                                onChanged();
                                            } catch (e) {
                                                setError(errorText(e));
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" /> Xoá
                                    </Button>
                                </div>
                            </div>
                            {m ? (
                                <div className="mt-3">
                                    <m.AssignmentBody assignment={a} board={board} />
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-muted">Bài của {a.app}: bản app giáo viên này chưa hiển thị được.</p>
                            )}
                            {m && p && p.total > 0 && (
                                <p className="mt-3 text-sm text-muted tabular">
                                    <b className="text-ink-2">{p.started}</b>/{p.total} em đã bắt đầu · <b className="text-ink-2">{p.done}</b> {m.progressLabels.done}
                                    {p.deep !== undefined && m.progressLabels.deep && (
                                        <>
                                            {' '}
                                            · <b className="text-ink-2">{p.deep}</b> {m.progressLabels.deep}
                                        </>
                                    )}
                                </p>
                            )}
                        </Card>
                    );
                })
            )}
            <Drawer open={picking} title={mod ? `Giao bài · ${mod.core.name}` : 'Giao bài mới'} onClose={close}>
                {!mod ? (
                    <div className="space-y-2">
                        <p className="mb-2 text-sm text-muted">Bài này cho ứng dụng nào?</p>
                        {mods.map((m) => (
                            <button key={m.core.id} onClick={() => setMod(m)} className="w-full rounded-xl border border-line-strong bg-surface p-3 text-left hover:border-accent">
                                <p className="flex items-center gap-2 font-medium text-ink">
                                    <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} /> {m.core.name}
                                </p>
                                <p className="text-sm text-muted">{Object.values(m.core.kinds).join(', ')}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <mod.AssignForm
                        board={board}
                        onCancel={close}
                        onSubmit={async (n) => {
                            await api.assign(board.class.id, { app: mod.core.id, kind: n.kind, title: n.title, payload: n.payload, due: n.due });
                            close();
                            onChanged();
                        }}
                    />
                )}
            </Drawer>
        </div>
    );
}
