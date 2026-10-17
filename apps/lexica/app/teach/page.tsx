'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Building2, ChevronRight, Plus } from 'lucide-react';
import ClassCode from '../components/ClassCode';
import { useAuth } from '../context/AuthContext';
import AuthGate from '../components/AuthGate';
import { addTeacher, createClass, createOrg, myClasses, myOrgs, orgOverview, type ClassInfo, type OrgInfo, type OrgOverview } from '../lib/classes';
import { BRANCH_LABEL, type Branch } from '../lib/journey/path';
import { LEVELS } from '../lib/levels';

/**
 * "Lớp tôi dạy" (docs/LEXICA_DIRECTION.md, "Trung tâm"): a teacher makes a
 * class and shares its code; a center admin sees seats and every class.
 */
export default function TeachPage() {
    const { user, loading } = useAuth();
    const [classes, setClasses] = useState<ClassInfo[] | null>(null);
    const [orgs, setOrgs] = useState<OrgInfo[]>([]);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            const [c, o] = await Promise.all([myClasses(), myOrgs()]);
            setClasses(c.filter((x) => x.role === 'teacher'));
            setOrgs(o);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setClasses([]);
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [user, load]);

    if (loading) return <div className="min-h-screen bg-bg" />;

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <Link href="/class" className="text-muted hover:text-accent text-sm">
                        ← Lớp học
                    </Link>
                    <p className="text-ink font-bold">Lớp tôi dạy</p>
                    <div className="w-16" />
                </div>
                <p className="text-sm text-muted">
                    Bạn dạy trên lớp, Lexica giữ từ giữa hai buổi học. Tạo lớp, gửi mã cho học viên, giao từ theo bài, rồi xem 4 con số của từng người.
                </p>

                {!user ? (
                    <AuthGate reason="Đăng nhập để tạo lớp và xem tiến độ học viên." redirectPath="/teach" />
                ) : (
                    <>
                        {error && <p className="text-sm text-danger">{error}</p>}
                        <NewClass orgs={orgs} onCreated={load} onError={setError} />
                        {classes === null ? (
                            <p className="text-sm text-muted">Đang tải…</p>
                        ) : classes.length === 0 ? (
                            <p className="text-sm text-muted">Chưa có lớp nào.</p>
                        ) : (
                            <ul className="space-y-2">
                                {classes.map((c) => (
                                    <li key={c.id}>
                                        <Link href={`/teach/${c.id}`} data-testid="teach-class" className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-line-strong">
                                            <span className="flex-1 min-w-0">
                                                <span className="block font-semibold text-ink truncate">{c.name}</span>
                                                <span className="block font-mono text-[11px] text-muted">
                                                    {BRANCH_LABEL[c.branch]} · {c.members} học viên · {c.assignments.length} bài đã giao
                                                </span>
                                            </span>
                                            <ClassCode code={c.code ?? ''} />
                                            <ChevronRight className="w-4 h-4 text-subtle" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Centers orgs={orgs} onChanged={load} onError={setError} />
                    </>
                )}
            </div>
        </div>
    );
}

function NewClass({ orgs, onCreated, onError }: { orgs: OrgInfo[]; onCreated: () => void; onError: (e: string) => void }) {
    const [name, setName] = useState('');
    const [branch, setBranch] = useState<Branch>('cert');
    const [level, setLevel] = useState<string>('intermediate');
    const [org, setOrg] = useState<string>('');
    const [busy, setBusy] = useState(false);
    const create = async () => {
        if (name.trim().length < 2) return;
        setBusy(true);
        onError('');
        try {
            await createClass(name.trim(), branch, level, org || null);
            setName('');
            onCreated();
        } catch (e) {
            onError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };
    const select = 'h-11 rounded-xl border border-line bg-bg px-3 text-sm text-ink';
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold text-ink flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" /> Tạo lớp mới
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên lớp, ví dụ IELTS tối 2-4-6" maxLength={80} className={`${select} sm:col-span-2`} aria-label="Tên lớp" />
                <select value={branch} onChange={(e) => setBranch(e.target.value as Branch)} className={select} aria-label="Nhánh">
                    {(['cert', 'talk'] as const).map((b) => (
                        <option key={b} value={b}>
                            {BRANCH_LABEL[b]}
                        </option>
                    ))}
                </select>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className={select} aria-label="Level">
                    {LEVELS.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.label} · {l.cefr}
                        </option>
                    ))}
                </select>
                {orgs.length > 0 && (
                    <select value={org} onChange={(e) => setOrg(e.target.value)} className={`${select} sm:col-span-2`} aria-label="Trung tâm">
                        <option value="">Lớp riêng (tối đa 60 học viên)</option>
                        {orgs.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <button onClick={() => void create()} disabled={busy || name.trim().length < 2} className="mt-3 h-11 px-5 rounded-xl bg-accent text-on-accent font-bold disabled:opacity-40">
                {busy ? 'Đang tạo…' : 'Tạo lớp'}
            </button>
        </section>
    );
}

function Centers({ orgs, onChanged, onError }: { orgs: OrgInfo[]; onChanged: () => void; onError: (e: string) => void }) {
    const [name, setName] = useState('');
    const admin = orgs.filter((o) => o.role === 'admin');
    return (
        <section className="rounded-2xl border border-line bg-surface p-4 space-y-4">
            <p className="font-semibold text-ink flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" /> Trung tâm
            </p>
            {admin.map((o) => (
                <OrgPanel key={o.id} org={o} onError={onError} />
            ))}
            {orgs.filter((o) => o.role === 'teacher').map((o) => (
                <p key={o.id} className="text-sm text-ink-2">
                    Giáo viên tại <span className="font-medium text-ink">{o.name}</span>
                </p>
            ))}
            <div className="flex flex-wrap gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên trung tâm" maxLength={80} className="h-10 flex-1 min-w-48 rounded-xl border border-line bg-bg px-3 text-sm text-ink" aria-label="Tên trung tâm" />
                <button
                    onClick={() =>
                        void createOrg(name.trim())
                            .then(() => {
                                setName('');
                                onChanged();
                            })
                            .catch((e) => onError(e instanceof Error ? e.message : String(e)))
                    }
                    disabled={name.trim().length < 2}
                    className="h-10 px-4 rounded-xl border border-line text-sm text-ink disabled:opacity-40 hover:border-line-strong"
                >
                    Tạo trung tâm
                </button>
            </div>
            <p className="text-xs text-muted">Trung tâm gom nhiều lớp và giáo viên, có số chỗ chung (bản chạy thử: 30 chỗ).</p>
        </section>
    );
}

function OrgPanel({ org, onError }: { org: OrgInfo; onError: (e: string) => void }) {
    const [view, setView] = useState<OrgOverview | null>(null);
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');
    useEffect(() => {
        orgOverview(org.id)
            .then(setView)
            .catch((e) => onError(e instanceof Error ? e.message : String(e)));
    }, [org.id, onError]);
    return (
        <div data-testid="org-panel" className="rounded-xl border border-line p-3">
            <p className="font-medium text-ink">{org.name}</p>
            {view && (
                <>
                    <p className="mt-1 font-mono text-[11px] text-muted">
                        {view.used}/{view.seats} chỗ · {view.teachers} giáo viên · {view.classes.length} lớp
                    </p>
                    {view.classes.length > 0 && (
                        <table className="mt-2 w-full text-xs">
                            <thead className="text-subtle">
                                <tr>
                                    <th className="text-left font-normal py-1">Lớp</th>
                                    <th className="text-right font-normal">Học viên</th>
                                    <th className="text-right font-normal">Học tuần này</th>
                                    <th className="text-right font-normal">TB Nhớ</th>
                                    <th className="text-right font-normal">TB Dùng</th>
                                </tr>
                            </thead>
                            <tbody className="text-ink-2">
                                {view.classes.map((c) => (
                                    <tr key={c.id} className="border-t border-line">
                                        <td className="py-1">{c.name}</td>
                                        <td className="text-right">{c.members}</td>
                                        <td className="text-right">{c.active_week}</td>
                                        <td className="text-right">{c.avg_nho ?? '–'}</td>
                                        <td className="text-right">{c.avg_dung ?? '–'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email giáo viên" type="email" className="h-9 flex-1 min-w-48 rounded-lg border border-line bg-bg px-3 text-sm text-ink" aria-label="Email giáo viên" />
                <button
                    onClick={() =>
                        void addTeacher(org.id, email)
                            .then(() => {
                                setEmail('');
                                setNote('Đã thêm giáo viên.');
                            })
                            .catch((e) => onError(e instanceof Error ? e.message : String(e)))
                    }
                    disabled={!email.includes('@')}
                    className="h-9 px-3 rounded-lg border border-line text-sm text-ink disabled:opacity-40"
                >
                    Thêm giáo viên
                </button>
            </div>
            {note && <p className="mt-1 text-xs text-accent">{note}</p>}
        </div>
    );
}
