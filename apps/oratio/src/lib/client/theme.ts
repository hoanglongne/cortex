"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
const KEY = "oratio-theme";

function apply(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/** The user's light/dark choice, saved on this device. "system" follows the OS. */
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    let saved: ThemeChoice = "system";
    try {
      const v = localStorage.getItem(KEY);
      if (v === "light" || v === "dark" || v === "system") saved = v;
    } catch {
      // storage blocked: keep following the system
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(saved);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      try {
        if ((localStorage.getItem(KEY) ?? "system") === "system") apply("system");
      } catch {
        apply("system");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const set = useCallback((next: ThemeChoice) => {
    setChoice(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // not saved, still applied for this visit
    }
    apply(next);
  }, []);

  return { choice, setTheme: set };
}

const CHARACTER_KEY = "oratio-character";

/** Whether Ơ appears with messages (Tôi > "Ơ nói chuyện với tôi"). */
export function useCharacterEnabled() {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(localStorage.getItem(CHARACTER_KEY) !== "off");
    } catch {
      // keep the default
    }
  }, []);
  const set = useCallback((on: boolean) => {
    setEnabled(on);
    try {
      localStorage.setItem(CHARACTER_KEY, on ? "on" : "off");
    } catch {
      // not saved
    }
  }, []);
  return { enabled, setEnabled: set };
}
