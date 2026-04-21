"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Eye, Gauge, ScanEye, Target } from "lucide-react";

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
        icon: ScanEye,
        title: "Eye-Tracking Thời Gian Thực",
        description:
            "Camera theo dõi mắt bạn. Mỗi lần quay lại. Mỗi lần nhảy sai. Mỗi lần dừng lâu. Bạn thấy hết.",
    },
    {
        icon: Gauge,
        title: "Tăng Tốc Độ Dần",
        description:
            "Bắt đầu 150 từ/phút. Rồi 200. Rồi 300. Rồi 500. Mắt buộc phải thích nghi với không thoải mái.",
    },
    {
        icon: Target,
        title: "Cắt Bỏ Subvocalization",
        description:
            "Não bộ đọc trong đầu làm bạn chậm. Visage buộc tốc độ quá nhanh để đọc thầm. Mắt thắng não.",
    },
    {
        icon: Eye,
        title: "Nhận Cụm, Không Từ",
        description:
            "Đọc từng từ là chậm. Mắt học nhận 3-5 từ cùng lúc. Cụm danh từ. Cụm động từ. Toàn bộ khối.",
    },
];

export default function VisagePage() {
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
                            "radial-gradient(circle, #a855f7 0%, transparent 70%)",
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
                            Q1 2027
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        variants={item}
                        className="font-sans text-6xl font-medium leading-[0.95] tracking-tight text-white md:text-8xl"
                    >
                        Visage
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        variants={item}
                        className="mx-auto mt-8 max-w-3xl text-2xl leading-tight text-ghost-white md:text-3xl"
                    >
                        Đọc Không Để Hiểu. Để Nhanh Với Hiểu.
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
                            Giải quyết CHÍNH XÁC một vấn đề: Rèn luyện tốc độ đọc và hiểu
                            qua hiệu chỉnh chuyển động mắt thời gian thực.
                        </p>
                    </motion.div>

                    {/* Vote CTA */}
                    <motion.div variants={item} className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <a
                            href="/#incubator"
                            className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-[#0a0a0a] transition-opacity hover:opacity-90"
                        >
                            Vote Cho Visage
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
                            Mắt Học Được Nhảy Nhanh Hơn
                        </h2>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ghost-white">
                            Người đọc chậm đọc từng từ. Người đọc nhanh nhận cụm. Visage theo dõi mắt bạn
                            qua camera. Buộc bạn nhảy xa hơn, dừng ít hơn. 500 từ/phút với hiểu 80%+.
                        </p>
                    </motion.div>

                    {/* Process Steps */}
                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        {[
                            {
                                step: "01",
                                title: "Hiệu Chỉnh Mắt",
                                description:
                                    "Camera theo dõi mắt. AI phát hiện quay lại, nhảy ngắn, dừng lâu. Bạn thấy thói quen xấu.",
                            },
                            {
                                step: "02",
                                title: "Buộc Tốc Độ",
                                description:
                                    "Văn bản tự động cuộn. 200 từ/phút. Rồi 300. Rồi 500. Quá nhanh để đọc thầm. Mắt phải thắng.",
                            },
                            {
                                step: "03",
                                title: "Kiểm Tra Hiểu",
                                description:
                                    "Đọc xong 3 câu hỏi về nội dung. Dưới 70% → giảm tốc độ. Trên 80% → tăng. Nhanh với hiểu.",
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
                                <span className="font-mono text-4xl font-normal text-[#a855f7]">
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
                            Tại Sao Visage?
                        </span>
                        <h2 className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-none tracking-tight text-white md:text-6xl">
                            Bốn Trụ Cột Tốc Độ Đọc
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
                                <feature.icon className="h-8 w-8 text-[#a855f7]" />
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
                        className="rounded-sm border border-phantom-white bg-gradient-to-br from-[rgba(168,85,247,0.05)] to-transparent p-12 text-center md:p-16"
                    >
                        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-whisper-white">
                            Tích Hợp CORTEX
                        </span>
                        <h2 className="mt-6 font-sans text-4xl font-normal leading-tight tracking-tight text-white md:text-5xl">
                            Văn Bản Bạn Đọc Chậm Quay Lại
                        </h2>
                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-ghost-white">
                            Mọi loại văn bản bạn đọc chậm trong Visage đều được CORTEX ghi lại.
                            Khi bạn mở Syntaxis, bạn phân tích cú pháp của văn bản đó.
                            Khi bạn mở Lexica, bạn học từ vựng xuất hiện trong văn bản đó.
                            <span className="mt-4 block font-medium text-white">
                                Điểm yếu đọc không trốn được. Chúng trở thành bài tập.
                            </span>
                        </p>

                        <Link
                            href="/#cortex"
                            className="mt-8 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.15em] text-[#a855f7] transition-colors hover:text-white"
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
                        Muốn Visage Ra Đời?
                    </h2>
                    <p className="mt-4 text-lg text-ghost-white">
                        Vote để đẩy Visage lên đầu hàng đợi phát triển.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <a
                            href="/#incubator"
                            className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-[#0a0a0a] transition-opacity hover:opacity-90"
                        >
                            Vote Cho Visage
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
