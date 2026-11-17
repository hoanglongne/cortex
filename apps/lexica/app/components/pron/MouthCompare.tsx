'use client';

import { Volume2 } from 'lucide-react';
import Mouth from './Mouth';
import { partsThatDiffer, type SoundPair } from '../../lib/pronunciation/compare';
import { ipaOf } from '../../lib/pronunciation/phones';
import { sayModel } from '../../lib/pronunciation/speech';
import type { MouthPart } from '../../lib/pronunciation/steps';

const PART_LABEL: Record<MouthPart, string> = {
    tongue: 'lưỡi',
    lips: 'môi',
    jaw: 'độ mở miệng',
    contact: 'chỗ chạm',
    air: 'luồng hơi',
    voice: 'rung cổ',
    nose: 'hơi ra mũi',
};

/**
 * Two mouths side by side with the parts that differ marked on both
 * (issue #153): the sound to aim for on the left, the one it gets mixed up
 * with on the right, one line naming the difference, and a button that
 * plays the two words in turn.
 */
export default function MouthCompare({ pair }: { pair: Pick<SoundPair, 'a' | 'b' | 'note'> & { words?: [string, string] } }) {
    const diff = partsThatDiffer(pair.a, pair.b);
    const words = pair.words;
    const play = async () => {
        if (!words) return;
        for (const w of [words[0], words[1], words[0], words[1]]) await sayModel(w, 'slow');
    };
    const side = (phone: string, word: string | undefined, label: string, tone: string) => (
        <figure className="space-y-1 text-center">
            <Mouth phone={phone} focus={diff} className="w-full h-auto" />
            <figcaption className="text-sm">
                <span className={`font-mono ${tone}`}>/{ipaOf(phone)}/</span>
                {word && <span className="text-ink"> {word}</span>}
                <span className="block text-[11px] text-muted">{label}</span>
            </figcaption>
        </figure>
    );
    return (
        <div data-testid="mouth-compare" className="rounded-xl bg-surface-2 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-3">
                {side(pair.a, words?.[0], 'cần nói', 'text-accent')}
                {side(pair.b, words?.[1], 'dễ nhầm thành', 'text-warning')}
            </div>
            {diff.length > 0 && (
                <p className="text-xs text-muted">
                    Khác ở: <span className="text-ink">{diff.map((d) => PART_LABEL[d]).join(', ')}</span> (viền vàng)
                </p>
            )}
            <p className="text-sm text-ink-2">{pair.note}</p>
            {words && (
                <button type="button" onClick={() => void play()} className="h-9 px-3 rounded-lg border border-line text-sm text-ink flex items-center gap-1.5 hover:border-line-strong">
                    <Volume2 className="w-3.5 h-3.5" /> Nghe xen kẽ {words[0]} / {words[1]}
                </button>
            )}
        </div>
    );
}
