"use client";

import { useEffect, useState } from "react";

/** The browser's install prompt (Chrome, Edge, Android). Not in the TS DOM lib. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Called once from PwaRegister: keeps the install prompt for later. */
export function captureInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export type InstallState = "installed" | "prompt" | "ios" | "unavailable";

/**
 * Whether Oratio can be installed here and how: a real prompt (Chromium),
 * instructions (iOS Safari has no prompt), or already installed.
 */
export function useInstall() {
  const [state, setState] = useState<InstallState>("unavailable");

  useEffect(() => {
    const update = () =>
      setState(isStandalone() ? "installed" : deferred ? "prompt" : isIos() ? "ios" : "unavailable");
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    notify();
    return outcome === "accepted";
  };

  return { state, install };
}
