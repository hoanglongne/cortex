'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { assignmentProgress, daysUntil, type Board } from '@cortex/lexica-classes';
import { Badge, Button, Card, Empty, ErrorNote, errorText } from '../ui';
import { api } from '../../lib/supabase';
import type { WordIndex } from '../../lib/words';
import AssignDrawer from './AssignDrawer';
import { dueText } from './Overview';

/** "Giao gì, tới đâu rồi?": lessons newest first, each with its due date, mode and how far the class got. */
export default function Assignments({ board, words, onChanged, startOpen }: { board: Board; words: WordIndex | null; onChanged: () => void; startOpen: boolean }) {
    const [open, setOpen] = useState(startOpen);
    const [error, setError] = useState('');
    const lessons = board.assignments ?? [];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" /> Giao bài mới
                </Button>
            </div>
            <ErrorNote error={error} />
            {lessons.length === 0 ? (
                <Empty title="Chưa có bài nào" action={<Button onClick={() => setOpen(true)}>Giao bài đầu tiên</Button>}>
                    Một bài là danh sách từ của một buổi học. Phiên Hôm nay của học viên sẽ đưa những từ này lên trước.
                </Empty>
            ) : (
                lessons.map((a) => {
                    const p = assignmentProgress(a, board.students);
                    const late = a.due_on ? daysUntil(a.due_on) : null;
                    return (
                        <Card key={a.id}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-[16px] font-semibold text-ink">{a.title}</p>
                                    <p className="mt-1 flex flex-wrap gap-2">
                                        {a.due_on && <Badge tone={late !== null && late <= 1 && p.learned < p.total ? 'warm' : 'neutral'}>{dueText(a.due_on)}</Badge>}
                                        <Badge>{(a.mode ?? 'only') === 'only' ? 'Chỉ từ của bài' : 'Xen với từ thường'}</Badge>
                                        {a.missing_words.length > 0 && <Badge tone="warm">{a.missing_words.length} từ Studio đang viết</Badge>}
                                    </p>
                                </div>
                                <Button
                                    kind="danger"
                                    size="sm"
                                    onClick={async () => {
                                        if (!window.confirm(`Xoá bài “${a.title}”? Học viên sẽ không còn được giao những từ này (tiến độ các em vẫn giữ).`)) return;
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
                            <ul className="mt-3 flex flex-wrap gap-1.5">
                                {a.card_ids.map((id) => (
                                    <li key={id} className="rounded-full bg-surface-2 px-2.5 py-1 text-sm text-ink-2" title={words?.byId.get(id)?.meaning}>
                                        {words?.byId.get(id)?.word.toLowerCase() ?? id}
                                    </li>
                                ))}
                                {a.missing_words.map((w) => (
                                    <li key={w} className="rounded-full border border-dashed border-warm/50 px-2.5 py-1 text-sm text-warm">
                                        {w}
                                    </li>
                                ))}
                            </ul>
                            {p.total > 0 && (
                                <p className="mt-3 text-sm text-muted tabular">
                                    <b className="text-ink-2">{p.started}</b>/{p.total} em đã bắt đầu · <b className="text-ink-2">{p.learned}</b> học hết · <b className="text-ink-2">{p.used}</b> nói được hết
                                </p>
                            )}
                        </Card>
                    );
                })
            )}
            <AssignDrawer
                classId={board.class.id}
                words={words}
                open={open}
                onClose={() => setOpen(false)}
                onDone={() => {
                    setOpen(false);
                    onChanged();
                }}
            />
        </div>
    );
}
