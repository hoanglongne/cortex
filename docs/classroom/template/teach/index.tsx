'use client';

/** MyApp's screens in the teacher app (docs/CLASSROOM.md, "Màn hình"). */
import { useState } from 'react';
import { studentApp } from '@cortex/classroom';
import { myappModule, type MyAppSettings, type TopicPayload } from '@cortex/classroom-myapp';
import { Button, Field, inputClass } from '../../components/ui';
import { LEXICA_URL } from '../../lib/config'; // add MYAPP_URL to lib/config.ts
import type { ModuleUI } from '../types';

export const myappUI: ModuleUI = {
    core: myappModule as ModuleUI['core'],
    dot: 'bg-step-gap',
    appUrl: LEXICA_URL,
    progressLabels: { done: 'đã nói xong' },
    SettingsFields: ({ value, onChange }) => {
        const s = myappModule.parseSettings(value);
        return (
            <Field label="Trình độ">
                <select value={s.level ?? ''} onChange={(e) => onChange({ ...s, level: myappModule.parseSettings({ level: e.target.value }).level } satisfies MyAppSettings)} className={inputClass}>
                    <option value="">Để học viên tự chọn</option>
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                </select>
            </Field>
        );
    },
    settingsLine: (raw) => myappModule.parseSettings(raw).level,
    StudentSummary: ({ app }) => <span className="text-sm text-muted tabular">{app ? `${myappModule.parseMetrics(app.metrics).minutes} phút nói` : 'Chưa học'}</span>,
    StudentSection: ({ student }) => {
        const app = studentApp(myappModule, student);
        return <p className="text-sm text-ink-2">{app ? `${app.metrics.sessions} buổi · ${app.metrics.minutes} phút` : 'Em chưa mở MyApp.'}</p>;
    },
    ClassSummary: ({ board }) => {
        const minutes = board.students.reduce((n, s) => n + myappModule.parseMetrics(s.apps.myapp?.metrics).minutes, 0);
        return <p className="text-sm text-muted">{minutes} phút nói cả lớp</p>;
    },
    AssignmentBody: ({ assignment }) => {
        const p = myappModule.parsePayload(assignment.kind, assignment.payload);
        return <p className="text-sm text-ink-2">{p.topic} · {p.minutes} phút</p>;
    },
    AssignForm: ({ onSubmit, onCancel }) => {
        const [topic, setTopic] = useState('');
        const [title, setTitle] = useState('');
        return (
            <div className="space-y-4">
                <Field label="Tên bài">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Chủ đề nói">
                    <input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass} />
                </Field>
                <div className="flex gap-2">
                    <Button kind="secondary" onClick={onCancel}>Huỷ</Button>
                    <Button
                        disabled={title.trim().length < 2 || topic.trim().length < 2}
                        onClick={() => void onSubmit({ kind: 'topic', title: title.trim(), payload: { topic: topic.trim(), minutes: 5 } satisfies TopicPayload, due: null })}
                    >
                        Giao bài
                    </Button>
                </div>
            </div>
        );
    },
};
