"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)";

/** True on a screen wide enough for two columns (the same break as the solo screen's grid). */
export function useIsWide(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(QUERY);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
