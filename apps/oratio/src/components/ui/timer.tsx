"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const formatClock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
};

/** Seconds since mount (or since `running` turned true), ticking. */
export function useElapsed(running = true) {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    if (!running) return;
    const start = Date.now();
    const t = setInterval(() => setElapsed((Date.now() - start) / 1000), 250);
    return () => clearInterval(t);
  }, [running]);
  return elapsed;
}

/** IELTS Part 2 timing: one minute to prepare, then up to two minutes to speak. */
export function Part2Timer({ prepS = 60, speakS = 120, className }: { prepS?: number; speakS?: number; className?: string }) {
  const elapsed = useElapsed();
  const preparing = elapsed < prepS;
  const done = elapsed >= prepS + speakS;
  const left = preparing ? prepS - elapsed : prepS + speakS - elapsed;
  const progress = preparing ? elapsed / prepS : (elapsed - prepS) / speakS;

  return (
    <div className={cn("space-y-2", className)} aria-live="polite">
      <div className="flex items-baseline justify-between text-sm font-bold">
        <span className={preparing ? "text-listen-ink" : done ? "text-subtle" : "text-voice"}>
          {preparing ? "Chuẩn bị, ghi chú nhanh" : done ? "Hết 2 phút" : "Nói liên tục"}
        </span>
        {!done && <span className="text-ink tabular">{formatClock(left)}</span>}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-3">
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", preparing ? "bg-listen" : "bg-voice")}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
