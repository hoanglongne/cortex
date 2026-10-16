"use client";

import type { CardQuote } from "../lib/content/pack";

/**
 * "Ngoài đời": real quotes that contain the word, collapsed by default so the
 * card stays simple. Each quote shows its source and, when Studio kept one, a
 * link to the original. Nothing is loaded from the network here.
 */
export default function InTheWild({
  word,
  quotes,
}: {
  word: string;
  quotes: CardQuote[];
}) {
  if (quotes.length === 0) return null;
  return (
    <details
      className="mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2"
      onClick={(e) => e.stopPropagation()}
    >
      <summary className="cursor-pointer font-mono text-[11px] text-accent uppercase tracking-wider">
        Ngoài đời · {quotes.length} câu thật
      </summary>
      <ul className="mt-2 space-y-3">
        {quotes.map((q, i) => (
          <li key={i} className="text-sm text-ink-2">
            <p className="leading-relaxed">{highlight(q.text, word)}</p>
            {q.translation && (
              <p className="mt-1 text-muted">{q.translation}</p>
            )}
            <p className="mt-1 font-mono text-[11px] text-subtle">
              {q.url ? (
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-ink"
                >
                  {q.source}
                </a>
              ) : (
                q.source
              )}
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Marks each whole-word, case-insensitive occurrence of `word`. */
function highlight(text: string, word: string): React.ReactNode {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(\\b${escaped}\\b)`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === word.toLowerCase() ? (
      <mark key={i} className="bg-accent text-on-accent px-1">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
