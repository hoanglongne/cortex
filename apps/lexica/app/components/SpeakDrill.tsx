'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, Ear, Lightbulb, Mic, Play, Sparkles, Square, Volume2, X } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { AudioService } from '../lib/audio/AudioService';
import { cardClips, shadowQuote } from '../lib/audio/clips';
import { getCard, getQuotes } from '../lib/content/repository';
import { listenFirst, planUseKinds, USE_LABEL, type UseKind } from '../lib/pronunciation/variety';
import { hardToSay } from '../lib/pronunciation/drill';
import { nearSound, pairFor, pairId, tipFor } from '../lib/pronunciation/pairs';
import { clarity, diffHeard, LEVEL_LABEL, scoreAttempt, type SpeakLevel } from '../lib/pronunciation/score';
import { ipaSyllables, spellingSyllables, stressedSyllables } from '../lib/pronunciation/syllables';
import { listenOnce, playRecording, sayModel, speakVaried, stopSpeaking, variedVoiceCount, type Attempt } from '../lib/pronunciation/speech';
import { contourMatch, modelContour, normalizeTrack } from '../lib/pronunciation/pitch';
import type { ContentCard } from '../lib/content/pack';
import { alignAttempt } from '../lib/pronunciation/align';
import AlignedLine from './pron/AlignedLine';
import { chipLevel, type ChipLevel } from '../lib/pronunciation/chips';
import { analyze, contour, ending } from '../lib/pronunciation/prosody';
import { overlay } from '../lib/pronunciation/level3';
import { modelVoiceSamples } from '../lib/pronunciation/modelVoice';
import SoundTips, { alignmentFor, useSoundFeedback } from './pron/SoundTips';

export type Step = 1 | 2 | 3;
const STEP_LABEL: Record<Step, string> = { 1: 'Nghe phân biệt', 2: 'Nghe mẫu rồi nói', 3: 'Mẹo và nói trong cụm' };
/** Giao tiếp cards replace the tip with a situation, and skip the minimal pairs (a phrase has none). */
const SITUATION_LABEL = 'Nói trong tình huống';

/**
 * The speaking drill (docs/LEXICA_FEEDBACK_TASKS.md T8): for each word, hear
 * the difference, hear the model and say it, then a tip and the word in a
 * phrase. The /speak page runs all three steps; the Nói stage of the Today
 * session runs the last two on three words.
 */
export default function SpeakDrill({ words, steps = [1, 2, 3], onDone, onRestart }: { words: string[]; steps?: Step[]; onDone?: () => void; onRestart?: (ids: string[]) => void }) {
    const [index, setIndex] = useState(0);
    const [at, setAt] = useState(0);
    const [results, setResults] = useState<Record<string, SpeakLevel>>({});
    // Each word's sound chips from the scoring pack, for the summary.
    const [chips, setChips] = useState<Record<string, ChipLevel[]>>({});
    const card = getCard(words[index]);
    // One kind of "use the word" exercise per word, varied across the run (lib/pronunciation/variety.ts).
    const [seed] = useState(() => Math.floor(Math.random() * 1_000_000));
    const plan = useMemo(() => {
        const mine = useLexicaStore.getState().mySentences;
        return planUseKinds(
            words.map((id) => {
                const c = getCard(id);
                const w = c?.word.toLowerCase() ?? '';
                return {
                    hasQuote: Boolean(c) && quoteFor(id, w) !== null,
                    hasScenario: Boolean(c?.scenario) && !c?.situation,
                    hasMine: Boolean(mine[id]?.text.toLowerCase().includes(w)),
                };
            }),
            seed,
        );
    }, [words, seed]);
    const useKind: UseKind = plan[index] ?? 'phrase';
    // The model voices of this word and the next start loading now, so tapping a model plays at once.
    const upcoming = words.slice(index, index + 2).join(',');
    useEffect(() => {
        AudioService.preloadText(
            upcoming.split(',').flatMap((id) => {
                const c = getCard(id);
                return c ? cardClips(c, getQuotes(id)) : [];
            }),
        );
    }, [upcoming]);
    const cardSteps = card?.situation ? steps.filter((s) => s !== 1) : steps;
    const step = cardSteps[Math.min(at, cardSteps.length - 1)];
    // Leaving the drill silences it.
    useEffect(() => () => stopSpeaking(), []);
    const next = () => {
        // Moving on cuts off whatever model voice is still playing.
        stopSpeaking();
        if (at + 1 < cardSteps.length) return setAt(at + 1);
        setAt(0);
        setIndex(index + 1);
    };
    if (!card || index >= words.length) {
        return <Summary words={words} results={results} chips={chips} onDone={onDone} onAgain={onRestart ? () => onRestart(hardToSay(useLexicaStore.getState().speakMisses).map((h) => h.cardId)) : undefined} />;
    }
    return (
        // Wider than the page's column on a laptop, so a result fits beside the prompt.
        <div className="lg:-mx-24 xl:-mx-40">
            <div className="mx-auto mb-5 flex max-w-2xl items-center gap-3">
                <span className="font-mono text-xs text-muted">
                    Từ {index + 1}/{words.length}
                </span>
                <div className="flex-1 h-1 rounded-full bg-surface-3 overflow-hidden">
                    <div className="h-full bg-accent transition-all" style={{ width: `${((index + at / cardSteps.length) / words.length) * 100}%` }} />
                </div>
                <span className="font-mono text-xs text-muted">
                    Bước {at + 1}/{cardSteps.length} · {step === 3 ? (card.situation ? SITUATION_LABEL : USE_LABEL[useKind]) : step === 2 && listenFirst(index, seed) ? 'Nghe rồi nhắc lại' : STEP_LABEL[step]}
                </span>
            </div>
            {step === 1 && <ListenStep key={`${card.id}-1`} card={card} onDone={next} />}
            {step === 2 && (
                <SayStep
                    key={`${card.id}-2`}
                    card={card}
                    byEar={listenFirst(index, seed)}
                    onChips={(levels) => setChips((c) => ({ ...c, [card.id]: levels }))}
                    onDone={(level) => {
                        setResults((r) => ({ ...r, [card.id]: level }));
                        next();
                    }}
                />
            )}
            {step === 3 &&
                (card.situation ? (
                    <SituationStep key={`${card.id}-3`} card={card} onDone={next} />
                ) : useKind === 'shadow' ? (
                    <ShadowStep key={`${card.id}-3`} card={card} onDone={next} />
                ) : useKind === 'translate' ? (
                    <TranslateStep key={`${card.id}-3`} card={card} onDone={next} />
                ) : useKind === 'mine' ? (
                    <MineStep key={`${card.id}-3`} card={card} onDone={next} />
                ) : (
                    <PhraseStep key={`${card.id}-3`} card={card} onDone={next} />
                ))}
        </div>
    );
}

