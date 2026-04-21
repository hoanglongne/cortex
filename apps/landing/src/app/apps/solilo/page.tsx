"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mic, Target, TrendingUp, Zap } from "lucide-react";

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
        icon: Mic,
        title: "Không Gian Riêng Tư",
        description:
            "Không khán giả. Không áp lực. Chỉ có bạn, giọng nói của bạn, và bức tường bạn đang phá vỡ.",
    },
    {
        icon: Target,
        title: "Độ Khó Tăng Dần",
        description:
            "Bắt đầu với 10 giây. Xây dựng lên 2 phút độc thoại. Lo âu của bạn thích nghi, bạn chinh phục.",
    },
    {
        icon: TrendingUp,
        title: "Lặp Lại Theo Khoảng Cách",
        description:
            "Các bài tập bạn sợ sẽ quay lại theo chu kỳ tính toán. Đối mặt lại. Và lại. Cho đến khi nỗi sợ thành phản xạ.",
    },
    {
        icon: Zap,
        title: "Phản Hồi Thời Gian Thực",
        description:
            "AI phân tích các mẫu do dự, từ lấp đầy (à, ừm, kiểu), và rung giọng. Bạn thấy bóng ma trong máy móc.",
    },
];

export default function SoliloPage() {
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
                            "radial-gradient(circle, #0089ff 0%, transparent 70%)",
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
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-whisper-white">
                            Psychological Pillar
                        </span>
                    </motion.div>

                    {/* App Name */}
                    <motion.h1
                        variants={item}
                        className="font-sans text-7xl font-normal leading-[0.9] tracking-tighter text-white md:text-8xl"
                    >
                        Solilo
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        variants={item}
                        className="mt-8 font-sans text-3xl font-normal leading-tight tracking-tight text-white md:text-4xl"
                    >
                        Dừng Suy Nghĩ Quá Nhiều.
                        <br />
                        Bắt Đầu Nói.
                    </motion.p>

                    {/* Pure Function */}
                    <motion.div
                        variants={item}
                        className="mx-auto mt-12 max-w-3xl rounded-sm border border-phantom-white bg-pure-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                    >
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-whisper-white">
                            Pure Function
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-ghost-white">
                            Giải quyết CHÍNH XÁC một vấn đề: Loại bỏ lo âu khi nói thông qua các bài tập lặp lại độc thoại cưỡng bức.
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
                            Xem Cách Hoạt Động
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
                            Tâm Lý Học Rất Đơn Giản
                        </h2>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ghost-white">
                            Nỗi sợ nói xuất phát từ nỗi sợ bị phán xét. Loại bỏ khán giả. Cưỡng bức lặp lại. Não bộ tái kết nối. Lo âu tan biến.
                        </p>
                    </motion.div>

                    {/* Process Steps */}
                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        {[
                            {
                                step: "01",
                                title: "Ghi Âm Độc Thoại",
                                description:
                                    "Vào buồng. Không ai đang xem. Nói to câu nhắc lên. 10 giây. Vậy thôi.",
                            },
                            {
                                step: "02",
                                title: "Phân Tích Mẫu",
                                description:
                                    "AI theo dõi do dự, từ lấp đầy (à, ừm, kiểu), và rung giọng. Bạn thấy dữ liệu. Không giấu được.",
                            },
                            {
                                step: "03",
                                title: "Lặp Lại Cho Mượt",
                                description:
                                    "Cùng câu nhắc quay lại sau 3 ngày. Rồi 7. Rồi 14. Lặp lại theo khoảng cách giết chết lo âu qua phơi nhiễm.",
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
                            Tại Sao Solilo?
                        </span>
                        <h2 className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-none tracking-tight text-white md:text-6xl">
                            Bốn Trụ Cột Loại Bỏ Lo Âu
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
                                    delay: index * 0.08,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                                className="group rounded-sm border border-phantom-white bg-pure-black p-8 transition-all hover:border-[rgba(255,255,255,0.4)]"
                            >
                                <feature.icon className="h-10 w-10 text-signal-blue" strokeWidth={1.5} />
                                <h3 className="mt-6 font-sans text-xl font-medium leading-tight text-white">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 text-base leading-relaxed text-ghost-white">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CORTEX Integration */}
            <section className="py-32 md:py-40">
                <div className="mx-auto max-w-6xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="rounded-sm border border-phantom-white bg-gradient-to-br from-[rgba(0,137,255,0.05)] to-transparent p-12 text-center md:p-16"
                    >
                        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-whisper-white">
                            Tích Hợp CORTEX
                        </span>
                        <h2 className="mt-6 font-sans text-4xl font-normal leading-tight tracking-tight text-white md:text-5xl">
                            Lo Âu Của Bạn Không Dừng Lại Ở Đây
                        </h2>
                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-ghost-white">
                            Mọi mẫu do dự trong Solilo đều được CORTEX theo dõi. Khi bạn mở
                            Oratio (Combat), bạn sẽ đối mặt với chính xác những cụm từ khiến bạn vấp.
                            Khi bạn mở Lexica (Biological), bạn sẽ luyện tập những từ bạn tránh né.
                            <span className="mt-4 block font-medium text-white">
                                Các app không để bạn trốn. Chúng bắt bạn phải đối mặt.
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
                        Sẵn Sàng Dừng Sợ Micro?
                    </h2>
                    <p className="mt-4 text-lg text-ghost-white">
                        Bắt đầu với 10 giây. Xây dựng lên trôi chảy. Miễn phí mãi mãi.
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
