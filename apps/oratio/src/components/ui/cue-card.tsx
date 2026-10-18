"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { parseCueCard } from "@/lib/cue-card";
import { cn } from "@/lib/utils";

type Question = { part: number; category: string; question_text: string };

/**
 * The signature object of Oratio: a question printed on a sheet of exam
 * paper. Part 2 shows the task and its bullet points; Part 1/3 can be
 * hidden behind "Hiện câu hỏi" so the candidate listens first.
 */
export function CueCard({
  question,
  hidden = false,
  className,
  children,
}: {
  question: Question;
  /** Start hidden (candidate in a live call, Part 1/3 only) */
  hidden?: boolean;
  className?: string;
  /** Footer: timer, actions */
  children?: React.ReactNode;
}) {
  const isCard = question.part === 2;
  const [shown, setShown] = React.useState(!hidden || isCard);
  const card = isCard ? parseCueCard(question.question_text) : null;

  return (
    <article
      className={cn(
        "relative rounded-[var(--radius-card)] border border-paper-line bg-paper px-5 pb-5 pt-4 sm:px-7 sm:pb-6 animate-enter",
        className
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-3 border-b border-paper-line pb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          Part {question.part}
          {isCard ? " · Cue card" : ""}
        </p>
        <p className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-subtle">{question.category}</p>
      </header>

      {card ? (
        <div className="font-serif text-ink">
          <p className="text-xl leading-snug sm:text-2xl">{card.task}</p>
          {card.points.length > 0 && (
            <>
              <p className="mt-4 text-sm italic text-muted">You should say:</p>
              <ul className="paper-ruled mt-1 text-[17px] leading-8">
                {card.points.map((point) => (
                  <li key={point} className="pl-5 -indent-4">
                    <span className="mr-2 text-subtle">–</span>
                    {point}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : shown ? (
        <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">{question.question_text}</p>
      ) : (
        <button
          onClick={() => setShown(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-paper-line py-6 text-sm text-muted hover:text-ink"
        >
          <Eye className="size-4" /> Nghe chưa rõ? Hiện câu hỏi
        </button>
      )}

      {children && <div className="mt-5">{children}</div>}
    </article>
  );
}
