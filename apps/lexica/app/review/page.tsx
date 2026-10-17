'use client';

import { useMemo, useState, useCallback, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy, RotateCcw, BookOpen, Zap, Flame, Lock, Ghost, Shield, Swords, Package } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards } from '../lib/content/repository';
import { trackCardEvent } from '../lib/content/events';
import { getDueCards, updateCardProgress } from '../lib/eloAlgorithm';
import { formatInterval } from '../lib/srs';
import { scenarioFor } from '../lib/content/persona';
import type { VocabCardData } from '../types/vocab';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { answer as riskAnswer, bank, initialRisk, LADDER, multiplier, pickNext, total as riskTotal, type RiskState } from '../lib/engagement/risk';
import { getRival, ghostCorrectAt, localDate, recordRun, WIN_STREAK_GOAL, type GhostResult, type Rival } from '../lib/engagement/ghost';
import { reviewDustLine, type ReviewDust } from '../lib/engagement/reviewDust';
import { hasShield, useEconomy } from '../lib/engagement/economy';
import { readShieldsUsed, spendShield } from '../lib/engagement/shields';
import { hardWords, isHard, mnemonic } from '../lib/engagement/hard';

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = 'word-to-meaning' | 'meaning-to-word' | 'fill-in' | 'context-pick';

interface Question {
    cardId: string;
    type: QuestionType;
    prompt: string;
    answer: string;     // correct answer text
    options: string[];  // 4 shuffled MCQ options (empty for meaning-to-word type-in)
    optionWords?: string[];  // for context-pick: word to blank in each option
    word: string;
    elo: number;
    ipa: string;
    scenario: string;   // full scenario for post-answer reveal
    meaning: string;    // translationHint for post-answer reveal
    hard: boolean;      // one of the learner's hard words (lib/engagement/hard.ts)
    aid: string | null; // memory aid from the word's parts
}

interface Result {
    cardId: string;
    word: string;
    correct: boolean;
    type: QuestionType;
    hard: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIMER_SECONDS = 15;
/** Answered right within this many seconds counts as easy (lib/srs.ts). */
const FAST_SECONDS = 5;

/** "8 ngày": when a right answer brings this word back. */
function previewNextIn(cardId: string, fast: boolean): string {
    const progress = useLexicaStore.getState().cardProgress[cardId];
    return formatInterval(updateCardProgress(progress, cardId, 'right', fast ? 'easy' : 'good').intervalDays ?? 1);
}

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

function buildOptions(answer: string, pool: string[], count = 4): string[] {
    const distractors = shuffle(pool.filter(s => s !== answer)).slice(0, count - 1);
    return shuffle([answer, ...distractors]);
}

function blank(sentence: string, word: string): string {
    return sentence.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '______');
}

function highlightBlank(sentence: string) {
    const parts = sentence.split('______');
    return parts.map((p, i) => (
        i < parts.length - 1
            ? <span key={i}>{p}<span className="inline-block bg-surface-3 rounded px-2 mx-0.5 text-subtle select-none font-mono">______</span></span>
            : <span key={i}>{p}</span>
    ));
}

function highlightWord(sentence: string, word: string) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = sentence.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((p, i) =>
        p.toLowerCase() === word.toLowerCase()
            ? <span key={i} className="text-accent font-bold">{p}</span>
            : <span key={i}>{p}</span>
    );
}

