'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Volume2, VolumeX, Mic, RotateCcw, Trash2 } from 'lucide-react';
import CortexSection from '../components/CortexSection';
import AuthGate from '../components/AuthGate';
import { useAuth } from '../context/AuthContext';
import { getSupabaseClient } from '../lib/supabase';
import { useLexicaStore } from '../store/lexicaStore';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { deletePack, packMegabytes, packReady, pronBeta, setPronBeta } from '../lib/pronunciation/model/client';
import { clearProsodyLog, readProsodyLog } from '../lib/pronunciation/prosodyLog';

function SettingsPageContent() {
    const learnedCount = useLexicaStore(state => state.learnedWords.size);
    const currentStreak = useLexicaStore(state => state.currentStreak);
    const soundEnabled = useLexicaStore(state => state.soundEnabled);
    const toggleSound = useLexicaStore(state => state.toggleSound);
    const autoReviewInDeck = useLexicaStore(state => state.autoReviewInDeck);
    const toggleAutoReview = useLexicaStore(state => state.toggleAutoReview);
    const resetProgress = useLexicaStore(state => state.resetProgress);
    const { click } = useSoundEffects();

    const [showResetDialog, setShowResetDialog] = useState(false);

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/me"
                        className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors group text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Tôi
                    </Link>
                    <h1 className="text-md md:text-2xl font-bold text-ink ">Cài đặt</h1>
                    <div className="w-10 md:w-20" /> {/* spacer */}
                </div>

                <PronPackSetting />

                {/* Settings Section */}
                <div className="bg-surface/50 border border-line rounded-xl p-5 mb-8">
                    <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Cài đặt
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sound Toggle */}
                        <div className="flex items-center justify-between p-4 bg-bg/50 rounded-lg border border-line">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${soundEnabled ? 'bg-accent/15' : 'bg-surface-2/60'
 }`}>
                                    {soundEnabled ? (
                                        <Volume2 className="w-5 h-5 text-accent" />
                                    ) : (
                                        <VolumeX className="w-5 h-5 text-muted" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-ink font-medium text-sm">Âm thanh</p>
                                    <p className="text-muted text-xs">Hiệu ứng âm thanh khi học</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    click();
                                    toggleSound();
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-accent' : 'bg-surface-3'
 }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-ink transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'
 }`}
                                />
                            </button>
                        </div>

                        {/* Speaking practice (it no longer blocks swiping) */}
                        <Link href="/speak" className="flex items-center justify-between p-4 bg-bg/50 rounded-lg border border-line hover:border-line-strong">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent/15">
                                    <Mic className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-ink font-medium text-sm">Luyện nói 2 phút</p>
                                    <p className="text-muted text-xs">Nghe phân biệt, nói và xem máy nghe được gì</p>
                                </div>
                            </div>
                            <span className="text-muted">→</span>
                        </Link>

                        {/* Auto-Review Toggle */}
                        <div className="flex items-center justify-between p-4 bg-bg/50 rounded-lg border border-line md:col-span-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${autoReviewInDeck ? 'bg-warning/15' : 'bg-surface-2/60'
 }`}>
                                    <RotateCcw className={`w-5 h-5 ${autoReviewInDeck ? 'text-warning' : 'text-muted'}`} />
                                </div>
                                <div>
                                    <p className="text-ink font-medium text-sm">Tự động ôn tập trong deck</p>
                                    <p className="text-muted text-xs">
                                        {autoReviewInDeck
                                            ? 'Tự động thêm từ cần ôn vào deck học (1 lần/phiên)'
                                            : 'Tắt - chỉ ôn tập qua trang /review riêng'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    click();
                                    toggleAutoReview();
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoReviewInDeck ? 'bg-warning' : 'bg-surface-3'
 }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-ink transition-transform ${autoReviewInDeck ? 'translate-x-6' : 'translate-x-1'
 }`}
                                />
                            </button>
                        </div>

                        {/* Hidden Reset Button */}
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-line/50">
                            <button
                                onClick={() => {
                                    click();
                                    setShowResetDialog(true);
                                }}
                                className="w-full p-3 bg-danger/5 hover:bg-danger/10 rounded-lg border border-danger/20 hover:border-danger/40 transition-all group"
                            >
                                <div className="flex items-center justify-center gap-2 text-danger/60 group-hover:text-danger transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-xs font-medium">Reset toàn bộ tiến trình</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cloud backup sign-in */}
                <BackupStatus />

                {/* Cortex Hub Section */}
                <CortexSection />

            </div>

            {/* Reset Confirmation Dialog */}
            {showResetDialog && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowResetDialog(false)}>
                    <div className="bg-surface border-2 border-danger/30 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-danger/20 border border-danger/30">
                                <Trash2 className="w-6 h-6 text-danger" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-ink mb-2">Xác nhận Reset</h3>
                                <p className="text-sm text-ink-2 leading-relaxed">
                                    Bạn có chắc chắn muốn reset toàn bộ tiến trình? Hành động này sẽ xóa:
                                </p>
                                <ul className="mt-3 space-y-1.5 text-xs text-muted">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-danger" />
                                        Tất cả từ vựng đã học ({learnedCount} từ)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-danger" />
                                        Streak hiện tại ({currentStreak} ngày)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-danger" />
                                        Thống kê và lịch sử học tập
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-danger" />
                                        Level đã chọn và lộ trình
                                    </li>
                                </ul>
                                <p className="mt-4 text-xs text-danger font-medium">
                                    Không thể hoàn tác!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetDialog(false)}
                                className="flex-1 py-3 px-4 bg-surface-2 hover:bg-surface-3 text-ink rounded-xl font-medium text-sm transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    click();
                                    resetProgress();
                                    setShowResetDialog(false);
                                    // Optionally redirect to home
                                    window.location.href = '/';
                                }}
                                className="flex-1 py-3 px-4 bg-danger hover:bg-danger text-on-status rounded-xl font-bold text-sm transition-colors shadow-lg "
                            >
                                Xác nhận Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Wrapper with Suspense boundary