// ─── Step 1: hear the difference ─────────────────────────────────────────

/** Minimal pairs heard lately, newest last, so the listening round does not repeat them. */
const RECENT_PAIRS_KEY = 'lexica-recent-pairs';
const RECENT_PAIRS = 12;
function readRecentPairs(): string[] {
    try {
        const v = JSON.parse(localStorage.getItem(RECENT_PAIRS_KEY) ?? '[]') as unknown;
        return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    } catch {
        return [];
    }
}
function rememberPair(id: string) {
    try {
        localStorage.setItem(RECENT_PAIRS_KEY, JSON.stringify([...readRecentPairs().filter((x) => x !== id), id].slice(-RECENT_PAIRS)));
    } catch {
        // private mode: pairs may repeat
    }
}

function ListenStep({ card, onDone }: { card: ContentCard; onDone: () => void }) {
    // A different pair and order each practice, so the listening round is not learned by heart.
    const [seed] = useState(() => Math.floor(Math.random() * 1000));
    const rounds = useMemo(() => {
        const { pair } = pairFor(card.word, card.ipa, seed, readRecentPairs());
        rememberPair(pairId(pair));
        const near = nearSound(card.word, card.ipa);
        const list: { options: [string, string]; answer: string }[] = [{ options: [pair[0], pair[1]], answer: pair[seed % 2] }];
        if (near) {
            const word = card.word.toLowerCase();
            list.push({ options: seed % 2 ? [word, near.distractor] : [near.distractor, word], answer: word });
        }
        return list;
    }, [card, seed]);
    const [round, setRound] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [played, setPlayed] = useState(false);
    const r = rounds[round];
    const voices = typeof window === 'undefined' ? 0 : variedVoiceCount();

    const play = async () => {
        setPlayed(true);
        await speakVaried(r.answer, 3);
    };

    return (
        <Panel icon={<Ear className="w-4 h-4" />} title="Bạn nghe thấy từ nào?">
            <p className="text-sm text-muted">
                Nghe {voices >= 2 ? `${Math.min(3, voices)} giọng khác nhau` : '3 lần, giọng khác nhau'} đọc một từ, rồi chọn đúng từ đó.
            </p>
            <button onClick={() => void play()} className="mt-4 h-11 px-4 rounded-xl border border-line bg-surface-2 text-ink flex items-center gap-2 hover:border-line-strong">
                <Volume2 className="w-4 h-4" /> {played ? 'Nghe lại' : 'Nghe'}
            </button>
            <div className="mt-4 grid grid-cols-2 gap-2">
                {r.options.map((o) => {
                    const done = picked !== null;
                    const cls = done && o === r.answer ? 'border-accent bg-accent/10 text-ink' : done && o === picked ? 'border-danger/60 text-muted' : 'border-line text-ink hover:border-line-strong';
                    return (
                        <button key={o} disabled={!played || done} onClick={() => setPicked(o)} className={`h-14 rounded-xl border text-lg font-semibold lowercase disabled:opacity-60 ${cls}`}>
                            {o}
                        </button>
                    );
                })}
            </div>
            {picked && (
                <div className="mt-4 flex items-center justify-between gap-3">
                    <p className={`text-sm ${picked === r.answer ? 'text-accent' : 'text-ink-2'}`}>
                        {picked === r.answer ? 'Đúng rồi.' : `Đó là "${r.answer}". Nghe lại để thấy khác ở đâu.`}
                    </p>
                    <button
                        onClick={() => {
                            if (round + 1 < rounds.length) {
                                stopSpeaking();
                                setRound(round + 1);
                                setPicked(null);
                                setPlayed(false);
                            } else onDone();
                        }}
                        className="h-10 px-4 rounded-xl bg-accent text-on-accent font-bold shrink-0"
                    >
                        Tiếp
                    </button>
                </div>
            )}
        </Panel>
    );
}

// ─── Step 2: hear the model, say it ──────────────────────────────────────

