'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, LogOut, School, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthGate from '../components/AuthGate';
import { useLexicaStore } from '../store/lexicaStore';
import { assignedCounts, daysUntil, joinClass, leaderboard, leaveClass, lessonOf, type ClassInfo, type LeaderRow } from '../lib/classes';
import { dungFromScore, lexicaModule } from '@cortex/classroom-lexica';
import { TEACH_URL } from '../lib/cortexConfig';
import { refreshClasses, reportNow } from '../lib/classSync';
import { BRANCH_LABEL } from '../lib/journey/path';
import { getCard } from '../lib/content/repository';

/**
 * "Lớp học" for a student (docs/LEXICA_DIRECTION.md, "Trung tâm"): join a
 * class with the teacher's code, see the words assigned by lesson and how far
 * they got, and the class ranked by words they can use (Dùng).
 */
/** "hạn hôm nay", "còn 3 ngày", "quá hạn". */
function dueLabel(dueOn: string): string {
    const d = daysUntil(dueOn);
    return d < 0 ? 'đã qua hạn' : d === 0 ? 'hạn hôm nay' : d === 1 ? 'hạn ngày mai' : `còn ${d} ngày`;
}

export default function ClassPage() {
    const { user, loading } = useAuth();
    const [classes, setClasses] = useState<ClassInfo[] | null>(null);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setClasses(await refreshClasses(true));
    }, []);

    useEffect(() => {
        if (!user) return;
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [user, load]);

    if (loading) return <div className="min-h-screen bg-bg" />;
    const mine = (classes ?? []).filter((c) => c.role === 'student');
    const teaching = (classes ?? []).some((c) => c.role === 'teacher');

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-muted hover:text-accent text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Lớp học</p>
                    {teaching && TEACH_URL ? (
                        <a href={TEACH_URL} className="text-xs text-muted hover:text-ink text-right whitespace-nowrap">
                            Trang giáo viên
                        </a>
                    ) : (
                        <span className="w-16" />
                    )}
                </div>

                {!user ? (
                    <AuthGate reason="Đăng nhập để vào lớp của trung tâm và gửi tiến độ cho giáo viên." redirectPath="/class" />
                ) : (
                    <>
                        <JoinForm onJoined={load} onError={setError} />
                        {error && <p className="text-sm text-danger">{error}</p>}
                        {classes === null ? (
                            <p className="text-sm text-muted">Đang tải…</p>
                        ) : mine.length === 0 ? (
                            <p className="text-sm text-muted">Bạn chưa ở lớp nào. Nhập mã lớp giáo viên gửi để bắt đầu.</p>
                        ) : (
                            mine.map((c) => <ClassCard key={c.id} cls={c} onLeft={load} />)
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function JoinForm({ onJoined, onError }: { onJoined: () => void; onError: (e: string) => void }) {
    const { profile } = useAuth();
    const [code, setCode] = useState('');
    const [name, setName] = useState(profile?.nickname ?? '');
    const [busy, setBusy] = useState(false);
    const join = async () => {
        if (!code.trim() || !name.trim()) return;
        setBusy(true);
        onError('');
        try {
            await joinClass(code, name);
            setCode('');
            onJoined();
            void reportNow();
        } catch (e) {
            onError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold text-ink flex items-center gap-2">
                <School className="w-4 h-4 text-accent" /> Vào lớp bằng mã
            </p>
            <p className="mt-1 text-xs text-muted">Giáo viên sẽ thấy tên bạn, 4 con số Hiểu, Nhớ, Gặp, Dùng, và số lần sai theo từng nhóm âm. Không thấy gì khác: không có bản ghi giọng nói.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Mã lớp (6 ký tự)" maxLength={6} className="h-11 rounded-xl border border-line bg-bg px-3 font-mono tracking-widest text-ink" aria-label="Mã lớp" />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên hiện trong lớp" maxLength={40} className="h-11 rounded-xl border border-line bg-bg px-3 text-ink" aria-label="Tên hiện trong lớp" />
                <button onClick={() => void join()} disabled={busy || code.trim().length < 6 || !name.trim()} className="h-11 px-5 rounded-xl bg-accent text-on-accent font-bold disabled:opacity-40">
                    {busy ? 'Đang vào…' : 'Vào lớp'}
                </button>
            </div>
        </section>
    );
}

function ClassCard({ cls, onLeft }: { cls: ClassInfo; onLeft: () => void }) {
    const router = useRouter();
    const journeys = useLexicaStore((s) => s.journeys);
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const queueCards = useLexicaStore((s) => s.queueCards);
    const [board, setBoard] = useState<LeaderRow[] | null>(null);
    const mine = assignedCounts(journeys, cls, cardProgress);
    const lessons = cls.assignments.filter((a) => a.app === 'lexica').map((a) => ({ a, words: lessonOf(a) }));
    const branch = lexicaModule.parseSettings(cls.settings.lexica).branch;

    useEffect(() => {
        leaderboard(cls.id)
            .then(setBoard)
            .catch(() => setBoard([]));
    }, [cls.id]);

    const learnNow = () => {
        queueCards(lessons.flatMap((l) => l.words.card_ids));
        router.push('/today');
    };

    return (
        <section data-testid="class-card" className="rounded-2xl border border-line bg-surface p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-semibold text-ink">{cls.name}</p>
                    <p className="font-mono text-[11px] text-muted">
                        {BRANCH_LABEL[branch]} · {cls.members} học viên
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (window.confirm(`Rời lớp ${cls.name}? Giáo viên sẽ không thấy tiến độ của bạn nữa.`)) void leaveClass(cls.id).then(onLeft);
                    }}
                    className="text-xs text-muted hover:text-danger flex items-center gap-1"
                >
                    <LogOut className="w-3.5 h-3.5" /> Rời lớp
                </button>
            </div>

            {lessons.length > 0 && (
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Từ được giao</p>
                    <p className="mt-1 text-sm text-ink">
                        {mine.dung ?? 0}/{mine.total} từ đã Dùng · {mine.nho ?? 0} Nhớ · {mine.hieu ?? 0} Hiểu
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                        {lessons.slice(0, 5).map(({ a, words }) => (
                            <li key={a.id} className="text-ink-2">
                                <span className="font-medium text-ink">{a.title}</span>
                                {a.due_on && <span className={`ml-1.5 font-mono text-[11px] ${daysUntil(a.due_on) <= 1 ? 'text-warning' : 'text-subtle'}`}>{dueLabel(a.due_on)}</span>}
                                <span className="text-muted"> · {words.card_ids.map((id) => getCard(id)?.word.toLowerCase()).filter(Boolean).slice(0, 6).join(', ')}{words.card_ids.length > 6 ? '…' : ''}</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={learnNow} className="mt-3 h-11 px-4 rounded-xl bg-accent text-on-accent font-bold">
                        Học từ của lớp trong phiên hôm nay
                    </button>
                    <p className="mt-1 text-xs text-muted">Phiên Hôm nay luôn chia từ của lớp trước.</p>
                </div>
            )}

            {board && board.length > 0 && (
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-subtle flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Xếp hạng theo từ Dùng
                    </p>
                    <ol className="mt-2 space-y-1">
                        {board.slice(0, 10).map((r, i) => (
                            <li key={`${r.name}-${i}`} className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm ${r.me ? 'bg-accent/10 text-ink' : 'text-ink-2'}`}>
                                <span className="w-5 font-mono text-xs text-muted">{i + 1}</span>
                                {i === 0 && <Crown className="w-3.5 h-3.5 text-warning" />}
                                <span className="flex-1 truncate">
                                    {r.name}
                                    {r.me ? ' (bạn)' : ''}
                                </span>
                                <span className="font-mono text-xs">{dungFromScore(r.score)} Dùng</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </section>
    );
}
