'use client';

import { useEffect, useState } from 'react';
import { studentApp, type ClassroomModuleCore } from '@cortex/classroom';
import { assignmentState, CRITERIA, CRITERION_LABEL, fmtBand, oratioModule, partLabel, weekGain, type OratioMetrics } from '@cortex/classroom-oratio';
import { Badge, Field, inputClass } from '../../components/ui';
import { ORATIO_URL } from '../../lib/config';
import type { ModuleUI } from '../types';
import AssignForm from './AssignForm';
import { firstLine, questionBank, type QuestionBank } from './questions';

const BANDS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

function useBank() {
    const [bank, setBank] = useState<QuestionBank | null>(null);
    useEffect(() => {
        questionBank().then(setBank, () => undefined);
    }, []);
    return bank;
}

const metricsOf = (app: { metrics: unknown } | null | undefined): OratioMetrics => oratioModule.parseMetrics(app?.metrics);

/** One criterion as a bar out of 9. */
function BandBar({ label, value, target }: { label: string; value: number | undefined; target: number | null }) {
    return (
        <div className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
            <span className="text-ink-2">{label}</span>
            <span className="relative h-2 rounded-full bg-surface-2">
                {value != null && <span className="absolute inset-y-0 left-0 rounded-full bg-lilac" style={{ width: `${(value / 9) * 100}%` }} />}
                {target != null && <span className="absolute -inset-y-1 w-0.5 rounded bg-ink/60" style={{ left: `${(target / 9) * 100}%` }} title={`Mục tiêu ${fmtBand(target)}`} />}
            </span>
            <span className="text-right font-medium tabular text-ink">{fmtBand(value)}</span>
        </div>
    );
}

