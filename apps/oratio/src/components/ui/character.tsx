import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Ơ, Oratio's character: a round white puff with the hook of "ơ" on top,
 * drawn with a slightly wobbly hand line (docs/ORATIO_REDESIGN.md §10).
 * Ơ also gets nervous speaking English, like the learner.
 */
export type Mood = "idle" | "talk" | "happy" | "nervous" | "listen";

const LINE = "#4A3B35";
const EYE = "#2B211E";
const BLUSH = "#FFC6CF";
const BLUSH_LINE = "#EE8FA2";

const BODY = "M60 23 C 83 22, 100 38, 101 61 C 102.5 86, 87 101.5, 60 101 C 33.5 101.5, 18.5 87, 19.5 62 C 20 38.5, 36.5 23.5, 60 23 Z";
const BODY_NERVOUS = "M60 25 C 83 24, 100 40, 100.5 62 C 101.5 86, 87 101.5, 60 101 C 33.5 101.5, 19 86, 20 63 C 20.5 40, 37 25.5, 60 25 Z";
const HOOK = "M71 25 C 74 17, 83 15, 86 21 C 88 25, 84 28, 81 26";

/** Arms (ellipses: cx, cy, rotation) per mood */
const ARMS: Record<Mood, [number, number, number][]> = {
  idle: [[21, 76, 28], [99, 76, -28]],
  listen: [[21, 76, 28], [99, 76, -28]],
  talk: [[20, 70, 48], [99, 76, -28]],
  happy: [[22, 52, -30], [98, 52, 30]],
  nervous: [[26, 80, 10], [94, 80, -10]],
};

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "happy") {
    return <path d="M43 61 Q47 56 51 61 M69 61 Q73 56 77 61" fill="none" stroke={EYE} strokeWidth={2.4} strokeLinecap="round" />;
  }
  const dy = mood === "talk" ? -1 : mood === "nervous" ? 1 : mood === "listen" ? -2 : 0;
  const dx = mood === "listen" ? 2 : 0;
  return (
    <>
      <ellipse cx={47 + dx} cy={60 + dy} rx={3.3} ry={3.9} fill={EYE} />
      <ellipse cx={73 + dx} cy={60 + dy} rx={3.3} ry={3.9} fill={EYE} />
      <circle cx={46 + dx} cy={58.6 + dy} r={1.1} fill="#FFFFFF" />
      <circle cx={72 + dx} cy={58.6 + dy} r={1.1} fill="#FFFFFF" />
    </>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case "talk":
      return (
        <>
          <path d="M55 66 Q60 77 65 66 Z" fill={LINE} stroke={LINE} strokeWidth={1.5} strokeLinejoin="round" />
          <ellipse cx={60} cy={71.5} rx={3} ry={1.8} fill="#FF9AAA" />
        </>
      );
    case "happy":
      return <path d="M54.5 66 Q60 75 65.5 66 Z" fill={LINE} stroke={LINE} strokeWidth={1.5} strokeLinejoin="round" />;
    case "nervous":
      return <path d="M54 70 q2 -2.5 4 0 q2 2.5 4 0 q2 -2.5 4 0" fill="none" stroke={LINE} strokeWidth={2} strokeLinecap="round" />;
    case "listen":
      return <ellipse cx={61} cy={68.5} rx={2.4} ry={2.8} fill={LINE} />;
    default:
      return <path d="M56.5 67.5 Q60 70.5 63.5 67.5" fill="none" stroke={LINE} strokeWidth={2} strokeLinecap="round" />;
  }
}

const LABEL: Record<Mood, string> = {
  idle: "Ơ",
  talk: "Ơ đang nói",
  happy: "Ơ vui",
  nervous: "Ơ hồi hộp",
  listen: "Ơ đang nghe",
};

export function Character({
  mood = "idle",
  size = 96,
  className,
  decorative = false,
}: {
  mood?: Mood;
  size?: number;
  className?: string;
  /** Hide from screen readers when the text next to it says the same */
  decorative?: boolean;
}) {
  const dy = mood === "nervous" ? 1 : 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 8 120 106"
      className={cn("shrink-0", className)}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : LABEL[mood]}
      aria-hidden={decorative || undefined}
    >
      <g fill="#FFFFFF" stroke={LINE} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx={47} cy={103} rx={8} ry={4.5} />
        <ellipse cx={73} cy={103} rx={8} ry={4.5} />
        {ARMS[mood].map(([cx, cy, r]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={5} ry={7.5} transform={`rotate(${r} ${cx} ${cy})`} />
        ))}
        <path d={mood === "nervous" ? BODY_NERVOUS : BODY} />
      </g>
      <path d={HOOK} transform={dy ? `translate(0 ${dy * 2})` : undefined} fill="none" stroke={LINE} strokeWidth={2.4} strokeLinecap="round" />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      <g transform={dy ? "translate(0 1)" : undefined}>
        <ellipse cx={36} cy={68} rx={6.5} ry={3.6} fill={BLUSH} />
        <ellipse cx={84} cy={68} rx={6.5} ry={3.6} fill={BLUSH} />
        <path
          d="M32.5 69.5 l2.2 -3 M36 69.5 l2.2 -3 M39.5 69.5 l2.2 -3 M80.5 69.5 l2.2 -3 M84 69.5 l2.2 -3 M87.5 69.5 l2.2 -3"
          stroke={BLUSH_LINE}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      </g>
      {mood === "talk" && (
        <path d="M106 52 q4 2 2 6 M111 46 q7 5 3 13" fill="none" stroke="#FF5A1F" strokeWidth={2.2} strokeLinecap="round" />
      )}
      {mood === "happy" && (
        <path d="M10 30 l4 4 M14 26 v6 M6 32 h6 M108 24 l-4 4 M106 18 v7" stroke="#FFB42E" strokeWidth={2} strokeLinecap="round" />
      )}
      {mood === "nervous" && (
        <path
          d="M96 30 C 99 36, 102 39, 102 42 a4 4 0 0 1 -8 0 C 94 39, 96 36, 96 30 Z"
          fill="#CFE8FF"
          stroke={LINE}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      )}
      {mood === "listen" && (
        <path d="M12 50 q-5 7 0 14 M6 45 q-9 12 0 24" fill="none" stroke="#5B63D3" strokeWidth={2.2} strokeLinecap="round" />
      )}
    </svg>
  );
}

/** Ơ with a speech bubble. Renders only the text when Ơ is turned off. */
export function CharacterSays({
  mood = "idle",
  size = 76,
  enabled = true,
  children,
  className,
}: {
  mood?: Mood;
  size?: number;
  enabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!enabled) {
    return <p className={cn("text-[15px] font-semibold leading-snug text-ink-2", className)}>{children}</p>;
  }
  return (
    <div className={cn("flex items-end gap-2.5", className)}>
      <Character mood={mood} size={size} decorative />
      <p className="mb-3 rounded-[16px_16px_16px_4px] bg-surface-2 px-3.5 py-3 text-[15px] font-semibold leading-snug text-ink">
        {children}
      </p>
    </div>
  );
}