/** One listening attempt at a time. `sentence`: the learner says their own sentence around `target`. */
function useAttempt(target: string, onScored?: (level: SpeakLevel) => void, sentence = false) {
    const [listening, setListening] = useState(false);
    const [attempt, setAttempt] = useState<(Attempt & { level: SpeakLevel; heard: string }) | null>(null);
    const abort = useRef<AbortController | null>(null);
    /** When the microphone really started recording this attempt (null while it opens, or asks for permission). */
    const [recordingAt, setRecordingAt] = useState<number | null>(null);
    /** "Xong" was tapped: the microphone is closing and the attempt is being read; the button says so at once. */
    const [finishing, setFinishing] = useState(false);
    const stop = () => {
        if (!abort.current || abort.current.signal.aborted) return;
        abort.current.abort();
        setFinishing(true);
        setRecordingAt(null);
    };
    const start = async () => {
        if (abort.current && !abort.current.signal.aborted) return;
        window.speechSynthesis?.cancel();
        const controller = new AbortController();
        abort.current = controller;
        setListening(true);
        setRecordingAt(null);
        setFinishing(false);
        const a = await listenOnce({ target, signal: controller.signal, sentence, onReady: () => setRecordingAt(Date.now()) });
        setRecordingAt(null);
        setFinishing(false);
        controller.abort();
        setListening(false);
        // A phrase is read word by word (level 1); a word, or a phrase inside the learner's own sentence, as a whole.
        const phrase = !sentence && target.trim().includes(' ') && a.alternatives.length > 0;
        const scored = phrase ? { level: alignAttempt(target, a.alternatives).level, heard: a.alternatives[0].transcript.toLowerCase() } : scoreAttempt(target, a.alternatives);
        setAttempt({ ...a, ...scored });
        // Each real attempt counts once for the "từ khó nói" list; a voice the browser could not read says nothing about the learner.
        if (a.alternatives.length > 0 || (a.error === 'no-speech' && !a.voiced)) onScored?.(scored.level);
    };
    return { listening, attempt, start, stop, recordingAt, finishing };
}

function SayStep({ card, onDone, onChips, byEar = false }: { card: ContentCard; onDone: (level: SpeakLevel) => void; onChips?: (levels: ChipLevel[]) => void; byEar?: boolean }) {
    const recordSpeak = useLexicaStore((s) => s.recordSpeak);
    const word = card.word.toLowerCase();
    const syl = stressedSyllables(card.word, card.ipa);
    const { listening, attempt, start, stop, recordingAt, finishing } = useAttempt(word, (level) => recordSpeak(card.id, level));
    const phrase = word.includes(' ');
    // By ear: the spelling stays hidden until the learner has tried, or asks to see it.
    const [peek, setPeek] = useState(false);
    const hidden = byEar && !attempt && !peek;

    return (
        <Panel
            icon={<Mic className="w-4 h-4" />}
            title={hidden ? 'Nghe rồi nhắc lại' : word}
            aside={
                attempt && (
                    <>
                        <AttemptResult attempt={attempt} target={word} ipa={card.ipa} onRetry={() => void start()} onChips={onChips} />
                        {attempt.pitch.length > 0 && <PitchTrace pitch={attempt.pitch} flags={stressFlags(word, word, card.ipa)} text={word} />}
                    </>
                )
            }
        >
            {hidden ? (
                <div className="rounded-xl bg-surface-2 p-4">
                    <p className="text-ink">Nghe giọng mẫu rồi nói lại y như vậy, chưa cần nhìn chữ.</p>
                    <button onClick={() => setPeek(true)} className="mt-2 text-xs text-muted underline">
                        Xem chữ
                    </button>
                </div>
            ) : (
                <p data-testid="syllables" className="font-mono text-2xl text-ink tracking-wide">
                    {phrase ? word : syl.text}
                </p>
            )}
            {!hidden && phrase && <p className="text-sm text-muted">{card.translationHint}</p>}
            {!hidden && !syl.fromIpa && card.ipa && <p className="font-mono text-sm text-muted">/{card.ipa}/</p>}
            <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => void sayModel(word, 'slow')} className="h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                    <Volume2 className="w-4 h-4" /> Mẫu chậm
                </button>
                <button onClick={() => void sayModel(word)} className="h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                    <Volume2 className="w-4 h-4" /> Mẫu thường
                </button>
            </div>
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingAt={recordingAt} finishing={finishing} label={attempt ? 'Nói lại' : 'Nói'} />
            {attempt && (
                <div className="mt-4 flex justify-end">
                    <button onClick={() => onDone(attempt.level)} className="h-10 px-4 rounded-xl bg-accent text-on-accent font-bold">
                        Tiếp
                    </button>
                </div>
            )}
            {!attempt && (
                <button onClick={() => onDone('unclear')} className="mt-3 text-xs text-muted underline">
                    Bỏ qua bước này
                </button>
            )}
        </Panel>
    );
}

/** Stress per syllable across a text: the card's word from its IPA, other words stressed on the first syllable (the pitch line's fallback model). */
function stressFlags(text: string, word: string, ipa?: string): boolean[] {
    return text
        .toLowerCase()
        .replace(/[^a-z' -]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .flatMap((w) => {
            if (w === word && ipa) {
                const { count, stress } = ipaSyllables(ipa);
                return Array.from({ length: count }, (_, i) => i === stress);
            }
            const n = Math.max(1, spellingSyllables(w).length);
            return Array.from({ length: n }, (_, i) => i === 0 && w.length > 3);
        });
}

// ─── Step 3: tip and the word in a phrase ────────────────────────────────

