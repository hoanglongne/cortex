'use client';

import Link from 'next/link';
import { Suspense, use } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Presentation } from 'lucide-react';
import { LinkButton, PageHeader } from '../../../components/ui';
import { useBoard } from '../../../lib/teaching';
import { modulesOf } from '../../../modules';
import Overview from '../../../components/class/Overview';
import Students from '../../../components/class/Students';
import Assignments from '../../../components/class/Assignments';
import Report from '../../../components/class/Report';
import Lessons from '../../../components/class/Lessons';
import Tests from '../../../components/class/Tests';
import Settings from '../../../components/class/Settings';

const TABS = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'students', label: 'Học viên' },
    { id: 'assignments', label: 'Bài giao' },
    { id: 'lessons', label: 'Buổi học' },
    { id: 'tests', label: 'Kiểm tra' },
    { id: 'report', label: 'Báo cáo' },
    { id: 'settings', label: 'Cài đặt' },
] as const;
type Tab = (typeof TABS)[number]['id'];

/** One class: seven tabs, each answering one question (Claude Doc, Cấu trúc màn hình). */
export default function ClassPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense>
            <ClassView id={id} />
        </Suspense>
    );
}

function ClassView({ id }: { id: string }) {
    const params = useSearchParams();
    const path = usePathname();
    const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'overview') as Tab;
    const { board, error, reload } = useBoard(id);
    // Only the URL changes: the board is already here, so switching tabs needs
    // no round trip to the server (router.replace would re-render this dynamic
    // route on the server first). useSearchParams follows history.replaceState.
    const go = (t: Tab) => window.history.replaceState(null, '', `${path}?tab=${t}`);

    if (error) {
        return (
            <p className="text-danger">
                {error}{' '}
                <Link href="/classes" className="text-accent underline">
                    Về danh sách lớp
                </Link>
            </p>
        );
    }
    if (!board) return <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />;
    const c = board.class;

    return (
        <>
            <Link href="/classes" className="text-sm text-muted hover:text-ink">
                ← Lớp của tôi
            </Link>
            <div className="mt-2">
                <PageHeader
                    title={c.name}
                    actions={
                        <LinkButton href={`/present/${c.id}`} kind="secondary" size="sm">
                            <Presentation className="h-4 w-4" /> Trên lớp
                        </LinkButton>
                    }
                    sub={[...modulesOf(board).map((m) => [m.core.name, m.settingsLine(c.settings[m.core.id])].filter(Boolean).join(': ')), c.org ?? 'Lớp riêng', `${board.students.length} học viên`].join(' · ')}
                />
            </div>
            <nav className="-mt-2 mb-6 flex gap-1 overflow-x-auto border-b border-line" aria-label="Các mục của lớp">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => go(t.id)}
                        className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[15px] ${tab === t.id ? 'border-accent font-semibold text-accent-strong' : 'border-transparent text-muted hover:text-ink'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>
            {tab === 'overview' && <Overview board={board} onGo={go} onChanged={reload} />}
            {tab === 'students' && <Students board={board} onChanged={reload} welcome={params.get('welcome') === '1'} filter={params.get('filter')} />}
            {tab === 'assignments' && <Assignments board={board} onChanged={reload} startOpen={params.get('assign') === '1'} />}
            {tab === 'lessons' && <Lessons board={board} startRoll={params.get('roll')} />}
            {tab === 'tests' && <Tests board={board} />}
            {tab === 'report' && <Report board={board} />}
            {tab === 'settings' && <Settings board={board} onChanged={reload} />}
        </>
    );
}
