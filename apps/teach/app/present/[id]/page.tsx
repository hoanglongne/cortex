'use client';

import Link from 'next/link';
import { Suspense, use, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, Maximize, UserCheck, X } from 'lucide-react';
import { rollMarks } from '@cortex/classroom';
import { lexicaModule } from '@cortex/classroom-lexica';
import { hasAccess, useSession } from '../../lib/session';
import { useBoard } from '../../lib/teaching';
import { api } from '../../lib/supabase';
import { localDay } from '../../lib/forecasts';
import { useClassAttendance } from '../../lib/useAttendance';
import { errorText } from '../../components/ui';
import { wordIndex, type IndexCard, type WordIndex } from '../../modules/lexica/words';
import { useClassScores } from '../../modules/lexica/scores';
import type { Person } from '../../lib/classroom/tools';
import Slides from '../../components/present/Slides';
import Picker from '../../components/present/Picker';
import Groups from '../../components/present/Groups';
import Arena from '../../components/arena/Arena';
import Speaking from '../../components/present/Speaking';

const TOOLS = [
    { id: 'slides', label: 'Trình chiếu từ' },
    { id: 'pick', label: 'Gọi tên' },
    { id: 'groups', label: 'Chia nhóm' },
    { id: 'arena', label: 'Đấu trường' },
    { id: 'speak', label: 'Luyện nói' },
] as const;
type Tool = (typeof TOOLS)[number]['id'];

/**
 * "Trên lớp" (docs/TEACH_PLAN.md, T1): the class on the projector, without
 * the app's sidebar. The lesson's words as slides, calling on a student,
 * splitting into groups; the roll taken here is saved as today's attendance.
 */
export default function PresentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense>
            <Present id={id} />
        </Suspense>
    );
}

/**
 * Who is absent today: the roll saved for today (sql/classroom_attendance.sql),
 * with the teacher's taps on top until they save. Absent and on leave both
 * count as away here.
 */
function useAbsent(classId: string, studentIds: readonly string[]) {
    const [today] = useState(() => localDay(Date.now()));
    const { attendance, reload } = useClassAttendance(classId, today);
    const saved = attendance?.sessions.find((x) => x.date === today && !x.cancelled);
    const savedAbsent = useMemo(() => studentIds.filter((sid) => saved?.marks[sid] === 'absent' || saved?.marks[sid] === 'excused'), [saved, studentIds]);
    const [local, setLocal] = useState<string[] | null>(null);
    const absent = local ?? savedAbsent;
    const toggle = (sid: string) => setLocal((a) => {
        const base = a ?? savedAbsent;
        return base.includes(sid) ? base.filter((x) => x !== sid) : [...base, sid];
    });
    const save = async () => {
        await api.markAttendance(classId, today, rollMarks(studentIds, absent, saved?.marks ?? {}));
        await reload();
        setLocal(null);
    };
    return { absent, toggle, save, dirty: local !== null, saved: Boolean(saved && Object.keys(saved.marks).length) };
}

