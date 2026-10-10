'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Swords, Copy, Check, User, ArrowLeft, Flame } from 'lucide-react';
import { fetchChallenge, getSavedNickname, saveNickname, saveResponse, createChallenge, GAME_LABELS, SCORE_LABELS, type GameChallenge, type GameType } from '../../lib/challenges';
import { getAllCards } from '../../lib/content/repository';
import SpeedQuiz from '../../components/SpeedQuiz';
import TypeChallenge from '../../components/TypeChallenge';
import TrueFalseBlitz from '../../components/TrueFalseBlitz';
import WordScramble from '../../components/WordScramble';
import ComboChain from '../../components/ComboChain';

// Dùng toàn bộ từ vựng làm pool cho challenge (không cần học trước)
const ALL_WORD_IDS = getAllCards().map(c => c.id);

interface ChallengePageProps {
    params: Promise<{ id: string }>;
}

export default function ChallengePage({ params }: ChallengePageProps) {
    const [challengeId, setChallengeId] = useState<string | null>(null);
    const [challenge, setChallenge] = useState<GameChallenge | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [nickname, setNickname] = useState('');
    const [gameActive, setGameActive] = useState(false);
    const [myScore, setMyScore] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [creatingCounter, setCreatingCounter] = useState(false);
    const [counterLink, setCounterLink] = useState<string | null>(null);
    // true khi người tạo challenge mở lại link và bạn bè đã chơi rồi
    const [viewingResult, setViewingResult] = useState(false);

    // Resolve params (Next.js 15+ params is a Promise)
    useEffect(() => {
        params.then(p => setChallengeId(p.id));
    }, [params]);

    useEffect(() => {
        if (!challengeId) return;
        fetchChallenge(challengeId).then(data => {
            if (!data) setNotFound(true);
            else {
                setChallenge(data);
                // Bạn bè đã chơi rồi → người tạo mở lại link thấy kết quả ngay
                if (data.response_score !== null && data.response_score !== undefined) {
                    setViewingResult(true);
                }
            }
            setLoading(false);
        });
    }, [challengeId]);

    useEffect(() => {
        const saved = getSavedNickname();
        if (saved) setNickname(saved);
    }, []);

    const handleAccept = () => {
        if (nickname.trim()) saveNickname(nickname);
        setGameActive(true);
    };

    const handleGameEnd = async (score: number) => {
        setGameActive(false);
        setMyScore(score);
        // Lưu kết quả lên Supabase để người tạo challenge có thể xem
        if (challengeId) {
            const name = nickname.trim() || getSavedNickname() || 'Anonymous';
            await saveResponse(challengeId, score, name);
        }
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCounterChallenge = async () => {
        if (myScore === null || !challenge) return;
        setCreatingCounter(true);
        const name = nickname.trim() || getSavedNickname() || 'Anonymous';
        const id = await createChallenge(challenge.game_type, myScore, name);
        if (id) {
            const url = `${window.location.origin}/challenge/${id}`;
            setCounterLink(url);
            await navigator.clipboard.writeText(url);
        }
        setCreatingCounter(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (notFound || !challenge) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center p-6 gap-4">
                <Swords className="w-12 h-12 text-muted" />
                <h1 className="text-2xl font-bold text-ink">Challenge không tồn tại</h1>
                <p className="text-muted text-sm">Link đã hết hạn hoặc không hợp lệ.</p>
                <Link href="/" className="mt-2 px-6 py-3 bg-accent hover:bg-accent-strong text-on-accent rounded-xl font-medium transition-all">
                    Về trang chủ
                </Link>
            </div>
        );
    }

    const won = myScore !== null && myScore > challenge.score;
    const tied = myScore !== null && myScore === challenge.score;

    // Người tạo challenge mở lại link — bạn bè đã chơi rồi
    if (viewingResult && challenge.response_score !== null && challenge.response_score !== undefined) {
        const friendScore = challenge.response_score;
        const friendName = challenge.response_nickname || 'Đối thủ';
        const iWon = challenge.score > friendScore;
        const isTied = challenge.score === friendScore;
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-surface rounded-2xl p-6 border border-line space-y-5">
                    <div className="text-center space-y-2">
                        <p className="text-muted text-sm">{GAME_LABELS[challenge.game_type]}</p>
                        {iWon ? (
                            <><Trophy className="w-12 h-12 text-warning mx-auto" /><h2 className="text-2xl font-bold text-warning">Bạn thắng!</h2></>
                        ) : isTied ? (
                            <><Flame className="w-12 h-12 text-warning mx-auto" /><h2 className="text-2xl font-bold text-warning">Hoà!</h2></>
                        ) : (
                            <><Swords className="w-12 h-12 text-danger mx-auto" /><h2 className="text-2xl font-bold text-ink">Thua rồi...</h2><p className="text-muted text-sm">Thách đấu ngược để rửa hận!</p></>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className={`rounded-xl p-4 text-center border ${iWon || isTied ? 'border-warning/40 bg-warning/10' : 'border-line-strong bg-bg/50'}`}>
                            <div className="text-muted text-xs mb-1">Bạn ({challenge.nickname})</div>
                            <div className={`text-3xl font-bold ${iWon || isTied ? 'text-warning' : 'text-ink'}`}>{challenge.score}</div>
                        </div>
                        <div className={`rounded-xl p-4 text-center border ${!iWon && !isTied ? 'border-accent/40 bg-accent/10' : 'border-line-strong bg-bg/50'}`}>
                            <div className="text-muted text-xs mb-1">{friendName}</div>
                            <div className={`text-3xl font-bold ${!iWon && !isTied ? 'text-accent' : 'text-ink'}`}>{friendScore}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleCounterChallenge}
                            disabled={creatingCounter}
                            className="w-full py-3 bg-surface-2 hover:bg-surface-3 disabled:opacity-50 text-ink rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <Swords className="w-4 h-4" />
                            {creatingCounter ? 'Đang tạo...' : 'Thách đấu ngược!'}
                        </button>
                        {counterLink && (
                            <p className="text-accent text-xs text-center">Link đã copy! Gửi cho bạn bè nhé.</p>
                        )}
                        <Link href="/" className="w-full py-2 text-muted hover:text-ink text-sm flex items-center justify-center gap-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" />Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Game overlay */}
            <AnimatePresence>
                {gameActive && (
                    <GameComponent
                        gameType={challenge.game_type}
                        onGameEnd={handleGameEnd}
                    />
                )}
            </AnimatePresence>

            <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {/* Intro screen */}
                        {myScore === null && !gameActive && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-surface rounded-2xl p-6 border border-line space-y-6"
                            >
                                {/* Header */}
                                <div className="text-center space-y-1">
                                    <Swords className="w-10 h-10 text-accent mx-auto" />
                                    <p className="text-muted text-sm">Thách đấu từ</p>
                                    <h1 className="text-xl font-bold text-ink">
                                        {challenge.nickname}
                                    </h1>
                                </div>

                                {/* Challenge info */}
                                <div className="bg-bg/60 rounded-xl p-5 text-center border border-line-strong">
                                    <div className="text-muted text-sm mb-1">{GAME_LABELS[challenge.game_type]}</div>
                                    <div className="text-5xl font-bold text-warning mb-1">{challenge.score}</div>
                                    <div className="text-muted text-xs">{SCORE_LABELS[challenge.game_type]}</div>
                                </div>

                                {/* Nickname input */}
                                <div className="space-y-2">
                                    <label className="text-muted text-sm flex items-center gap-1">
                                        <User className="w-3 h-3" /> Tên của bạn
                                    </label>
                                    <input
                                        value={nickname}
                                        onChange={e => setNickname(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAccept()}
                                        placeholder="Nhập nickname..."
                                        maxLength={20}
                                        className="w-full px-4 py-3 bg-surface-2 border border-line-strong rounded-xl text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={handleAccept}
                                    className="w-full py-4 bg-accent hover:bg-accent-strong text-on-accent rounded-xl font-bold text-lg transition-all"
                                >
                                    Chấp nhận thách đấu!
                                </button>

                                <button
                                    onClick={handleCopyLink}
                                    className="w-full py-2 text-muted hover:text-ink text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Đã copy link!' : 'Copy link thách đấu'}
                                </button>
                            </motion.div>
                        )}

                        {/* Result screen */}
                        {myScore !== null && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-surface rounded-2xl p-6 border border-line space-y-5"
                            >
                                {/* Verdict */}
                                <div className="text-center space-y-2">
                                    {won ? (
                                        <>
                                            <Trophy className="w-12 h-12 text-warning mx-auto" />
                                            <h2 className="text-2xl font-bold text-warning">Bạn thắng!</h2>
                                        </>
                                    ) : tied ? (
                                        <>
                                            <Flame className="w-12 h-12 text-warning mx-auto" />
                                            <h2 className="text-2xl font-bold text-warning">Hoà!</h2>
                                        </>
                                    ) : (
                                        <>
                                            <Swords className="w-12 h-12 text-muted mx-auto" />
                                            <h2 className="text-2xl font-bold text-ink">Tiếc quá!</h2>
                                            <p className="text-muted text-sm">Luyện thêm rồi thử lại nhé!</p>
                                        </>
                                    )}
                                </div>

                                {/* Score comparison */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`rounded-xl p-4 text-center border ${won || tied ? 'border-accent/40 bg-accent/10' : 'border-line-strong bg-bg/50'}`}>
                                        <div className="text-muted text-xs mb-1">
                                            {nickname.trim() || 'Bạn'}
                                        </div>
                                        <div className={`text-3xl font-bold ${won || tied ? 'text-accent' : 'text-ink'}`}>
                                            {myScore}
                                        </div>
                                    </div>
                                    <div className={`rounded-xl p-4 text-center border ${!won && !tied ? 'border-warning/40 bg-warning/10' : 'border-line-strong bg-bg/50'}`}>
                                        <div className="text-muted text-xs mb-1">
                                            {challenge.nickname}
                                        </div>
                                        <div className={`text-3xl font-bold ${!won && !tied ? 'text-warning' : 'text-ink'}`}>
                                            {challenge.score}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Counter-challenge */}
                                    {counterLink ? (
                                        <div className="space-y-2">
                                            <p className="text-accent text-sm text-center">Link đã copy vào clipboard!</p>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(counterLink)}
                                                className="w-full py-3 bg-surface-2 hover:bg-surface-3 text-ink rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy lại link thách đấu ngược
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleCounterChallenge}
                                            disabled={creatingCounter}
                                            className="w-full py-3 bg-surface-2 hover:bg-surface-3 disabled:opacity-50 text-ink rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <Swords className="w-4 h-4" />
                                            {creatingCounter ? 'Đang tạo...' : 'Thách đấu ngược lại!'}
                                        </button>
                                    )}

                                    {/* Play again */}
                                    <button
                                        onClick={() => { setMyScore(null); setCounterLink(null); }}
                                        className="w-full py-3 bg-accent hover:bg-accent-strong text-on-accent rounded-xl font-bold transition-all"
                                    >
                                        Chơi lại
                                    </button>

                                    {/* Share result — để bạn gửi lại link cho người đã thách */}
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full py-2 text-muted hover:text-ink text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Đã copy!' : 'Gửi kết quả cho người thách đấu'}
                                    </button>

                                    <Link
                                        href="/"
                                        className="w-full py-2 text-muted hover:text-ink text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Về trang chủ
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}

/** Render đúng game component theo game_type */
function GameComponent({ gameType, onGameEnd }: { gameType: GameType; onGameEnd: (score: number) => void }) {
    const props = {
        learnedWordIds: ALL_WORD_IDS,
        onClose: () => onGameEnd(0),
        onGameEnd,
    };

    switch (gameType) {
        case 'speed': return <SpeedQuiz {...props} />;
        case 'type': return <TypeChallenge {...props} />;
        case 'truefalse': return <TrueFalseBlitz {...props} />;
        case 'scramble': return <WordScramble {...props} />;
        case 'combo': return <ComboChain {...props} />;
    }
}
