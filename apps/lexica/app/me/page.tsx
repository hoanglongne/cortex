'use client';

import Link from 'next/link';
import { BarChart3, ChevronRight, Compass, Gauge, MessageSquareHeart, Route, School, Settings, Swords, Users } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { hardWords } from '../lib/engagement/hard';
import { CORTEX_HUB_URL } from '../lib/cortexConfig';
import StepNumbers from '../components/StepNumbers';


/**
 * "Tôi": the learner's profile: where they stand and the places about them
 * (path, class, buddy, statistics). Settings live on /settings (issue #146).
 */
export default function MePage() {
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const hardCount = hardWords(cardProgress).length;
    const lastScore = useLexicaStore((s) => s.placements[s.placements.length - 1]?.score ?? null);

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
                    <Row href="/buddy" icon={<Users className="w-4 h-4" />} title="Bạn học" />
                    {hardCount > 0 && <Row href="/review?hard=1" icon={<Swords className="w-4 h-4" />} title="Từ khó của bạn" hint={`${hardCount} từ`} />}
                    <Row href="/guide" icon={<Compass className="w-4 h-4" />} title="Lexica có gì" />
                    {CORTEX_HUB_URL && <Row href={CORTEX_HUB_URL} icon={<Compass className="w-4 h-4" />} title="Về Cortex" hint="Giáo viên, trung tâm và các app khác" />}
                    <Row href="/settings" icon={<Settings className="w-4 h-4" />} title="Cài đặt" hint="Lộ trình, nhịp học, giọng, âm thanh" />
                    <Row href="/feedback?from=/me" icon={<MessageSquareHeart className="w-4 h-4" />} title="Góp ý và báo lỗi" />
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
            <span className="shrink-0 whitespace-nowrap text-sm font-medium text-ink">{title}</span>
            <span className="flex-1 min-w-0 truncate text-right text-xs text-muted">{hint}</span>
            <ChevronRight className="w-4 h-4 text-subtle" />
        </Link>
    );
}
