"use client";

import * as React from "react";
import { ArrowLeft, BarChart3, History, Mic, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "practice" | "history" | "progress" | "me";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "practice", label: "Luyện", icon: Mic },
  { id: "history", label: "Lịch sử", icon: History },
  { id: "progress", label: "Tiến bộ", icon: BarChart3 },
  { id: "me", label: "Tôi", icon: User },
];

/** The wordmark: lowercase, mono dot as the ON AIR lamp. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-lg font-semibold tracking-tight text-ink", className)}>
      <span className="size-2 rounded-full bg-onair" aria-hidden />
      oratio
    </span>
  );
}

/**
 * A tab screen: header (wordmark and tabs on wide screens), content column,
 * bottom tab bar on phones. Full-screen flows (answering, calls) don't use it.
 */
export function TabShell({
  tab,
  onTab,
  title,
  action,
  children,
}: {
  tab: Tab;
  onTab: (tab: Tab) => void;
  /** Big page title; omit on the practice tab */
  title?: string;
  /** Right side of the header */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
          <Wordmark />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors",
                  tab === t.id ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="flex min-w-0 items-center justify-end md:min-w-24">{action}</div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 md:pb-16">
        {title && <h1 className="mb-6 text-2xl font-semibold tracking-tight text-ink">{title}</h1>}
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Điều hướng chính"
      >
        <div className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px]", active ? "text-ink" : "text-subtle")}
              >
                <Icon className={cn("size-5", active && "text-onair")} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/**
 * A full-screen flow (answering, matchmaking, a call, rating): back or close
 * on the left, a short title, nothing else to distract.
 */
export function FlowShell({
  title,
  onBack,
  backLabel = "Quay lại",
  right,
  children,
  footer,
}: {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  /** Sticky bottom area for the main action */
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-4">
        <div className="w-11">
          {onBack && (
            <button
              onClick={onBack}
              aria-label={backLabel}
              className="flex size-11 items-center justify-center rounded-[var(--radius-control)] text-muted hover:bg-surface-2 hover:text-ink"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
        </div>
        {title && <p className="truncate text-sm text-muted">{title}</p>}
        <div className="flex min-w-11 justify-end">{right}</div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8">{children}</main>
      {footer && (
        <div className="sticky bottom-0 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto max-w-2xl px-4 py-3">{footer}</div>
        </div>
      )}
    </div>
  );
}
