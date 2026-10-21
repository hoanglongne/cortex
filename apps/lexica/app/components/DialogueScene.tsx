'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, Mic, Square, Volume2, X } from 'lucide-react';
import { guessOptions, guessTurns, lineMatch, speakersOf, type Turn } from '../lib/content/dialogue';
import { NATURAL_VOICES, speakNatural } from '../lib/audio/AudioService';
import { englishVoices, listenOnce, recognitionCtor, speakWith } from '../lib/pronunciation/speech';
import { CORTEX_API_URL } from '../lib/cortexConfig';
import { alignAttempt } from '../lib/pronunciation/align';
import AlignedLine from './pron/AlignedLine';

/** Each speaker keeps one voice through the scene. */
async function sayAs(text: string, speaker: number, slow = false): Promise<void> {
    if (await speakNatural(text, { slow, voice: NATURAL_VOICES[speaker % NATURAL_VOICES.length], wait: true })) return;
    const voices = englishVoices(2);
    // With one system voice, the second speaker gets a higher pitch so the two still sound apart.
    await speakWith(text, voices[speaker % Math.max(1, voices.length)] ?? null, slow ? 0.75 : 0.9, voices.length < 2 && speaker % 2 ? 1.2 : 1);
}

const LEVEL = { clear: 'Rõ', close: 'Gần đúng', unclear: 'Chưa rõ' } as const;

/**
 * A dialogue as a scene (lib/content/dialogue.ts). "Từng lượt": the turns
 * appear one by one, each read in its speaker's voice, with a few "what
 * will they say?" guesses on the way. "Đóng vai": the learner takes one
 * character and says their lines from the Vietnamese meaning; the app
 * plays the other one. Words stay tappable (`renderLine`).
 */
