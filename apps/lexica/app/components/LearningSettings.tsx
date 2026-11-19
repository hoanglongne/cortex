'use client';

import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { ARCHETYPE_OPTIONS } from '../lib/content/persona';
import { BRANCH_LABEL } from '../lib/journey/path';
import { BRANCH_PROMISE } from '../lib/journey/branchInfo';
import BranchCompare from './BranchCompare';
import PaceChooser from './PaceChooser';
import DeviceVoiceCard from './DeviceVoiceCard';
import { saveThemePref } from './ThemeSync';
import { parseThemePref, THEME_KEY, THEME_LABEL, THEME_PREFS, type ThemePref } from '../lib/theme';
import { useEffect, useState } from 'react';

const chip = (on: boolean) => `h-9 px-3 whitespace-nowrap rounded-lg border text-xs font-medium ${on ? 'bg-accent border-[var(--outline)] text-on-accent font-bold shadow-[1.5px_1.5px_0_var(--outline)]' : 'bg-surface-2/40 border-line-strong/50 text-ink-2'}`;

/** Learning settings: branch, pace, example style, level, device voice. Moved from "Tôi" to /settings (issue #146). */
export default function LearningSettings() {
    const router = useRouter();
    const path = useLexicaStore((s) => s.path);
    const setPath = useLexicaStore((s) => s.setPath);
    const userArchetype = useLexicaStore((s) => s.userArchetype);
    const setUserArchetype = useLexicaStore((s) => s.setUserArchetype);
    const mySentenceOff = useLexicaStore((s) => s.mySentencePrompt.off);
    const setMySentenceOff = useLexicaStore((s) => s.setMySentenceOff);

    const [theme, setTheme] = useState<ThemePref>('dark');
    useEffect(() => {
        try { setTheme(parseThemePref(localStorage.getItem(THEME_KEY))); } catch { /* private mode */ }
    }, []);

    const changeLevel = () => {
        const store = useLexicaStore.getState();
        if (!store.hasSeenWelcome) store.skipToManual();
        store.setSelectedLevel(null);
        router.push('/');
    };

    return (
        <div className="space-y-5 mb-8">
            <section className="lx-soft rounded-[18px] bg-surface p-4 space-y-2" data-testid="theme-setting">
                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Giao diện</p>
                <div className="grid grid-cols-3 gap-1.5">
                    {THEME_PREFS.map((p) => (
                        <button key={p} onClick={() => { setTheme(p); saveThemePref(p); }} aria-pressed={theme === p} className={`h-10 ${chip(theme === p)}`}>
                            {THEME_LABEL[p]}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-muted">Tối là mặc định. Sáng là nền giấy kem.</p>
            </section>
                <DeviceVoiceCard />

                {path && (
                    <section className="lx-soft rounded-[18px] bg-surface p-4 space-y-3">
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

                <section className="lx-soft rounded-[18px] bg-surface p-4 space-y-4">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Cài đặt học</p>
                    <div className="space-y-2">
                        <span className="text-muted text-sm">Câu ví dụ theo kiểu</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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
                        <Settings className="w-4 h-4" /> Đổi trình độ
                    </button>
                </section>

        </div>
    );
}
