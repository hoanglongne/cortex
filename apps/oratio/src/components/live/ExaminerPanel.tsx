"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, Label } from "@/components/ui/card";
import { formatClock, useElapsed } from "@/components/ui/timer";
import { examinerMoment, paceStatus, partTarget, type ExaminerPosition } from "@/lib/examiner-script";
import { cn } from "@/lib/utils";

/** Elapsed time of this candidate's turn against the target. Remounts (key) when the turn changes. */
function TurnClock({ part }: { part: number }) {
  const elapsed = useElapsed();
  const target = partTarget(part);
  const pace = paceStatus(part, elapsed);
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3" aria-live="off">
      <span className="text-sm text-muted">
        Part {part}, mục tiêu <span className="font-bold text-ink-2">{target.label}</span>
      </span>
      {part !== 2 && (
        <span className={cn("text-lg font-extrabold tabular", pace === "over" ? "text-pending-ink" : pace === "on" ? "text-good-edge dark:text-good" : "text-ink")}>
          {formatClock(elapsed)}
          <span className="sr-only">{pace === "over" ? ", đã quá giờ" : pace === "on" ? ", trong khung giờ" : ""}</span>
        </span>
      )}
    </div>
  );
}

/** Examiner-only: the line for this moment of the test and the clock for the turn. */
export function ExaminerPanel({ position }: { position: ExaminerPosition }) {
  const [open, setOpen] = useState(true);
  const moment = examinerMoment(position);
  return (
    <Card className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <Label>Lời giám khảo</Label>
        <ChevronDown className={cn("size-4 text-subtle transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div>
          {moment ? (
            <>
              <p className="text-xs font-bold text-voice">{moment.when}</p>
              <p lang="en" className="mt-1.5 text-[15px] leading-relaxed text-ink">
                {moment.line}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Câu này không cần lời dẫn. Đọc thẳng câu hỏi cho bạn kia.</p>
          )}
        </div>
      )}
      <TurnClock key={`${position.part}-${position.turnInPart}`} part={position.part} />
    </Card>
  );
}
