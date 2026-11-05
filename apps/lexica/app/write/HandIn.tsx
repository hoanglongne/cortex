'use client';

import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { capture } from '../lib/productAnalytics';
import { readCachedClasses } from '../lib/classes';
import { refreshClasses } from '../lib/classSync';
import { handIn, type WritingKind } from '../lib/writing/handIn';

/**
 * "Nộp cho lớp": only for a student who is in a class that uses Lexica. Says who
 * will read it before anything is sent, and sends one piece per tap.
 */
export default function HandIn({ kind, prompt, body }: { kind: WritingKind; prompt: string; body: string }) {
    const [classes, setClasses] = useState(() => readCachedClasses().filter((c) => c.role === 'student'));
    const [classId, setClassId] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sentBody, setSentBody] = useState<string | null>(null);

    useEffect(() => {
        let live = true;
        void refreshClasses().then((list) => live && setClasses(list.filter((c) => c.role === 'student')));
        return () => {
            live = false;
        };
    }, []);

    if (classes.length === 0) return null;
    const chosen = classes.find((c) => c.id === classId) ?? classes[0];
    const sent = sentBody === body;
    const empty = body.trim().length === 0;

    const send = async () => {
        setBusy(true);
        setError(null);
        const err = await handIn(chosen.id, kind, prompt, body);
        setBusy(false);
        if (err) return setError(err);
        setSentBody(body);
        capture('practice_completed', { mode: `write_handin_${kind}` }, { track: 'writing', classId: chosen.id });
    };

    return (
        <div className="space-y-2 rounded-xl border border-line p-3">
            <p className="text-sm font-semibold text-ink">Nộp cho lớp</p>
            {classes.length > 1 && (
                <select value={chosen.id} onChange={(e) => setClassId(e.target.value)} aria-label="Chọn lớp" className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink">
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            )}
            <p className="text-xs text-muted">
                Chỉ giáo viên của lớp <b>{chosen.name}</b> đọc được bài này, không bạn nào khác. Bài tự xoá sau 30 ngày, bạn cũng xoá ngay được ở mục “Bài đã nộp”. Giáo viên có thể chấm và viết nhận xét cho bạn.
            </p>
            <button type="button" disabled={busy || empty || sent} onClick={() => void send()} className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-on-accent disabled:opacity-50">
                <Send className="h-4 w-4" aria-hidden /> {sent ? 'Đã nộp' : busy ? 'Đang nộp…' : 'Nộp bài này'}
            </button>
            {error && (
                <p className="text-xs font-semibold text-danger" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