function PhraseStep({ card, onDone }: { card: ContentCard; onDone: () => void }) {
    const word = card.word.toLowerCase();
    // Another of the word's phrases each practice.
    const [pick] = useState(() => Math.floor(Math.random() * 3));
    const phrase = (card.collocations?.length ? card.collocations[pick % card.collocations.length] : word).toLowerCase();
    const syl = stressedSyllables(card.word, card.ipa);
    const stressedPart = syl.fromIpa ? undefined : syl.text.split('·').find((s) => s === s.toUpperCase());
    const recordSpeak = useLexicaStore((s) => s.recordSpeak);
    // Said clearly inside its phrase counts as Dùng too; a miss here does not add to "từ khó nói".
    const { listening, attempt, start, stop, recordingAt, finishing } = useAttempt(phrase, (level) => level === 'clear' && recordSpeak(card.id, level));
    const flags = useMemo(() => stressFlags(phrase, word, card.ipa), [phrase, word, card.ipa]);

    return (
        <Panel
            icon={<Lightbulb className="w-4 h-4" />}
            title="Mẹo"
            aside={
                attempt && (
                    <>
                        <AttemptResult attempt={attempt} target={phrase} onRetry={() => void start()} />
                        {attempt.pitch.length > 0 && <PitchTrace pitch={attempt.pitch} flags={flags} text={phrase} />}
                    </>
                )
            }
        >
            <p className="text-ink">{tipFor(card.word, card.ipa, stressedPart)}</p>
            <div className="mt-5 rounded-xl bg-surface-2 p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Nói trong cụm</p>
                <p className="mt-1 text-xl text-ink">{phrase}</p>
                <button onClick={() => void sayModel(phrase)} className="mt-3 h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                    <Play className="w-4 h-4" /> Nghe mẫu
                </button>
            </div>
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingAt={recordingAt} finishing={finishing} label={attempt ? 'Nói lại' : 'Nói cả cụm'} />
            <div className="mt-4 flex justify-end">
                <button onClick={onDone} className="h-10 px-4 rounded-xl bg-accent text-on-accent font-bold">
                    {attempt ? 'Tiếp' : 'Bỏ qua'}
                </button>
            </div>
        </Panel>
    );
}

// ─── Step 3, other ways to use the word (lib/pronunciation/variety.ts) ──

/** A real quote with the word, short enough to say back, or null. */
const quoteFor = (cardId: string, word: string) => shadowQuote(getQuotes(cardId), word);

/** "Nói theo câu thật": hear a line from a book, the news or a song, then say it back. */
function ShadowStep({ card, onDone }: { card: ContentCard; onDone: () => void }) {
    const word = card.word.toLowerCase();
    const quote = useMemo(() => quoteFor(card.id, word), [card.id, word]);
    const line = quote?.text ?? word;
    const recordSpeak = useLexicaStore((s) => s.recordSpeak);
    const { listening, attempt, start, stop, recordingAt, finishing } = useAttempt(line, (level) => level === 'clear' && recordSpeak(card.id, level));
    return (
        <Panel
            icon={<Ear className="w-4 h-4" />}
            title="Nói theo câu thật"
            aside={
                attempt && (
                    <>
                        <AttemptResult attempt={attempt} target={line} onRetry={() => void start()} />
                        {attempt.pitch.length > 0 && <PitchTrace pitch={attempt.pitch} flags={stressFlags(line, word, card.ipa)} text={line} />}
                    </>
                )
            }
        >
            <p className="text-sm text-muted">Nghe câu này rồi nói lại, giữ nhịp và chỗ lên xuống giọng.</p>
            <blockquote className="mt-3 rounded-xl bg-surface-2 p-4">
                <p className="text-lg leading-relaxed text-ink">
                    {line.split(new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i')).map((part, i) =>
                        part.toLowerCase() === word ? (
                            <mark key={i} className="rounded bg-accent-soft px-0.5 text-accent-strong">
                                {part}
                            </mark>
                        ) : (
                            <span key={i}>{part}</span>
                        ),
                    )}
                </p>
                {quote && <p className="mt-2 text-xs text-muted">{quote.source}</p>}
                {quote?.translation && <p className="mt-1 text-sm text-ink-2">{quote.translation}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => void sayModel(line, 'slow')} className="h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                        <Play className="w-4 h-4" /> Nghe chậm
                    </button>
                    <button onClick={() => void sayModel(line)} className="h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                        <Play className="w-4 h-4" /> Nghe thường
                    </button>
                </div>
            </blockquote>
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingAt={recordingAt} finishing={finishing} label={attempt ? 'Nói lại' : 'Nói cả câu'} />
            <StepNext attempted={Boolean(attempt)} onDone={onDone} />
        </Panel>
    );
}

