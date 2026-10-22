'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Ear, Mic, Play, Volume2, X } from 'lucide-react';
import type { Attempt } from '../../lib/pronunciation/speech';
import { sayModel } from '../../lib/pronunciation/speech';
import { alignAttempt, type Alignment } from '../../lib/pronunciation/align';
import { soundFeedback, swapsOf, type SoundFeedback } from '../../lib/pronunciation/feedback';
import { ipaOf, isVowel, loadDict, phonesOf } from '../../lib/pronunciation/phones';
import { SOUND_LABEL, SOUND_TIP, type SoundIssue } from '../../lib/pronunciation/sounds';
import { wordChips, type Chip } from '../../lib/pronunciation/chips';
import { downloadPack, packAvailable, packMegabytes, packReady, pronBeta, scoreRecording, warmUp, type WordScores } from '../../lib/pronunciation/model/client';
import { analyze } from '../../lib/pronunciation/prosody';
import { prosodyNotes, type ProsodyMeasures, type ProsodyNote } from '../../lib/pronunciation/level3';
import { modelVoiceSamples } from '../../lib/pronunciation/modelVoice';
import { logProsody } from '../../lib/pronunciation/prosodyLog';
import { exposures } from '../../lib/pronunciation/soundLog';
import { spellingSyllables } from '../../lib/pronunciation/syllables';
import type { ErrorKind } from '../../lib/pronunciation/pairs';
import { useLexicaStore } from '../../store/lexicaStore';
import Mouth from './Mouth';
import { mouthFor } from '../../lib/pronunciation/mouth';

export interface AttemptFeedback {
    sound: SoundFeedback;
    /** Per word, the model's phone scores, when the scoring pack is downloaded. */
    scored: WordScores[] | null;
    /** Level 3 remarks and measures: testers only until the measures pass the Vietnamese-voice check. */
    prosody: ProsodyNote[];
    measures: ProsodyMeasures | null;
}

/**
 * Sounds that may be off after an attempt (levels 1–3 of
 * docs/LEXICA_PRONUNCIATION_DESIGN.md): every phone scored on the device
 * when the learner downloaded the scoring pack, else guessed from the word
 * the recognizer heard instead. `heard`: the closest piece of what was
 * heard, for one word.
 */
