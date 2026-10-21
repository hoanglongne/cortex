'use client';

import type { Alignment } from '../../lib/pronunciation/align';
import { sayModel } from '../../lib/pronunciation/speech';

/**
 * The model phrase or sentence with each word marked (level 1): heard,
 * missing, heard as another word, or not sure. Tap a word to hear it.
 */
export default function AlignedLine({ alignment }: { alignment: Alignment }) {
    const missed = alignment.words.filter((w) => w.status !== 'ok').length;
    return (
        <div data-testid="aligned-line" className="mt-3">
            <p className="flex flex-wrap gap-x-1.5 gap-y-2 text-lg leading-snug">
                {alignment.words.map((w, i) => (
                    <button
                        key={i}
                        onClick={() => void sayModel(w.word.replace(/[^a-zA-Z' -]/g, ''), 'slow')}
                        aria-label={`Nghe “${w.word}”`}
                        className={`inline-flex flex-col items-start text-left ${
                            w.status === 'ok'
                                ? 'text-ink'
                                : w.status === 'missing'
                                  ? 'text-muted line-through decoration-warning/70'
                                  : w.status === 'swapped'
                                    ? 'text-danger underline decoration-danger/60 underline-offset-4'
                                    : 'text-ink-2 underline decoration-dotted decoration-line-strong underline-offset-4'
                        }`}
                    >
                        <span>{w.word}</span>
                        {w.status === 'swapped' && <span className="text-[11px] leading-none text-danger no-underline">nghe thành “{w.heard}”</span>}
                    </button>
                ))}
            </p>
            {missed > 0 && (
                <p className="mt-2 text-xs text-muted">
                    <span className="line-through decoration-warning/70">gạch</span>: máy không nghe thấy · <span className="text-danger underline decoration-danger/60">đỏ</span>: máy nghe thành từ khác ·{' '}
                    <span className="underline decoration-dotted">chấm</span>: máy chưa chắc. Bấm một từ để nghe mẫu.
                </p>
            )}
        </div>
    );
}
