"use client";

import * as React from "react";
import { Check, Eye } from "lucide-react";
import { parseCueCard } from "@/lib/cue-card";
import { cn } from "@/lib/utils";

type Question = { part: number; category: string; question_text: string };

const PART_NAME: Record<number, string> = { 1: "Làm quen", 2: "Kể chuyện", 3: "Thảo luận" };

/**
 * A question card. Part 2 shows the task and its points as chips the
 * speaker can tick off while talking; Part 1/3 can start hidden so the
 * candidate listens first.
 */
export function CueCard({
  question,
  hidden = false,
  size = "md",
  className,
  children,
}: {
  question: Question;
  /** Start hidden (candidate in a live call, Part 1/3 only) */
  hidden?: boolean;
  size?: "md" | "lg";
  className?: string;
  /** Footer: timer, hint */
  children?: React.ReactNode;
}) {
  const isCard = question.part === 2;
  const [shown, setShown] = React.useState(!hidden || isCard);
  const [ticked, setTicked] = React.useState<Set<number>>(new Set());
  const card = isCard ? parseCueCard(question.question_text) : null;
  const titleSize = size === "lg" ? "text-[28px] md:text-[34px]" : "text-[22px] md:text-[26px]";

  const toggle = (i: number) =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <article className={cn("animate-enter rounded-[var(--radius-card)] border border-line bg-surface p-5 md:p-7", className)}>
      <p className="mb-3 flex justify-between gap-3 text-xs font-extrabold uppercase tracking-[0.06em]">
        <span className="text-voice">
          Part {question.part} · {PART_NAME[question.part] ?? ""}
        </span>
        <span className="truncate text-subtle">{question.category}</span>
      </p>

      {card ? (
        <>
          <h2 className={cn("font-extrabold leading-tight tracking-[-0.03em] text-ink", titleSize)}>{card.task}</h2>
          {card.points.length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Các ý cần nói, chạm để đánh dấu đã nói">
              {card.points.map((point, i) => {
                const done = ticked.has(i);
                return (
                  <li key={point}>
                    <button
                      onClick={() => toggle(i)}
                      aria-pressed={done}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-[15px] transition-colors",
                        done ? "bg-good-soft text-muted" : "border border-line text-ink hover:border-line-strong"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-[22px] shrink-0 items-center justify-center rounded-full",
                          done ? "bg-good text-white" : "border-2 border-line-strong"
                        )}
                      >
                        {done && <Check className="size-3.5" strokeWidth={3.5} />}
                      </span>
                      {point}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : shown ? (
        <h2 className={cn("font-extrabold leading-tight tracking-[-0.03em] text-ink", titleSize)}>{question.question_text}</h2>
      ) : (
        <button
          onClick={() => setShown(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-line-strong py-6 text-sm font-bold text-muted hover:text-ink"
        >
          <Eye className="size-4" /> Nghe chưa rõ? Hiện câu hỏi
        </button>
      )}

      {children && <div className="mt-5">{children}</div>}
    </article>
  );
}
