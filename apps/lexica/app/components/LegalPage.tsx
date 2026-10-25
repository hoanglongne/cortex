import Link from 'next/link';

export type LegalSection = { title: string; body: React.ReactNode };

/** Shared layout of /privacy and /terms: plain sections, readable on a phone. */
export default function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: React.ReactNode; sections: LegalSection[] }) {
    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <article className="max-w-xl mx-auto space-y-5 text-sm leading-relaxed text-ink-2">
                <header className="space-y-1">
                    <h1 className="text-xl font-semibold text-ink">{title}</h1>
                    <p className="text-xs text-subtle">Cập nhật {updated} · bản thử nghiệm</p>
                </header>
                <div className="text-muted">{intro}</div>
                {sections.map((s, i) => (
                    <section key={s.title} className="space-y-2">
                        <h2 className="font-semibold text-ink">
                            {i + 1}. {s.title}
                        </h2>
                        <div className="space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">{s.body}</div>
                    </section>
                ))}
                <footer className="pt-2 border-t border-line text-xs text-muted flex flex-wrap gap-x-4 gap-y-1">
                    <Link href="/privacy" className="hover:text-ink">Chính sách riêng tư</Link>
                    <Link href="/terms" className="hover:text-ink">Điều khoản sử dụng</Link>
                    <Link href="/feedback" className="hover:text-ink">Góp ý, liên hệ</Link>
                </footer>
            </article>
        </div>
    );
}
