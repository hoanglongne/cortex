'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, User } from 'lucide-react';

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

    const HUB_URL = process.env.NEXT_PUBLIC_CORTEX_HUB_URL || 'http://localhost:3005';
    const API_URL = process.env.NEXT_PUBLIC_CORTEX_API_URL || 'http://localhost:3001';

    useEffect(() => {
        // 1. Create invisible bridge to Hub
        const iframe = document.createElement('iframe');
        iframe.src = `${HUB_URL}/auth-bridge`;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== HUB_URL) return;
            if (event.data.type === 'CORTEX_USER_ID_RESPONSE' && event.data.userId) {
                localStorage.setItem('cortex_user_id', event.data.userId);
                fetchProfile(event.data.userId);
            }
        };

        window.addEventListener('message', handleMessage);

        iframe.onload = () => {
            iframe.contentWindow?.postMessage({ type: 'GET_CORTEX_USER_ID' }, HUB_URL);
        };

        // 2. Initial fetch if we already have it
        const existingId = localStorage.getItem('cortex_user_id');
        if (existingId) fetchProfile(existingId);

        async function fetchProfile(userId: string) {
            try {
                const res = await fetch(`${API_URL}/insights/${userId}`);
                const data = await res.json();
                if (data && !data.error) setProfile(data);
            } catch (err) {
                console.error('[CortexWidget] Failed to fetch:', err);
            } finally {
                setLoading(false);
            }
        }

        const interval = setInterval(() => {
            const currentId = localStorage.getItem('cortex_user_id');
            if (currentId) fetchProfile(currentId);
        }, 30000);

        return () => {
            window.removeEventListener('message', handleMessage);
            document.body.removeChild(iframe);
            clearInterval(interval);
        };
    }, []);

    if (loading) return null;

    return (
        <div className="relative font-mono">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                    profile 
                    ? 'bg-black text-white border-white/20 shadow-xl' 
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
            >
                <Brain size={14} className={profile ? 'animate-pulse' : ''} />
                <span className="text-[9px] font-bold tracking-tighter uppercase">
                    {profile ? `CORTEX` : 'HUB'}
                </span>
            </motion.button>

            <AnimatePresence>
                {isOpen && profile && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-3 right-0 w-64 bg-black border border-white/20 rounded-xl p-4 shadow-2xl z-50"
                    >
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                            <div className="flex items-center gap-2 text-white">
                                <Activity size={14} />
                                <span className="text-[11px] font-bold tracking-widest uppercase">System Stats</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-500 uppercase">
                                    <span>Fluency</span>
                                    <span>{Math.round(profile.fluency_score)}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${profile.fluency_score}%` }}
                                        className="h-full bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 border border-white/10 rounded-lg">
                                    <div className="text-[9px] text-gray-500 uppercase">Active</div>
                                    <div className="text-sm font-bold text-white">{profile.active_vocab_count}</div>
                                </div>
                                <div className="p-2 border border-white/10 rounded-lg">
                                    <div className="text-[9px] text-gray-500 uppercase">Passive</div>
                                    <div className="text-sm font-bold text-white">{profile.passive_vocab_count}</div>
                                </div>
                            </div>

                            {profile.difficulty_recommendation && (
                                <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
                                    <div className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Target</div>
                                    <p className="text-[10px] text-gray-300 leading-tight italic">
                                        &ldquo;{profile.difficulty_recommendation.message}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-white/10 flex justify-center">
                            <button 
                                onClick={() => window.open(`${HUB_URL}/profile`, '_blank')}
                                className="text-[9px] text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-widest flex items-center gap-1"
                            >
                                <User size={10} />
                                Node Profile
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
