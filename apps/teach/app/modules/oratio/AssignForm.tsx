'use client';

import { useEffect, useMemo, useState } from 'react';
import { partLabel, type GoalPayload, type Part, type QuestionsPayload, type TopicPayload } from '@cortex/classroom-oratio';
import { Badge, Button, ErrorNote, errorText, Field, inputClass } from '../../components/ui';
import type { ModuleUI } from '../types';
import { firstLine, questionBank, type QuestionBank } from './questions';

type Kind = 'topic' | 'questions' | 'goal';
const KINDS: { id: Kind; label: string; hint: string }[] = [
    { id: 'topic', label: 'Chủ đề', hint: 'Học viên luyện vài buổi có hỏi về chủ đề này.' },
    { id: 'questions', label: 'Bộ câu hỏi', hint: 'Phòng thi và Tập một mình sẽ hỏi em các câu này trước tiên.' },
    { id: 'goal', label: 'Chỉ tiêu', hint: 'Số buổi, số phút nói tính từ hôm nay.' },
];
const MAX_QUESTIONS = 30;

/**
 * Giving Oratio work: a topic to practise for some sessions, a set of
 * questions, or a goal in sessions and minutes. One form, the title filled
 * in from the choice.
 */
const AssignForm: ModuleUI['AssignForm'] = ({ onSubmit, onCancel }) => {
    const [bank, setBank] = useState<QuestionBank | null>(null);
    const [loadError, setLoadError] = useState('');
    useEffect(() => {
        questionBank().then(setBank, (e) => setLoadError(errorText(e)));
    }, []);
    const [kind, setKind] = useState<Kind>('topic');
    const [category, setCategory] = useState('');
    const [part, setPart] = useState<Part | null>(null);
    const [sessions, setSessions] = useState(2);
    const [minutes, setMinutes] = useState(60);
    const [picked, setPicked] = useState<string[]>([]);
    const [filterPart, setFilterPart] = useState<Part>(1);
    const [search, setSearch] = useState('');
    const [title, setTitle] = useState('');
    const [due, setDue] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const topic = category || bank?.categories[0]?.name || '';
    const shown = useMemo(() => {
        const s = search.trim().toLowerCase();
        return (bank?.all ?? []).filter((q) => q.part === filterPart && (!s || q.question_text.toLowerCase().includes(s) || q.category.toLowerCase().includes(s)));
    }, [bank, filterPart, search]);

    const suggested =
        kind === 'topic' ? `Chủ đề: ${topic}${part ? ` (Part ${part})` : ''}` : kind === 'questions' ? `${picked.length} câu hỏi luyện nói` : [sessions ? `${sessions} buổi` : '', minutes ? `${minutes} phút` : ''].filter(Boolean).join(', ') + ' nói';
    const ready = kind === 'topic' ? Boolean(topic) : kind === 'questions' ? picked.length > 0 : sessions > 0 || minutes > 0;

    const give = async () => {
        setBusy(true);
        setError('');
        try {
            const payload: TopicPayload | QuestionsPayload | GoalPayload =
                kind === 'topic' ? { category: topic, part, sessions } : kind === 'questions' ? { question_ids: picked } : { sessions, minutes };
            await onSubmit({ kind, title: (title.trim() || suggested).slice(0, 120), payload, due: due || null });
        } catch (e) {
            setError(errorText(e));
            setBusy(false);
        }
    };

    const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < MAX_QUESTIONS ? [...p, id] : p));
    const num = (v: string, max: number) => Math.min(max, Math.max(0, Math.round(Number(v) || 0)));

    return (
        <div className="space-y-5">
            <div role="radiogroup" aria-label="Loại bài" className="grid grid-cols-3 gap-2">
                {KINDS.map((k) => (
                    <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} onClick={() => setKind(k.id)} className={`h-11 rounded-xl border text-sm ${kind === k.id ? 'border-accent bg-accent-soft font-semibold text-accent-strong' : 'border-line-strong bg-surface text-ink-2'}`}>
                        {k.label}
                    </button>
                ))}
            </div>
            <p className="-mt-2 text-sm text-muted">{KINDS.find((k) => k.id === kind)!.hint}</p>
            <ErrorNote error={loadError} />

            {kind === 'topic' && (
                <>
                    <Field label="Chủ đề IELTS">
                        <select value={topic} onChange={(e) => setCategory(e.target.value)} className={inputClass} disabled={!bank}>
                            {bank?.categories.map((c) => (
                                <option key={c.name} value={c.name}>
                                    {c.name} ({c.parts[1] + c.parts[2] + c.parts[3]} câu)
                                </option>
                            ))}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Part">
                            <select value={part ?? ''} onChange={(e) => setPart(e.target.value ? (Number(e.target.value) as Part) : null)} className={inputClass}>
                                <option value="">Mọi part</option>
                                {([1, 2, 3] as const).map((p) => (
                                    <option key={p} value={p}>
                                        Part {p}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Số buổi">
                            <input type="number" min={1} max={20} value={sessions} onChange={(e) => setSessions(Math.max(1, num(e.target.value, 20)))} className={inputClass} />
                        </Field>
                    </div>
                </>
            )}

            {kind === 'questions' && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        {([1, 2, 3] as const).map((p) => (
                            <button key={p} type="button" onClick={() => setFilterPart(p)} aria-pressed={filterPart === p} className={`h-9 flex-1 rounded-full border text-sm ${filterPart === p ? 'border-ink bg-ink text-bg' : 'border-line-strong text-ink-2'}`}>
                                Part {p}
                            </button>
                        ))}
                    </div>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm câu hoặc chủ đề" aria-label="Tìm câu hỏi" className={inputClass} />
                    <p className="text-sm text-muted">
                        Đã chọn <Badge tone="accent">{picked.length}</Badge> / {MAX_QUESTIONS} câu
                    </p>
                    <ul className="max-h-80 space-y-1.5 overflow-y-auto rounded-xl border border-line p-2">
                        {!bank && <li className="p-2 text-sm text-muted">Đang tải câu hỏi…</li>}
                        {shown.map((q) => (
                            <li key={q.id}>
                                <label className={`flex cursor-pointer gap-3 rounded-lg p-2 text-sm ${picked.includes(q.id) ? 'bg-accent-soft' : 'hover:bg-surface-2'}`}>
                                    <input type="checkbox" checked={picked.includes(q.id)} onChange={() => toggle(q.id)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]" />
                                    <span>
                                        <span className="block text-ink">{firstLine(q.question_text)}</span>
                                        <span className="block text-xs text-muted">{q.category}</span>
                                    </span>
                                </label>
                            </li>
                        ))}
                        {bank && shown.length === 0 && <li className="p-2 text-sm text-muted">Không có câu nào khớp.</li>}
                    </ul>
                </div>
            )}

            {kind === 'goal' && (
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Số buổi" hint="0 nếu không tính">
                        <input type="number" min={0} max={50} value={sessions} onChange={(e) => setSessions(num(e.target.value, 50))} className={inputClass} />
                    </Field>
                    <Field label="Số phút nói" hint="0 nếu không tính">
                        <input type="number" min={0} max={1000} step={10} value={minutes} onChange={(e) => setMinutes(num(e.target.value, 1000))} className={inputClass} />
                    </Field>
                </div>
            )}

            <Field label="Tên bài" hint={`Để trống: “${suggested}”`}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputClass} placeholder={suggested} />
            </Field>
            <Field label="Hạn (không bắt buộc)">
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
            </Field>
            {kind === 'topic' && <p className="text-sm text-muted">Một buổi được tính khi có câu hỏi về “{topic}” ({partLabel(part)}). Phòng thi sẽ ưu tiên hỏi em chủ đề này.</p>}
            <ErrorNote error={error} />
            <div className="flex gap-2">
                <Button kind="secondary" onClick={onCancel}>
                    Huỷ
                </Button>
                <Button className="flex-1" disabled={busy || !ready} onClick={() => void give()}>
                    {busy ? 'Đang giao…' : 'Giao bài'}
                </Button>
            </div>
        </div>
    );
};

export default AssignForm;