function SettingsPageFallback() {
    return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-line border-t-accent animate-spin" />
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<SettingsPageFallback />}>
            <SettingsPageContent />
        </Suspense>
    );
}

/** Sign-in prompt that turns on cloud backup (lib/cloudSync.ts). */
function BackupStatus() {
    const { user, loading } = useAuth();
    if (loading || !getSupabaseClient()) return null;

    if (user) {
        return (
            <p className="mb-6 text-center text-xs text-muted">
                Đã đăng nhập <span className="text-accent">{user.email}</span> · tiến trình được tự động sao lưu
            </p>
        );
    }

    return (
        <div className="mb-6 rounded-2xl border border-line bg-surface/60 p-4">
            <AuthGate
                reason="Đăng nhập để sao lưu tiến trình học và tiếp tục trên máy khác."
                redirectPath="/settings"
            />
        </div>
    );
}

/** Testers only (phone scoring is behind a flag): the downloaded scoring pack, and turning the test off. */
function PronPackSetting() {
    const [state, setState] = useState<'hidden' | 'none' | 'ready'>('hidden');
    const [logCount, setLogCount] = useState(0);
    useEffect(() => {
        if (!pronBeta()) return;
        void packReady().then((ok) => {
            setLogCount(readProsodyLog().length);
            setState(ok ? 'ready' : 'none');
        });
    }, []);
    if (state === 'hidden') return null;
    return (
        <div className="bg-surface/50 border border-line rounded-xl p-5 mb-8">
            <p className="font-semibold text-ink">Chấm từng âm trên máy (thử nghiệm)</p>
            <p className="mt-1 text-sm text-muted">
                {state === 'ready' ? `Gói chấm đã tải (khoảng ${packMegabytes()}MB).` : 'Chưa tải gói chấm. Tải ở trang Luyện nói.'}
            </p>
            <p className="mt-1 text-xs text-subtle">Sổ đo ghi các con số về nhấn âm, ngữ điệu, tốc độ của mỗi lần nói (không có âm thanh), để kiểm lại ngưỡng.</p>
            <div className="mt-3 flex flex-wrap gap-2">
                {state === 'ready' && (
                    <button
                        onClick={async () => {
                            await deletePack();
                            setState('none');
                        }}
                        className="h-10 px-4 rounded-xl border border-line text-sm text-ink hover:border-line-strong"
                    >
                        Xoá gói chấm
                    </button>
                )}
                <button
                    onClick={() => {
                        const blob = new Blob([JSON.stringify(readProsodyLog(), null, 1)], { type: 'application/json' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `lexica-so-do-phat-am-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(a.href);
                    }}
                    className="h-10 px-4 rounded-xl border border-line text-sm text-ink hover:border-line-strong"
                >
                    Tải sổ đo ({logCount} lần nói)
                </button>
                <button
                    onClick={async () => {
                        await deletePack();
                        clearProsodyLog();
                        setPronBeta(false);
                        setState('hidden');
                    }}
                    className="h-10 px-4 rounded-xl border border-line text-sm text-ink hover:border-line-strong"
                >
                    Tắt thử nghiệm
                </button>
            </div>
        </div>
    );
}
