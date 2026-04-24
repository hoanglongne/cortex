'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, TrendingUp, User, RefreshCw } from 'lucide-react';
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

export default function CortexWidget() {
    const [profile, setProfile] = useState<CortexProfile | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const { syncAllToCortex } = useLexicaStore();

    const HUB_URL = process.env.NEXT_PUBLIC_CORTEX_HUB_URL || 'http://localhost:3000';
    const API_URL = process.env.NEXT_PUBLIC_CORTEX_API_URL || 'http://localhost:3001';

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const res = await fetch(`${API_URL}/insights/${userId}`);
            const data = await res.json();
            if (data && !data.error) setProfile(data);
        } catch (err) {
            console.error('[CortexWidget] Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        console.log('[CortexWidget] Initializing with Hub URL:', HUB_URL);
        // 1. Create invisible bridge to Hub
        const iframe = document.createElement('iframe');
        iframe.src = `${HUB_URL}/auth-bridge`;
        iframe.style.display = 'none';
        iframe.id = 'cortex-auth-bridge';
        document.body.appendChild(iframe);

        const handleMessage = async (event: MessageEvent) => {
            // Check if the message is from our expected Hub URL
            // We use .startsWith to handle cases with/without trailing slashes
            const isAuthorizedOrigin = event.origin === HUB_URL || 
                                      event.origin === 'http://localhost:3000' || 
                                      event.origin === 'http://localhost:3005';

            if (!isAuthorizedOrigin) {
                // Only log if it's clearly a Cortex message but from wrong origin
                if (event.data?.type?.startsWith('CORTEX_')) {
                    console.warn(`[CortexBridge] Ignoring message from unauthorized origin: ${event.origin}. Expected: ${HUB_URL}`);
                }
                return;
            }

            if (event.data.type === 'CORTEX_USER_ID_RESPONSE') {
                const newUserId = event.data.userId;
                console.log(`[CortexBridge] Received userId from Hub (${event.origin}): ${newUserId}`);
                
                if (newUserId) {
                    const oldUserId = localStorage.getItem('cortex_user_id');
                    localStorage.setItem('cortex_user_id', newUserId);
                    
                    // If it's a new connection, sync all words
                    if (newUserId !== oldUserId) {
                        console.log('[CortexBridge] New user detected, triggering bulk sync...');
                        setIsSyncing(true);
                        await syncAllToCortex();
                        setIsSyncing(false);
                    }
                    
                    fetchProfile(newUserId);
                } else {
                    console.warn('[CortexBridge] Hub returned empty userId. Are you logged in to the Hub?');
                }
            }
        };

        window.addEventListener('message', handleMessage);

        iframe.onload = () => {
            iframe.contentWindow?.postMessage({ type: 'GET_CORTEX_USER_ID' }, HUB_URL);
        };

        // 2. Initial fetch if we already have it
        const existingId = localStorage.getItem('cortex_user_id');
        if (existingId) {
            // Use setTimeout to avoid synchronous setState during render
            setTimeout(() => fetchProfile(existingId), 0);
        } else {
            setTimeout(() => setLoading(false), 0); // No ID, so stop loading and show disconnected state
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
    }, [fetchProfile, HUB_URL, syncAllToCortex]);

    // Remove the blocking return null

    return (
        <div className="fixed top-4 right-4 z-[100] font-space-grotesk">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg transition-all ${
                    profile 
                    ? 'bg-slate-900/80 border-cyan-500/50 text-cyan-400 backdrop-blur-md' 
                    : 'bg-slate-900/50 border-slate-700 text-slate-400'
                }`}
            >
                <Brain size={18} className={profile ? 'animate-pulse' : ''} />
                <span className="text-xs font-bold tracking-wider uppercase">
                    {profile ? `CORTEX HUB` : 'Chưa kết nối Hub'}
                </span>
            </motion.button>

            <AnimatePresence>
                {isOpen && profile && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-3 right-0 w-64 bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-cyan-400">
                                <Activity size={16} />
                                <span className="text-sm font-bold tracking-tight">Hệ sinh thái Cortex</span>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-bold uppercase">
                                {isSyncing ? 'Syncing...' : 'Online'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-800/30 p-2 rounded-lg border border-slate-700/50">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dữ liệu cục bộ</span>
                                <button 
                                    onClick={async () => {
                                        setIsSyncing(true);
                                        await syncAllToCortex();
                                        const id = localStorage.getItem('cortex_user_id');
                                        if (id) fetchProfile(id);
                                        setIsSyncing(false);
                                    }}
                                    disabled={isSyncing}
                                    className="flex items-center gap-1 text-[10px] bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 px-2 py-1 rounded transition-all disabled:opacity-50"
                                >
                                    <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
                                    Đồng bộ ngay
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <div className="text-[10px] text-slate-500 uppercase mb-1">Kích hoạt</div>
                                    <div className="text-lg font-bold text-cyan-400">{profile.active_vocab_count}</div>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <div className="text-[10px] text-slate-500 uppercase mb-1">Từ vựng chết</div>
                                    <div className="text-lg font-bold text-rose-400">{profile.passive_vocab_count}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-slate-400">Độ trôi chảy</span>
                                    <span className="text-sm font-bold text-emerald-400">{Math.round(profile.fluency_score)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${profile.fluency_score}%` }}
                                        className="h-full bg-emerald-400"
                                    />
                                </div>
                            </div>

                            {profile.difficulty_recommendation && (
                                <div className="mt-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp size={12} className="text-cyan-400" />
                                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Gợi ý AI</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-relaxed italic">
                                    &quot;{profile.difficulty_recommendation.message}&quot;
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-center">
                            <button 
                                onClick={() => window.open(`${HUB_URL}/profile`, '_blank')}
                                className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors uppercase font-bold tracking-widest flex items-center gap-1"
                            >
                                <User size={10} />
                                Xem Profile chi tiết
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
