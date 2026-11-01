'use client';

import { useEffect, useState } from 'react';
import { Button, ErrorNote, errorText, Field, inputClass } from '../../components/ui';
import type { StoryMission } from '../../lib/arena';
import type { ModuleUI } from '../types';

type Kind = 'mission' | 'review';

/**
 * Giving Synapse work: a written mission to clear by a date, or a review
 * mission ("Ôn bằng truyện") built from the phrases each student misses.
 */
const AssignForm: ModuleUI['AssignForm'] = ({ onSubmit, onCancel }) => {
    const [missions, setMissions] = useState<StoryMission[] | null>(null);
    const [kind, setKind] = useState<Kind>('mission');
    const [key, setKey] = useState('');
    const [title, setTitle] = useState('');
    const [due, setDue] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/synapse?missions=1')
            .then((r) => (r.ok ? (r.json() as Promise<StoryMission[]>) : Promise.reject(new Error('Không lấy được danh sách nhiệm vụ'))))
            .then((list) => {
                setMissions(list);
                setKey((k) => k || (list[0] ? `${list[0].loreId}/${list[0].missionId}` : ''));
            })
            .catch((e: unknown) => {
                setMissions([]);
                setError(errorText(e));
            });
    }, []);

    const chosen = missions?.find((m) => `${m.loreId}/${m.missionId}` === key);
    const suggested = kind === 'review' ? 'Ôn bằng truyện' : `Nhiệm vụ: ${chosen?.name ?? ''}`;
    const ready = kind === 'review' || Boolean(chosen);

    const give = async () => {
        setBusy(true);
        setError('');
        try {
            const payload = kind === 'review' ? {} : { lore_id: chosen!.loreId, mission_id: chosen!.missionId, name: chosen!.name };
            await onSubmit({ kind, title: (title.trim() || suggested).slice(0, 120), payload, due: due || null });
        } catch (e) {
            setError(errorText(e));
            setBusy(false);
        }
    };

    const chip = (on: boolean) => `h-11 rounded-full border px-4 text-[15px] ${on ? 'border-accent bg-accent-soft font-semibold text-accent-strong' : 'border-line-strong text-ink-2 hover:bg-surface-2'}`;
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <button className={chip(kind === 'mission')} onClick={() => setKind('mission')}>
                    Một nhiệm vụ truyện
                </button>
                <button className={chip(kind === 'review')} onClick={() => setKind('review')}>
                    Ôn bằng truyện
                </button>
            </div>
            {kind === 'mission' ? (
                missions === null ? (
                    <p className="text-sm text-muted">Đang tải nhiệm vụ…</p>
                ) : missions.length === 0 ? (
                    <p className="text-sm text-muted">Chưa có nhiệm vụ viết sẵn.</p>
                ) : (
                    <Field label="Nhiệm vụ" hint="Em chơi trong Synapse, xong khi qua nhiệm vụ (không phải kết thúc dở dang).">
                        <select value={key} onChange={(e) => setKey(e.target.value)} className={inputClass}>
                            {missions.map((m) => (
                                <option key={`${m.loreId}/${m.missionId}`} value={`${m.loreId}/${m.missionId}`}>
                                    {m.name} ({m.scenes} cảnh{m.level ? `, ${m.level}` : ''})
                                </option>
                            ))}
                        </select>
                    </Field>
                )
            ) : (
                <p className="text-sm text-muted">Mỗi em chơi 3 cảnh mới về các cụm em hay nhầm. Em nào chưa nhầm cụm nào thì chưa có bài để làm.</p>
            )}
            <Field label="Tên bài" hint={`Để trống: “${suggested}”`}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputClass} placeholder={suggested} />
            </Field>
            <Field label="Hạn (không bắt buộc)">
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
            </Field>
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
