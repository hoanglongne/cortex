'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, GraduationCap } from 'lucide-react';
import { useLexicaStore } from '../../store/lexicaStore';
import { BRANCH_HINT, BRANCH_LABEL, nextLevel, PATH_DAYS, type Branch } from '../../lib/journey/path';
import { STAGE_MINUTES } from '../../lib/journey/today';
import { levelDef } from '../../lib/levels';
import { localDate } from '../../lib/engagement/ghost';
import PaceChooser from '../../components/PaceChooser';
import { readBranchPick } from '../../lib/journey/branchPick';
import type { DifficultyLevel } from '../../types/vocab';

/**
 * Start a 30-day path (docs/LEXICA_DIRECTION.md, "Ngày 0"): the branch, the
 * pace with what it promises, then straight into the first session.
 * ?next=1 starts the next path after day 30, one level up.
 */
function SetupContent() {
    const router = useRouter();
    const params = useSearchParams();
    const selectedLevel = useLexicaStore((s) => s.selectedLevel);
    const old = useLexicaStore((s) => s.path);
    const setPath = useLexicaStore((s) => s.setPath);
    const hasWords = useLexicaStore((s) => Object.keys(s.journeys).length > 0);
    const levelUp = params.get('next') === '1' && old ? nextLevel(old.level) : null;
    const level: DifficultyLevel = levelUp ?? (selectedLevel && selectedLevel !== 'all' ? selectedLevel : 'beginner');
    const [branch, setBranch] = useState<Branch>(() => old?.branch ?? readBranchPick() ?? 'cert');
    const [pace, setPace] = useState<number>(old?.pace || 10);

    const start = () => {
        setPath({ branch, pace, level, startDate: localDate(), seen: [] });
        router.replace(hasWords ? '/' : '/today');
    };

    const minutes = STAGE_MINUTES.review + STAGE_MINUTES.learn + STAGE_MINUTES.read + STAGE_MINUTES.speak;

    return (
        <div className="min-h-screen bg-bg px-4 py-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6">
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Lộ trình {PATH_DAYS} ngày</p>
                    <h1 className="mt-2 text-2xl font-semibold text-ink">{levelUp ? `Lộ trình mới ở level ${levelDef(level).label}` : 'Chọn cách bạn học'}</h1>
                    <p className="mt-2 text-sm text-muted">
                        Mỗi ngày một phiên khoảng {minutes} phút: ôn, học từ mới, đọc, nói. Bỏ một ngày thì lộ trình dời theo, không mất gì.
                    </p>
                </div>

                <fieldset>
                    <legend className="text-sm font-semibold text-ink mb-2">Bạn học tiếng Anh để làm gì?</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {(['cert', 'talk'] as const).map((b) => (
                            <button
                                key={b}
                                type="button"
                                onClick={() => setBranch(b)}
                                aria-pressed={branch === b}
                                className={`text-left rounded-2xl border p-4 transition-colors ${branch === b ? 'border-accent bg-accent/10' : 'border-line bg-surface hover:border-line-strong'}`}
                            >
                                <span className="flex items-center gap-2 font-semibold text-ink">
                                    {b === 'cert' ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                    {BRANCH_LABEL[b]}
                                </span>
                                <span className="mt-1 block text-sm text-muted">{BRANCH_HINT[b]}</span>
                            </button>
                        ))}
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-sm font-semibold text-ink mb-2">Nhịp mỗi ngày</legend>
                    <PaceChooser value={pace} onChange={setPace} />
                </fieldset>

                <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
                    Level: <span className="text-ink font-medium">{levelDef(level).label} · {levelDef(level).cefr}</span>
                    {!levelUp && (
                        <Link href="/level-select" className="ml-2 text-accent underline">
                            Đổi
                        </Link>
                    )}
                </div>

                <button data-testid="path-start" onClick={start} className="w-full h-14 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold text-lg flex items-center justify-center gap-2">
                    {hasWords ? 'Bắt đầu lộ trình' : 'Bắt đầu phiên đầu tiên'} <ArrowRight className="w-5 h-5" />
                </button>
            </motion.div>
        </div>
    );
}

export default function PathSetupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
            <SetupContent />
        </Suspense>
    );
}
