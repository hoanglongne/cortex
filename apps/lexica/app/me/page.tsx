'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, ChevronRight, Compass, Gauge, MessageSquareHeart, Route, School, Settings, Swords, Users } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { hardWords } from '../lib/engagement/hard';
import { ARCHETYPE_OPTIONS } from '../lib/content/persona';
import { BRANCH_LABEL } from '../lib/journey/path';
import BranchCompare from '../components/BranchCompare';
import { BRANCH_PROMISE } from '../lib/journey/branchInfo';
import PaceChooser from '../components/PaceChooser';
import StepNumbers from '../components/StepNumbers';

const chip = (on: boolean) => `h-9 px-3 rounded-lg border text-xs font-medium ${on ? 'bg-accent/12 border-accent/40 text-accent' : 'bg-surface-2/40 border-line-strong/50 text-ink-2'}`;

/**
 * "Tôi": where the learner stands, their path and settings, and the places
 * that are about them (class, buddy, statistics). Was a sheet on Home.
 */
export default function MePage() {
    const router = useRouter();
    const path = useLexicaStore((s) => s.path);
    const setPath = useLexicaStore((s) => s.setPath);
    const userArchetype = useLexicaStore((s) => s.userArchetype);
    const setUserArchetype = useLexicaStore((s) => s.setUserArchetype);
    const mySentenceOff = useLexicaStore((s) => s.mySentencePrompt.off);
    const setMySentenceOff = useLexicaStore((s) => s.setMySentenceOff);
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const hardCount = hardWords(cardProgress).length;
    const lastScore = useLexicaStore((s) => s.placements[s.placements.length - 1]?.score ?? null);

    const changeLevel = () => {
        const store = useLexicaStore.getState();
        if (!store.hasSeenWelcome) store.skipToManual();
        store.setSelectedLevel(null);
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-xl mx-auto space-y-5">
                <h1 className="text-xl font-semibold text-ink">Tôi</h1>

                <Link href="/stats" className="block rounded-2xl border border-line bg-surface p-4 hover:border-line-strong">
                    <StepNumbers href={null} compact />
                    <p className="mt-3 flex items-center gap-2 text-sm text-accent">
                        <BarChart3 className="w-4 h-4" /> Xem thống kê <ChevronRight className="w-4 h-4 ml-auto text-subtle" />
                    </p>
                </Link>

                <section className="rounded-2xl border border-line bg-surface divide-y divide-line">
                    <Row href="/path" icon={<Route className="w-4 h-4" />} title="Lộ trình 30 ngày" />
                    <Row href="/score" icon={<Gauge className="w-4 h-4" />} title="Điểm từ vựng" hint={lastScore ? String(lastScore) : 'Chưa thi'} />
                    <Row href="/class" icon={<School className="w-4 h-4" />} title="Lớp học" />
                    <Row href="/buddy" icon={<Users className="w-4 h-4" />} title="Buddy" />
                    {hardCount > 0 && <Row href="/review?hard=1" icon={<Swords className="w-4 h-4" />} title="Từ khó của bạn" hint={`${hardCount} từ`} />}
                    <Row href="/guide" icon={<Compass className="w-4 h-4" />} title="Lexica có gì" />
                    <Row href="/feedback?from=/me" icon={<MessageSquareHeart className="w-4 h-4" />} title="Góp ý và báo lỗi" />
                </section>

                {path && (
                    <section className="rounded-2xl border border-line bg-surface p-4 space-y-3">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Lộ trình của bạn</p>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted text-sm">Nhánh</span>
                            <div className="flex gap-1.5">
                                {(['cert', 'talk'] as const).map((b) => (
                                    <button key={b} onClick={() => setPath({ ...path, branch: b })} aria-pressed={path.branch === b} className={chip(path.branch === b)}>
                                        {BRANCH_LABEL[b]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-muted">{BRANCH_PROMISE[path.branch]}</p>
                        <BranchCompare />
                        <div className="space-y-2">
                            <span className="text-muted text-sm">Nhịp học</span>
                            <PaceChooser value={path.pace || 10} onChange={(n) => setPath({ ...path, pace: n })} compareTo={path.pace} />
                        </div>
                    </section>
                )}

                <section className="rounded-2xl border border-line bg-surface p-4 space-y-4">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Cài đặt học</p>
                    <div className="space-y-2">
                        <span className="text-muted text-sm">Câu ví dụ theo kiểu</span>
                        <div className="grid grid-cols-4 gap-1.5">
                            {ARCHETYPE_OPTIONS.map((opt) => (
                                <button key={opt.id} onClick={() => setUserArchetype(opt.id)} aria-pressed={(userArchetype ?? 'casual') === opt.id} className={`h-10 ${chip((userArchetype ?? 'casual') === opt.id)}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted">Câu ví dụ trên thẻ sẽ theo đời sống của bạn, với những thẻ đã có câu riêng.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-muted text-sm">Gợi ý gắn từ với đời bạn</span>
                            <button onClick={() => setMySentenceOff(!mySentenceOff)} aria-pressed={!mySentenceOff} className={chip(!mySentenceOff)}>
                                {mySentenceOff ? 'Đang tắt' : 'Đang bật'}
                            </button>
                        </div>
                        <p className="text-xs text-muted">Cuối phiên, thỉnh thoảng app gợi ý bạn chọn hoặc viết một câu của riêng mình cho một từ vừa nhớ. Không bắt buộc.</p>
                    </div>
                    <button onClick={changeLevel} className="w-full h-11 rounded-xl border border-line-strong/50 bg-surface-2/50 text-ink text-sm font-medium flex items-center justify-center gap-2 hover:border-line-strong">
                        <Settings className="w-4 h-4" /> Đổi level
                    </button>
                    <Link href="/settings" className="block text-center text-sm text-muted hover:text-ink">
                        Âm thanh, sao lưu và các cài đặt khác
                    </Link>
                </section>

                <p className="flex justify-center gap-4 text-xs text-subtle">
                    <Link href="/privacy" className="hover:text-ink">Chính sách riêng tư</Link>
                    <Link href="/terms" className="hover:text-ink">Điều khoản</Link>
                </p>
            </div>
        </div>
    );
}

function Row({ href, icon, title, hint }: { href: string; icon: React.ReactNode; title: string; hint?: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/50 first:rounded-t-2xl last:rounded-b-2xl">
            <span className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-muted shrink-0">{icon}</span>
            <span className="flex-1 text-sm font-medium text-ink">{title}</span>
            {hint && <span className="text-xs text-muted">{hint}</span>}
            <ChevronRight className="w-4 h-4 text-subtle" />
        </Link>
    );
}
