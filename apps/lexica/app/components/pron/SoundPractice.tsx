'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Ear, Volume2, X } from 'lucide-react';
import { SOUND_LABEL } from '@cortex/classroom-lexica';
import { useLexicaStore } from '../../store/lexicaStore';
import { getCard } from '../../lib/content/repository';
import { MINIMAL_PAIRS, type ErrorKind } from '../../lib/pronunciation/pairs';
import { SOUND_TIP } from '../../lib/pronunciation/sounds';
import { exposures } from '../../lib/pronunciation/soundLog';
import { loadDict, phonesOf, type Dict } from '../../lib/pronunciation/phones';
import { speakVaried } from '../../lib/pronunciation/speech';
import SpeakDrill from '../SpeakDrill';

const ROUNDS = 4;
const SAY = 5;

/**
 * "2 phút luyện âm" (docs/LEXICA_PRONUNCIATION_DESIGN.md, 7.2): hear the
 * minimal pairs of one sound group in several voices and pick the word,
 * then say up to 5 learned words that have that sound. Never required.
 */
export default function SoundPractice({ kind, onDone }: { kind: ErrorKind; onDone: () => void }) {
    const [seed] = useState(() => Math.floor(Math.random() * 1000));
    const rounds = useMemo(() => {
        // Another starting pair each practice.
        const all = MINIMAL_PAIRS[kind];
        const pairs = [...all.slice(seed % all.length), ...all.slice(0, seed % all.length)];
        return Array.from({ length: Math.min(ROUNDS, pairs.length) }, (_, i) => {
            const pair = pairs[i];
            return { pair, answer: pair[(seed + i) % 2] };
        });
    }, [kind, seed]);
    const [round, setRound] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [played, setPlayed] = useState(false);
    const [right, setRight] = useState(0);
    const journeys = useLexicaStore((s) => s.journeys);
    const [dict, setDict] = useState<Dict | null>(null);
    useEffect(() => {
        void loadDict().then(setDict);
    }, []);
    // Learned words with this sound, single words only, most recent first.
    const sayIds = useMemo(() => {
        if (!dict) return [];
        return Object.entries(journeys)
            .sort(([, a], [, b]) => b.understoodAt - a.understoodAt)
            .map(([id]) => getCard(id))
            .filter((c): c is NonNullable<typeof c> => Boolean(c) && !c!.word.includes(' '))
            .filter((c) => {
                const ph = phonesOf(dict, c.word, c.ipa);
                return ph ? exposures(ph).has(kind) : false;
            })
            .slice(0, SAY)
            .map((c) => c.id);
    }, [dict, journeys, kind]);

    if (round >= rounds.length) {
        return (
            <div className="space-y-4">
                <div className="rounded-2xl border border-line bg-surface p-5">
                    <p className="text-ink font-semibold">
                        Nghe phân biệt: đúng {right}/{rounds.length}
                    </p>
                    <p className="mt-1 text-sm text-ink-2">{SOUND_TIP[kind]}</p>
                    {sayIds.length === 0 && (
                        <>
                            <p className="mt-3 text-sm text-muted">Bạn chưa học từ nào có âm này để luyện nói. Học thêm từ rồi quay lại nhé.</p>
                            <button onClick={onDone} className="mt-4 h-10 px-4 rounded-xl bg-accent text-on-accent font-bold">
                                Xong
                            </button>
                        </>
                    )}
                </div>
                {sayIds.length > 0 && (
                    <>
                        <p className="text-sm text-muted">Giờ nói {sayIds.length} từ bạn đã học có âm này.</p>
                        <SpeakDrill words={sayIds} steps={[2]} onDone={onDone} />
                    </>
                )}
            </div>
        );
    }

    const r = rounds[round];
    const done = picked !== null;
    return (
        <div data-testid="sound-practice" className="rounded-2xl border border-line bg-surface p-5">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-accent">
                <Ear className="w-4 h-4" /> Luyện 2 phút · {SOUND_LABEL[kind]}
            </p>
            <p className="mt-2 text-sm text-muted">
                Vòng {round + 1}/{rounds.length}: nghe 3 giọng đọc một từ, chọn đúng từ đó.
            </p>
            <button
                onClick={async () => {
                    setPlayed(true);
                    await speakVaried(r.answer, 3);
                }}
                className="mt-4 h-11 px-4 rounded-xl border border-line bg-surface-2 text-ink flex items-center gap-2 hover:border-line-strong"
            >
                <Volume2 className="w-4 h-4" /> {played ? 'Nghe lại' : 'Nghe'}
            </button>
            <div className="mt-4 grid grid-cols-2 gap-2">
                {r.pair.map((o) => {
                    const cls = done && o === r.answer ? 'border-accent bg-accent/10 text-ink' : done && o === picked ? 'border-danger/60 text-muted' : 'border-line text-ink hover:border-line-strong';
                    return (
                        <button
                            key={o}
                            disabled={!played || done}
                            onClick={() => {
                                setPicked(o);
                                if (o === r.answer) setRight((n) => n + 1);
                            }}
                            className={`h-14 rounded-xl border text-lg font-semibold lowercase disabled:opacity-60 ${cls}`}
                        >
                            {done && o === r.answer && <Check className="inline w-4 h-4 mr-1 text-accent" />}
                            {done && o === picked && o !== r.answer && <X className="inline w-4 h-4 mr-1 text-danger" />}
                            {o}
                        </button>
                    );
                })}
            </div>
            {done && (
                <div className="mt-4 flex items-center justify-between gap-3">
                    <p className={`text-sm ${picked === r.answer ? 'text-accent' : 'text-ink-2'}`}>{picked === r.answer ? 'Đúng rồi.' : `Đó là “${r.answer}”. Nghe lại để thấy khác ở đâu.`}</p>
                    <button
                        onClick={() => {
                            setRound(round + 1);
                            setPicked(null);
                            setPlayed(false);
                        }}
                        className="h-10 px-4 rounded-xl bg-accent text-on-accent font-bold shrink-0"
                    >
                        Tiếp
                    </button>
                </div>
            )}
        </div>
    );
}
