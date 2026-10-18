import * as React from "react";
import { cn } from "@/lib/utils";

/** A plain surface with a hairline border. */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5", className)} {...props} />;
}

/** Small uppercase label above a section, e.g. "HÔM NAY", "PART 2". */
export function Label({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-xs font-extrabold uppercase tracking-[0.06em] text-subtle", className)} {...props} />;
}

/** A number with its unit and label, for stats rows. */
export function Stat({ value, unit, label, className }: { value: React.ReactNode; unit?: string; label: string; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-2xl font-extrabold tracking-tight text-ink tabular">
        {value}
        {unit && <span className="ml-1 text-sm font-semibold text-subtle">{unit}</span>}
      </p>
      <p className="mt-0.5 text-xs text-subtle">{label}</p>
    </div>
  );
}

/** One-line message with an optional dismiss. */
export function Notice({
  children,
  tone = "info",
  onDismiss,
  className,
}: {
  children: React.ReactNode;
  tone?: "info" | "error" | "good";
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-control)] px-4 py-3 text-sm font-medium",
        tone === "error" && "bg-danger-soft text-ink",
        tone === "good" && "bg-good-soft text-ink",
        tone === "info" && "bg-listen-soft text-listen-ink",
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Đóng thông báo" className="text-lg leading-none opacity-70 hover:opacity-100">
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
      <p className="font-bold text-ink">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** A small rounded tag. */
export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "listen" | "pending" | "voice";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        tone === "neutral" && "border border-line text-muted",
        tone === "good" && "bg-good-soft text-good-edge dark:text-good",
        tone === "listen" && "bg-listen-soft text-listen-ink",
        tone === "pending" && "bg-pending-soft text-pending-ink",
        tone === "voice" && "bg-voice-soft text-voice",
        className
      )}
    >
      {children}
    </span>
  );
}

/** A thin progress bar made of segments (Part 1–2–3, question n of m). */
export function Segments({ total, done, current, className, label }: { total: number; done: number; current?: number; className?: string; label?: string }) {
  return (
    <div className={cn("flex gap-1.5", className)} aria-label={label} role={label ? "img" : undefined}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 flex-1 rounded-full",
            i < done ? "bg-good" : i === current ? "bg-voice" : "bg-surface-3"
          )}
        />
      ))}
    </div>
  );
}