export default function DialogueScene({
    turns,
    mode,
    renderLine,
    onComplete,
    onSaid,
}: {
    turns: Turn[];
    mode: 'scene' | 'roleplay';
    renderLine: (line: string) => React.ReactNode;
    onComplete: () => void;
    /** A line the learner said clearly in role-play (to count the words in it as said). */
    onSaid: (line: string) => void;
}) {
    const speakers = useMemo(() => speakersOf(turns), [turns]);
    const voiceOf = (speaker: string) => Math.max(0, speakers.indexOf(speaker));
    const [role, setRole] = useState<string | null>(null);
    const [shown, setShown] = useState(1);
    const [autoplay, setAutoplay] = useState(true);
    const [meaningOpen, setMeaningOpen] = useState<Set<number>>(new Set());
    const [seed] = useState(() => Math.floor(Math.random() * 1000));
    const guesses = useMemo(() => (mode === 'scene' ? guessTurns(turns).filter((i) => guessOptions(turns, i, seed)) : []), [mode, turns, seed]);
    const [guessed, setGuessed] = useState<Record<number, string>>({});
    const [said, setSaid] = useState<Record<number, { heard: string; level: keyof typeof LEVEL } | 'skipped'>>({});
    const endRef = useRef<HTMLDivElement>(null);
    const canListen = typeof window !== 'undefined' && (Boolean(recognitionCtor()) || Boolean(CORTEX_API_URL));

    const ready = mode === 'scene' || role !== null;
    const last = turns[shown - 1];
    const mine = (i: number) => mode === 'roleplay' && turns[i].speaker === role;
    // The learner's own turn waits for them; the rest plays as it appears.
    const waitingForMe = ready && mine(shown - 1) && !said[shown - 1];
    const done = shown >= turns.length && !waitingForMe;
    const next = shown < turns.length ? shown : null;
    const mustGuess = next !== null && guesses.includes(next) && !guessed[next];

    useEffect(() => {
        if (!ready || !last || !autoplay || mine(shown - 1)) return;
        void sayAs(last.line, voiceOf(last.speaker));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- play each turn once, when it appears
    }, [shown, ready]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        if (done) onComplete();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once per step
    }, [shown, done, said]);

    if (!ready) {
        return (
            <div className="rounded-2xl border border-line bg-surface p-5 space-y-3">
                <p className="text-ink font-semibold">Bạn muốn đóng vai ai?</p>
                <p className="text-sm text-muted">App đọc câu của người kia. Tới lượt bạn, app chỉ hiện ý tiếng Việt: bạn nói câu tiếng Anh, rồi xem câu gốc.</p>
                <div className="flex flex-wrap gap-2">
                    {speakers.map((s) => (
                        <button key={s} onClick={() => setRole(s)} className="h-11 px-5 rounded-xl border border-line-strong bg-bg text-ink font-medium hover:border-accent">
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} className="accent-current" />
                Tự đọc từng câu
            </label>
            <AnimatePresence initial={false}>
                {turns.slice(0, shown).map((t, i) => {
                    const left = voiceOf(t.speaker) === 0;
                    const hidden = mine(i) && !said[i];
                    const result = said[i];
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-2xl border px-4 py-3 ${left ? 'border-line bg-surface mr-8' : 'border-accent/30 bg-accent/5 ml-8'}`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">
                                    {t.speaker}
                                    {mine(i) ? ' (bạn)' : ''}
                                </p>
                                {!hidden && (
                                    <button onClick={() => void sayAs(t.line, voiceOf(t.speaker))} className="p-1 text-muted hover:text-ink" aria-label="Nghe câu này">
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {hidden ? (
                                <MyTurn
                                    meaning={t.meaning}
                                    line={t.line}
                                    canListen={canListen}
                                    onResult={(r) => {
                                        setSaid((s) => ({ ...s, [i]: r }));
                                        if (r !== 'skipped' && r.level === 'clear') onSaid(t.line);
                                    }}
                                />
                            ) : (
                                <>
                                    <button onClick={() => setMeaningOpen((s) => new Set(s.has(i) ? [...s].filter((x) => x !== i) : [...s, i]))} className="block text-left w-full" aria-label="Bấm để xem nghĩa">
                                        <span className="text-lg leading-relaxed text-ink-2">{renderLine(t.line)}</span>
                                    </button>
                                    {meaningOpen.has(i) && t.meaning && <p className="mt-1.5 text-sm text-muted">{t.meaning}</p>}
                                    {result && result !== 'skipped' && (
                                        <>
                                            <p className={`mt-2 text-sm ${result.level === 'clear' ? 'text-accent' : 'text-muted'}`}>
                                                {LEVEL[result.level]} · máy nghe: “{result.heard || '…'}”
                                            </p>
                                            {result.level !== 'clear' && <AlignedLine alignment={alignAttempt(t.line, [{ transcript: result.heard, confidence: 0 }])} />}
                                        </>
                                    )}
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {mustGuess && next !== null && <Guess turns={turns} index={next} seed={seed} onPicked={(pick) => setGuessed((g) => ({ ...g, [next]: pick }))} />}

            {next !== null && !mustGuess && !waitingForMe && (
                <button onClick={() => setShown((n) => n + 1)} className="w-full h-12 rounded-xl border border-line-strong bg-surface text-ink font-semibold hover:border-accent">
                    {guessed[next] ? 'Xem câu tiếp' : 'Tiếp'} ({shown}/{turns.length})
                </button>
            )}
            {mode === 'scene' && <p className="text-center text-xs text-subtle">Bấm vào một câu để xem nghĩa tiếng Việt.</p>}
            <div ref={endRef} />
        </div>
    );
}

function Guess({ turns, index, seed, onPicked }: { turns: Turn[]; index: number; seed: number; onPicked: (pick: string) => void }) {
    const g = guessOptions(turns, index, seed)!;
    const [pick, setPick] = useState<string | null>(null);
    return (
        <div className="rounded-2xl border border-dashed border-accent/40 p-4 space-y-2">
            <p className="text-sm text-ink">
                Đoán xem <b>{turns[index].speaker}</b> sẽ nói ý nào?
            </p>
            {g.options.map((o) => {
                const right = o === g.answer;
                const state = pick === null ? '' : right ? 'border-accent bg-accent/10' : pick === o ? 'border-danger/50 bg-danger/5' : 'opacity-60';
                return (
                    <button key={o} disabled={pick !== null} onClick={() => setPick(o)} className={`w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-left text-sm text-ink ${state}`}>
                        {pick !== null && right && <Check className="inline w-4 h-4 mr-1 text-accent" />}
                        {pick === o && !right && <X className="inline w-4 h-4 mr-1 text-danger" />}
                        {o}
                    </button>
                );
            })}
            {pick !== null && (
                <button onClick={() => onPicked(pick)} className="w-full h-11 rounded-xl bg-accent text-on-accent font-bold">
                    {pick === g.answer ? 'Đúng rồi! Nghe câu đó' : 'Nghe câu thật'}
                </button>
            )}
        </div>
    );
}

function MyTurn({ meaning, line, canListen, onResult }: { meaning: string; line: string; canListen: boolean; onResult: (r: { heard: string; level: 'clear' | 'close' | 'unclear' } | 'skipped') => void }) {
    const [listening, setListening] = useState(false);
    const stop = useRef<AbortController | null>(null);
    const [error, setError] = useState('');

    const speak = async () => {
        setError('');
        const ctrl = new AbortController();
        stop.current = ctrl;
        setListening(true);
        const attempt = await listenOnce({ target: line, sentence: true, signal: ctrl.signal });
        setListening(false);
        const heard = attempt.alternatives[0]?.transcript ?? '';
        if (!heard) {
            setError(attempt.error === 'not-allowed' ? 'Chưa có quyền dùng micro.' : 'Máy chưa nghe thấy. Nói to hơn một chút, hoặc xem câu.');
            return;
        }
        // The best of the alternatives the recognizer offers.
        const best = attempt.alternatives.map((a) => ({ heard: a.transcript, ...lineMatch(a.transcript, line) })).sort((a, b) => ['clear', 'close', 'unclear'].indexOf(a.level) - ['clear', 'close', 'unclear'].indexOf(b.level))[0];
        onResult({ heard: best.heard, level: best.level });
    };

    return (
        <div className="mt-1 space-y-2">
            <p className="text-ink">{meaning || '…'}</p>
            <p className="text-xs text-muted">Nói câu này bằng tiếng Anh.</p>
            <div className="flex flex-wrap gap-2">
                {canListen &&
                    (listening ? (
                        <button onClick={() => stop.current?.abort()} className="h-10 px-4 rounded-xl bg-danger text-bg font-semibold flex items-center gap-2">
                            <Square className="w-4 h-4" /> Xong
                        </button>
                    ) : (
                        <button onClick={() => void speak()} className="h-10 px-4 rounded-xl bg-accent text-on-accent font-semibold flex items-center gap-2">
                            <Mic className="w-4 h-4" /> Nói
                        </button>
                    ))}
                <button onClick={() => onResult('skipped')} className="h-10 px-4 rounded-xl border border-line text-sm text-ink-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Xem câu
                </button>
            </div>
            {error && <p className="text-xs text-warning">{error}</p>}
        </div>
    );
}
