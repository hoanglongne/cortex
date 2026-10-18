import * as React from "react";
import { cn } from "@/lib/utils";

/** A plain surface. Content goes in it; it never decorates. */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5", className)} {...props} />;
}

/** Small mono label above a section, e.g. "HÔM NAY", "PART 2". */
export function Label({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("font-mono text-[11px] uppercase tracking-[0.08em] text-subtle", className)} {...props} />;
}

/** A number with its unit and label, for stats rows. */
export function Stat({ value, unit, label, className }: { value: React.ReactNode; unit?: string; label: string; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="font-mono text-2xl text-ink tabular">
        {value}
        {unit && <span className="ml-1 text-sm text-muted">{unit}</span>}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

/** One-line message with an optional dismiss, for "why you are here" notices. */
export function Notice({
  children,
  tone = "info",
  onDismiss,
  className,
}: {
  children: React.ReactNode;
  tone?: "info" | "error";
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-control)] border px-4 py-3 text-sm",
        tone === "error" ? "border-danger/30 bg-danger-soft text-ink" : "border-line-strong bg-surface-2 text-ink-2",
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Đóng thông báo" className="text-muted hover:text-ink">
          ×
        </button>
      )}
    </div>
  );
}

/** What to show when a list is empty: say why, offer the next step. */
export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong px-5 py-8 text-center">
      <p className="text-ink">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