function buildQuestions(dueCardIds: string[], hardIds: ReadonlySet<string> = new Set()): Question[] {
    const archetype = useLexicaStore.getState().userArchetype;
    const sentence = (c: { scenario?: string; scenarios?: VocabCardData['scenarios'] }) => scenarioFor(c, archetype);
    const wordPool = getAllCards().map(c => c.word);
    const meaningPool = getAllCards().map(c => c.translationHint);
    const types: QuestionType[] = ['word-to-meaning', 'meaning-to-word', 'fill-in', 'context-pick'];

    return shuffle(dueCardIds).map(cardId => {
        const card = getAllCards().find(c => c.id === cardId);
        if (!card) return null;

        const type = types[Math.floor(Math.random() * types.length)];
        const base = {
            cardId,
            word: card.word,
            elo: card.elo,
            ipa: card.ipa ?? '',
            scenario: sentence(card),
            meaning: card.translationHint,
            hard: hardIds.has(cardId),
            aid: mnemonic(card),
        };

        if (type === 'word-to-meaning') {
            return { ...base, type, prompt: card.word, answer: card.translationHint, options: buildOptions(card.translationHint, meaningPool) };
        }
        if (type === 'meaning-to-word') {
            return { ...base, type, prompt: card.translationHint, answer: card.word.toUpperCase(), options: [] };
        }
        if (type === 'fill-in') {
            return {
                ...base, type,
                prompt: blank(sentence(card) || card.word, card.word),
                answer: card.word.toUpperCase(),
                options: buildOptions(card.word.toUpperCase(), wordPool.map(w => w.toUpperCase())),
            };
        }
        // context-pick: which sentence fits this word?
        const distractorCards = shuffle(getAllCards().filter(c => c.id !== cardId)).slice(0, 3);
        const allOptions = shuffle([
            { scenario: sentence(card), word: card.word },
            ...distractorCards.map(c => ({ scenario: sentence(c), word: c.word }))
        ]);
        return {
            ...base,
            type,
            prompt: card.word,
            answer: sentence(card),
            options: allOptions.map(o => o.scenario),
            optionWords: allOptions.map(o => o.word),
        };
    }).filter(Boolean) as Question[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TYPE_LABEL: Record<QuestionType, string> = {
    'word-to-meaning': 'Từ → Nghĩa',
    'meaning-to-word': 'Nghĩa → Từ · gõ đáp án',
    'fill-in': 'Điền từ vào câu',
    'context-pick': 'Câu nào dùng đúng từ này?',
};

function RevealPanel({ question, onContinue }: { question: Question; onContinue: () => void }) {
    const { buttonPress } = useSoundEffects();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-ink/20 bg-ink/[0.03] p-4"
        >
            <p className="text-[10px] text-muted uppercase font-mono font-semibold mb-3">Đáp án đúng</p>
            <div className="flex items-baseline gap-2.5 mb-1">
                <p className="text-2xl font-bold text-ink tracking-wide">{question.word}</p>
                {question.ipa && <p className="text-muted text-sm font-mono">/{question.ipa}/</p>}
            </div>
            <p className="text-accent text-sm mb-3">{question.meaning}</p>
            {question.aid && <p className="text-warning text-xs font-mono leading-relaxed mb-3">Mẹo nhớ: {question.aid}</p>}
            <p className="text-muted text-sm italic leading-relaxed border-t border-line/60 pt-3">
                &ldquo;{highlightWord(question.scenario, question.word)}&rdquo;
            </p>
            <button
                onClick={() => {
                    buttonPress();
                    onContinue();
                }}
                className="mt-4 w-full py-3 rounded-xl bg-accent hover:bg-accent-strong text-on-accent text-sm font-semibold transition-colors active:scale-95"
            >
                Tiếp tục →
            </button>
        </motion.div>
    );
}

function QuestionCard({
    question,
    index,
    total,
    streak,
    rail,
    onAnswer,
}: {
    question: Question;
    index: number;
    total: number;
    streak: number;
    /** The "Liều hay Dừng" pot, drawn as a column beside the question. */
    rail?: React.ReactNode;
    onAnswer: (correct: boolean, fast?: boolean) => void;
}) {
    const { click } = useSoundEffects();
    const [selected, setSelected] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [typedInput, setTypedInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [nextIn, setNextIn] = useState<string | null>(null);
    const [showReveal, setShowReveal] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Countdown timer
    useEffect(() => {
        if (answered) return;
        if (timeLeft <= 0) {
            const t = setTimeout(() => {
                setAnswered(true);
                setIsCorrect(false);
                setShowReveal(true);
            }, 0);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, answered]);

    // Auto-focus type-in input
    useEffect(() => {
        if (question.type === 'meaning-to-word') inputRef.current?.focus();
    }, [question.type]);

    const handleSelect = (option: string) => {
        if (answered) return;
        click();
        setSelected(option);
        setAnswered(true);
        const correct = option === question.answer;
        setIsCorrect(correct);
        if (correct) {
            const fast = timeLeft >= TIMER_SECONDS - FAST_SECONDS;
            setNextIn(previewNextIn(question.cardId, fast));
            setTimeout(() => onAnswer(true, fast), 900);
        } else {
            setShowReveal(true);
        }
    };

    const handleTypeSubmit = () => {
        if (answered || typedInput.trim().length === 0) return;
        click();
        const correct = typedInput.trim().toUpperCase() === question.answer;
        setAnswered(true);
        setIsCorrect(correct);
        if (correct) {
            const fast = timeLeft >= TIMER_SECONDS - FAST_SECONDS;
            setNextIn(previewNextIn(question.cardId, fast));
            setTimeout(() => onAnswer(true, fast), 900);
        } else {
            setShowReveal(true);
        }
    };

    const promptBorder = answered
        ? 'bg-ink/[0.03] border-ink/30'
        : 'bg-ink/[0.02] border-ink/20';

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* The only bar: question progress. The timer is the ring around the number. */}
            <div className="flex items-center gap-3 mb-4">
                <TimerRing seconds={timeLeft} total={TIMER_SECONDS} label={index + 1} />
                <div className="flex-1 h-1 bg-ink/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={index} aria-valuemax={total} aria-label="Tiến độ">
                    <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${(index / total) * 100}%` }}
                    />
                </div>
                <span className="text-muted text-xs font-mono shrink-0">{index + 1}/{total}</span>
                <AnimatePresence>
                    {streak >= 3 && (
                        <motion.span
                            key="streak"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1 text-accent text-xs font-bold shrink-0"
                        >
                            <Flame className="w-3 h-3" /> {streak}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
            {/* Question prompt */}
            <div className={`border rounded-xl p-5 mb-4 transition-colors duration-300 ${promptBorder}`}>
                <p data-testid="review-type" className="text-[10px] text-muted uppercase font-mono font-semibold mb-2.5 flex items-center gap-2">
                    {TYPE_LABEL[question.type]}
                    {question.hard && <span className="flex items-center gap-1 text-warning"><Swords className="w-3 h-3" /> Từ khó</span>}
                </p>

                {question.type === 'fill-in' ? (
                    <p data-testid="review-prompt" className="text-ink text-base leading-relaxed italic">
                        &ldquo;{highlightBlank(question.prompt)}&rdquo;
                    </p>
                ) : question.type === 'meaning-to-word' ? (
                    <p data-testid="review-prompt" className="text-ink text-base leading-relaxed">{question.prompt}</p>
                ) : (
                    <p data-testid="review-prompt" className="text-3xl font-bold text-ink tracking-wide">{question.prompt}</p>
                )}

                {answered && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${isCorrect ? 'text-accent' : 'text-muted'}`}
                    >
                        {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        {isCorrect ? 'Chính xác!' : timeLeft <= 0 ? 'Hết giờ!' : 'Sai rồi'}
                        {isCorrect && nextIn && (
                            <span className="ml-1 font-mono text-[11px] text-muted">{nextIn === 'mai' ? 'Mai ôn lại' : `Ôn lại sau ${nextIn}`}</span>
                        )}
                    </motion.div>
                )}
            </div>

            {/* MCQ options (all types except meaning-to-word) */}
            {question.type !== 'meaning-to-word' && (
                <div className="space-y-2">
                    {question.options.map((option, i) => {
                        const isSelected = selected === option;
                        const isCorrectOpt = option === question.answer;
                        let cls = 'bg-ink/[0.02] border-ink/20 text-ink-2 hover:border-accent/50 hover:bg-ink/[0.04] active:scale-[0.99]';
                        if (answered && isCorrectOpt) cls = 'bg-accent/10 border-accent/50 text-ink';
                        else if (answered && isSelected && !isCorrectOpt) cls = 'bg-ink/[0.03] border-ink/30 text-muted';
                        else if (answered) cls = 'bg-ink/[0.01] border-ink/5 text-subtle';

                        const isLong = question.type === 'context-pick';
                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(option)}
                                disabled={answered}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-left transition-all flex items-start gap-3 ${cls}`}
                            >
                                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                                    {answered && isCorrectOpt ? <Check className="w-3 h-3" /> :
                                        answered && isSelected && !isCorrectOpt ? <X className="w-3 h-3" /> :
                                            String.fromCharCode(65 + i)}
                                </span>
                                <span className={isLong ? 'italic leading-snug' : ''}>
                                    {isLong
                                        ? highlightBlank(blank(option, question.optionWords?.[i] ?? question.word))
                                        : option}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Type-in input (meaning-to-word) */}
            {question.type === 'meaning-to-word' && (
                <div className="space-y-3">
                    <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition-colors ${answered
 ? isCorrect ? 'border-accent/50 bg-accent/5' : 'border-ink/30 bg-ink/[0.03]'
 : 'border-ink/20 bg-ink/[0.02] focus-within:border-accent'
 }`}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={typedInput}
                            onChange={e => setTypedInput(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleTypeSubmit()}
                            disabled={answered}
                            placeholder="Gõ từ tiếng Anh..."
                            className="flex-1 bg-transparent text-ink text-xl font-bold tracking-widest outline-none placeholder:text-subtle placeholder:font-normal placeholder:text-base placeholder:tracking-normal"
                            autoComplete="off"
                            spellCheck={false}
                        />
                        {answered && isCorrect && <Check className="w-5 h-5 text-accent shrink-0" />}
                        {answered && !isCorrect && <X className="w-5 h-5 text-muted shrink-0" />}
                    </div>
                    {!answered ? (
                        <button
                            onClick={handleTypeSubmit}
                            disabled={typedInput.trim().length === 0}
                            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-strong disabled:bg-ink/5 disabled:text-subtle disabled:cursor-not-allowed text-on-accent font-semibold text-sm transition-colors active:scale-95"
                        >
                            Kiểm tra →
                        </button>
                    ) : !isCorrect && (
                        <p className="text-muted text-sm text-center">
                            Đáp án: <span className="text-ink font-bold tracking-wider">{question.answer}</span>
                        </p>
                    )}
                </div>
            )}

            {/* Reveal panel after wrong answer */}
            {showReveal && (
                <RevealPanel question={question} onContinue={() => { setShowReveal(false); onAnswer(false); }} />
            )}
            </div>
            {rail}
            </div>
        </motion.div>
    );
}

/** A small countdown ring around the question number. */
function TimerRing({ seconds, total, label }: { seconds: number; total: number; label: number }) {
    const r = 13;
    const c = 2 * Math.PI * r;
    const left = Math.max(0, seconds) / total;
    return (
        <span className="relative w-8 h-8 shrink-0 flex items-center justify-center" aria-label={`Câu ${label}, còn ${seconds} giây`}>
            <svg viewBox="0 0 32 32" className="absolute inset-0 -rotate-90">
                <circle cx="16" cy="16" r={r} fill="none" strokeWidth="2.5" className="stroke-ink/10" />
                <circle
                    cx="16"
                    cy="16"
                    r={r}
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - left)}
                    className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${seconds <= 5 ? 'stroke-warning' : 'stroke-accent'}`}
                />
            </svg>
            <span className="font-mono text-xs font-bold text-ink">{label}</span>
        </span>
    );
}

/**
 * "Liều hay Dừng" as a narrow column beside the question: the steps x1…x5
 * from the bottom up, lit by the run of right answers; the pot on top and a
 * small Chốt button below. Not banking means the next word is harder.
 */
function RiskRail({ risk, shield, lost, onBank }: { risk: RiskState; shield: boolean; lost: { pot: number; key: number } | null; onBank: () => void }) {
    const { buttonPress } = useSoundEffects();
    // One step lights up per right answer in a row; the next one is outlined.
    const lit = (i: number) => i < risk.step || (i === LADDER.length - 1 && risk.step === i && risk.pot > 0);
    const next = (i: number) => !lit(i) && i === risk.step && risk.pot > 0;
    return (
        <div data-testid="risk-rail" className="relative self-start w-7 sm:w-11 shrink-0 flex flex-col items-center gap-1.5" aria-label={`Hũ ${risk.pot} điểm, nhân x${multiplier(risk)}, đã chốt ${risk.banked}`}>
            <span className="h-4 flex items-center" title={shield ? 'Khiên: thẻ Holo của bạn giữ hũ nếu sai câu này' : undefined}>
                {shield && <Shield className="w-3.5 h-3.5 text-accent" aria-label="Có khiên" />}
            </span>
            <motion.span key={risk.pot} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-mono text-[11px] sm:text-sm font-bold text-accent leading-none">
                {risk.pot}
            </motion.span>
            <div className="w-full flex flex-col-reverse gap-1">
                {LADDER.map((m, i) => (
                    <div
                        key={m}
                        className={`h-8 sm:h-10 w-full rounded-md flex items-center justify-center font-mono text-[10px] transition-colors duration-300 ${lit(i) ? 'bg-accent text-on-accent' : next(i) ? 'border border-accent/60 text-accent' : 'bg-ink/[0.06] text-subtle'}`}
                    >
                        <span className="hidden sm:inline">x{m}</span>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={() => {
                    buttonPress();
                    onBank();
                }}
                disabled={risk.pot === 0}
                aria-label={`Chốt ${risk.pot} điểm`}
                className="w-full h-8 rounded-lg border border-line-strong bg-surface text-ink text-[11px] font-semibold flex items-center justify-center gap-1 hover:border-accent/60 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
            >
                <Lock className="w-3 h-3 sm:hidden" />
                <span className="hidden sm:inline">Chốt</span>
            </button>
            <span className="font-mono text-[10px] text-subtle leading-none" title="Điểm đã chốt">{risk.banked}</span>
            {/* A wrong answer: the pot falls out of the column */}
            <AnimatePresence>
                {lost && (
                    <motion.span
                        key={lost.key}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: 60 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: 'easeIn' }}
                        className="pointer-events-none absolute top-5 font-mono text-xs font-bold text-danger"
                    >
                        -{lost.pot}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}

/** "Bạn 7 · Hôm qua 6 ▲": right answers so far against the rival at the same time. */
function GhostLine({ rival, mine, startedAt }: { rival: Rival; mine: number; startedAt: number }) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);
    const theirs = ghostCorrectAt(rival.run, now - startedAt);
    const sign = mine > theirs ? '▲' : mine < theirs ? '▼' : '=';
    return (
        <p data-testid="ghost-line" className="font-mono text-[11px] text-muted text-center" aria-label={`Bạn ${mine} câu đúng, ${rival.label} ${theirs} câu`}>
            Bạn <span className="text-ink">{mine}</span> · {rival.short} {theirs}{' '}
            <span className={mine > theirs ? 'text-accent' : mine < theirs ? 'text-warning' : ''}>{sign}</span>
        </p>
    );
}

function GhostSummary({ result, rival }: { result: GhostResult; rival: Rival | null }) {
    if (result.beat === null) {
        return <p className="text-muted text-sm text-center mb-5">Mai bạn sẽ đua với chính lượt này.</p>;
    }
    const diff = Math.abs(result.scoreDiff);
    const who = `bạn ${rival?.label ?? 'hôm qua'}`;
    return (
        <div className={`rounded-xl border p-4 mb-5 text-center ${result.beat ? 'border-accent/40 bg-accent/5' : 'border-line bg-ink/[0.02]'}`}>
            <p className="text-ink font-semibold flex items-center justify-center gap-2">
                <Ghost className="w-4 h-4" />
                {result.beat ? `Hơn ${who} ${diff} điểm` : diff === 0 ? `Hoà với ${who}` : `Kém ${who} ${diff} điểm`}
            </p>
            <p className="text-muted text-xs mt-1 font-mono">
                {result.correctDiff >= 0 ? '+' : ''}
                {result.correctDiff} câu đúng
            </p>
            <p className="text-muted text-xs mt-1 flex items-center justify-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Vượt lượt trước {WIN_STREAK_GOAL} ngày liền → 1 Hộp · đang {result.winStreak}/{WIN_STREAK_GOAL}
            </p>
            {result.streakReached && <p className="text-accent text-sm font-semibold mt-2">Thắng bóng ma {WIN_STREAK_GOAL} ngày liền!</p>}
        </div>
    );
}

function ResultScreen({
    results,
    maxStreak,
    score,
    bestPot,
    ghostResult,
    rival,
    dust,
    onRetry,
}: {
    results: Result[];
    maxStreak: number;
    score: number;
    bestPot: number;
    ghostResult: GhostResult | null;
    rival: Rival | null;
    /** What the banked points turned into (null while asking, or on a retry). */
    dust: ReviewDust | null;
    onRetry: () => void;
}) {
    const { buttonPress } = useSoundEffects();
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    const accuracy = Math.round((correct / total) * 100);
    const wrong = results.filter(r => !r.correct);
    const beaten = results.filter(r => r.correct && r.hard);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* Score */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-accent" />
                </div>
                <p className="text-4xl font-bold text-ink mb-1 font-mono">{score}</p>
                <p className="text-muted text-sm">điểm đã chốt · {correct}/{total} câu đúng</p>
                {dust && <p data-testid="review-dust" className="mt-2 text-sm text-accent">{reviewDustLine(dust)}</p>}
            </div>

            {ghostResult && <GhostSummary result={ghostResult} rival={rival} />}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-ink/[0.02] border border-ink/20 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-muted font-medium mb-1">Độ chính xác</p>
                    <p className="text-2xl font-bold text-ink">{accuracy}%</p>
                </div>
                <div className="bg-ink/[0.02] border border-ink/20 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-muted font-medium mb-1">Hũ lớn nhất</p>
                    <p className="text-2xl font-bold text-accent font-mono">{bestPot}</p>
                </div>
                <div className="bg-ink/[0.02] border border-ink/20 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-muted font-medium mb-1">Combo cao nhất</p>
                    <p className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
                        {maxStreak >= 3 && <Flame className="w-4 h-4" />}{maxStreak}
                    </p>
                </div>
            </div>

            {/* Accuracy bar */}
            <div className="h-1.5 bg-ink/5 border border-ink/10 rounded-full overflow-hidden mb-5">
                <div
                    className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{ width: `${accuracy}%` }}
                />
            </div>

            {beaten.length > 0 && (
                <div className="mb-5 px-4 py-3 rounded-xl border border-warning/40 bg-warning/5 flex items-start gap-3">
                    <Swords className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                        <p className="text-ink text-sm font-semibold">Hạ được {beaten.length} từ khó</p>
                        <p className="text-muted text-sm lowercase">{beaten.map(r => r.word).join(', ')}</p>
                    </div>
                </div>
            )}

            {/* Wrong answers review */}
            {wrong.length > 0 && (
                <div className="mb-5">
                    <p className="text-muted text-xs uppercase font-mono font-semibold mb-2.5">Xem lại từ sai ({wrong.length})</p>
                    <div className="space-y-2">
                        {wrong.map(r => {
                            const card = getAllCards().find(c => c.id === r.cardId);
                            return (
                                <div key={r.cardId} className="px-3.5 py-2.5 rounded-xl bg-ink/[0.02] border border-ink/20 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <X className="w-3.5 h-3.5 text-muted shrink-0" />
                                        <span className="text-ink font-bold tracking-wide text-sm">{r.word}</span>
                                        {card?.ipa && <span className="text-muted text-xs font-mono">/{card.ipa}/</span>}
                                    </div>
                                    {card && (
                                        <>
                                            <p className="text-accent text-xs pl-5">{card.translationHint}</p>
                                            <p className="text-muted text-xs italic pl-5 leading-snug">
                                                &ldquo;{highlightWord(card.scenario ?? card.word, r.word)}&rdquo;
                                            </p>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
                {wrong.length > 0 && (
                    <button
                        onClick={() => {
                            buttonPress();
                            onRetry();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-ink/20 bg-ink/[0.02] text-ink-2 hover:border-accent/50 hover:text-ink hover:bg-ink/[0.04] transition-all text-sm font-semibold active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Ôn lại từ sai ({wrong.length})
                    </button>
                )}
                <Link
                    href="/"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold text-sm transition-colors active:scale-95"
                >
                    <Zap className="w-4 h-4" />
                    Học tiếp
                </Link>
                <Link
                    href="/learned"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-ink/20 bg-ink/[0.02] hover:bg-ink/[0.04] hover:border-ink/30 text-ink-2 hover:text-ink text-sm font-medium transition-all"
                >
                    <BookOpen className="w-4 h-4" />
                    Xem từ đã học
                </Link>
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

/** Shown once: what the pot is for. */
const INTRO_KEY = 'lexica-review-intro-v1';

function readFlag(key: string): boolean {
    try {
        return typeof window !== 'undefined' && localStorage.getItem(key) === '1';
    } catch {
        return false;
    }
}

function writeFlag(key: string) {
    try {
        localStorage.setItem(key, '1');
    } catch {
        // Private mode: the line just shows again next time.
    }
}

function ReviewPageContent() {
    const searchParams = useSearchParams();
    const testAll = searchParams.get('all') === '1';
    const hardOnly = searchParams.get('hard') === '1';

    const cardProgress = useLexicaStore(state => state.cardProgress);
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const submitReviewAnswer = useLexicaStore(state => state.submitReviewAnswer);

    const dueCardIds = useMemo(() => {
        if (testAll) {
            // Test mode: use all learned words that exist in getAllCards()
            const vocabIds = new Set(getAllCards().map(c => c.id));
            return Array.from(learnedWords).filter(id => vocabIds.has(id));
        }
        if (hardOnly) return hardWords(cardProgress).map(p => p.cardId);
        return getDueCards(cardProgress).map(p => p.cardId);
    }, [cardProgress, learnedWords, testAll, hardOnly]);

    // Which words were hard when the run started (kept fixed while answers change progress)
    const hardIdsRef = useRef<Set<string> | null>(null);
    const hardIdsNow = () => {
        if (!hardIdsRef.current) {
            const progress = useLexicaStore.getState().cardProgress;
            hardIdsRef.current = new Set(Object.keys(progress).filter(id => isHard(progress[id])));
        }
        return hardIdsRef.current;
    };

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<Result[]>([]);
    const [done, setDone] = useState(false);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);

    // Liều hay Dừng + race against an earlier session
    const [risk, setRisk] = useState<RiskState>(initialRisk);
    const [lost, setLost] = useState<{ pot: number; key: number } | null>(null);
    const [isRetry, setIsRetry] = useState(false);
    const [rival] = useState<Rival | null>(() => (typeof window === 'undefined' ? null : getRival()));
    const [ghostResult, setGhostResult] = useState<GhostResult | null>(null);
    const [dust, setDust] = useState<ReviewDust | null>(null);
    const [showIntro, setShowIntro] = useState(() => !readFlag(INTRO_KEY));
    const [startedAt, setStartedAt] = useState(0);
    const timeline = useRef<[number, 0 | 1][]>([]);
    const editions = useEconomy(s => s.state?.editions);
    const claimReward = useEconomy(s => s.claim);
    const reviewDust = useEconomy(s => s.reviewDust);
    const [shieldsUsed, setShieldsUsed] = useState<Set<string>>(() => (typeof window === 'undefined' ? new Set() : readShieldsUsed()));

    // Build questions once dueCardIds is known (store may hydrate after mount)
    useEffect(() => {
        if (dueCardIds.length > 0 && questions.length === 0 && !done) {
            const t = setTimeout(() => setQuestions(buildQuestions(dueCardIds, hardIdsNow())), 0);
            return () => clearTimeout(t);
        }
    }, [dueCardIds, questions.length, done]);

    useEffect(() => {
        if (questions.length === 0 || startedAt !== 0) return;
        const t = setTimeout(() => setStartedAt(Date.now()), 0);
        return () => clearTimeout(t);
    }, [questions.length, startedAt]);

    const finish = useCallback((finalRisk: RiskState, finalResults: Result[]) => {
        const banked = bank(finalRisk);
        setRisk(banked);
        setDone(true);
        if (isRetry) return;
        const result = recordRun({
            date: localDate(),
            score: banked.banked,
            correct: finalResults.filter(r => r.correct).length,
            total: finalResults.length,
            durationMs: Date.now() - startedAt,
            bestPot: banked.bestPot,
            timeline: timeline.current,
        });
        setGhostResult(result);
        if (result.streakReached) void claimReward('ghost_streak', localDate()).catch(() => undefined);
        // Banked points become Bụi (10 = 1, capped per day on the server).
        void reviewDust(banked.banked).then(setDust);
    }, [isRetry, startedAt, claimReward, reviewDust]);

    /** Moves to the next question; after Liều the next one is a harder word. */
    const advance = useCallback((risky: boolean) => {
        const next = currentIndex + 1;
        const rest = questions.slice(next);
        const pick = pickNext(rest, questions[currentIndex]?.elo ?? 0, risky);
        if (pick > 0) {
            const reordered = [...questions];
            [reordered[next], reordered[next + pick]] = [reordered[next + pick], reordered[next]];
            setQuestions(reordered);
        }
        setCurrentIndex(next);
    }, [questions, currentIndex]);

    const handleAnswer = useCallback((correct: boolean, fast = false) => {
        const q = questions[currentIndex];
        const card = getAllCards().find(c => c.id === q.cardId);

        // Recalled fast with most of the timer left: the word can wait longer.
        submitReviewAnswer(q.cardId, correct, fast ? 'easy' : 'good');
        trackCardEvent(q.cardId, correct ? 'review_correct' : 'review_wrong');
        timeline.current.push([Date.now() - startedAt, correct ? 1 : 0]);

        const newStreak = correct ? streak + 1 : 0;
        setStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));

        const newResult: Result = {
            cardId: q.cardId,
            word: card?.word ?? q.cardId,
            correct,
            type: q.type,
            hard: q.hard,
        };
        const allResults = [...results, newResult];
        setResults(allResults);

        // A Holo (or better) edition of this word shields the pot once a day.
        const shielded = !correct && risk.pot > 0 && hasShield(editions?.[q.cardId]) && !shieldsUsed.has(q.cardId);
        if (shielded) setShieldsUsed(spendShield(q.cardId));
        const nextRisk = riskAnswer(risk, correct, shielded);
        setRisk(nextRisk);
        if (!correct && risk.pot > 0 && nextRisk.pot === 0) setLost({ pot: risk.pot, key: Date.now() });

        if (currentIndex + 1 >= questions.length) {
            finish(nextRisk, allResults);
        } else {
            // Leaving points in the pot is the "Liều": the next word is harder.
            advance(nextRisk.pot > 0);
        }
    }, [questions, currentIndex, submitReviewAnswer, streak, results, risk, finish, advance, startedAt, editions, shieldsUsed]);

    const handleRetry = useCallback(() => {
        const wrongIds = results.filter(r => !r.correct).map(r => r.cardId);
        const retryQuestions = buildQuestions(wrongIds, hardIdsNow());
        setQuestions(retryQuestions);
        setCurrentIndex(0);
        setResults([]);
        setDone(false);
        setStreak(0);
        setMaxStreak(0);
        setRisk(initialRisk());
        setLost(null);
        setIsRetry(true);
        setGhostResult(null);
        setDust(null);
    }, [results]);

    // No due cards (store hydrated, genuinely empty)
    if (dueCardIds.length === 0 && questions.length === 0 && !done) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center mb-2">
                    <Check className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold text-ink">{hardOnly ? 'Không còn từ khó nào!' : 'Không có từ cần ôn!'}</h1>
                <p className="text-muted text-sm max-w-xs">{hardOnly ? 'Bạn đã hạ hết từ khó. Từ nào quên nhiều lần sẽ hiện lại ở đây.' : 'Bạn đã ôn hết tất cả từ đến hạn. Tiếp tục học từ mới nhé.'}</p>
                <Link
                    href="/"
                    className="mt-4 px-6 py-3 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold text-sm transition-colors"
                >
                    Học từ mới
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-8 bg-bg">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors group text-sm"
                    >
                        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                        Thoát
                    </Link>
                    <div className="text-center">
                        <p className="text-ink font-bold">Ôn tập</p>
                        <p className="text-muted text-xs">{testAll ? `${dueCardIds.length} từ (test)` : hardOnly ? `${dueCardIds.length} từ khó` : `${dueCardIds.length} từ đến hạn`}</p>
                    </div>
                    <div className="w-12" /> {/* spacer */}
                </div>

                <div className="h-5 mb-5">
                    {!done && rival && !isRetry && startedAt > 0 && (
                        <GhostLine rival={rival} mine={results.filter(r => r.correct).length} startedAt={startedAt} />
                    )}
                </div>

                {!done && showIntro && questions.length > 0 && (
                    <p data-testid="risk-intro" className="mb-4 text-xs text-muted flex items-start gap-2">
                        <span className="flex-1">Đúng liên tiếp thì hũ nhân lên. Sai là mất phần chưa chốt. Bấm Chốt để giữ điểm.</span>
                        <button
                            type="button"
                            onClick={() => {
                                writeFlag(INTRO_KEY);
                                setShowIntro(false);
                            }}
                            className="text-ink underline shrink-0"
                        >
                            Hiểu rồi
                        </button>
                    </p>
                )}

                <AnimatePresence mode="wait">
                    {done ? (
                        <ResultScreen
                            key="results"
                            results={results}
                            maxStreak={maxStreak}
                            score={riskTotal(risk)}
                            bestPot={risk.bestPot}
                            ghostResult={ghostResult}
                            rival={rival}
                            dust={dust}
                            onRetry={handleRetry}
                        />
                    ) : questions.length === 0 ? (
                        <div key="loading" className="flex justify-center py-20">
                            <div className="w-8 h-8 rounded-full border-2 border-line border-t-accent animate-spin" />
                        </div>
                    ) : (
                        <QuestionCard
                            key={currentIndex}
                            question={questions[currentIndex]}
                            index={currentIndex}
                            total={questions.length}
                            streak={streak}
                            onAnswer={handleAnswer}
                            rail={
                                <RiskRail
                                    risk={risk}
                                    lost={lost}
                                    shield={hasShield(editions?.[questions[currentIndex].cardId]) && !shieldsUsed.has(questions[currentIndex].cardId) && risk.pot > 0}
                                    onBank={() => setRisk(bank(risk))}
                                />
                            }
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Wrapper với Suspense boundary ────────────────────────────────────────────

function ReviewPageFallback() {
    return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-line border-t-accent animate-spin" />
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<ReviewPageFallback />}>
            <ReviewPageContent />
        </Suspense>
    );
}
