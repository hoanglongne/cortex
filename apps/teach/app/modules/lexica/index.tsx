'use client';

import { useEffect, useState } from 'react';
import { studentApp, type ClassroomModuleCore } from '@cortex/classroom';
import { classSounds, lexicaModule, oftenMissed, SOUND_KINDS, SOUND_LABEL, STEP_LABEL, type LexicaMetrics, type LexicaSettings, type WordsPayload } from '@cortex/classroom-lexica';
import { Badge, Field, inputClass } from '../../components/ui';
import { LEXICA_URL } from '../../lib/config';
import type { ModuleUI } from '../types';
import AssignForm from './AssignForm';
import StepBar from './StepBar';
import { wordIndex, type WordIndex } from './words';

const BRANCH_LABEL = { cert: 'Chứng chỉ', talk: 'Giao tiếp' } as const;
const LEVELS = [
    { id: 'beginner', label: 'Cơ bản' },
    { id: 'intermediate', label: 'Trung cấp' },
    { id: 'advanced', label: 'Nâng cao' },
    { id: 'expert', label: 'Chuyên sâu' },
] as const;
const STEP_NAMES = ['Chưa học', STEP_LABEL.hieu, STEP_LABEL.nho, STEP_LABEL.gap, STEP_LABEL.dung, STEP_LABEL.doi];

/** Lexica's word list, loaded once, to name cards by id. */
function useWords() {
    const [words, setWords] = useState<WordIndex | null>(null);
    useEffect(() => {
        void wordIndex().then(setWords);
    }, []);
    return words;
}

const metricsOf = (app: { metrics: unknown } | null | undefined) => lexicaModule.parseMetrics(app?.metrics);
const lessonOf = (payload: unknown) => lexicaModule.parsePayload('words', payload);

