"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Crosshair, Swords, Timer, Trophy } from "lucide-react";

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
        icon: Timer,
        title: "90 Giây Hoặc Im Lặng",
        description:
            "Chủ đề xuất hiện. Đồng hồ chạy. 90 giây để tranh luận. Không chuẩn bị. Não bộ buộc phải phản xạ.",
    },
    {
        icon: Swords,
        title: "AI Phản Bác Thời Gian Thực",
        description:
            "Bạn nói, AI nghe và phản bác ngay lập tức. Điểm yếu lộ ra. Bạn buộc phải bảo vệ luận điểm.",
    },
    {
        icon: Crosshair,
        title: "Chủ Đề Bạn Sợ",
        description:
            "Không random. CORTEX biết bạn yếu về gì. Chính trị? Khoa học? Triết học? Nó buộc bạn đối mặt.",
    },
    {
        icon: Trophy,
        title: "Điểm Theo Logic",
        description:
            "Không phải ai nói hay hơn. Ai có cấu trúc rõ, bằng chứng mạnh, và phản bác chặt. Logic thắng.",
    },
];

export default function OratioPage() {
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
                            "radial-gradient(circle, #0007cd 0%, transparent 70%)",
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
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-signal-blue">
                            <span className="h-1.5 w-1.5 rounded-full bg-signal-blue" />
                            Live
                        </span>
                        <span className="text-whisper-white">•</span>
                        <span className="font-mono text-xs uppercase tracking-wider text-whisper-white">
                            Combat
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        variants={item}
                        className="font-sans text-6xl font-medium leading-[0.95] tracking-tight text-white md:text-8xl"
                    >
                        Oratio
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        variants={item}
                        className="mx-auto mt-8 max-w-3xl text-2xl leading-tight text-ghost-white md:text-3xl"
                    >
                        Tranh Luận Không Để Thắng. Để Trôi Chảy Dưới Áp Lực.
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
                            Giải quyết CHÍNH XÁC một vấn đề: Xây dựng lưu loát tranh luận
                            dưới áp lực thời gian bó buộc.
                        </p>
                    </motion.div>

                    {/* CTA */}
                    <motion.div variants={item} className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-[#0a0a0a] transition-opacity hover:opacity-90"
                        >
                            Bắt Đầu Miễn Phí
                        </a>
                        <a
                            href="#how-it-works"
                            className="inline-flex items-center justify-center gap-2 rounded-sm border border-phantom-white bg-transparent px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-white transition-all hover:border-white hover:bg-[rgba(255,255,255,0.05)]"
                        >
                            Xem Cơ Chế
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="border-b border-border-06 py-32 md:py-40">
                <div className="mx-auto max-w-6xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-whisper-white">
                            Cơ Chế
                        </span>
                        <h2 className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-none tracking-tight text-white md:text-6xl">
                            Tư Duy Dưới Thời Gian Bó Buộc
                        </h2>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ghost-white">
                            Tranh luận thật không cho bạn thời gian suy nghĩ. Câu hỏi đến, bạn phải trả lời.
                            Oratio buộc não bộ tư duy và nói cùng lúc. 90 giây. Hoặc im lặng.
                        </p>
                    </motion.div>

                    {/* Process Steps */}
                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        {[
                            {
                                step: "01",
                                title: "Nhận Chủ Đề",
                                description:
                                    "Một chủ đề gây tranh cãi xuất hiện. 10 giây để đọc. Không google. Không ghi chú. Chỉ có não bộ.",
                            },
                            {
                                step: "02",
                                title: "Tranh Luận 90 Giây",
                                description:
                                    "Đồng hồ chạy. Nói luận điểm, bằng chứng, phản bác. AI nghe và phản bác thời gian thực. Não bộ buộc phải bảo vệ.",
                            },
                            {
                                step: "03",
                                title: "Phân Tích Logic",
                                description:
                                    "AI chấm điểm cấu trúc, bằng chứng, phản bác. Bạn thấy điểm yếu. Chủ đề đó quay lại cho đến khi bạn thành thạo.",
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
                                <span className="font-mono text-4xl font-normal text-signal-blue">
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
                            Tại Sao Oratio?
                        </span>
                        <h2 className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-none tracking-tight text-white md:text-6xl">
                            Bốn Trụ Cột Xây Dựng Phản Xạ Tranh Luận
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
                                <feature.icon className="h-8 w-8 text-signal-blue" />
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
                        className="rounded-sm border border-phantom-white bg-gradient-to-br from-[rgba(0,7,205,0.05)] to-transparent p-12 text-center md:p-16"
                    >
                        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-whisper-white">
                            Tích Hợp CORTEX
                        </span>
                        <h2 className="mt-6 font-sans text-4xl font-normal leading-tight tracking-tight text-white md:text-5xl">
                            Điểm Yếu Của Bạn Trở Thành Chủ Đề
                        </h2>
                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-ghost-white">
                            Mọi từ bạn vấp trong Solilo đều xuất hiện trong tranh luận Oratio.
                            Mọi từ bạn quên trong Lexica buộc bạn phải dùng để lập luận.
                            Mọi giọng bạn yếu trong Dialecta xuất hiện trong đối thủ AI.
                            <span className="mt-4 block font-medium text-white">
                                CORTEX không để bạn trốn. Nó buộc mọi điểm yếu đối mặt với nhau.
                            </span>
                        </p>

                        <Link
                            href="/#cortex"
                            className="mt-8 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.15em] text-signal-blue transition-colors hover:text-white"
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
                        Sẵn Sàng Tranh Luận Dưới Áp Lực?
                    </h2>
                    <p className="mt-4 text-lg text-ghost-white">
                        Bắt đầu với 30 giây. Xây dựng lên 5 phút. Miễn phí mãi mãi.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-[#0a0a0a] transition-opacity hover:opacity-90"
                        >
                            Bắt Đầu Miễn Phí
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
