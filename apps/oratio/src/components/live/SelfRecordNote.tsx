"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** The candidate's consent line and off switch for the on-device recording. */
export function SelfRecordNote({ on, onToggle, error }: { on: boolean; onToggle: () => void; error: boolean }) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-muted">Phần nói của bạn được ghi lại trên máy này để xem chỉ số sau buổi.</p>
        {error && on && (
          <p role="alert" className="mt-1 text-[13px] text-pending-ink">
            Không ghi âm được trên máy này. Buổi thi vẫn diễn ra bình thường.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={on}
        aria-label="Ghi âm phần nói của tôi"
        className={cn(
          "shrink-0 rounded-full border px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em]",
          on ? "border-voice-edge bg-voice-soft text-ink" : "border-line-strong text-subtle"
        )}
      >
        {on ? "Đang bật" : "Đã tắt"}
      </button>
    </Card>
  );
}
