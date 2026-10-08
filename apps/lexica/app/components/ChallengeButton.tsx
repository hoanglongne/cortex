'use client';

import { useState } from 'react';
import { Swords, Copy, Check } from 'lucide-react';
import { createChallenge, getSavedNickname, saveNickname, type GameType } from '../lib/challenges';

interface ChallengeButtonProps {
    gameType: GameType;
    score: number;
}

export default function ChallengeButton({ gameType, score }: ChallengeButtonProps) {
    const [status, setStatus] = useState<'idle' | 'entering' | 'creating' | 'done'>('idle');
    const [nickname, setNickname] = useState(() => getSavedNickname() || '');

    const create = async (name: string) => {
        setStatus('creating');
        saveNickname(name);
        const id = await createChallenge(gameType, score, name);
        if (id) {
            const url = `${window.location.origin}/challenge/${id}`;
            await navigator.clipboard.writeText(url);
        }
        setStatus('done');
        setTimeout(() => setStatus('idle'), 3500);
    };

    const handleClick = () => {
        if (status !== 'idle') return;
        if (getSavedNickname()) {
            create(getSavedNickname()!);
        } else {
            setStatus('entering');
        }
    };

    if (status === 'entering') {
        return (
            <div className="flex gap-2">
                <input
                    autoFocus
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && nickname.trim() && create(nickname)}
                    placeholder="Tên hiển thị của bạn..."
                    maxLength={20}
                    className="flex-1 px-3 py-2 bg-surface-2 border border-line-strong rounded-lg text-ink placeholder-muted text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <button
                    onClick={() => nickname.trim() && create(nickname)}
                    disabled={!nickname.trim()}
                    className="px-4 py-2 bg-accent hover:bg-accent-strong disabled:opacity-40 text-on-accent rounded-lg text-sm font-medium transition-all"
                >
                    OK
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={status !== 'idle'}
            className="w-full py-3 px-4 bg-surface-2 hover:bg-surface-3 disabled:opacity-60 text-ink rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
        >
            {status === 'done' ? (
                <><span className="text-accent">Copied! Hãy gửi cho bạn bè link này nhaaa!</span></>
            ) : status === 'creating' ? (
                <><div className="w-4 h-4 border border-ink/50 border-t-ink rounded-full animate-spin" /> Đang tạo link...</>
            ) : (
                <><Swords className="w-4 h-4 text-accent" /> Thách bạn bè!</>
            )}
        </button>
    );
}
