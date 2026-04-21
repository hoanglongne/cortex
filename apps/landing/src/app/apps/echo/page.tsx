"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Activity, RefreshCw, Speaker, TrendingUp } from "lucide-react";

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.06,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 350, damping: 30 },
    },
};

const features = [
    {
        icon: Speaker,
        title: "Nghe Và Lặp Ngay",
        description:
            "Không dừng. Không phân tích. Nghe tiếng native → lặp lại ngay lập tức. Cơ học tập phản xạ, không phải ý thức.",
    },
    {
        icon: RefreshCw,
        title: "Vòng Lặp 50 Lần",
        description:
            "Cùng câu 50 lần liên tiếp. Giọng thay đổi mỗi vòng. Cơ buộc phải nhớ mẫu, không phải từng từ.",
    },
    {
        icon: Activity,
        title: "Phân Tích Sóng Âm",
        description:
            "AI so sánh sóng âm của bạn vs native. Cao độ sai? Nhấn sai? Tốc độ chậm? Bạn thấy rõ lỗi.",
    },
    {
        icon: TrendingUp,
        title: "Mức Độ Tăng Dần",
        description:
            "Bắt đầu 3 từ. Rồi 5. Rồi 10. Rồi cả câu phức. Cơ xây dựng bộ nhớ theo lớp.",
    },
];