/** "Nói bằng tiếng Anh": the card's Vietnamese sentence, said in English with the word. Only the word is scored. */
function TranslateStep({ card, onDone }: { card: ContentCard; onDone: () => void }) {
    const word = card.word.toLowerCase();
    const recordSpeak = useLexicaStore((s) => s.recordSpeak);
    const { listening, attempt, start, stop, recordingAt, finishing } = useAttempt(word, (level) => level === 'clear' && recordSpeak(card.id, level), true);
    const [hint, setHint] = useState(false);
    const parts = (card.scenario ?? word).split(new RegExp(`(${card.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'));
    return (
        <Panel icon={<Lightbulb className="w-4 h-4" />} title="Nói bằng tiếng Anh" aside={attempt && <AttemptResult attempt={attempt} target={word} sentence />}>
            <p className="text-sm text-muted">
                Nói ý này bằng tiếng Anh, có dùng <span className="font-semibold text-ink">{word}</span>. Không cần dịch từng chữ, nói theo cách của bạn.
            </p>
            <p data-testid="translate-source" className="mt-3 rounded-xl bg-surface-2 p-4 text-lg leading-relaxed text-ink">
                {parts.map((part, i) =>
                    part.toLowerCase() === word ? (
                        <mark key={i} className="rounded bg-accent-soft px-0.5 font-semibold text-accent-strong">
                            {word}
                        </mark>
                    ) : (
                        <span key={i}>{part}</span>
                    ),
                )}
            </p>
            {hint ? (
                <p className="mt-2 text-sm text-ink-2">
                    Gợi ý mở đầu: {card.collocations?.[0] ? <span className="font-mono">…{card.collocations[0]}…</span> : <span className="font-mono">I think … {word} …</span>}
                </p>
            ) : (
                <button onClick={() => setHint(true)} className="mt-2 text-xs text-muted underline">
                    Cần gợi ý?
                </button>
            )}
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingAt={recordingAt} finishing={finishing} label={attempt ? 'Nói lại' : 'Nói cả câu'} />
            <StepNext attempted={Boolean(attempt)} onDone={onDone} />
        </Panel>
    );
}

/** "Đọc câu của bạn": the sentence the learner wrote with the word, read aloud and marked word by word. */
function MineStep({ card, onDone }: { card: ContentCard; onDone: () => void }) {
    const mine = useLexicaStore((s) => s.mySentences[card.id]?.text) ?? card.word;
    const recordSpeak = useLexicaStore((s) => s.recordSpeak);
    const { listening, attempt, start, stop, recordingAt, finishing } = useAttempt(mine, (level) => level === 'clear' && recordSpeak(card.id, level));
    return (
        <Panel
            icon={<Mic className="w-4 h-4" />}
            title="Đọc câu của bạn"
            aside={
                attempt && (
                    <>
                        <AttemptResult attempt={attempt} target={mine} onRetry={() => void start()} />
                        {attempt.pitch.length > 0 && <PitchTrace pitch={attempt.pitch} flags={stressFlags(mine, card.word.toLowerCase(), card.ipa)} text={mine} />}
                    </>
                )
            }
        >
            <p className="text-sm text-muted">Câu bạn đã tự viết với từ này. Đọc to như đang kể cho bạn bè nghe.</p>
            <p className="mt-3 rounded-xl bg-surface-2 p-4 text-lg leading-relaxed text-ink">{mine}</p>
            <button onClick={() => void sayModel(mine)} className="mt-3 h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                <Play className="w-4 h-4" /> Nghe máy đọc
            </button>
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingAt={recordingAt} finishing={finishing} label={attempt ? 'Nói lại' : 'Đọc to'} />
            <StepNext attempted={Boolean(attempt)} onDone={onDone} />
        </Panel>
    );
}

function StepNext({ attempted, onDone }: { attempted: boolean; onDone: () => void }) {
    return (
        <div className="mt-4 flex justify-end">
            <button onClick={onDone} className="h-10 px-4 rounded-xl bg-accent text-on-accent font-bold">
                {attempted ? 'Tiếp' : 'Bỏ qua'}
            </button>
        </div>
    );
}

// ─── Giao tiếp: say the phrase in a situation ────────────────────────────

/**
 * A situation in Vietnamese ("Bạn kẹt xe, nhắn cho sếp..."), a model sentence
 * to hear, then the learner says a sentence of their own with the phrase.
 * Only the phrase is scored: the rest of the sentence is theirs.
 */
function SituationStep({ card, onDone }: { card: ContentCard; onDone: () => void }) {
    const recordSpeak = useLexicaStore((s) => s.recordSpeak);
    const phrase = card.word.toLowerCase();
    const [showModel, setShowModel] = useState(false);
    const { listening, attempt, start, stop, recordingAt, finishing } = useAttempt(phrase, (level) => level === 'clear' && recordSpeak(card.id, level), true);
    const situation = card.situation!;
    return (
        <Panel icon={<Lightbulb className="w-4 h-4" />} title="Tình huống" aside={attempt && <AttemptResult attempt={attempt} target={phrase} sentence />}>
            <p data-testid="situation" className="text-lg text-ink">{situation.prompt}</p>
            <p className="mt-2 text-sm text-muted">
                Nói một câu tiếng Anh có <span className="font-semibold text-ink">{phrase}</span>.
            </p>
            <div className="mt-4 rounded-xl bg-surface-2 p-4">
                {showModel ? (
                    <>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Câu mẫu</p>
                        <p className="mt-1 text-lg text-ink">{situation.model}</p>
                        <button onClick={() => void sayModel(situation.model)} className="mt-3 h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                            <Play className="w-4 h-4" /> Nghe mẫu
                        </button>
                    </>
                ) : (
                    <button onClick={() => setShowModel(true)} className="text-sm text-ink underline">
                        Xem câu mẫu
                    </button>
                )}
            </div>
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingAt={recordingAt} finishing={finishing} label={attempt ? 'Nói lại' : 'Nói cả câu'} />
            {showModel && <SayModelSentence model={situation.model} />}
            <div className="mt-4 flex justify-end">
                <button onClick={onDone} className="h-10 px-4 rounded-xl bg-accent text-on-accent font-bold">
                    {attempt ? 'Tiếp' : 'Bỏ qua'}
                </button>
            </div>
        </Panel>
    );
}

/** Optional, after the learner's own sentence: say the model sentence and see each word marked. */
function SayModelSentence({ model }: { model: string }) {
    const [open, setOpen] = useState(false);
    const { listening, attempt, start, stop, recordingAt, finishing } = useAttempt(model);
    if (!open)
        return (
            <button onClick={() => setOpen(true)} className="mt-3 text-sm text-ink underline">
                Nói theo câu mẫu
            </button>
        );
    return (
        <div className="mt-4 border-t border-line pt-4">
            <p className="text-sm text-muted">Đọc to câu mẫu, app đánh dấu từng từ máy nghe được.</p>
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingAt={recordingAt} finishing={finishing} label={attempt ? 'Nói lại câu mẫu' : 'Nói câu mẫu'} />
            {attempt && <AttemptResult attempt={attempt} target={model} />}
        </div>
    );
}

/**
 * Desktop first: the learner's pitch over the model voice's, aligned in time
 * (level 3, 6.3). Without the natural voice (no Cortex API), a model line
 * shaped from the stress pattern stands in.
 */
function PitchTrace({ pitch, flags, text }: { pitch: (number | null)[]; flags: boolean[]; text: string }) {
    const [voice, setVoice] = useState<number[] | null>(null);
    useEffect(() => {
        let live = true;
        void modelVoiceSamples(text).then((s) => live && s && setVoice(contour(analyze(s))));
        return () => {
            live = false;
        };
    }, [text]);
    const mine = normalizeTrack(pitch);
    const laid = voice ? overlay(mine, voice) : null;
    const model = laid?.model ?? modelContour(flags);
    if (mine.length === 0) return null;
    const all = [...mine, ...model];
    const lo = Math.min(...all) - 1;
    const hi = Math.max(...all) + 1;
    const path = (v: number[]) => v.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i / (v.length - 1)) * 300},${100 - ((y - lo) / (hi - lo)) * 100}`).join(' ');
    const match = Math.round(contourMatch(mine, model) * 100);
    return (
        <div data-testid="pitch-trace" className="hidden lg:block mt-4 rounded-xl border border-line p-3">
            <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                <span>
                    Cao độ: <span className="text-accent">giọng bạn</span> · <span className="text-subtle">{laid ? 'giọng mẫu' : 'đường mẫu (theo trọng âm)'}</span>
                </span>
                <span>giống {match}%</span>
            </div>
            <svg viewBox="0 0 300 100" className="mt-2 w-full h-28" preserveAspectRatio="none" aria-label="Đường cao độ">
                <path d={path(model)} fill="none" strokeWidth="2" strokeDasharray="4 4" className="stroke-subtle" />
                <path d={path(mine)} fill="none" strokeWidth="2.5" className="stroke-accent" />
            </svg>
            <p className="text-xs text-muted">
                Cuối câu: <span className="text-subtle">mẫu {arrow(ending(model))}</span> · <span className="text-accent">bạn {arrow(ending(mine))}</span>. Câu kể thường lên ở âm được nhấn rồi xuống giọng ở cuối.
            </p>
        </div>
    );
}

/** Which way the end of a pitch line goes. */
const arrow = (semitones: number) => (semitones <= -1 ? '↘ xuống' : semitones >= 1 ? '↗ lên' : '→ ngang');

/**
 * One button, one way: tap to start, tap again when done (or just pause:
 * the recording ends by itself). It says what it is doing: opening the
 * microphone, then listening with the seconds. Holding to talk was tried
 * and dropped: on phones a permission prompt or a slight finger move ended
 * recordings at random.
 */
function MicButton({
    listening,
    onStart,
    onStop,
    recordingAt,
    finishing = false,
    label,
}: {
    listening: boolean;
    onStart: () => void;
    onStop: () => void;
    recordingAt: number | null;
    finishing?: boolean;
    label: string;
}) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (recordingAt === null) return;
        const t = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(t);
    }, [recordingAt]);
    const seconds = recordingAt === null ? 0 : Math.max(0, Math.floor((now - recordingAt) / 1000));
    const opening = listening && recordingAt === null && !finishing;
    return (
        <>
            <button
                type="button"
                onClick={listening ? onStop : onStart}
                disabled={finishing}
                aria-pressed={listening}
                className={`mt-5 w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors select-none ${listening ? 'bg-danger text-bg' : 'bg-accent text-on-accent hover:bg-accent-strong'}`}
            >
                {finishing ? (
                    <>
                        <Mic className="w-4 h-4 animate-pulse" /> Đang chấm…
                    </>
                ) : listening ? (
                    opening ? (
                        <>
                            <Mic className="w-4 h-4 animate-pulse" /> Đang mở micro…
                        </>
                    ) : (
                        <>
                            <Square className="w-4 h-4" /> Xong · <span className="tabular-nums font-mono">0:{String(seconds).padStart(2, '0')}</span>
                        </>
                    )
                ) : (
                    <>
                        <Mic className="w-4 h-4" /> {label}
                    </>
                )}
            </button>
            <p className="mt-1.5 text-center text-xs text-muted" aria-live="polite">
                {finishing ? 'Đã dừng thu, đang xem bạn nói gì.' : opening ? 'Chờ micro bật rồi hãy nói.' : listening ? 'Đang nghe. Nói xong bấm Xong, hoặc im 2 giây là tự dừng.' : 'Bấm để bắt đầu nói.'}
            </p>
        </>
    );
}