function Present({ id }: { id: string }) {
    const router = useRouter();
    const path = usePathname();
    const params = useSearchParams();
    const { loading, session, me } = useSession();
    const { board, error } = useBoard(id);
    const scores = useClassScores(id);
    const [words, setWords] = useState<WordIndex | null>(null);
    const [roll, setRoll] = useState(false);
    const ids = useMemo(() => (board?.students ?? []).map((s) => s.user_id), [board]);
    const { absent, toggle, save, dirty, saved } = useAbsent(id, ids);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const tool = (TOOLS.find((t) => t.id === params.get('tool'))?.id ?? 'slides') as Tool;
    const assignmentId = params.get('assignment');

    useEffect(() => {
        if (!loading && !session) router.replace(`/login?next=${encodeURIComponent(`${path}?${params.toString()}`)}`);
    }, [loading, session, router, path, params]);
    useEffect(() => {
        void wordIndex().then(setWords);
    }, []);

    const setParams = (patch: Record<string, string | null>) => {
        const q = new URLSearchParams(params.toString());
        for (const [k, v] of Object.entries(patch)) {
            if (v === null) q.delete(k);
            else q.set(k, v);
        }
        window.history.replaceState(null, '', `${path}?${q.toString()}`);
    };
    const setParam = (k: string, v: string | null) => setParams({ [k]: v });
    // Words to teach again from the arena (?words=id,id), instead of a lesson
    const again = params.get('words')?.split(',').filter(Boolean) ?? null;

    const lessons = useMemo(() => (board?.assignments ?? []).filter((a) => a.app === 'lexica'), [board]);
    const lesson = lessons.find((a) => a.id === assignmentId) ?? lessons[0] ?? null;
    const againKey = again?.join(',') ?? '';
    const cards = useMemo<IndexCard[]>(() => {
        if (!words) return [];
        const ids = againKey ? againKey.split(',') : lesson ? lexicaModule.parsePayload('words', lesson.payload).card_ids : [];
        return ids.map((cid) => words.byId.get(cid)).filter((c): c is IndexCard => Boolean(c));
    }, [lesson, words, againKey]);

    const present = useMemo<Person[]>(() => {
        if (!board) return [];
        const withScore = board.students.filter((s) => scores?.[s.user_id]).length;
        // A verified score when most of the class has one, else words remembered: one scale for everyone.
        const byScore = withScore * 2 >= board.students.length && withScore > 0;
        return board.students
            .filter((s) => !absent.includes(s.user_id))
            .map((s) => ({
                id: s.user_id,
                name: s.name,
                strength: byScore ? (scores?.[s.user_id]?.score ?? null) : lexicaModule.parseMetrics(s.apps.lexica?.metrics).counts.nho ?? null,
            }));
    }, [board, scores, absent]);

    if (loading || !session) return <div className="min-h-screen bg-bg" />;
    if (!hasAccess(me)) return <p className="p-8 text-muted">Tài khoản này chưa có quyền dạy.</p>;
    if (error)
        return (
            <p className="p-8 text-danger">
                {error} <Link href="/classes" className="text-accent underline">Về danh sách lớp</Link>
            </p>
        );
    if (!board) return <div className="min-h-screen bg-bg" />;

    // A student remembers a word from Nhớ on (step 2 and up in the class report).
    const remembered = (cardId: string) => board.students.filter((s) => (lexicaModule.parseMetrics(s.apps.lexica?.metrics).words[cardId] ?? 0) >= 2).length;

    return (
        <div className="flex h-dvh flex-col bg-bg">
            <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
                <Link href={`/classes/${id}`} aria-label="Thoát" className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:text-ink">
                    <X className="h-5 w-5" />
                </Link>
                <p className="mr-2 font-semibold text-ink">{board.class.name}</p>
                <nav className="flex gap-1" aria-label="Công cụ">
                    {TOOLS.map((t) => (
                        <button key={t.id} onClick={() => setParam('tool', t.id)} aria-pressed={tool === t.id} className={`h-10 rounded-xl px-3 text-sm ${tool === t.id ? 'bg-accent-soft font-semibold text-accent-strong' : 'text-muted hover:text-ink'}`}>
                            {t.label}
                        </button>
                    ))}
                </nav>
                {tool === 'slides' && again && (
                    <span className="flex h-10 items-center gap-2 rounded-xl bg-warm-soft px-3 text-sm text-warm">
                        {again.length} từ khó từ Đấu trường
                        <button onClick={() => setParam('words', null)} aria-label="Về bài giao" className="text-warm hover:text-ink">
                            <X className="h-4 w-4" />
                        </button>
                    </span>
                )}
                {tool === 'slides' && !again && lessons.length > 1 && (
                    <select value={lesson?.id ?? ''} onChange={(e) => setParam('assignment', e.target.value)} aria-label="Bài" className="h-10 max-w-[14rem] rounded-xl border border-line bg-surface px-2 text-sm text-ink-2">
                        {lessons.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.title}
                            </option>
                        ))}
                    </select>
                )}
                <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => setRoll((r) => !r)} aria-pressed={roll} className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm ${roll ? 'bg-accent-soft text-accent-strong' : 'text-muted hover:text-ink'}`}>
                        <UserCheck className="h-4 w-4" /> Điểm danh{absent.length > 0 ? ` · vắng ${absent.length}` : ''}
                        {dirty ? <span className="text-warm"> · chưa lưu</span> : saved ? <Check className="h-4 w-4 text-accent" aria-label="đã lưu" /> : null}
                    </button>
                    <button onClick={() => void document.documentElement.requestFullscreen?.()} aria-label="Toàn màn hình" className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:text-ink">
                        <Maximize className="h-4 w-4" />
                    </button>
                </div>
            </header>

            {roll && (
                <div className="border-b border-line bg-surface px-4 py-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-muted">Bấm tên em vắng hôm nay. Em vắng không bị gọi tên, không vào nhóm. Lưu để Teach nhớ cho báo cáo phụ huynh.</p>
                        <span className="flex items-center gap-2">
                            {saveError && <span className="text-xs text-danger">{saveError}</span>}
                            <button
                                disabled={saving || (!dirty && saved)}
                                onClick={async () => {
                                    setSaving(true);
                                    setSaveError('');
                                    try {
                                        await save();
                                    } catch (e) {
                                        setSaveError(errorText(e));
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                className="h-9 rounded-xl bg-accent px-3 text-sm font-semibold text-on-accent hover:bg-accent-strong disabled:opacity-40"
                            >
                                {!dirty && saved ? 'Đã lưu' : `Lưu: ${ids.length - absent.length}/${ids.length} có mặt`}
                            </button>
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {board.students.map((s) => {
                            const off = absent.includes(s.user_id);
                            return (
                                <button key={s.user_id} onClick={() => toggle(s.user_id)} aria-pressed={off} className={`h-9 rounded-full border px-3 text-sm ${off ? 'border-line text-subtle line-through' : 'border-line-strong text-ink'}`}>
                                    {s.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <main className="min-h-0 flex-1">
                {tool === 'slides' &&
                    (lessons.length === 0 && !again ? (
                        <p className="p-10 text-center text-muted">Lớp chưa có bài từ vựng nào. Giao một bài ở mục Bài giao rồi quay lại trình chiếu.</p>
                    ) : !words ? (
                        <div className="h-full animate-pulse bg-surface-2/40" />
                    ) : words.error ? (
                        <p className="p-10 text-center text-danger">{words.error}</p>
                    ) : (
                        <Slides key={againKey || lesson?.id} cards={cards} remembered={remembered} students={board.students.length} />
                    ))}
                {tool === 'pick' && <Picker classId={id} people={present} onAbsent={(sid) => !absent.includes(sid) && toggle(sid)} />}
                {tool === 'groups' && <Groups people={present} />}
                {tool === 'speak' && <Speaking board={board} people={present} />}
                {tool === 'arena' && <Arena board={board} words={words} people={present} onTeach={(ids) => setParams({ tool: 'slides', words: ids.join(',') })} />}
            </main>
        </div>
    );
}