/** Lexica's screens in the teacher app. */
export const lexicaUI: ModuleUI = {
    core: lexicaModule as ClassroomModuleCore<unknown, unknown, unknown>,
    dot: 'bg-accent',
    appUrl: LEXICA_URL,
    progressLabels: { done: 'đã học hết', deep: 'đã nói được hết' },

    settingsLine(raw) {
        const s = lexicaModule.parseSettings(raw);
        const level = LEVELS.find((l) => l.id === s.level)?.label;
        return [BRANCH_LABEL[s.branch], level].filter(Boolean).join(' · ');
    },

    SettingsFields({ value, onChange }) {
        const s: LexicaSettings = lexicaModule.parseSettings(value);
        return (
            <div className="space-y-4">
                <Field label="Nhánh học">
                    <div className="grid grid-cols-2 gap-2">
                        {(['cert', 'talk'] as const).map((b) => (
                            <button key={b} type="button" onClick={() => onChange({ ...s, branch: b })} className={`h-11 rounded-xl border text-sm ${s.branch === b ? 'border-accent bg-accent-soft font-semibold text-accent-strong' : 'border-line-strong bg-surface text-ink-2'}`}>
                                {BRANCH_LABEL[b]}
                            </button>
                        ))}
                    </div>
                </Field>
                <Field label="Level (không bắt buộc)">
                    <select value={s.level ?? ''} onChange={(e) => onChange({ ...s, level: e.target.value || null })} className={inputClass}>
                        <option value="">Không đặt</option>
                        {LEVELS.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.label}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>
        );
    },

    StudentSummary({ app }) {
        return <StepBar counts={metricsOf(app).counts} />;
    },

    ClassSummary({ board }) {
        const all = board.students.map((s) => metricsOf(s.apps.lexica).counts);
        if (all.length === 0) return <p className="text-sm text-muted">Chưa có học viên.</p>;
        const avg = (k: 'hieu' | 'nho' | 'gap' | 'dung' | 'doi') => Math.round(all.reduce((n, c) => n + (c[k] ?? 0), 0) / all.length);
        const sounds = classSounds(board);
        return (
            <>
                <StepBar counts={{ hieu: avg('hieu'), nho: avg('nho'), gap: avg('gap'), dung: avg('dung'), doi: avg('doi') }} />
                <p className="mt-1 text-xs text-subtle">trung bình mỗi em</p>
                {sounds.length > 0 && (
                    <div data-testid="class-sounds" className="mt-4">
                        <p className="text-sm font-medium text-ink">Âm cả lớp hay sai (14 ngày)</p>
                        <ul className="mt-1.5 space-y-1">
                            {sounds.map((x) => (
                                <li key={x.kind} className="flex items-baseline justify-between gap-3 text-sm">
                                    <span className="text-ink-2">{SOUND_LABEL[x.kind]}</span>
                                    <span className="text-muted shrink-0">{x.students} em</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-1 text-xs text-subtle">Em “hay sai” một nhóm âm: Lexica nghe chưa rõ quá 40% trong ít nhất 5 lần nói.</p>
                    </div>
                )}
            </>
        );
    },

    AssignmentBody({ assignment }) {
        const words = useWords();
        const lesson: WordsPayload = lessonOf(assignment.payload);
        return (
            <>
                <p className="flex flex-wrap gap-2">
                    <Badge>{lesson.mode === 'only' ? 'Chỉ từ của bài' : 'Xen với từ thường'}</Badge>
                    {lesson.missing_words.length > 0 && <Badge tone="warm">{lesson.missing_words.length} từ Studio đang viết</Badge>}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                    {lesson.card_ids.map((id) => (
                        <li key={id} className="rounded-full bg-surface-2 px-2.5 py-1 text-sm text-ink-2" title={words?.byId.get(id)?.meaning}>
                            {words?.byId.get(id)?.word.toLowerCase() ?? id}
                        </li>
                    ))}
                    {lesson.missing_words.map((w) => (
                        <li key={w} className="rounded-full border border-dashed border-warm/50 px-2.5 py-1 text-sm text-warm">
                            {w}
                        </li>
                    ))}
                </ul>
            </>
        );
    },

    StudentSection({ student, board }) {
        const words = useWords();
        const app = studentApp(lexicaModule, student);
        const m: LexicaMetrics = app?.metrics ?? metricsOf(null);
        const assigned = [...new Set(board.assignments.filter((a) => a.app === 'lexica').flatMap((a) => lessonOf(a.payload).card_ids))];
        const groups = STEP_NAMES.map((label, n) => ({ label, n, ids: assigned.filter((id) => (m.words[id] ?? 0) === n) })).filter((g) => g.ids.length > 0);
        return (
            <div className="space-y-5">
                <div>
                    <StepBar counts={m.counts} />
                    {(m.counts.known ?? 0) > 0 && <p className="mt-1 text-xs text-subtle">Không tính {m.counts.known} từ em đánh dấu “biết rồi” mà chưa học trong Lexica.</p>}
                </div>
                <StudentSounds sounds={m.sounds} />
                <div>
                    <p className="mb-2 text-sm font-medium text-ink">Từ của lớp: em đang ở bước nào</p>
                    {assigned.length === 0 ? (
                        <p className="text-sm text-muted">Lớp chưa giao bài từ vựng nào.</p>
                    ) : (
                        <div className="space-y-4">
                            {groups.map((g) => (
                                <div key={g.n}>
                                    <p className={`text-sm font-medium ${g.n <= 1 ? 'text-warm' : 'text-ink-2'}`}>
                                        {g.label} · {g.ids.length} từ
                                    </p>
                                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                                        {g.ids.map((id) => (
                                            <li key={id} className={`rounded-full px-2.5 py-1 text-sm ${g.n === 0 ? 'border border-dashed border-line-strong text-muted' : g.n >= 4 ? 'bg-accent-soft text-accent-strong' : 'bg-surface-2 text-ink-2'}`} title={words?.byId.get(id)?.meaning}>
                                                {words?.byId.get(id)?.word.toLowerCase() ?? id}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    },

    AssignForm,
};

/** One line per sound group the student said in 14 days: misses out of tries. */
function StudentSounds({ sounds }: { sounds: LexicaMetrics['sounds'] }) {
    const rows = SOUND_KINDS.map((kind) => ({ kind, pair: sounds[kind] }))
        .filter((r): r is { kind: (typeof SOUND_KINDS)[number]; pair: [number, number] } => Boolean(r.pair && r.pair[1] > 0))
        .sort((a, b) => b.pair[1] / b.pair[0] - a.pair[1] / a.pair[0]);
    if (rows.length === 0) return null;
    return (
        <div data-testid="student-sounds">
            <p className="mb-1.5 text-sm font-medium text-ink">Phát âm: số lần Lexica nghe chưa rõ (14 ngày)</p>
            <ul className="space-y-1">
                {rows.map((r) => (
                    <li key={r.kind} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className={oftenMissed(r.pair) ? 'text-warm' : 'text-ink-2'}>{SOUND_LABEL[r.kind]}</span>
                        <span className="text-muted shrink-0">
                            {r.pair[1]}/{r.pair[0]} lần
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