/** Oratio's screens in the teacher app. */
export const oratioUI: ModuleUI = {
    core: oratioModule as ClassroomModuleCore<unknown, unknown, unknown>,
    dot: 'bg-lilac',
    appUrl: ORATIO_URL,
    progressLabels: { done: 'đã xong' },

    settingsLine(raw) {
        const s = oratioModule.parseSettings(raw);
        return s.target_band ? `Mục tiêu band ${fmtBand(s.target_band)}` : null;
    },

    SettingsFields({ value, onChange }) {
        const s = oratioModule.parseSettings(value);
        return (
            <Field label="Band mục tiêu của lớp (không bắt buộc)" hint="Hiện như một vạch trên điểm của từng em.">
                <select value={s.target_band ?? ''} onChange={(e) => onChange({ ...s, target_band: e.target.value ? Number(e.target.value) : null })} className={inputClass}>
                    <option value="">Không đặt</option>
                    {BANDS.map((b) => (
                        <option key={b} value={b}>
                            {fmtBand(b)}
                        </option>
                    ))}
                </select>
            </Field>
        );
    },

    StudentSummary({ app }) {
        if (!app) return <span className="text-sm text-subtle">Chưa vào Oratio</span>;
        const m = metricsOf(app);
        return (
            <span className="text-sm text-ink-2 tabular">
                {m.sessions} buổi · {m.minutes} phút{m.band?.overall ? ` · band ~${fmtBand(m.band.overall)}` : ''}
            </span>
        );
    },

    ClassSummary({ board }) {
        const apps = board.students.map((s) => studentApp(oratioModule, s)).filter((a): a is NonNullable<typeof a> => a !== null);
        if (apps.length === 0) return <p className="text-sm text-muted">Chưa em nào vào Oratio.</p>;
        const week = apps.map(weekGain);
        const minutes = week.reduce((n, g) => n + g.minutes, 0);
        const speakers = week.filter((g) => g.sessions > 0).length;
        const bands = apps.map((a) => a.metrics.band?.overall).filter((b): b is number => b != null);
        const avg = bands.length ? Math.round((bands.reduce((n, b) => n + b, 0) / bands.length) * 2) / 2 : null;
        return (
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
                <span>
                    <b className="tabular text-ink">{minutes}</b> phút nói tuần này
                </span>
                <span>
                    <b className="tabular text-ink">{speakers}</b>/{board.students.length} em có buổi nói
                </span>
                {avg != null && (
                    <span>
                        band bạn luyện chấm ~<b className="tabular text-ink">{fmtBand(avg)}</b>
                    </span>
                )}
            </p>
        );
    },

    AssignmentBody({ assignment }) {
        const bank = useBank();
        const p = oratioModule.parsePayload(assignment.kind, assignment.payload);
        if (p.kind === 'topic')
            return (
                <p className="flex flex-wrap gap-2">
                    <Badge tone="lilac">{p.category}</Badge>
                    <Badge>{partLabel(p.part)}</Badge>
                    <Badge>{p.sessions} buổi</Badge>
                </p>
            );
        if (p.kind === 'goal')
            return (
                <p className="flex flex-wrap gap-2">
                    {p.sessions > 0 && <Badge tone="lilac">{p.sessions} buổi</Badge>}
                    {p.minutes > 0 && <Badge tone="lilac">{p.minutes} phút nói</Badge>}
                </p>
            );
        return (
            <ol className="space-y-1 text-sm text-ink-2">
                {p.question_ids.map((id) => {
                    const q = bank?.byId.get(id);
                    return (
                        <li key={id} className="flex gap-2">
                            <span className="shrink-0 text-xs text-subtle">{q ? `P${q.part}` : ''}</span>
                            <span>{q ? firstLine(q.question_text) : '…'}</span>
                        </li>
                    );
                })}
            </ol>
        );
    },

    StudentSection({ student, board }) {
        const app = studentApp(oratioModule, student);
        const m = app?.metrics ?? metricsOf(null);
        const target = oratioModule.parseSettings(board.class.settings.oratio).target_band ?? m.target_band;
        const work = board.assignments.filter((a) => a.app === 'oratio');
        if (!app) return <p className="text-sm text-muted">Em chưa mở Oratio. Gửi em link lớp để vào bằng Oratio nhé.</p>;
        const g = weekGain(app);
        return (
            <div className="space-y-5">
                <p className="text-sm text-ink-2">
                    <b className="tabular text-ink">{m.sessions}</b> buổi · <b className="tabular text-ink">{m.minutes}</b> phút nói (tuần này {g.sessions} buổi, {g.minutes} phút)
                    {m.current_band != null && ` · em tự đặt band ${fmtBand(m.current_band)}${m.target_band ? `, mục tiêu ${fmtBand(m.target_band)}` : ''}`}
                </p>
                <div>
                    <p className="mb-2 text-sm font-medium text-ink">Bạn luyện chấm{m.ratings ? ` (${m.ratings} lượt gần nhất)` : ''}</p>
                    {m.band ? (
                        <div className="space-y-2">
                            {CRITERIA.map((c) => (
                                <BandBar key={c} label={CRITERION_LABEL[c]} value={m.band?.[c]} target={target} />
                            ))}
                            <BandBar label="Tổng" value={m.band.overall} target={target} />
                            <p className="text-xs text-subtle">Điểm do bạn cùng luyện chấm, chỉ để tham khảo.{target != null ? ' Vạch đậm: band mục tiêu.' : ''}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted">Chưa có ai chấm em.</p>
                    )}
                </div>
                <div>
                    <p className="mb-2 text-sm font-medium text-ink">Bài của lớp</p>
                    {work.length === 0 ? (
                        <p className="text-sm text-muted">Lớp chưa giao bài Oratio nào.</p>
                    ) : (
                        <ul className="space-y-1.5 text-sm">
                            {work.map((a) => {
                                const st = assignmentState({ kind: a.kind, payload: oratioModule.parsePayload(a.kind, a.payload) }, m.progress[a.id]);
                                return (
                                    <li key={a.id} className="flex items-center justify-between gap-3">
                                        <span className="text-ink-2">{a.title}</span>
                                        <span className={`shrink-0 tabular ${st.done ? 'font-medium text-accent-strong' : st.started ? 'text-ink-2' : 'text-warm'}`}>{st.done ? `Xong · ${st.line}` : st.line}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        );
    },

    AssignForm,
};
