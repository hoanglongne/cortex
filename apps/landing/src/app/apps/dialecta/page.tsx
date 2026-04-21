"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Ear, Globe, Radio, Volume2 } from "lucide-react";

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
        icon: Globe,
        title: "20+ Giọng Vùng Miền",
        description:
            "British RP. Indian English. Australian. Southern US. Scottish. Mỗi ngày một giọng mới. Tai bạn phải thích nghi.",
    },
    {
        icon: Ear,
        title: "Nghe Không Đọc",
        description:
            "Không phụ đề. Không văn bản. Chỉ có âm thanh và 5 giây để chọn từ đúng. Tai buộc phải làm việc.",
    },
    {
        icon: Radio,
        title: "Nhiễu Nền Thực Tế",
        description:
            "Quán cà phê. Đường phố. Văn phòng. Não bộ học lọc noise. Đúng như cuộc sống thật.",
    },
    {
        icon: Volume2,
        title: "Tốc Độ Thay Đổi",
        description:
            "Chậm 0.75x cho tai mới. Tăng lên 1.25x khi bạn quen. Rồi 1.5x. Đến khi giọng nhanh trở thành bình thường.",
    },
];

export default function DialectaPage() {
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
                            "radial-gradient(circle, #0096ff 0%, transparent 70%)",
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
                            Cognitive
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        variants={item}
                        className="font-sans text-6xl font-medium leading-[0.95] tracking-tight text-white md:text-8xl"
                    >
                        Dialecta
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        variants={item}
                        className="mx-auto mt-8 max-w-3xl text-2xl leading-tight text-ghost-white md:text-3xl"
                    >
                        Giọng Không Để Nghe. Để Giải Mã Thời Gian Thực.
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
                            Giải quyết CHÍNH XÁC một vấn đề: Huấn luyện giải mã giọng nói
                            thời gian thực qua đa dạng vùng miền.
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
                            Rèn Luyện Tai, Không Phải Bộ Nhớ
                        </h2>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ghost-white">
                            Tai bạn không yếu. Nó chưa được huấn luyện với đa dạng. Dialecta
                            buộc bạn nghe 20+ giọng khác nhau mỗi ngày. Cho đến khi mọi giọng đều trở thành tiếng Anh.
                        </p>
                    </motion.div>

                    {/* Process Steps */}
                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        {[
                            {
                                step: "01",
                                title: "Nghe Giọng Mới",
                                description:
                                    "Mỗi ngày AI chọn một giọng vùng miền. Scottish hôm nay. Indian ngày mai. Tai không thích nhưng phải quen.",
                            },
                            {
                                step: "02",
                                title: "Chọn Từ Đúng",
                                description:
                                    "Nghe câu. 4 từ xuất hiện. 1 từ đúng. 5 giây để chọn. Không phụ đề. Chỉ có tai.",
                            },
                            {
                                step: "03",
                                title: "Tăng Độ Khó",
                                description:
                                    "Bắt đầu 0.75x tốc độ. Rồi 1x. Rồi 1.25x. Rồi thêm nhiễu nền. Tai buộc phải chuyên nghiệp.",
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
                            Tại Sao Dialecta?
                        </span>
                        <h2 className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-none tracking-tight text-white md:text-6xl">
                            Bốn Trụ Cột Giải Mã Giọng Nói
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
                        className="rounded-sm border border-phantom-white bg-gradient-to-br from-[rgba(0,150,255,0.05)] to-transparent p-12 text-center md:p-16"
                    >
                        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-whisper-white">
                            Tích Hợp CORTEX
                        </span>
                        <h2 className="mt-6 font-sans text-4xl font-normal leading-tight tracking-tight text-white md:text-5xl">
                            Giọng Bạn Yếu Không Biến Mất
                        </h2>
                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-ghost-white">
                            Mọi giọng bạn nhầm trong Dialecta đều được CORTEX theo dõi. Khi bạn mở
                            Oratio (Combat), bạn sẽ tranh luận với người có giọng đó.
                            Khi bạn mở Lexica (Biological), bạn sẽ nghe từ vựng qua giọng bạn yếu.
                            <span className="mt-4 block font-medium text-white">
                                Giọng không để trốn. Chúng buộc bạn đối mặt ở mọi app.
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
                        Sẵn Sàng Rèn Luyện Tai?
                    </h2>
                    <p className="mt-4 text-lg text-ghost-white">
                        Bắt đầu với 1 giọng. Xây dựng lên 20. Miễn phí mãi mãi.
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
