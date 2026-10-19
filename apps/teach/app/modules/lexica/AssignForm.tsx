'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { matchWords, type WordsMode, type WordsPayload } from '@cortex/classroom-lexica';
import { Badge, Button, ErrorNote, errorText, Field, inputClass } from '../../components/ui';
import type { ModuleUI } from '../types';
import LexicaPicker from './LexicaPicker';
import { wordIndex, type WordIndex } from './words';

/** Words per lesson, as classroom_lexica_clean_payload keeps them. */
const MAX_WORDS = 200;

/**
 * Giving a Lexica lesson, three steps: choose the words (pick from the cards
 * Lexica has, or paste a list split at once into "có sẵn" and "Studio sẽ
 * viết"), name it with a due date and a mode, check what students will see,
 * give it.
 */
const AssignForm: ModuleUI['AssignForm'] = ({ board, onSubmit, onCancel }) => {
    const [words, setWords] = useState<WordIndex | null>(null);
    useEffect(() => {
        void wordIndex().then(setWords);
    }, []);
    const [source, setSource] = useState<'pick' | 'paste'>('pick');
    const [picked, setPicked] = useState<string[]>([]);
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [due, setDue] = useState('');
    const [mode, setMode] = useState<WordsMode>('only');
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const match = useMemo(() => matchWords(text, (w) => words?.byWord.get(w)), [text, words]);
    const pasted = match.cardIds.filter((id) => !picked.includes(id));
    const cardIds = [...picked, ...pasted].slice(0, MAX_WORDS);
    const missing = match.missing.slice(0, MAX_WORDS);
    const found = cardIds.map((id) => words?.byId.get(id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
    const assigned = useMemo(() => new Set(board.assignments.filter((a) => a.app === 'lexica').flatMap((a) => (a.payload as Partial<WordsPayload>)?.card_ids ?? [])), [board.assignments]);

    const give = async () => {
        setBusy(true);
        setError('');
        try {
            const payload: WordsPayload = { card_ids: cardIds, missing_words: missing, mode };
            await onSubmit({ kind: 'words', title: title.trim(), payload, due: due || null });
        } catch (e) {
            setError(errorText(e));
            setBusy(false);
        }
    };

    return (
        <div>
            <ol className="mb-6 flex gap-2 text-sm" aria-label="Các bước">
                {['Từ', 'Tên và hạn', 'Xem lại'].map((label, i) => (
                    <li key={label} className={`flex-1 rounded-full px-3 py-1 text-center ${step === i + 1 ? 'bg-accent-soft font-semibold text-accent-strong' : step > i + 1 ? 'text-accent' : 'text-subtle'}`}>
                        {i + 1}. {label}
                    </li>
                ))}
            </ol>

            {step === 1 && (
                <div className="space-y-4">
                    <div className="flex gap-1 rounded-xl bg-surface-2 p-1" role="tablist" aria-label="Cách chọn từ">
                        {(
                            [
                                ['pick', 'Chọn từ Lexica'],
                                ['paste', 'Dán danh sách'],
                            ] as const
                        ).map(([id, label]) => (
                            <button key={id} role="tab" aria-selected={source === id} onClick={() => setSource(id)} className={`flex-1 rounded-lg px-3 py-1.5 text-sm ${source === id ? 'bg-surface font-semibold text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    {source === 'pick' && words && !words.error && <LexicaPicker words={words} picked={picked} onChange={setPicked} max={MAX_WORDS - pasted.length} assigned={assigned} />}
                    {source === 'pick' && !words && <div className="h-64 animate-pulse rounded-xl bg-surface-2" />}
                    {source === 'paste' && (
                        <Field label="Dán danh sách từ" hint="Mỗi dòng một từ, hoặc cách nhau bằng dấu phẩy. Cụm từ như “keep in mind” cũng được.">
                            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className={`${inputClass} h-auto py-2`} autoFocus placeholder={'commute\ndeadline\nkeep in mind'} />
                        </Field>
                    )}
                    {words?.error && (
                        <div className="space-y-2">
                            <ErrorNote error={words.error} />
                            <Button kind="secondary" size="sm" onClick={() => void wordIndex().then(setWords)}>
                                Thử tải lại
                            </Button>
                        </div>
                    )}
                    {(picked.length > 0 || text.trim()) && !words?.error && (
                        <div className="space-y-2 rounded-xl border border-line bg-surface p-3 text-sm">
                            <p className="font-medium text-ink">
                                Bài này: {found.length + missing.length} từ <Badge tone="accent">{found.length} có sẵn</Badge> {missing.length > 0 && <Badge tone="warm">{missing.length} Studio sẽ viết</Badge>}
                            </p>
                            {found.length > 0 && (
                                <ul className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                                    {found.map((c) => (
                                        <li key={c.id} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-0.5 pl-2.5 pr-1 text-ink-2" title={c.meaning}>
                                            {c.word.toLowerCase()}
                                            {picked.includes(c.id) && (
                                                <button onClick={() => setPicked(picked.filter((x) => x !== c.id))} aria-label={`Bỏ ${c.word.toLowerCase()}`} className="rounded-full p-0.5 text-muted hover:bg-surface hover:text-ink">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {missing.length > 0 && (
                                <p className="text-muted">
                                    Chưa có thẻ: <span className="text-ink-2">{missing.join(', ')}</span>. Đội nội dung sẽ viết thẻ; học viên nhận được khi thẻ xong.
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button kind="secondary" onClick={onCancel}>
                            Huỷ
                        </Button>
                        <Button onClick={() => setStep(2)} disabled={!words || Boolean(words.error) || cardIds.length + missing.length === 0} className="flex-1">
                            {words ? 'Tiếp' : 'Đang tải danh sách từ…'}
                        </Button>
                    </div>
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
                            {found.length + missing.length} từ{due ? ` · hạn ${due.slice(8)}/${due.slice(5, 7)}` : ''} · {mode === 'only' ? 'phiên Học chỉ có từ của bài' : 'học trước trong phiên thường'}
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                            {found.map((c) => (
                                <li key={c.id} className="rounded-full bg-surface-2 px-2.5 py-1 text-sm text-ink-2" title={c.meaning}>
                                    {c.word.toLowerCase()}
                                </li>
                            ))}
                            {missing.map((w) => (
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
        </div>
    );
};

export default AssignForm;
