"use client";

import * as React from "react";
import { ArrowLeft, BarChart3, Headphones, History, Mic, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Character } from "./character";
import { InstallButton } from "./install";

export type Tab = "practice" | "review" | "history" | "progress" | "me";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "practice", label: "Luyện", icon: Mic },
  { id: "review", label: "Chấm", icon: Headphones },
  { id: "history", label: "Lịch sử", icon: History },
  { id: "progress", label: "Tiến bộ", icon: BarChart3 },
  { id: "me", label: "Tôi", icon: User },
];

/** The wordmark: lowercase, an orange dot as the voice. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-xl font-extrabold tracking-[-0.04em] text-ink", className)}>
      <span className="size-2.5 rounded-full bg-voice" aria-hidden />
      oratio
    </span>
  );
}

/**
 * A tab screen. Phones: content plus a bottom tab bar. Wide screens: a
 * sidebar with the tabs, Ơ and the install button. Full-screen flows
 * (answering, calls) use FlowShell instead.
 */
export function TabShell({
  tab,
  onTab,
  title,
  action,
  children,
  wide = false,
}: {
  tab: Tab;
  onTab: (tab: Tab) => void;
  /** Big page title; omit on the practice tab */
  title?: string;
  /** Right side of the title row */
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Wider content column (practice and progress use two columns on desktop) */
  wide?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-bg md:flex">
      {/* Sidebar (md+) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-1 border-r border-line bg-surface px-4 py-6 md:flex">
        <Wordmark className="mb-6 px-3" />
        <nav className="flex flex-col gap-1" aria-label="Điều hướng chính">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-[12px] px-3 text-[15px] transition-colors",
                  active ? "bg-voice-soft font-extrabold text-ink" : "font-semibold text-muted hover:bg-surface-2 hover:text-ink"
                )}
              >
                <t.icon className={cn("size-5", active && "text-voice")} />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex justify-center">
            <Character mood="idle" size={72} className="animate-bob" />
          </div>
          <InstallButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Phone header */}
        <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur md:hidden">
          <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-4">
            <Wordmark />
            {action}
          </div>
        </header>

        <main className={cn("mx-auto px-4 pb-28 pt-6 md:px-10 md:pb-16 md:pt-10", wide ? "max-w-5xl" : "max-w-3xl")}>
          {(title || action) && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              {title && <h1 className="text-[28px] font-extrabold tracking-[-0.035em] text-ink md:text-[32px]">{title}</h1>}
              {action && <div className="hidden md:block">{action}</div>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Bottom tabs (phones) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Điều hướng chính"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold", active ? "text-voice" : "text-subtle")}
              >
                <t.icon className="size-[22px]" />
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
 * on the left, an optional progress bar, nothing else to distract.
 */
export function FlowShell({
  title,
  onBack,
  backLabel = "Quay lại",
  close = false,
  progress,
  right,
  children,
  footer,
  wide = false,
  tone = "default",
}: {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  /** Show × instead of ← (leaving a session) */
  close?: boolean;
  /** A progress bar in the header (Segments or a custom bar) */
  progress?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  /** Sticky bottom area for the main action */
  footer?: React.ReactNode;
  /** Wider content (two columns on desktop) */
  wide?: boolean;
  /** "dark" forces the dark theme for this screen (the live exam room) */
  tone?: "default" | "dark";
}) {
  const BackIcon = close ? X : ArrowLeft;
  return (
    <div data-theme={tone === "dark" ? "dark" : undefined} className="flex min-h-dvh flex-col bg-bg text-ink">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className={cn("mx-auto flex h-16 w-full items-center gap-3 px-4 md:px-8", wide ? "max-w-6xl" : "max-w-2xl")}>
          <div className="w-11 shrink-0">
            {onBack && (
              <button
                onClick={onBack}
                aria-label={backLabel}
                className="flex size-11 items-center justify-center rounded-[12px] text-subtle hover:bg-surface-2 hover:text-ink"
              >
                <BackIcon className="size-5" />
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {progress ?? (title && <p className="truncate text-center text-sm font-bold text-muted">{title}</p>)}
          </div>
          <div className="flex min-w-11 shrink-0 justify-end">{right}</div>
        </div>
      </header>
      <main className={cn("mx-auto w-full flex-1 px-4 pb-8 pt-6 md:px-8 md:pt-8", wide ? "max-w-6xl" : "max-w-2xl")}>{children}</main>
      {footer && (
        <div className="sticky bottom-0 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className={cn("mx-auto px-4 py-3 md:px-8", wide ? "max-w-6xl" : "max-w-2xl")}>{footer}</div>
        </div>
      )}
    </div>
  );
}
