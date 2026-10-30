/** Hand-drawn marks: they sit on top of words and cards like pen on paper. */
export function Circled({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <svg aria-hidden viewBox="0 0 200 80" preserveAspectRatio="none" className="absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)] text-pen">
        <path d="M14 46 C 8 14, 120 4, 176 16 C 204 24, 196 62, 120 70 C 60 76, 6 64, 12 36 C 14 26, 40 16, 66 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 12" className={`h-3 w-28 text-moss ${className}`}>
      <path d="M2 7 Q 12 0 22 7 T 42 7 T 62 7 T 82 7 T 102 7 T 118 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 90 60" className={`h-14 w-20 text-ink-2 ${className}`}>
      <path d="M4 8 C 30 0, 70 14, 74 46" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M62 38 L 75 50 L 82 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Handwritten words in the margin. */
export function Hand({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-hand text-2xl leading-none text-pen ${className}`}>{children}</span>;
}

/** A paper note: slightly turned, with tape. */
export function Note({ children, tilt = 0, tone = "white", className = "" }: { children: React.ReactNode; tilt?: number; tone?: "white" | "sun" | "sky" | "blush" | "moss"; className?: string }) {
  const bg = { white: "bg-white", sun: "bg-sun/80", sky: "bg-sky", blush: "bg-blush", moss: "bg-moss-soft" }[tone];
  return (
    <div style={{ transform: `rotate(${tilt}deg)` }} className={`tape relative rounded-sm p-5 shadow-[3px_5px_0_0_rgba(31,29,26,0.1)] ${bg} ${className}`}>
      {children}
    </div>
  );
}