export default function EchoPage() {
    return (
        <main className="min-h-screen bg-void-black text-white">
            {/* Back Navigation */}
            <div className="border-b border-border-06 bg-void-black">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ghost-white transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Về Trang Chủ
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-border-06 py-32 md:py-48">
                {/* Background Glow */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06]"
                    style={{
                        background:
                            "radial-gradient(circle, #22d3ee 0%, transparent 70%)",
                    }}
                />

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="relative z-10 mx-auto max-w-5xl px-6 text-center"
                >
                    {/* App Badge */}
                    <motion.div variants={item} className="mb-6 flex items-center justify-center gap-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-ghost-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-ghost-white" />
                            Idea
                        </span>
                        <span className="text-whisper-white">•</span>
                        <span className="font-mono text-xs uppercase tracking-wider text-whisper-white">
                            Biological
                        </span>
                        <span className="text-whisper-white">•</span>
                        <span className="font-mono text-xs uppercase tracking-wider text-whisper-white">
                            Q3 2026
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        variants={item}
                        className="font-sans text-6xl font-medium leading-[0.95] tracking-tight text-white md:text-8xl"
                    >
                        Echo
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        variants={item}
                        className="mx-auto mt-8 max-w-3xl text-2xl leading-tight text-ghost-white md:text-3xl"
                    >
                        Shadowing Không Để Bắt Chước. Để Điều Kiện Hóa Cơ.
                    </motion.p>

                    {/* Pure Function */}
                    <motion.div
                        variants={item}
                        className="mx-auto mt-12 max-w-2xl rounded-sm border border-phantom-white bg-pure-black p-6"
                    >
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-whisper-white">
                            Pure Function
                        </span>
                        <p className="mt-3 text-sm leading-relaxed text-ghost-white">
                            Giải quyết CHÍNH XÁC một vấn đề: Điều kiện hóa bộ nhớ cơ giọng
                            qua vòng lặp shadowing lặp lại.
                        </p>
                    </motion.div>

                    {/* Vote CTA */}
                    <motion.div variants={item} className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <a
                            href="/#incubator"
                            className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-[#0a0a0a] transition-opacity hover:opacity-90"
                        >
                            Vote Cho Echo
                        </a>
                        <a
                            href="#concept"
                            className="inline-flex items-center justify-center gap-2 rounded-sm border border-phantom-white bg-transparent px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-white transition-all hover:border-white hover:bg-[rgba(255,255,255,0.05)]"
                        >
                            Xem Concept
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* Concept */}
            <section id="concept" className="border-b border-border-06 py-32 md:py-40">
                <div className="mx-auto max-w-6xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-whisper-white">
                            Concept
                        </span>
                        <h2 className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-none tracking-tight text-white md:text-6xl">
                            Cơ Học Tập Qua Lặp Lại, Não Không
                        </h2>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ghost-white">
                            Giọng native không đến từ hiểu biết ngữ pháp. Nó đến từ cơ được điều kiện hóa.
                            Echo buộc bạn lặp lại 50 lần liên tiếp. Cơ nhớ mẫu. Não bộ nghỉ ngơi.
                        </p>
                    </motion.div>

                    {/* Process Steps */}
                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        {[
                            {
                                step: "01",
                                title: "Nghe Native",
                                description:
                                    "AI phát âm native. Không chữ. Không nghĩa. Chỉ có âm thanh thuần túy.",
                            },
                            {
                                step: "02",
                                title: "Lặp Ngay Lập Tức",
                                description:
                                    "Không dừng suy nghĩ. Nghe xong → nói ngay. Cơ phản xạ, não không kịp phân tích.",
                            },
                            {
                                step: "03",
                                title: "50 Vòng Lặp",
                                description:
                                    "Cùng câu 50 lần. Giọng khác nhau mỗi vòng. Cơ buộc phải nhớ cốt lõi, không phải bề mặt.",
                            },
                        ].map((step, index) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                                className="rounded-sm border border-phantom-white bg-pure-black p-8"
                            >
                                <span className="font-mono text-4xl font-normal text-[#22d3ee]">
                                    {step.step}
                                </span>
                                <h3 className="mt-4 font-sans text-xl font-medium leading-tight text-white">
                                    {step.title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-ghost-white">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="border-b border-border-06 py-32 md:py-40">
                <div className="mx-auto max-w-6xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-whisper-white">
                            Tại Sao Echo?
                        </span>
                        <h2 className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-none tracking-tight text-white md:text-6xl">
                            Bốn Trụ Cột Điều Kiện Hóa Giọng
                        </h2>
                    </motion.div>

                    <div className="mt-16 grid gap-6 md:grid-cols-2">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                                className="rounded-sm border border-phantom-white bg-pure-black p-8"
                            >
                                <feature.icon className="h-8 w-8 text-[#22d3ee]" />
                                <h3 className="mt-6 font-sans text-2xl font-medium leading-tight text-white">
                                    {feature.title}
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed text-ghost-white">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CORTEX Integration */}
            <section className="border-b border-border-06 py-32 md:py-40">
                <div className="mx-auto max-w-6xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="rounded-sm border border-phantom-white bg-gradient-to-br from-[rgba(34,211,238,0.05)] to-transparent p-12 text-center md:p-16"
                    >
                        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-whisper-white">
                            Tích Hợp CORTEX
                        </span>
                        <h2 className="mt-6 font-sans text-4xl font-normal leading-tight tracking-tight text-white md:text-5xl">
                            Mẫu Của Bạn Theo Dõi Qua Apps
                        </h2>
                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-ghost-white">
                            Mọi âm thanh bạn phát sai trong Echo đều được CORTEX ghi lại.
                            Khi bạn mở Solilo, bạn sẽ nói chính những mẫu đó.
                            Khi bạn mở Dialecta, bạn sẽ nghe chúng qua giọng khác nhau.
                            <span className="mt-4 block font-medium text-white">
                                Lỗi giọng không trốn được. Chúng đuổi theo bạn đến mỗi app.
                            </span>
                        </p>

                        <Link
                            href="/#cortex"
                            className="mt-8 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.15em] text-[#22d3ee] transition-colors hover:text-white"
                        >
                            Tìm Hiểu Về CORTEX →
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="border-t border-border-06 py-24">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <h2 className="font-sans text-4xl font-normal leading-tight text-white md:text-5xl">
                        Muốn Echo Ra Đời?
                    </h2>
                    <p className="mt-4 text-lg text-ghost-white">
                        Vote để đẩy Echo lên đầu hàng đợi phát triển.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <a
                            href="/#incubator"
                            className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-[#0a0a0a] transition-opacity hover:opacity-90"
                        >
                            Vote Cho Echo
                        </a>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 rounded-sm border border-phantom-white bg-transparent px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-white transition-all hover:border-white hover:bg-[rgba(255,255,255,0.05)]"
                        >
                            Về Trang Chủ
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
