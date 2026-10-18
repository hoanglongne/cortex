'use client';

import { useMemo, useState } from 'react';
import { matchWords, type AssignMode } from '@cortex/lexica-classes';
import { Badge, Button, Drawer, ErrorNote, errorText, Field, inputClass } from '../ui';
import { api } from '../../lib/supabase';
import type { WordIndex } from '../../lib/words';

/**
 * Giving a lesson, three steps in one panel: paste the words (split at once
 * into "có sẵn" and "Studio sẽ viết"), name it with a due date and a mode,
 * check what students will see, give it.
 */
export default function AssignDrawer({ classId, words, open, onClose, onDone }: { classId: string; words: WordIndex | null; open: boolean; onClose: () => void; onDone: () => void }) {
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [due, setDue] = useState('');
    const [mode, setMode] = useState<AssignMode>('only');
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const match = useMemo(() => matchWords(text, (w) => words?.byWord.get(w)), [text, words]);
    const found = match.cardIds.map((id) => words?.byId.get(id)).filter((c): c is NonNullable<typeof c> => Boolean(c));

    const reset = () => {
        setText('');
        setTitle('');
        setDue('');
        setMode('only');
        setStep(1);
        setError('');
    };
    const give = async () => {
        setBusy(true);
        setError('');
        try {
            await api.assign(classId, { title: title.trim(), cardIds: match.cardIds, missing: match.missing, due: due || null, mode });
            reset();
            onDone();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Drawer open={open} title="Giao bài mới" onClose={onClose}>
            <ol className="mb-6 flex gap-2 text-sm" aria-label="Các bước">
                {['Từ', 'Tên và hạn', 'Xem lại'].map((label, i) => (
                    <li key={label} className={`flex-1 rounded-full px-3 py-1 text-center ${step === i + 1 ? 'bg-accent-soft font-semibold text-accent-strong' : step > i + 1 ? 'text-accent' : 'text-subtle'}`}>
                        {i + 1}. {label}
                    </li>
                ))}
            </ol>

            {step === 1 && (
                <div className="space-y-4">
                    <Field label="Dán danh sách từ" hint="Mỗi dòng một từ, hoặc cách nhau bằng dấu phẩy. Cụm từ như “keep in mind” cũng được.">
                        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className={`${inputClass} h-auto py-2`} autoFocus placeholder={'commute\ndeadline\nkeep in mind'} />
                    </Field>
                    {text.trim() && (
                        <div className="space-y-2 text-sm">
                            <p>
                                <Badge tone="accent">{found.length} có sẵn</Badge>{' '}
                                {match.missing.length > 0 && <Badge tone="warm">{match.missing.length} Studio sẽ viết</Badge>}
                            </p>
                            {match.missing.length > 0 && (
                                <p className="text-muted">
                                    Chưa có thẻ: <span className="text-ink-2">{match.missing.join(', ')}</span>. Đội nội dung sẽ viết thẻ; học viên nhận được khi thẻ xong.
                                </p>
                            )}
                        </div>
                    )}
                    <Button onClick={() => setStep(2)} disabled={!words || match.cardIds.length + match.missing.length === 0} className="w-full">
                        {words ? 'Tiếp' : 'Đang tải danh sách từ…'}
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-5">
                    <Field label="Tên buổi học" hint="Ví dụ “Unit 4: Work” hoặc “Buổi 12/10”.">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={inputClass} autoFocus />
                    </Field>
                    <Field label="Hạn chót (không bắt buộc)" hint="Hôm nay của giáo viên sẽ nhắc khi còn 2 ngày mà nhiều em chưa học.">
                        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Cách học">
                        <div className="space-y-2">
                            {(
                                [
                                    ['only', 'Chỉ từ của bài', 'Phiên Học của học viên chỉ có những từ này cho tới khi học hết. Hợp với bài trên lớp.'],
                                    ['mixed', 'Xen với từ thường', 'Từ của bài được học trước, phần còn lại của phiên là từ theo lộ trình riêng của em.'],
                                ] as const
                            ).map(([id, name, hint]) => (
                                <button key={id} onClick={() => setMode(id)} className={`w-full rounded-xl border p-3 text-left ${mode === id ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface'}`}>
                                    <p className={`font-medium ${mode === id ? 'text-accent-strong' : 'text-ink'}`}>{name}</p>
                                    <p className="text-sm text-muted">{hint}</p>
                                </button>
                            ))}
                        </div>
                    </Field>
                    <div className="flex gap-2">
                        <Button kind="secondary" onClick={() => setStep(1)}>
                            Quay lại
                        </Button>
                        <Button onClick={() => setStep(3)} disabled={title.trim().length < 1} className="flex-1">
                            Tiếp
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-5">
                    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
                        <p className="text-sm text-muted">Học viên sẽ thấy trong Lexica → Lớp học:</p>
                        <p className="mt-2 font-semibold text-ink">{title}</p>
                        <p className="text-sm text-muted">
                            {found.length + match.missing.length} từ{due ? ` · hạn ${due.slice(8)}/${due.slice(5, 7)}` : ''} · {mode === 'only' ? 'phiên Học chỉ có từ của bài' : 'học trước trong phiên thường'}
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                            {found.map((c) => (
                                <li key={c.id} className="rounded-full bg-surface-2 px-2.5 py-1 text-sm text-ink-2" title={c.meaning}>
                                    {c.word.toLowerCase()}
                                </li>
                            ))}
                            {match.missing.map((w) => (
                                <li key={w} className="rounded-full border border-dashed border-warm/50 px-2.5 py-1 text-sm text-warm" title="Studio đang viết thẻ">
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <ErrorNote error={error} />
                    <div className="flex gap-2">
                        <Button kind="secondary" onClick={() => setStep(2)}>
                            Quay lại
                        </Button>
                        <Button onClick={() => void give()} disabled={busy} className="flex-1">
                            {busy ? 'Đang giao…' : 'Giao bài'}
                        </Button>
                    </div>
                </div>
            )}
        </Drawer>
    );
}
