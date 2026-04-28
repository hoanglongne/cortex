"use client";

import type { ActionLog } from "@cortex/types";

export function TerminalHistory(props: {
  borderClass: string;
  sessionHistory: ActionLog[];
}) {
  return (
    <div className={`${props.borderClass} bg-[#0a0a0a] px-3 py-3`}>
      <div className="text-[10px] uppercase tracking-widest text-white/60">
        Session History
      </div>
      <div className="mt-3 max-h-[240px] overflow-y-auto space-y-2">
        {props.sessionHistory.length === 0 ? (
          <div className="text-[11px] text-white/40">No logs.</div>
        ) : (
          props.sessionHistory
            .slice()
            .reverse()
            .slice(0, 30)
            .map((l) => (
              <div
                key={l.id}
                className="border border-[color:var(--terminal-border)] px-2 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-widest text-white/70">
                    {l.actionType}
                  </div>
                  <div className="text-[10px] text-white/35">
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-white/45 break-words">
                  {typeof l.metadata === "object" && l.metadata
                    ? JSON.stringify(l.metadata)
                    : String(l.metadata)}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

