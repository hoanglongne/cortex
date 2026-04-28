import { useEffect, useMemo, useState } from "react";

export function useTypewriter(
  fullText: string,
  options?: { cps?: number; enabled?: boolean },
) {
  const cps = options?.cps ?? 60;
  const enabled = options?.enabled ?? true;

  const [text, setText] = useState<string>(enabled ? "" : fullText);

  useEffect(() => {
    const interval = Math.max(10, Math.floor(1000 / cps));

    if (!enabled) {
      queueMicrotask(() => setText(fullText));
      return;
    }

    queueMicrotask(() => setText(""));
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) {
        window.clearInterval(timer);
      }
    }, interval);

    return () => window.clearInterval(timer);
  }, [cps, enabled, fullText]);

  const done = useMemo(() => text.length >= fullText.length, [fullText.length, text.length]);

  return { text, done };
}