function AttemptResult({
    attempt,
    target,
    ipa,
    sentence = false,
    onRetry,
    onChips,
}: {
    attempt: Attempt & { level: SpeakLevel; heard: string };
    target: string;
    ipa?: string;
    sentence?: boolean;
    onRetry?: () => void;
    onChips?: (levels: ChipLevel[]) => void;
}) {
    const alignment = useMemo(() => (sentence ? null : alignmentFor(attempt, target)), [attempt, target, sentence]);
    const feedback = useSoundFeedback(sentence ? null : attempt, target, { ipa, heard: attempt.heard, alignment });
    useEffect(() => {
        if (feedback?.scored) onChips?.(feedback.scored.flatMap((w) => w.scores.map((s) => chipLevel(s.score))));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once per result
    }, [feedback]);
    const score = funScore(attempt, target, feedback?.scored ?? null);
    const tone = attempt.level === 'clear' ? 'text-accent border-accent/50' : attempt.level === 'close' ? 'text-warning border-warning/50' : 'text-danger border-danger/50';
    if (attempt.error === 'unsupported') return <p className="mt-3 text-sm text-warning">Trình duyệt này không nhận giọng nói.</p>;
    if (attempt.error === 'not-allowed') return <p className="mt-3 text-sm text-warning">Chưa có quyền dùng micro. Bật micro trong cài đặt trình duyệt rồi thử lại.</p>;
    return (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} data-testid="attempt" className="mt-4 @3xl:mt-0 rounded-xl border border-line bg-surface p-4">
            <FunScore score={score} />
            <div className="flex items-center gap-3">
                {/* With the sound chips, the chips say how clear it was; the recognizer's label would contradict them. */}
                {/* The score says how clear it was; the label only when there is no score. */}
                {score === null && <span className={`rounded-lg border px-2 py-0.5 text-sm font-semibold ${tone}`}>{LEVEL_LABEL[attempt.level]}</span>}
                <p className="text-sm text-ink-2">
                    Máy nghe:{' '}
                    {attempt.heard && alignment ? (
                        <span className="font-mono text-ink">{attempt.alternatives[0]?.transcript}</span>
                    ) : attempt.heard ? (
                        <span className="font-mono text-ink">
                            {diffHeard(attempt.heard, target).map((p, i) => (
                                <span key={i} className={p.ok ? '' : 'text-danger underline decoration-danger/60'}>
                                    {p.text}
                                </span>
                            ))}
                        </span>
                    ) : (
                        <span className="text-muted">{attempt.voiced ? 'có giọng bạn nhưng chưa nhận ra từ' : 'không nghe được gì'}</span>
                    )}
                </p>
            </div>
            {alignment && <AlignedLine alignment={alignment} />}
            {!attempt.heard && (
                <p data-testid="attempt-hint" className="mt-2 text-xs text-muted">
                    {attempt.error === 'network'
                        ? 'Không gửi được bản ghi để nhận dạng. Kiểm tra mạng rồi nói lại.'
                        : attempt.voiced
                          ? 'Bản ghi có giọng bạn nhưng trình duyệt chưa đọc ra chữ. Lần tới app để trình duyệt tự nghe trực tiếp, bạn nói lại nhé.'
                          : 'Micro thu rất nhỏ. Đưa micro lại gần, bấm nút rồi mới nói.'}
                </p>
            )}
            <SoundTips feedback={feedback} audioUrl={attempt.audioUrl} onRetry={onRetry} />
            {attempt.audioUrl && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted">Nghe lại:</span>
                    <button onClick={() => playRecording(attempt.audioUrl!)} className="h-9 px-3 rounded-lg border border-line text-ink flex items-center gap-1.5 hover:border-line-strong">
                        <Play className="w-3.5 h-3.5" /> Giọng bạn
                    </button>
                    <button onClick={() => void sayModel(target)} className="h-9 px-3 rounded-lg border border-line text-ink flex items-center gap-1.5 hover:border-line-strong">
                        <Volume2 className="w-3.5 h-3.5" /> Giọng mẫu
                    </button>
                </div>
            )}
        </motion.div>
    );
}

