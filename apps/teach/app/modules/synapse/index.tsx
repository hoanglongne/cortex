'use client';

import { studentApp, type ClassroomModuleCore } from '@cortex/classroom';
import { classWeak, phraseName, synapseModule, TIER_LABEL, weekRuns } from '@cortex/classroom-synapse';
import { Badge } from '../../components/ui';
import { SYNAPSE_URL } from '../../lib/config';
import type { ModuleUI } from '../types';
import AssignForm from './AssignForm';

const metricsOf = (app: { metrics: unknown } | null | undefined) => synapseModule.parseMetrics(app?.metrics);

/** Synapse's screens in the teacher app. Numbers and phrase names only. */
export const synapseUI: ModuleUI = {
    core: synapseModule as ClassroomModuleCore<unknown, unknown, unknown>,
    dot: 'bg-warm',
    appUrl: SYNAPSE_URL,
    progressLabels: { done: 'đã qua' },

    settingsLine: () => null,
    SettingsFields: () => <p className="text-sm text-muted">Synapse không có cài đặt riêng. Học viên vào bằng cùng mã lớp.</p>,

    StudentSummary({ app }) {
        if (!app) return <span className="text-sm text-subtle">Chưa vào Synapse</span>;
        const m = metricsOf(app);
        return (
            <span className="text-sm text-ink-2 tabular">
                {m.runs} nhiệm vụ · {m.solid} cụm vững
            </span>
        );
    },

    ClassSummary({ board }) {
        const apps = board.students.map((s) => studentApp(synapseModule, s)).filter((a): a is NonNullable<typeof a> => a !== null);
        if (apps.length === 0) return <p className="text-sm text-muted">Chưa em nào vào Synapse.</p>;
        const week = apps.reduce((n, a) => n + weekRuns(a), 0);
        const weak = classWeak(board.students, 6);
        return (
            <div className="space-y-2 text-sm text-ink-2">
                <p className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                        <b className="tabular text-ink">{week}</b> nhiệm vụ tuần này
                    </span>
                    <span>
                        <b className="tabular text-ink">{apps.filter((a) => weekRuns(a) > 0).length}</b>/{board.students.length} em có chơi
                    </span>
                </p>
                {weak.length > 0 && (
                    <p>
                        Cụm hay nhầm:{' '}
                        {weak.map((w, i) => (
                            <span key={w.phrase}>
                                {i > 0 ? ', ' : ''}
                                <b lang="en" className="text-ink">{w.phrase}</b> ({w.students} em)
                            </span>
                        ))}
                    </p>
                )}
            </div>
        );
    },

    AssignmentBody({ assignment }) {
        const p = synapseModule.parsePayload(assignment.kind, assignment.payload);
        if (p.kind === 'review') return <p className="text-sm text-ink-2">Mỗi em chơi 3 cảnh mới về các cụm em hay nhầm.</p>;
        return (
            <p className="flex flex-wrap gap-2">
                <Badge tone="accent">{p.name || p.mission_id}</Badge>
            </p>
        );
    },

    StudentSection({ student, board }) {
        const app = studentApp(synapseModule, student);
        if (!app) return <p className="text-sm text-muted">Em chưa mở Synapse. Gửi em mã lớp để vào bằng Synapse nhé.</p>;
        const m = app.metrics;
        const work = board.assignments.filter((a) => a.app === 'synapse');
        return (
            <div className="space-y-6">
                <p className="text-sm text-ink-2">
                    <b className="tabular text-ink">{m.runs}</b> nhiệm vụ đã chơi, <b className="tabular text-ink">{m.cleared}</b> đã qua, <b className="tabular text-ink">{m.solid}</b> cụm vững (tuần này {weekRuns(app)} nhiệm vụ)
                </p>
                {m.weak.length > 0 && (
                    <p className="text-sm text-ink-2">
                        Hay nhầm:{' '}
                        {m.weak.map((k, i) => (
                            <span key={k}>
                                {i > 0 ? ', ' : ''}
                                <b lang="en" className="text-ink">{phraseName(k)}</b>
                            </span>
                        ))}
                    </p>
                )}
                <div>
                    <p className="mb-2 text-sm font-medium text-ink">Bài của lớp</p>
                    {work.length === 0 ? (
                        <p className="text-sm text-muted">Lớp chưa giao bài Synapse nào.</p>
                    ) : (
                        <ul className="space-y-1.5 text-sm">
                            {work.map((a) => {
                                const d = m.progress[a.id];
                                return (
                                    <li key={a.id} className="flex items-center justify-between gap-3">
                                        <span className="text-ink-2">{a.title}</span>
                                        <span className={`shrink-0 tabular ${d?.done ? 'font-medium text-accent-strong' : d?.tries ? 'text-ink-2' : 'text-warm'}`}>
                                            {d?.done ? `Xong · ${d.best ? TIER_LABEL[d.best] : ''}` : d?.tries ? `Đã thử ${d.tries} lần` : 'Chưa chơi'}
                                        </span>
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
