'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import MouthPlayer from './MouthPlayer';
import { loadDict, phonesOf, type Dict } from '../../lib/pronunciation/phones';
import { sayModel } from '../../lib/pronunciation/speech';
import { guideFor } from '../../lib/pronunciation/steps';
import { wordSounds } from '../../lib/pronunciation/wordSounds';

/**
 * "Xem từng âm trong từ" (issue #157): the word's letters grouped by sound.
 * Tapping a group lights it, moves the mouth to that sound (played slowly)
 * and plays the whole word slowly. Per-sound timing in the model voice would
 * need forced alignment; until then the word is played whole.
 */
export default function WordSounds({ word, ipa, startPhone }: { word: string; ipa?: string; startPhone?: string }) {
    const [dict, setDict] = useState<Dict | null>(null);
    const [picked, setAt] = useState<number | null>(null);
    const [taps, setTaps] = useState(0);
    useEffect(() => {
        void loadDict().then(setDict);
    }, []);
    const sounds = wordSounds(word, phonesOf(dict, word, ipa));
    if (!sounds) return null;
    const first = startPhone ? sounds.findIndex((x) => x.phone === startPhone.replace(/\d$/, '')) : -1;
    const at = Math.min(picked ?? Math.max(0, first), sounds.length - 1);
    const cur = sounds[at];
    const step = guideFor(cur.phone)?.steps[0]?.text;
    return (
        <div data-testid="word-sounds" className="rounded-xl bg-surface-2 p-3 space-y-2">
            <p className="text-xs text-muted">Chạm vào từng phần của từ để xem miệng</p>
            <div className="flex flex-wrap items-end gap-1" role="group" aria-label={`Các âm trong ${word}`}>
                {sounds.map((x, i) => (
                    <button
                        key={i}
                        type="button"
                        aria-pressed={i === at}
                        onClick={() => {
                            setAt(i);
                            setTaps((n) => n + 1);
                            void sayModel(word, 'slow');
                        }}
                        className={`min-w-9 rounded-lg border px-2 py-1 text-center ${i === at ? '!border-ink bg-ink text-bg' : 'border-line hover:border-line-strong'}`}
                    >
                        <span className="block font-semibold text-lg leading-tight text-ink">{x.letters || '·'}</span>
                        <span className="block font-mono text-[11px] text-muted">/{x.ipa}/</span>
                    </button>
                ))}
                <button type="button" onClick={() => void sayModel(word, 'slow')} className="ml-1 h-9 w-9 rounded-lg border border-line grid place-items-center text-ink-2" aria-label={`Nghe ${word} chậm`}>
                    <Volume2 className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-[112px_1fr] gap-3 items-start">
                <MouthPlayer key={`${at}-${taps}`} phone={cur.phone} autoSlow={taps > 0} className="w-28" />
                <p className="text-sm text-ink-2">
                    <span className="font-mono text-accent">/{cur.ipa}/</span> {cur.letters ? `(${cur.letters})` : ''} {step}
                </p>
            </div>
        </div>
    );
}
