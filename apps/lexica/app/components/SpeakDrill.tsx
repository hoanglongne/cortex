'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Ear, Lightbulb, Mic, Play, Square, Volume2, X } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { AudioService, NATURAL_VOICES } from '../lib/audio/AudioService';
import { getCard } from '../lib/content/repository';
import { hardToSay } from '../lib/pronunciation/drill';
import { nearSound, pairFor, tipFor } from '../lib/pronunciation/pairs';
import { diffHeard, LEVEL_LABEL, scoreAttempt, type SpeakLevel } from '../lib/pronunciation/score';
import { ipaSyllables, spellingSyllables, stressedSyllables } from '../lib/pronunciation/syllables';
import { listenOnce, sayModel, speakVaried, variedVoiceCount, type Attempt } from '../lib/pronunciation/speech';
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
    // The model voices of this word and the next start loading now, so tapping a model plays at once.
    const upcoming = words.slice(index, index + 2).join(',');
    useEffect(() => {
        AudioService.preloadText(
            upcoming.split(',').flatMap((id) => {
                const c = getCard(id);
                if (!c) return [];
                const w = c.word.toLowerCase();
                return [
                    { text: w },
                    { text: w, slow: true },
                    ...NATURAL_VOICES.map((voice) => ({ text: w, voice })),
                    ...(c.collocations?.[0] ? [{ text: c.collocations[0].toLowerCase() }] : []),
                    ...(c.situation ? [{ text: c.situation.model }] : []),
                ];
            }),
        );
    }, [upcoming]);
    const cardSteps = card?.situation ? steps.filter((s) => s !== 1) : steps;
    const step = cardSteps[Math.min(at, cardSteps.length - 1)];
    const next = () => {
        if (at + 1 < cardSteps.length) return setAt(at + 1);
        setAt(0);
        setIndex(index + 1);
    };
    if (!card || index >= words.length) {
        return <Summary words={words} results={results} chips={chips} onDone={onDone} onAgain={onRestart ? () => onRestart(hardToSay(useLexicaStore.getState().speakMisses).map((h) => h.cardId)) : undefined} />;
    }
    return (
        <>
            <div className="mb-5 flex items-center gap-3">
                <span className="font-mono text-xs text-muted">
                    Từ {index + 1}/{words.length}
                </span>
                <div className="flex-1 h-1 rounded-full bg-surface-3 overflow-hidden">
                    <div className="h-full bg-accent transition-all" style={{ width: `${((index + at / cardSteps.length) / words.length) * 100}%` }} />
                </div>
                <span className="font-mono text-xs text-muted">
                    Bước {at + 1}/{cardSteps.length} · {step === 3 && card.situation ? SITUATION_LABEL : STEP_LABEL[step]}
                </span>
            </div>
            {step === 1 && <ListenStep key={`${card.id}-1`} card={card} onDone={next} />}
            {step === 2 && (
                <SayStep
                    key={`${card.id}-2`}
                    card={card}
                    onChips={(levels) => setChips((c) => ({ ...c, [card.id]: levels }))}
                    onDone={(level) => {
                        setResults((r) => ({ ...r, [card.id]: level }));
                        next();
                    }}
                />
            )}
            {step === 3 && (card.situation ? <SituationStep key={`${card.id}-3`} card={card} onDone={next} /> : <PhraseStep key={`${card.id}-3`} card={card} onDone={next} />)}
        </>
    );
}

// ─── Step 1: hear the difference ─────────────────────────────────────────

