'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import type { CardQuote } from '../lib/content/pack';

/**
 * "Ngoài đời": real quotes that contain the word. The first line of the first
 * quote is shown straight away; a tap opens all of them. Each quote shows its
 * source and, when Studio kept one, a link to the original. A song line can
 * play its few seconds from the official video; the player is only loaded
 * after a tap.
 */
export default function InTheWild({ word, quotes }: { word: string; quotes: CardQuote[] }) {
    if (quotes.length === 0) return null;
    return (
        <details className="group mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2" onClick={e => e.stopPropagation()}>
            <summary className="cursor-pointer list-none">
                <span className="font-mono text-[11px] text-accent uppercase tracking-wider">
                    Ngoài đời · {quotes.length} câu thật
                </span>
                <span data-testid="wild-preview" className="mt-1 block truncate text-sm text-ink-2 group-open:hidden">
                    {highlight(quotes[0].text, word)}
                </span>
            </summary>
            <ul className="mt-2 space-y-3">
                {quotes.map((q, i) => (
                    <li key={i} className="text-sm text-ink-2">
                        <p className="leading-relaxed">{highlight(q.text, word)}</p>
                        {q.translation && <p className="mt-1 text-muted">{q.translation}</p>}
                        <p className="mt-1 font-mono text-[11px] text-subtle">
                            {q.url ? (
                                <a href={q.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                                    {q.source}
                                </a>
                            ) : (
                                q.source
                            )}
                        </p>
                        {q.media && <Clip media={q.media} title={q.source} />}
                    </li>
                ))}
            </ul>
        </details>
    );
}

/** A tap-to-load player for the seconds of the line, from youtube-nocookie. */
function Clip({ media, title }: { media: NonNullable<CardQuote['media']>; title: string }) {
    const [open, setOpen] = useState(false);
    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink hover:bg-surface-3"
            >
                <Play className="w-3.5 h-3.5" /> Nghe đoạn này ({clock(media.start)})
            </button>
        );
    }
    const src = `https://www.youtube-nocookie.com/embed/${media.id}?start=${media.start}&end=${media.end}&autoplay=1&rel=0`;
    return (
        <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg">
            <iframe
                src={src}
                title={`Đoạn nhạc: ${title}`}
                className="h-full w-full"
                allow="autoplay; encrypted-media"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            />
        </div>
    );
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Marks each case-insensitive occurrence of `word` or a simple form of it ("dilemmas"). */
function highlight(text: string, word: string): React.ReactNode {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const form = new RegExp(`^${escaped}(?:s|es|d|ed|ing|ly)?$`, 'i');
    const parts = text.split(new RegExp(`(\\b${escaped}(?:s|es|d|ed|ing|ly)?\\b)`, 'gi'));
    return parts.map((part, i) =>
        form.test(part) ? (
            <mark key={i} className="bg-accent text-on-accent px-1">
                {part}
            </mark>
        ) : (
            part
        ),
    );
}
