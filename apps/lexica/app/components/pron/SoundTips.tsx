'use client';

import { useEffect, useState } from 'react';
import { Download, Ear, Volume2 } from 'lucide-react';
import type { Attempt } from '../../lib/pronunciation/speech';
import { sayModel } from '../../lib/pronunciation/speech';
import { alignAttempt, type Alignment } from '../../lib/pronunciation/align';
import { soundFeedback, swapsOf, type SoundFeedback } from '../../lib/pronunciation/feedback';
import { loadDict, phonesOf } from '../../lib/pronunciation/phones';
import { SOUND_LABEL } from '../../lib/pronunciation/sounds';
import { downloadPack, packAvailable, packMegabytes, packReady, pronBeta, scoreRecording, warmUp, type WordScores } from '../../lib/pronunciation/model/client';
import { analyze } from '../../lib/pronunciation/prosody';
import { prosodyNotes, type ProsodyNote } from '../../lib/pronunciation/level3';
import { modelVoiceSamples } from '../../lib/pronunciation/modelVoice';
import { logProsody } from '../../lib/pronunciation/prosodyLog';
import { exposures } from '../../lib/pronunciation/soundLog';
import type { ErrorKind } from '../../lib/pronunciation/pairs';
import { useLexicaStore } from '../../store/lexicaStore';

export interface AttemptFeedback {
    sound: SoundFeedback;
    /** Level 3 remarks: testers only until the measures pass the Vietnamese-voice check. */
    prosody: ProsodyNote[];
}

/**
 * Sounds that may be off after an attempt (levels 1–2 of
 * docs/LEXICA_PRONUNCIATION_DESIGN.md): from the on-device model when its
 * pack is downloaded (beta flag), else from the word the recognizer heard
 * instead. `heard`: the closest piece of what was heard, for one word.
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
            const withPhones = words.map((word) => ({ word, phones: phonesOf(dict, word, single ? opts.ipa : undefined) }));
            const known = withPhones.every((w) => w.phones) ? withPhones.map((w) => ({ word: w.word, phones: w.phones! })) : null;
            const beta = pronBeta() && Boolean(attempt.samples) && Boolean(attempt.voiced);
            let scored: WordScores[] | null = null;
            if (beta && known) scored = await scoreRecording(attempt.samples!, known).catch(() => null);
            const swaps = opts.alignment ? swapsOf(opts.alignment) : single && opts.heard ? [{ word: target, heard: opts.heard, ipa: opts.ipa }] : [];
            const sound = soundFeedback({ dict, scored, swaps });
            let prosody: ProsodyNote[] = [];
            if (beta && known) {
                // The model voice only matters for phrases (pitch line, speed).
                const modelSamples = single ? null : await modelVoiceSamples(target);
                const r = prosodyNotes({ target, words: known, mine: analyze(attempt.samples!), model: modelSamples ? analyze(modelSamples) : null, scored });
                prosody = r.notes;
                logProsody({ at: Date.now(), target, measures: r.measures, notes: r.notes.map((n) => n.kind) });
            }
            // Level 4: the sound groups this attempt tried and missed, for "Âm hay sai" and the class report.
            if (attempt.alternatives.length > 0 || attempt.voiced) {
                const tried = new Set<ErrorKind>(withPhones.flatMap((w) => (w.phones ? [...exposures(w.phones)] : [])));
                const missed = new Set<ErrorKind>(sound.issues.flatMap((x) => (x.kind ? [x.kind] : [])));
                if (prosody.some((n) => n.kind === 'final')) missed.add('final_consonant');
                useLexicaStore.getState().recordSounds([...tried], [...missed]);
            }
            if (live) setFeedback({ sound, prosody });
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

export default function SoundTips({ feedback: both }: { feedback: AttemptFeedback | null }) {
    if (!both) return null;
    const feedback = both.sound;
    return (
        <div className="mt-3 space-y-3">
            {feedback.issues.map((x, i) => (
                <div key={i} data-testid="sound-issue" className="rounded-xl bg-surface-2 p-3">
                    {x.kind && <p className="text-xs font-semibold text-subtle">{SOUND_LABEL[x.kind]}</p>}
                    <p className="text-sm text-ink">{x.text}</p>
                    {x.tip && <p className="mt-1 text-sm text-ink-2">{x.tip}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                        <button onClick={() => void sayModel(x.word, 'slow')} className="h-9 px-3 rounded-lg border border-line text-sm text-ink flex items-center gap-1.5 hover:border-line-strong">
                            <Volume2 className="w-3.5 h-3.5" /> {x.word}
                        </button>
                        {x.pair && (
                            <button
                                onClick={async () => {
                                    await sayModel(x.pair![0], 'slow');
                                    await sayModel(x.pair![1], 'slow');
                                }}
                                className="h-9 px-3 rounded-lg border border-line text-sm text-ink flex items-center gap-1.5 hover:border-line-strong"
                            >
                                <Ear className="w-3.5 h-3.5" /> {x.pair[0]} / {x.pair[1]}
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {feedback.source === 'model' && feedback.issues.length === 0 && <p className="text-xs text-muted">Chấm từng âm trên máy: chưa thấy âm nào đáng lo.</p>}
            {feedback.issues.length > 0 && (
                <p className="text-xs text-muted">
                    Máy chỉ đoán{feedback.source === 'model' ? ' (chấm từng âm trên máy, đang thử nghiệm)' : ' qua từ nó nghe được'}. Nghe lại giọng bạn cạnh giọng mẫu để tự kiểm tra.
                </p>
            )}
            {both.prosody.length > 0 && (
                <div data-testid="prosody" className="rounded-xl border border-dashed border-line-strong p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-subtle">Nhấn âm, ngữ điệu, tốc độ (thử nghiệm)</p>
                    {both.prosody.map((n, i) => (
                        <p key={i} className="text-sm text-ink">
                            {n.text}
                        </p>
                    ))}
                </div>
            )}
            <PackOffer />
        </div>
    );
}

/** With the beta flag on: download the scoring pack, only when the learner taps. */
export function PackOffer() {
    const [state, setState] = useState<'hidden' | 'offer' | 'loading' | 'ready' | 'error'>('hidden');
    const [share, setShare] = useState(0);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!pronBeta() || !packAvailable()) return;
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
            <p className="text-ink">Chấm từng âm ngay trên máy (thử nghiệm)</p>
            <p className="mt-1 text-xs text-muted">Biết âm nào có thể chưa rõ kể cả khi máy nghe ra đúng từ. Tải một lần khoảng {packMegabytes()}MB, nên dùng Wi-Fi. Âm thanh không rời máy bạn.</p>
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
                    <Download className="w-4 h-4" /> {state === 'error' ? 'Thử tải lại' : `Tải gói (${packMegabytes()}MB)`}
                </button>
            )}
            {error && <p className="mt-2 text-xs text-warning">{error}</p>}
        </div>
    );
}