export function useSoundFeedback(attempt: Attempt | null, target: string, opts: { ipa?: string; heard?: string; alignment?: Alignment | null }) {
    const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);
    useEffect(() => {
        if (!attempt) return;
        let live = true;
        void (async () => {
            const dict = await loadDict();
            const words = target.split(/\s+/).filter(Boolean);
            const single = words.length === 1;
            const withPhones = words.map((word) => ({ word: word.replace(/[^A-Za-z'-]/g, ''), phones: phonesOf(dict, word, single ? opts.ipa : undefined) }));
            const known = withPhones.every((w) => w.phones) ? withPhones.map((w) => ({ word: w.word, phones: w.phones! })) : null;
            const recorded = Boolean(attempt.samples) && Boolean(attempt.voiced);
            let scored: WordScores[] | null = null;
            if (recorded && known && (await packReady())) scored = await scoreRecording(attempt.samples!, known).catch(() => null);
            const swaps = opts.alignment ? swapsOf(opts.alignment) : single && opts.heard ? [{ word: target, heard: opts.heard, ipa: opts.ipa }] : [];
            const sound = soundFeedback({ dict, scored, swaps });
            let prosody: ProsodyNote[] = [];
            let measures: ProsodyMeasures | null = null;
            if (pronBeta() && recorded && known) {
                // The model voice only matters for phrases (pitch line, speed).
                const modelSamples = single ? null : await modelVoiceSamples(target);
                const r = prosodyNotes({ target, words: known, mine: analyze(attempt.samples!), model: modelSamples ? analyze(modelSamples) : null, scored });
                prosody = r.notes;
                measures = r.measures;
                logProsody({ at: Date.now(), target, measures: r.measures, notes: r.notes.map((n) => n.kind) });
            }
            // Level 4: the sound groups this attempt tried and missed, for "Âm hay sai" and the class report.
            if (attempt.alternatives.length > 0 || attempt.voiced) {
                const tried = new Set<ErrorKind>(withPhones.flatMap((w) => (w.phones ? [...exposures(w.phones, w.word)] : [])));
                const missed = new Set<ErrorKind>(sound.issues.flatMap((x) => (x.kind ? [x.kind] : [])));
                if (prosody.some((n) => n.kind === 'final')) missed.add('final_consonant');
                useLexicaStore.getState().recordSounds([...tried], [...missed]);
            }
            if (live) setFeedback({ sound, scored, prosody, measures });
        })();
        return () => {
            live = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once per attempt
    }, [attempt]);
    return feedback;
}

/** Level 1 for a phrase or sentence: null for one word. */
export const alignmentFor = (attempt: Attempt | null, target: string) => (attempt && target.trim().includes(' ') && attempt.alternatives.length > 0 ? alignAttempt(target, attempt.alternatives) : null);

const LEVEL_STYLE = {
    ok: { box: 'border-accent/45 bg-accent/10', badge: 'bg-accent text-on-accent', mark: '✓', label: 'rõ' },
    warn: { box: 'border-warning/70 bg-warning/10', badge: 'bg-warning text-on-status', mark: '~', label: 'có thể chưa rõ' },
    bad: { box: 'border-danger bg-danger/15', badge: 'bg-danger text-on-status', mark: '!', label: 'chưa đúng' },
} as const;

/**
 * What the learner sees after an attempt. With the scoring pack: each word
 * as a row of sound chips, coloured; tapping an off chip opens a sheet
 * that shows what it sounded like, what it should be, the mouth, and
 * ways to compare by ear. Without it: the sounds guessed from what was
 * heard, and the offer to download the pack.
 */
export default function SoundTips({ feedback, audioUrl, onRetry }: { feedback: AttemptFeedback | null; audioUrl?: string | null; onRetry?: () => void }) {
    const [open, setOpen] = useState<{ word: number; chip: number } | null>(null);
    const rows = useMemo(() => feedback?.scored?.map((w) => ({ word: w.word, chips: wordChips(w.word, w.phones, w.scores) })) ?? null, [feedback]);
    if (!feedback) return null;
    const { sound, prosody, measures } = feedback;
    const openChip = open && rows ? rows[open.word]?.chips[open.chip] : null;
    const anyOff = rows?.some((r) => r.chips.some((c) => c.level !== 'ok'));

    return (
        <div className="mt-3 space-y-3">
            {rows ? (
                <div data-testid="sound-chips" className="space-y-3">
                    {rows.map((r, wi) => (
                        <div key={wi}>
                            {rows.length > 1 && <p className="mb-1 font-mono text-xs text-muted">{r.word}</p>}
                            {/* One word, one line: the chips scroll sideways on a narrow phone instead of wrapping. */}
                            <div className="-mx-1 flex flex-nowrap gap-1 overflow-x-auto px-1 pt-2 pb-1">
                                {r.chips.map((c, ci) => (
                                    <ChipButton key={ci} chip={c} onOpen={c.level === 'ok' ? undefined : () => setOpen({ word: wi, chip: ci })} />
                                ))}
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-muted">{anyOff ? 'Bấm ô vàng hoặc đỏ để xem cách sửa.' : 'Các âm đều rõ.'}</p>
                </div>
            ) : (
                <>
                    {sound.issues.map((x, i) => (
                        <IssueCard key={i} issue={x} />
                    ))}
                    {sound.issues.length > 0 && <p className="text-xs text-muted">Máy chỉ đoán qua từ nó nghe được. Nghe lại giọng bạn cạnh giọng mẫu để tự kiểm tra.</p>}
                    <PackOffer />
                </>
            )}

            {measures?.stress && measures.stress.said !== null && rows?.length === 1 && <StressDots word={rows[0].word} phones={feedback.scored![0].phones} expected={measures.stress.expected} said={measures.stress.said} />}
            {measures?.rate !== undefined && measures.modelRate !== undefined && <PaceBar rate={measures.rate} model={measures.modelRate} />}
            {prosody.filter((n) => n.kind !== 'stress' || !rows).length > 0 && (
                <div data-testid="prosody" className="rounded-xl border border-dashed border-line-strong p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-subtle">Nhấn âm, ngữ điệu, tốc độ (thử nghiệm)</p>
                    {prosody.map((n, i) => (
                        <p key={i} className="text-sm text-ink">
                            {n.text}
                        </p>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {openChip?.issue && (
                    <SoundSheet
                        key={`${open!.word}-${open!.chip}`}
                        chip={openChip}
                        issue={openChip.issue}
                        audioUrl={audioUrl}
                        onClose={() => setOpen(null)}
                        onRetry={
                            onRetry &&
                            (() => {
                                setOpen(null);
                                onRetry();
                            })
                        }
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ChipButton({ chip, onOpen }: { chip: Chip; onOpen?: () => void }) {
    const s = LEVEL_STYLE[chip.level];
    return (
        <button
            type="button"
            onClick={onOpen}
            disabled={!onOpen}
            aria-label={`Âm /${chip.ipa}/${chip.letters ? `, chữ “${chip.letters}”` : ''}: ${s.label}`}
            className={`relative shrink-0 min-w-9 rounded-lg border-[1.5px] px-1.5 pt-1.5 pb-1 flex flex-col items-center gap-0.5 ${s.box} ${onOpen ? 'cursor-pointer hover:-translate-y-px transition-transform' : 'cursor-default'}`}
        >
            <span className={`absolute -top-1.5 -right-1 w-4 h-4 rounded-full text-[10px] font-bold grid place-items-center ${s.badge}`} aria-hidden>
                {s.mark}
            </span>
            <span className="font-mono text-lg leading-none text-ink">
                {chip.ipa}
            </span>
            <span className="font-mono text-[10px] text-muted min-h-[13px] whitespace-nowrap">{chip.letters}</span>
        </button>
    );
}

/** The detail of one sound: heard as / should be, the mouth, compare by ear, try again. */
function SoundSheet({ chip, issue, audioUrl, onClose, onRetry }: { chip: Chip; issue: SoundIssue; audioUrl?: string | null; onClose: () => void; onRetry?: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    const swapped = issue.heardAs !== null && issue.heardAs.replace(/\d/, '') !== issue.phone.replace(/\d/, '');
    const dropped = issue.heardAs === null;
    const pairWord = issue.pair ? issue.pair.find((w) => w !== issue.word.toLowerCase()) ?? issue.pair[1] : null;
    const tip = issue.kind ? SOUND_TIP[issue.kind] : null;
    return (
        <>
            <motion.button type="button" aria-label="Đóng" onClick={onClose} className="fixed inset-0 z-40 bg-bg/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="sound-sheet-title"
                data-testid="sound-sheet"
                className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border-t border-line-strong bg-surface px-4 pt-3 space-y-3 max-h-[88vh] overflow-y-auto"
                style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))' }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            >
                <span className="mx-auto block h-1 w-9 rounded-full bg-line-strong" aria-hidden />
                <div className="flex items-center justify-between gap-3">
                    <p id="sound-sheet-title" className="text-base font-semibold text-ink">
                        Âm /{chip.ipa}/{chip.letters ? ` (${chip.letters})` : ''} trong “{issue.word.toLowerCase()}”
                    </p>
                    <button type="button" onClick={onClose} className="w-9 h-9 rounded-lg border border-line text-muted grid place-items-center hover:text-ink" aria-label="Đóng">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {issue.kind && <p className="text-xs font-semibold text-subtle -mt-2">{SOUND_LABEL[issue.kind]}</p>}

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                    <div className={`rounded-xl p-2 ${swapped || dropped ? 'border-[1.5px] border-danger bg-danger/10' : 'border-[1.5px] border-warning bg-warning/10'}`}>
                        <p className="text-[11px] text-muted">{swapped ? 'bạn nói giống' : 'bạn'}</p>
                        <p className="font-mono text-2xl leading-tight text-ink">{swapped ? `/${ipaOf(issue.heardAs!)}/` : dropped ? '∅' : `/${chip.ipa}/~`}</p>
                        <p className="text-[11px] text-muted">{swapped ? (pairWord ?? '') : dropped ? 'có thể bỏ mất âm' : 'có thể chưa rõ'}</p>
                    </div>
                    <span className="text-muted" aria-hidden>
                        →
                    </span>
                    <div className="rounded-xl p-2 border-[1.5px] border-accent/60 bg-accent/10">
                        <p className="text-[11px] text-muted">đúng là</p>
                        <p className="font-mono text-2xl leading-tight text-ink">
                            /{chip.ipa}/
                        </p>
                        <p className="text-[11px] text-muted">{issue.word.toLowerCase()}</p>
                    </div>
                </div>

                <MouthHint phone={issue.phone} tip={tip} />

                <div className="flex flex-wrap gap-2">
                    <ListenButton label={issue.word.toLowerCase()} onPlay={() => void sayModel(issue.word.toLowerCase(), 'slow')} icon={<Volume2 className="w-3.5 h-3.5" />} />
                    {swapped && pairWord && <ListenButton label={pairWord} onPlay={() => void sayModel(pairWord, 'slow')} icon={<Ear className="w-3.5 h-3.5" />} />}
                    {audioUrl && <ListenButton label="Giọng bạn" onPlay={() => void new Audio(audioUrl).play()} icon={<Play className="w-3.5 h-3.5" />} />}
                </div>
                {onRetry && (
                    <button type="button" onClick={onRetry} className="w-full h-12 rounded-xl bg-accent text-on-accent font-bold flex items-center justify-center gap-2">
                        <Mic className="w-4 h-4" /> Thử lại từ này
                    </button>
                )}
            </motion.div>
        </>
    );
}

/** The mouth for the right sound, its one-line pose, whether the throat buzzes, and the error group's tip. */
function MouthHint({ phone, tip }: { phone: string; tip: string | null }) {
    const m = mouthFor(phone);
    return (
        <div className="grid grid-cols-[112px_1fr] gap-3 items-start">
            <Mouth phone={phone} className="w-28 h-auto" />
            <div className="space-y-1 text-sm">
                {m && <p className="text-ink">{m.hint}</p>}
                {m?.voiceHint && <p className="text-xs text-muted">{m.voiceHint}</p>}
                {tip && <p className="text-xs text-ink-2">{tip}</p>}
            </div>
        </div>
    );
}

function ListenButton({ label, onPlay, icon }: { label: string; onPlay: () => void; icon: React.ReactNode }) {
    return (
        <button type="button" onClick={onPlay} className="h-10 px-3 rounded-lg border border-line text-sm text-ink flex items-center gap-1.5 hover:border-line-strong">
            {icon} {label}
        </button>
    );
}

/** Without the scoring pack: one sound guessed from the word heard instead. */
function IssueCard({ issue: x }: { issue: SoundIssue }) {
    return (
        <div data-testid="sound-issue" className="rounded-xl bg-surface-2 p-3">
            {x.kind && <p className="text-xs font-semibold text-subtle">{SOUND_LABEL[x.kind]}</p>}
            <p className="text-sm text-ink">{x.text}</p>
            {x.tip && <p className="mt-1 text-sm text-ink-2">{x.tip}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
                <ListenButton label={x.word} onPlay={() => void sayModel(x.word, 'slow')} icon={<Volume2 className="w-3.5 h-3.5" />} />
                {x.pair && (
                    <ListenButton
                        label={`${x.pair[0]} / ${x.pair[1]}`}
                        onPlay={async () => {
                            await sayModel(x.pair![0], 'slow');
                            await sayModel(x.pair![1], 'slow');
                        }}
                        icon={<Ear className="w-3.5 h-3.5" />}
                    />
                )}
            </div>
        </div>
    );
}

/** Stress as dots, the model's row over the learner's: a big dot is the stressed syllable. */
function StressDots({ word, phones, expected, said }: { word: string; phones: readonly string[]; expected: number; said: number }) {
    const count = phones.filter(isVowel).length;
    const parts = spellingSyllables(word);
    const labels = parts.length === count ? parts : Array.from({ length: count }, (_, i) => String(i + 1));
    const row = (who: string, stressed: number, off: boolean) => (
        <>
            <span className="text-xs text-muted">{who}</span>
            {labels.map((l, i) => (
                <span key={i} className="flex flex-col items-center gap-1">
                    <span className={`rounded-full ${i === stressed ? `w-5 h-5 ${off ? 'bg-danger' : 'bg-accent'}` : 'w-2.5 h-2.5 bg-ink-2'}`} />
                    <span className={`font-mono text-xs ${i === stressed ? (off ? 'text-danger font-bold' : 'text-ink font-bold') : 'text-muted'}`}>{i === stressed ? l.toUpperCase() : l.toLowerCase()}</span>
                </span>
            ))}
        </>
    );
    return (
        <div data-testid="stress-dots" className="rounded-xl bg-surface-2 p-3">
            <p className="text-xs font-semibold text-subtle">Trọng âm (thử nghiệm)</p>
            <div className="mt-2 grid items-end gap-x-2 gap-y-3" style={{ gridTemplateColumns: `40px repeat(${labels.length}, minmax(0, 1fr))` }}>
                {row('Mẫu', expected, false)}
                {row('Bạn', said, said !== expected)}
            </div>
        </div>
    );
}

/** Syllables per second against the model voice, on a slow · right · fast bar (testers, phrases). */
function PaceBar({ rate, model }: { rate: number; model: number }) {
    // 0.6× the model at the left edge of "right", 1.4× at its right edge.
    const at = (r: number) => Math.min(100, Math.max(0, ((r / model - 0.2) / 1.6) * 100));
    return (
        <div data-testid="pace-bar" className="rounded-xl bg-surface-2 p-3">
            <p className="text-xs font-semibold text-subtle">Tốc độ (thử nghiệm)</p>
            <div className="relative mt-3 h-2 rounded-full bg-surface-3">
                <div className="absolute inset-y-0 rounded-full bg-accent/30" style={{ left: `${at(model * 0.6)}%`, right: `${100 - at(model * 1.4)}%` }} />
                <span className="absolute -top-1.5 h-5 w-1 rounded bg-ink-2" style={{ left: `${at(model)}%` }} title="Giọng mẫu" />
                <span className="absolute -top-1.5 h-5 w-1 rounded bg-accent" style={{ left: `${at(rate)}%` }} title="Bạn" />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-subtle">
                <span>chậm</span>
                <span>vừa</span>
                <span>nhanh</span>
            </div>
            <p className="mt-1 text-xs text-muted">Vạch xanh là bạn, vạch xám là giọng mẫu.</p>
        </div>
    );
}

/** Download the scoring pack, only when the learner taps: it is what shows each sound. */
export function PackOffer() {
    const [state, setState] = useState<'hidden' | 'offer' | 'loading' | 'ready' | 'error'>('hidden');
    const [share, setShare] = useState(0);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!packAvailable()) return;
        let live = true;
        void packReady().then((ok) => {
            if (!live) return;
            setState(ok ? 'ready' : 'offer');
            if (ok) warmUp();
        });
        return () => {
            live = false;
        };
    }, []);
    if (state === 'hidden' || state === 'ready') return null;
    return (
        <div data-testid="pron-pack" className="rounded-xl border border-dashed border-line-strong p-3 text-sm">
            <p className="text-ink font-medium">Xem từng âm bạn nói</p>
            <p className="mt-1 text-xs text-muted">Tô màu từng âm trong từ, chỉ âm nào chưa rõ và cách sửa, kể cả khi máy nghe ra đúng từ. Tải một lần khoảng {packMegabytes()}MB, nên dùng Wi-Fi. Âm thanh không rời máy bạn.</p>
            {state === 'loading' ? (
                <div className="mt-2 h-2 rounded-full bg-line overflow-hidden">
                    <div className="h-full bg-accent transition-all" style={{ width: `${Math.round(share * 100)}%` }} />
                </div>
            ) : (
                <button
                    onClick={async () => {
                        setState('loading');
                        setError('');
                        try {
                            await downloadPack(setShare);
                            setState('ready');
                            warmUp();
                        } catch (e) {
                            setError(e instanceof Error ? e.message : 'Không tải được.');
                            setState('error');
                        }
                    }}
                    className="mt-2 h-9 px-3 rounded-lg bg-accent text-on-accent font-semibold flex items-center gap-1.5"
                >
                    <Download className="w-4 h-4" /> {state === 'error' ? 'Thử tải lại' : `Tải gói chấm (${packMegabytes()}MB)`}
                </button>
            )}
            {error && <p className="mt-2 text-xs text-warning">{error}</p>}
        </div>
    );
}
