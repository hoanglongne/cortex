'use client';

import Link from 'next/link';
import { Suspense, use, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Maximize, UserCheck, X } from 'lucide-react';
import { lexicaModule } from '@cortex/classroom-lexica';
import { hasAccess, useSession } from '../../lib/session';
import { useBoard } from '../../lib/teaching';
import { wordIndex, type IndexCard, type WordIndex } from '../../modules/lexica/words';
import { useClassScores } from '../../modules/lexica/scores';
import type { Person } from '../../lib/classroom/tools';
import Slides from '../../components/present/Slides';
import Picker from '../../components/present/Picker';
import Groups from '../../components/present/Groups';

const TOOLS = [
    { id: 'slides', label: 'Trình chiếu từ' },
    { id: 'pick', label: 'Gọi tên' },
    { id: 'groups', label: 'Chia nhóm' },
] as const;
type Tool = (typeof TOOLS)[number]['id'];

/**
 * "Trên lớp" (docs/TEACH_PLAN.md, T1): the class on the projector, without
 * the app's sidebar. The lesson's words as slides, calling on a student,
 * splitting into groups; who is absent today is kept for the three.
 */
export default function PresentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense>
            <Present id={id} />
        </Suspense>
    );
}

/** Who is absent today, kept in this tab (sessionStorage) so a reload keeps it. */
function useAbsent(classId: string) {
    const key = `teach-absent-${classId}-${new Date().toDateString()}`;
    const [absent, setAbsent] = useState<string[]>(() => {
        try {
            return JSON.parse(sessionStorage.getItem(key) ?? '[]') as string[];
        } catch {
            return [];
        }
    });
    const toggle = (id: string) =>
        setAbsent((a) => {
            const next = a.includes(id) ? a.filter((x) => x !== id) : [...a, id];
            try {
                sessionStorage.setItem(key, JSON.stringify(next));
            } catch {
                // private mode: for this visit only
            }
            return next;
        });
    return { absent, toggle };
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
    const { absent, toggle } = useAbsent(id);
    const tool = (TOOLS.find((t) => t.id === params.get('tool'))?.id ?? 'slides') as Tool;
    const assignmentId = params.get('assignment');

    useEffect(() => {
        if (!loading && !session) router.replace(`/login?next=${encodeURIComponent(`${path}?${params.toString()}`)}`);
    }, [loading, session, router, path, params]);
    useEffect(() => {
        void wordIndex().then(setWords);
    }, []);

    const setParam = (k: string, v: string | null) => {
        const q = new URLSearchParams(params.toString());
        if (v === null) q.delete(k);
        else q.set(k, v);
        window.history.replaceState(null, '', `${path}?${q.toString()}`);
    };

    const lessons = useMemo(() => (board?.assignments ?? []).filter((a) => a.app === 'lexica'), [board]);
    const lesson = lessons.find((a) => a.id === assignmentId) ?? lessons[0] ?? null;
    const cards = useMemo<IndexCard[]>(() => {
        if (!lesson || !words) return [];
        return lexicaModule.parsePayload('words', lesson.payload).card_ids.map((cid) => words.byId.get(cid)).filter((c): c is IndexCard => Boolean(c));
    }, [lesson, words]);

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
                {tool === 'slides' && lessons.length > 1 && (
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
                    </button>
                    <button onClick={() => void document.documentElement.requestFullscreen?.()} aria-label="Toàn màn hình" className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:text-ink">
                        <Maximize className="h-4 w-4" />
                    </button>
                </div>
            </header>

            {roll && (
                <div className="border-b border-line bg-surface px-4 py-3">
                    <p className="mb-2 text-xs text-muted">Bấm tên em vắng hôm nay. Em vắng không bị gọi tên, không vào nhóm.</p>
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
                    (lessons.length === 0 ? (
                        <p className="p-10 text-center text-muted">Lớp chưa có bài từ vựng nào. Giao một bài ở mục Bài giao rồi quay lại trình chiếu.</p>
                    ) : !words ? (
                        <div className="h-full animate-pulse bg-surface-2/40" />
                    ) : words.error ? (
                        <p className="p-10 text-center text-danger">{words.error}</p>
                    ) : (
                        <Slides key={lesson?.id} cards={cards} remembered={remembered} students={board.students.length} />
                    ))}
                {tool === 'pick' && <Picker classId={id} people={present} onAbsent={(sid) => !absent.includes(sid) && toggle(sid)} />}
                {tool === 'groups' && <Groups people={present} />}
            </main>
        </div>
    );
}
