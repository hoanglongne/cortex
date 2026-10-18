"use client";

import { useEffect, useState } from "react";
import { Eye, Timer } from "lucide-react";
import { parseCueCard } from "@/lib/cue-card";
import type { IeltsQuestion } from "@/lib/types/database";

// Part 2: one minute to prepare, then two minutes to speak (local to each screen)
const PART2_PREP_S = 60;
const PART2_SPEAK_S = 120;

export function Part2Timer() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => clearInterval(t);
  }, []);

  const preparing = elapsed < PART2_PREP_S;
  const left = preparing ? PART2_PREP_S - elapsed : Math.max(0, PART2_PREP_S + PART2_SPEAK_S - elapsed);
  const done = !preparing && left === 0;
  const mm = Math.floor(left / 60);
  const ss = (left % 60).toString().padStart(2, "0");

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-sm ${preparing
        ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
        : done
          ? "bg-white/5 border-white/10 text-zinc-400"
          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
        }`}
      aria-live="polite"
    >
      <span className="flex items-center gap-2">
        <Timer className="w-4 h-4" />
        {preparing ? "Thí sinh chuẩn bị (ghi chú nhanh)" : done ? "Hết 2 phút – giám khảo có thể sang câu tiếp" : "Thí sinh nói liên tục"}
      </span>
      {!done && <span className="font-mono tabular-nums">{mm}:{ss}</span>}
    </div>
  );
}

// The question as the candidate sees it: Part 2 cue card always, Part 1/3 on tap
export function QuestionText({ question, revealable }: { question: IeltsQuestion; revealable: boolean }) {
  const [shown, setShown] = useState(!revealable);

  if (question.part === 2) {
    const card = parseCueCard(question.question_text);
    return (
      <div className="text-left">
        <p className="text-lg font-medium text-white/90 leading-relaxed mb-3">{card.task}</p>
        {card.points.length > 0 && (
          <>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">You should say:</p>
            <ul className="list-disc pl-5 space-y-1 text-white/80">
              {card.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  if (!shown) {
    return (
      <button
        onClick={() => setShown(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-zinc-300 transition-colors"
      >
        <Eye className="w-4 h-4" /> Hiện câu hỏi
      </button>
    );
  }
  return <p className="text-lg font-medium text-white/90 leading-relaxed">{question.question_text}</p>;
}