function ListenStep({ card, onDone }: { card: ContentCard; onDone: () => void }) {
    // A different pair and order each practice, so the listening round is not learned by heart.
    const [seed] = useState(() => Math.floor(Math.random() * 1000));
    const rounds = useMemo(() => {
        const { pair } = pairFor(card.word, card.ipa, seed);
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
    const recordingSince = useRef<number | null>(null);
    const stop = () => abort.current?.abort();
    const start = async () => {
        if (abort.current && !abort.current.signal.aborted) return;
        window.speechSynthesis?.cancel();
        const controller = new AbortController();
        abort.current = controller;
        setListening(true);
        recordingSince.current = null;
        const a = await listenOnce({ target, signal: controller.signal, sentence, onReady: () => (recordingSince.current = performance.now()) });
        recordingSince.current = null;
        controller.abort();
        setListening(false);
        // A phrase is read word by word (level 1); a word, or a phrase inside the learner's own sentence, as a whole.
        const phrase = !sentence && target.trim().includes(' ') && a.alternatives.length > 0;
        const scored = phrase ? { level: alignAttempt(target, a.alternatives).level, heard: a.alternatives[0].transcript.toLowerCase() } : scoreAttempt(target, a.alternatives);
        setAttempt({ ...a, ...scored });
        // Each real attempt counts once for the "từ khó nói" list; a voice the browser could not read says nothing about the learner.
        if (a.alternatives.length > 0 || (a.error === 'no-speech' && !a.voiced)) onScored?.(scored.level);
    };
    return { listening, attempt, start, stop, recordingSince };
}

function SayStep({ card, onDone, onChips }: { card: ContentCard; onDone: (level: SpeakLevel) => void; onChips?: (levels: ChipLevel[]) => void }) {
    const recordSpeak = useLexicaStore((s) => s.recordSpeak);
    const word = card.word.toLowerCase();
    const syl = stressedSyllables(card.word, card.ipa);
    const { listening, attempt, start, stop, recordingSince } = useAttempt(word, (level) => recordSpeak(card.id, level));
    const phrase = word.includes(' ');

    return (
        <Panel icon={<Mic className="w-4 h-4" />} title={word}>
            <p data-testid="syllables" className="font-mono text-2xl text-ink tracking-wide">
                {phrase ? word : syl.text}
            </p>
            {phrase && <p className="text-sm text-muted">{card.translationHint}</p>}
            {!syl.fromIpa && card.ipa && <p className="font-mono text-sm text-muted">/{card.ipa}/</p>}
            <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => void sayModel(word, 'slow')} className="h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                    <Volume2 className="w-4 h-4" /> Mẫu chậm
                </button>
                <button onClick={() => void sayModel(word)} className="h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                    <Volume2 className="w-4 h-4" /> Mẫu thường
                </button>
            </div>
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingSince={recordingSince} label={attempt ? 'Nói lại' : 'Nói'} />
            {attempt && <AttemptResult attempt={attempt} target={word} ipa={card.ipa} onRetry={() => void start()} onChips={onChips} />}
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
    const { listening, attempt, start, stop, recordingSince } = useAttempt(phrase, (level) => level === 'clear' && recordSpeak(card.id, level));
    // Stress per syllable across the phrase: the target word from its IPA, others stressed on the first syllable.
    const flags = useMemo(
        () =>
            phrase.split(/\s+/).flatMap((w) => {
                if (w === word && card.ipa) {
                    const { count, stress } = ipaSyllables(card.ipa);
                    return Array.from({ length: count }, (_, i) => i === stress);
                }
                const n = Math.max(1, spellingSyllables(w).length);
                return Array.from({ length: n }, (_, i) => i === 0 && w.length > 3);
            }),
        [phrase, word, card.ipa],
    );

    return (
        <Panel icon={<Lightbulb className="w-4 h-4" />} title="Mẹo">
            <p className="text-ink">{tipFor(card.word, card.ipa, stressedPart)}</p>
            <div className="mt-5 rounded-xl bg-surface-2 p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Nói trong cụm</p>
                <p className="mt-1 text-xl text-ink">{phrase}</p>
                <button onClick={() => void sayModel(phrase)} className="mt-3 h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                    <Play className="w-4 h-4" /> Nghe mẫu
                </button>
            </div>
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingSince={recordingSince} label={attempt ? 'Nói lại' : 'Nói cả cụm'} />
            {attempt && <AttemptResult attempt={attempt} target={phrase} onRetry={() => void start()} />}
            {attempt && attempt.pitch.length > 0 && <PitchTrace pitch={attempt.pitch} flags={flags} text={phrase} />}
            <div className="mt-4 flex justify-end">
                <button onClick={onDone} className="h-10 px-4 rounded-xl bg-accent text-on-accent font-bold">
                    {attempt ? 'Tiếp' : 'Bỏ qua'}
                </button>
            </div>
        </Panel>
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
    const { listening, attempt, start, stop, recordingSince } = useAttempt(phrase, (level) => level === 'clear' && recordSpeak(card.id, level), true);
    const situation = card.situation!;
    return (
        <Panel icon={<Lightbulb className="w-4 h-4" />} title="Tình huống">
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
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingSince={recordingSince} label={attempt ? 'Nói lại' : 'Nói cả câu'} />
            {attempt && <AttemptResult attempt={attempt} target={phrase} sentence />}
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
    const { listening, attempt, start, stop, recordingSince } = useAttempt(model);
    if (!open)
        return (
            <button onClick={() => setOpen(true)} className="mt-3 text-sm text-ink underline">
                Nói theo câu mẫu
            </button>
        );
    return (
        <div className="mt-4 border-t border-line pt-4">
            <p className="text-sm text-muted">Đọc to câu mẫu, app đánh dấu từng từ máy nghe được.</p>
            <MicButton listening={listening} onStart={() => void start()} onStop={stop} recordingSince={recordingSince} label={attempt ? 'Nói lại câu mẫu' : 'Nói câu mẫu'} />
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

/** Held this long, letting go ends the recording (push to talk); a shorter press is a tap. */
const HOLD_MS = 350;

/**
 * Two ways to talk: hold the button while speaking and let go when done, or
 * tap once, speak, and either pause or tap again. Keyboard: Enter or Space toggles.
 */
function MicButton({
    listening,
    onStart,
    onStop,
    recordingSince,
    label,
}: {
    listening: boolean;
    onStart: () => void;
    onStop: () => void;
    recordingSince: React.RefObject<number | null>;
    label: string;
}) {
    const pressed = useRef<number | null>(null);
    const [holding, setHolding] = useState(false);
    const release = () => {
        const at = pressed.current;
        pressed.current = null;
        setHolding(false);
        // Letting go stops only a hold the microphone heard: a release while it was still
        // opening (or the browser asked for permission) leaves it listening, like a tap.
        const since = recordingSince.current;
        if (at !== null && since !== null && performance.now() - at >= HOLD_MS && performance.now() - since >= HOLD_MS) onStop();
    };
    return (
        <>
            <button
                type="button"
                onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    if (listening) return onStop();
                    pressed.current = performance.now();
                    setHolding(true);
                    onStart();
                }}
                onPointerUp={release}
                onPointerCancel={release}
                onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    if (listening) onStop();
                    else onStart();
                }}
                onContextMenu={(e) => e.preventDefault()}
                className={`mt-5 w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors select-none touch-none ${listening ? 'bg-accent text-on-accent' : 'border border-line-strong bg-surface-2 text-ink hover:bg-surface-3'}`}
            >
                {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {listening ? (holding ? 'Đang nghe… thả ra khi nói xong' : 'Đang nghe… bấm để dừng') : label}
            </button>
            <p className="mt-1.5 text-center text-xs text-muted">{listening && !holding ? 'Nói xong thì dừng 1–2 giây, app tự kết thúc.' : 'Giữ nút trong lúc nói, thả ra là xong. Hoặc bấm một lần rồi nói.'}</p>
        </>
    );
}

/**
 * What the machine heard. A phrase shows each of its words marked (level 1);
 * a word or phrase also gets up to two sounds that may be off (level 2).
 * `sentence`: the learner said their own sentence, so only the phrase is shown.
 */
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
    const tone = attempt.level === 'clear' ? 'text-accent border-accent/50' : attempt.level === 'close' ? 'text-warning border-warning/50' : 'text-danger border-danger/50';
    if (attempt.error === 'unsupported') return <p className="mt-3 text-sm text-warning">Trình duyệt này không nhận giọng nói.</p>;
    if (attempt.error === 'not-allowed') return <p className="mt-3 text-sm text-warning">Chưa có quyền dùng micro. Bật micro trong cài đặt trình duyệt rồi thử lại.</p>;
    return (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} data-testid="attempt" className="mt-4 rounded-xl border border-line p-4">
            <div className="flex items-center gap-3">
                {/* With the sound chips, the chips say how clear it was; the recognizer's label would contradict them. */}
                {!feedback?.scored && <span className={`rounded-lg border px-2 py-0.5 text-sm font-semibold ${tone}`}>{LEVEL_LABEL[attempt.level]}</span>}
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
                    <button onClick={() => void new Audio(attempt.audioUrl!).play()} className="h-9 px-3 rounded-lg border border-line text-ink flex items-center gap-1.5 hover:border-line-strong">
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

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-line bg-surface p-5">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-accent">
                {icon} {title}
            </p>
            <div className="mt-3">{children}</div>
        </motion.section>
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
