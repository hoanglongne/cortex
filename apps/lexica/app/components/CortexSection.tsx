'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, TrendingUp, User, RefreshCw, ExternalLink } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { CORTEX_API_URL, CORTEX_HUB_URL } from '../lib/cortexConfig';
import { authHeaders, getCortexAuth } from '../lib/cortexAuth';

interface CortexProfile {
    user_id: string;
    vocabulary_size: number;
    fluency_score: number;
    active_vocab_count: number;
    passive_vocab_count: number;
    difficulty_recommendation?: {
        recommendation: string;
        message: string;
    };
}

export default function CortexSection() {
    // Hidden when Cortex isn't configured (e.g. env vars missing in production)
    if (!CORTEX_HUB_URL || !CORTEX_API_URL) return null;
    return <CortexSectionInner hubUrl={CORTEX_HUB_URL} apiUrl={CORTEX_API_URL} />;
}

function CortexSectionInner({ hubUrl: HUB_URL, apiUrl: API_URL }: { hubUrl: string; apiUrl: string }) {
    const [profile, setProfile] = useState<CortexProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const { syncAllToCortex } = useLexicaStore();

    const fetchProfile = useCallback(async () => {
        try {
            // Identity comes from Lexica's own Supabase session
            const auth = await getCortexAuth();
            if (!auth) {
                setProfile(null);
                return;
            }
            const res = await fetch(`${API_URL}/insights/${auth.userId}`, { headers: authHeaders(auth) });
            const data = await res.json();
            if (data && !data.error) setProfile(data);
        } catch (err) {
            console.error('[CortexSection] Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        void fetchProfile();
        const interval = setInterval(() => void fetchProfile(), 30000);
        return () => clearInterval(interval);
    }, [fetchProfile]);

    if (loading) {
        return (
            <div className="bg-surface/50 border border-line rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-accent animate-pulse" />
                    <h2 className="text-lg font-bold text-ink">Cortex Hub</h2>
                </div>
                <p className="text-muted text-sm">Đang kết nối...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-surface/50 border border-line rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-muted" />
                    <h2 className="text-lg font-bold text-ink">Cortex Hub</h2>
                </div>
                <p className="text-muted text-sm mb-4">
                    Kết nối với Cortex Hub để đồng bộ dữ liệu học tập của bạn qua các ứng dụng trong hệ sinh thái Cortex.
                </p>
                <a
                    href={HUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent-strong/20 border border-accent/30 hover:border-accent/50 text-accent text-sm font-medium rounded-lg transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Đăng nhập Cortex Hub
                </a>
            </div>
        );
    }

    return (
        <div className="bg-surface/50 border border-accent/30 rounded-xl p-6 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                        <Brain className="w-6 h-6 text-accent animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-ink">Cortex Hub</h2>
                        <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-accent" />
                            <span className="text-xs text-accent font-medium">
                                {isSyncing ? 'Đang đồng bộ...' : 'Đã kết nối'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        try {
                            setIsSyncing(true);
                            console.log('[CortexSection] Starting manual sync...');
                            await syncAllToCortex();
                            console.log('[CortexSection] Sync completed, fetching profile...');
                            await fetchProfile();
                        } catch (error) {
                            console.error('[CortexSection] Sync error:', error);
                        } finally {
                            setIsSyncing(false);
                        }
                    }}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent-strong/20 border border-accent/30 hover:border-accent/50 text-accent text-xs font-medium rounded-lg transition-all disabled:opacity-50 active:scale-95"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-bg/50 border border-line">
                    <div className="text-xs text-muted uppercase font-mono mb-2">Tổng từ vựng</div>
                    <div className="text-2xl font-bold text-ink">{profile.vocabulary_size}</div>
                </div>
                <div className="p-4 rounded-xl bg-bg/50 border border-line">
                    <div className="text-xs text-muted uppercase font-mono mb-2">Từ kích hoạt</div>
                    <div className="text-2xl font-bold text-accent">{profile.active_vocab_count}</div>
                </div>
                <div className="p-4 rounded-xl bg-bg/50 border border-line">
                    <div className="text-xs text-muted uppercase font-mono mb-2">Từ thụ động</div>
                    <div className="text-2xl font-bold text-danger">{profile.passive_vocab_count}</div>
                </div>
                <div className="p-4 rounded-xl bg-bg/50 border border-line">
                    <div className="text-xs text-muted uppercase font-mono mb-2">Độ trôi chảy</div>
                    <div className="text-2xl font-bold text-accent">{Math.round(profile.fluency_score)}%</div>
                </div>
            </div>

            {/* Fluency Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted">Fluency Score</span>
                    <span className="text-sm font-bold text-accent">{Math.round(profile.fluency_score)}%</span>
                </div>
                <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${profile.fluency_score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-accent"
                    />
                </div>
            </div>

            {/* AI Recommendation */}
            {profile.difficulty_recommendation && (
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="text-xs font-bold text-accent uppercase font-mono">Gợi ý từ AI</span>
                    </div>
                    <p className="text-sm text-ink-2 leading-relaxed italic">
                        &quot;{profile.difficulty_recommendation.message}&quot;
                    </p>
                </div>
            )}

            {/* Footer Link */}
            <div className="pt-4 border-t border-line">
                <a
                    href={`${HUB_URL}/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
                >
                    <User className="w-4 h-4" />
                    Xem profile chi tiết trên Cortex Hub
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
