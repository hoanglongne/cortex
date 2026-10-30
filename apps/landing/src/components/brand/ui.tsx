import Link from "next/link";

/** A word with a marker stroke under it. */
export function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative whitespace-nowrap">
      <span aria-hidden className="absolute inset-x-[-2px] bottom-[0.08em] -z-0 h-[0.42em] -rotate-1 rounded-sm bg-sun" />
      <span className="relative">{children}</span>
    </span>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-moss">{children}</p>;
}

export function Button({ href, children, tone = "solid" }: { href: string; children: React.ReactNode; tone?: "solid" | "line" }) {
  const cls =
    tone === "solid"
      ? "bg-ink text-paper hover:bg-moss-strong"
      : "border border-ink/30 text-ink hover:border-ink hover:bg-paper-2";
  const base = `inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors ${cls}`;
  return href.startsWith("/") ? (
    <Link href={href} className={base}>
      {children}
    </Link>
  ) : (
    <a href={href} className={base}>
      {children}
    </a>
  );
}

/** A phone-shaped frame around a real screenshot. */
export function Phone({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`w-[220px] shrink-0 rounded-[2rem] border-[6px] border-ink bg-ink shadow-[6px_8px_0_0_rgba(31,29,26,0.12)] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="block w-full rounded-[1.5rem]" />
    </div>
  );
}

/** A step or fact: a number in mono, a line, a sentence. */
export function Fact({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-rule pt-5">
      <p className="font-mono text-xs text-moss">{n}</p>
      <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{children}</p>
    </div>
  );
}
