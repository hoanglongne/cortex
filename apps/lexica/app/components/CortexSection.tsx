'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, TrendingUp, User, RefreshCw, ExternalLink } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';

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
    const [profile, setProfile] = useState<CortexProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const { syncAllToCortex } = useLexicaStore();

    const HUB_URL = process.env.NEXT_PUBLIC_CORTEX_HUB_URL || 'http://localhost:3002';
    const API_URL = process.env.NEXT_PUBLIC_CORTEX_API_URL || 'http://localhost:3001';

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const res = await fetch(`${API_URL}/insights/${userId}`);
            const data = await res.json();
            if (data && !data.error) setProfile(data);
        } catch (err) {
            console.error('[CortexSection] Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        console.log('[CortexSection] Initializing with Hub URL:', HUB_URL);
        // 1. Create invisible bridge to Hub
        const iframe = document.createElement('iframe');
        iframe.src = `${HUB_URL}/auth-bridge`;
        iframe.style.display = 'none';
        iframe.id = 'cortex-auth-bridge-section';
        document.body.appendChild(iframe);

        const handleMessage = async (event: MessageEvent) => {
            const isAuthorizedOrigin = [
                HUB_URL,
                'http://localhost:3000',
                'http://localhost:3005',
                'https://cortexedtech.vercel.app/',
            ].includes(event.origin);

            if (!isAuthorizedOrigin) return;

            if (event.data.type === 'CORTEX_SESSION_RESPONSE') {
                const newUserId = event.data.userId;
                const token = event.data.token;

                if (newUserId) {
                    localStorage.setItem('cortex_user_id', newUserId);
                    if (token) localStorage.setItem('sb-token', token);
                    fetchProfile(newUserId);
                }
            }
        };

        window.addEventListener('message', handleMessage);

        iframe.onload = () => {
            iframe.contentWindow?.postMessage({ type: 'GET_CORTEX_SESSION' }, HUB_URL);
        };

        // 2. Initial fetch if we already have it
        const existingId = localStorage.getItem('cortex_user_id');
        if (existingId) {
            setTimeout(() => fetchProfile(existingId), 0);
        } else {
            setTimeout(() => setLoading(false), 0);
        }

        const interval = setInterval(() => {
            const currentId = localStorage.getItem('cortex_user_id');
            if (currentId) fetchProfile(currentId);
        }, 30000);

        return () => {
            window.removeEventListener('message', handleMessage);
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
            clearInterval(interval);
        };
    }, [fetchProfile, HUB_URL]);

    if (loading) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
                    <h2 className="text-lg font-bold text-white">Cortex Hub</h2>
                </div>
                <p className="text-slate-400 text-sm">Đang kết nối...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-slate-500" />
                    <h2 className="text-lg font-bold text-white">Cortex Hub</h2>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                    Kết nối với Cortex Hub để đồng bộ dữ liệu học tập của bạn qua các ứng dụng trong hệ sinh thái Cortex.
                </p>
                <a
                    href={HUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 text-sm font-medium rounded-lg transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Đăng nhập Cortex Hub
                </a>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-6 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                        <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Cortex Hub</h2>
                        <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">
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
                            const id = localStorage.getItem('cortex_user_id');
                            if (id) {
                                await fetchProfile(id);
                                console.log('[CortexSection] Profile refreshed');
                            }
                        } catch (error) {
                            console.error('[CortexSection] Sync error:', error);
                        } finally {
                            setIsSyncing(false);
                        }
                    }}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 text-xs font-medium rounded-lg transition-all disabled:opacity-50 active:scale-95"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Tổng từ vựng</div>
                    <div className="text-2xl font-bold text-white">{profile.vocabulary_size}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Từ kích hoạt</div>
                    <div className="text-2xl font-bold text-cyan-400">{profile.active_vocab_count}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Từ thụ động</div>
                    <div className="text-2xl font-bold text-rose-400">{profile.passive_vocab_count}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Độ trôi chảy</div>
                    <div className="text-2xl font-bold text-emerald-400">{Math.round(profile.fluency_score)}%</div>
                </div>
            </div>

            {/* Fluency Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Fluency Score</span>
                    <span className="text-sm font-bold text-emerald-400">{Math.round(profile.fluency_score)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${profile.fluency_score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-emerald-400"
                    />
                </div>
            </div>

            {/* AI Recommendation */}
            {profile.difficulty_recommendation && (
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Gợi ý từ AI</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                        &quot;{profile.difficulty_recommendation.message}&quot;
                    </p>
                </div>
            )}

            {/* Footer Link */}
            <div className="pt-4 border-t border-slate-700">
                <a
                    href={`${HUB_URL}/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                >
                    <User className="w-4 h-4" />
                    Xem profile chi tiết trên Cortex Hub
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
