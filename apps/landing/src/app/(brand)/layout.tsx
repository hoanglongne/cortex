import Link from "next/link";

const NAV = [
  { href: "/hoc-vien", label: "Người học" },
  { href: "/chung-chi", label: "IELTS" },
  { href: "/giao-vien", label: "Giáo viên" },
  { href: "/trung-tam", label: "Trung tâm" },
  { href: "/dang-nghi-toi", label: "Đang nghĩ tới" },
];

/** The light, warm shell of the public pages. The older dark pages (/apps, /auth) keep their own look. */
export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="notebook min-h-screen overflow-x-clip font-body text-ink">
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight">
            <span aria-hidden className="h-3 w-3 rounded-full bg-moss" />
            Cortex
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-ink-2 md:flex" aria-label="Chính">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/auth" className="text-sm font-semibold text-moss-strong hover:underline">
            Đăng nhập
          </Link>
        </div>
        <nav className="flex gap-5 overflow-x-auto border-t border-rule px-5 py-2 text-sm text-ink-2 md:hidden" aria-label="Chính (điện thoại)">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <footer className="mt-24 border-t border-rule bg-paper-2">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-serif text-xl font-semibold">Cortex</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-2">
              Học tiếng Anh nhớ lâu, dạy tiếng Anh thấy rõ. Làm ở Việt Nam, cho người học và thầy cô Việt Nam.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-ink-2">
            <li className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">Cho ai</li>
            {NAV.filter((n) => n.href !== "/dang-nghi-toi").map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-2 text-sm text-ink-2">
            <li className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">Lưu ý</li>
            <li>Điểm hiển thị là ước lượng, không phải điểm thi thật.</li>
            <li>Giá hiện là giá thử nghiệm.</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