/** Springs for the panel moving aside and back; soft, no bounce. */
const PANEL_SPRING = { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 } as const;

/**
 * One step of the drill. With `aside` (the result of an attempt), a wide
 * screen shows it to the right of the prompt, so nothing important is
 * below the fold; the prompt slides left to make room, and back to the
 * middle on the next step (one `layoutId`, so the move is animated across
 * steps). On a phone the result stays under the prompt.
 */
function Panel({ icon, title, children, aside }: { icon: React.ReactNode; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
    const split = Boolean(aside);
    return (
        <div className="@container">
            <motion.div layout transition={PANEL_SPRING} className={`mx-auto ${split ? 'max-w-2xl @3xl:max-w-none @3xl:grid @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @3xl:items-start @3xl:gap-5' : 'max-w-2xl'}`}>
                <motion.section
                    layoutId="speak-panel"
                    layout
                    transition={PANEL_SPRING}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-line bg-surface p-5"
                >
                    <motion.p layout="position" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-accent">
                        {icon} {title}
                    </motion.p>
                    <motion.div layout="position" className="mt-3">
                        {children}
                    </motion.div>
                </motion.section>
                <AnimatePresence mode="popLayout">
                    {aside && (
                        <motion.aside
                            key="result"
                            layout
                            initial={{ opacity: 0, x: 32, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 32 }}
                            transition={{ ...PANEL_SPRING, opacity: { duration: 0.25 } }}
                            className="@3xl:sticky @3xl:top-4"
                        >
                            {aside}
                        </motion.aside>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function Summary({ words, results, chips, onAgain, onDone }: { words: string[]; results: Record<string, SpeakLevel>; chips: Record<string, ChipLevel[]>; onAgain?: () => void; onDone?: () => void }) {
    const hard = hardToSay(useLexicaStore.getState().speakMisses);
    return (
        <div data-testid="speak-summary" className="rounded-2xl border border-line bg-surface p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Xong</p>
            <ul className="mt-3 space-y-2">
                {words.map((id) => {
                    const level = results[id] ?? 'unclear';
                    return (
                        <li key={id} className="flex items-center gap-2 text-sm">
                            {level === 'clear' ? <Check className="w-4 h-4 text-accent" /> : level === 'close' ? <Check className="w-4 h-4 text-warning" /> : <X className="w-4 h-4 text-danger" />}
                            <span className="text-ink lowercase">{getCard(id)?.word}</span>
                            {chips[id] ? (
                                <span className="ml-auto flex gap-0.5" aria-label="Từng âm">
                                    {chips[id].map((c, i) => (
                                        <i key={i} className={`w-3.5 h-3.5 rounded ${c === 'ok' ? 'bg-accent/70' : c === 'warn' ? 'bg-warning' : 'bg-danger'}`} />
                                    ))}
                                </span>
                            ) : (
                                <span className="text-muted">· {LEVEL_LABEL[level]}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
            {onDone ? (
                <button data-testid="stage-next" onClick={onDone} className="mt-5 w-full h-12 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold">
                    Tiếp tục →
                </button>
            ) : (
            <div className="mt-5 grid grid-cols-2 gap-2">
                <button disabled={hard.length === 0} onClick={onAgain} className="h-11 rounded-xl border border-line text-sm text-ink disabled:opacity-40 hover:border-line-strong">
                    Luyện lại từ khó{hard.length > 0 ? ` (${hard.length})` : ''}
                </button>
                <Link href="/" className="h-11 rounded-xl border border-line text-sm text-ink flex items-center justify-center hover:border-line-strong">
                    Về trang chủ
                </Link>
            </div>
            )}
        </div>
    );
}

/**
 * A light-hearted 0–100 for an attempt. With the scoring pack: the sounds,
 * weighted towards the weakest one (one missed sound should show). Without
 * it: how clearly recognition caught the target (score.ts, clarity). Only a
 * smile, never a grade: nothing is stored or compared.
 */
export function funScore(attempt: Pick<Attempt, 'alternatives'>, target: string, scored: { scores: { score: number }[] }[] | null): number | null {
    const all = (scored?.flatMap((w) => w.scores.map((s) => s.score)) ?? []).map((x) => Math.min(1, Math.max(0, x)));
    if (all.length > 0) {
        const mean = all.reduce((n, x) => n + x, 0) / all.length;
        return Math.round((0.65 * mean + 0.35 * Math.min(...all)) * 100);
    }
    if (attempt.alternatives.length === 0) return null;
    return Math.round(clarity(target, attempt.alternatives) * 100);
}

/** Kind lines per band, several each, so the same one does not come back every time. */
const FUN_LINES: { from: number; lines: string[] }[] = [
    { from: 95, lines: ['Chuẩn như người bản xứ!', 'Nghe là thấy Tây liền', 'Hoàn hảo, khỏi chỉnh gì', 'Giọng này đi thi được rồi'] },
    { from: 85, lines: ['Rất rõ, giỏi ghê', 'Ngon lành cành đào', 'Máy nghe phát hiểu luôn', 'Gần như hoàn hảo'] },
    { from: 70, lines: ['Ổn áp rồi, thêm chút là chuẩn', 'Khá lắm, chỉnh nhẹ là xong', 'Đúng hướng rồi đó', 'Nghe được, mài thêm tí nữa'] },
    { from: 50, lines: ['Đang vào guồng, thử lại nhé', 'Gần tới rồi, nói chậm lại xem', 'Nghe mẫu thêm lần nữa rồi thử', 'Chút nữa thôi'] },
    { from: 0, lines: ['Máy hơi bối rối, nói lại cho nó nghe nha', 'Thử nói to và chậm hơn xem', 'Lần sau sẽ khá hơn, thử lại nào', 'Nghe mẫu chậm trước rồi nói nhé'] },
];
let lastLine = '';
/** A line for the score, never the same as the previous one. */
function funLine(score: number): string {
    const lines = FUN_LINES.find((l) => score >= l.from)!.lines.filter((l) => l !== lastLine);
    lastLine = lines[Math.floor(Math.random() * lines.length)];
    return lastLine;
}

/** The score counting up in a ring, with a friendly line. */
function FunScore({ score }: { score: number | null }) {
    const value = useMotionValue(0);
    const shown = useTransform(value, (v) => Math.round(v));
    const [n, setN] = useState(0);
    useEffect(() => {
        if (score === null) return;
        const unsub = shown.on('change', setN);
        const controls = animate(value, score, { duration: 0.9, ease: 'easeOut' });
        return () => {
            controls.stop();
            unsub();
        };
    }, [score, value, shown]);
    // One line per score shown, picked once (not on every count-up frame).
    const line = useMemo(() => (score === null ? '' : funLine(score)), [score]);
    if (score === null) return null;
    const tone = score >= 80 ? 'text-accent' : score >= 55 ? 'text-warning' : 'text-muted';
    const r = 22;
    const c = 2 * Math.PI * r;
    return (
        <div data-testid="fun-score" className="mb-3 flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0">
                <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
                    <circle cx="28" cy="28" r={r} strokeWidth="5" className="fill-none stroke-surface-3" />
                    <motion.circle
                        cx="28"
                        cy="28"
                        r={r}
                        strokeWidth="5"
                        strokeLinecap="round"
                        className={`fill-none ${score >= 80 ? 'stroke-accent' : score >= 55 ? 'stroke-warning' : 'stroke-subtle'}`}
                        strokeDasharray={c}
                        initial={{ strokeDashoffset: c }}
                        animate={{ strokeDashoffset: c * (1 - score / 100) }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                </svg>
                <span className={`absolute inset-0 grid place-items-center font-mono text-lg font-bold tabular-nums ${tone}`}>{n}</span>
            </div>
            <p className="flex items-center gap-1.5 font-semibold text-ink">
                {score >= 80 && <Sparkles className="h-4 w-4 text-accent" aria-hidden />}
                {line}
            </p>
        </div>
    );
}
