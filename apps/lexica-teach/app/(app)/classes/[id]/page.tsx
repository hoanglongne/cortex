'use client';

import Link from 'next/link';
import { Suspense, use } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '../../../components/ui';
import { useBoard } from '../../../lib/board';
import { BRANCH_LABEL, levelLabel } from '../../../lib/labels';
import Overview from '../../../components/class/Overview';
import Students from '../../../components/class/Students';
import Assignments from '../../../components/class/Assignments';
import Report from '../../../components/class/Report';
import Settings from '../../../components/class/Settings';

const TABS = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'students', label: 'Học viên' },
    { id: 'assignments', label: 'Bài giao' },
    { id: 'report', label: 'Báo cáo' },
    { id: 'settings', label: 'Cài đặt' },
] as const;
type Tab = (typeof TABS)[number]['id'];

/** One class: five tabs, each answering one question (Claude Doc, Cấu trúc màn hình). */
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
    const router = useRouter();
    const path = usePathname();
    const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'overview') as Tab;
    const { board, words, error, reload } = useBoard(id);
    const go = (t: Tab) => router.replace(`${path}?tab=${t}`, { scroll: false });

    if (error) {
        return (
            <p className="text-danger">
                {error} <Link href="/classes" className="text-accent underline">Về danh sách lớp</Link>
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
                <PageHeader title={c.name} sub={[BRANCH_LABEL[c.branch], levelLabel(c.level), c.org ?? 'Lớp riêng', `${board.students.length} học viên`].filter(Boolean).join(' · ')} />
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
            {tab === 'overview' && <Overview board={board} words={words} onGo={go} />}
            {tab === 'students' && <Students board={board} onChanged={reload} welcome={params.get('welcome') === '1'} filter={params.get('filter')} />}
            {tab === 'assignments' && <Assignments board={board} words={words} onChanged={reload} startOpen={params.get('assign') === '1'} />}
            {tab === 'report' && <Report board={board} />}
            {tab === 'settings' && <Settings board={board} onChanged={reload} />}
        </>
    );
}
