"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ecosystemApps } from "@/data/ecosystem";
import IdeaCard from "./IdeaCard";

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 300, damping: 28 },
    },
};

export default function IncubatorSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Filter apps: Idea status only, sorted by upvotes descending
    const ideaApps = ecosystemApps
        .filter((app) => app.status === "Idea")
        .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

    return (
        <section
            id="incubator"
            ref={ref}
            className="relative w-full overflow-hidden border-t border-[rgba(255,255,255,0.06)] bg-gradient-to-b from-transparent to-[rgba(0,137,255,0.02)] py-32 md:py-40"
        >
            <motion.div
                variants={container}
                initial="hidden"
                animate={isInView ? "show" : "hidden"}
                className="mx-auto max-w-7xl px-6"
            >
                {/* Overline */}
                <motion.span
                    variants={item}
                    className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.5)]"
                >
                    Vườn Ươm Ý Tưởng
                </motion.span>

                {/* Heading */}
                <motion.h2
                    variants={item}
                    className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-[1.0] tracking-tight text-white md:text-6xl"
                >
                    Từ Ý Tưởng Đến Hiện Thực.
                </motion.h2>

                {/* Description */}
                <motion.p
                    variants={item}
                    className="mt-6 max-w-2xl text-lg leading-relaxed text-[rgba(255,255,255,0.6)]"
                >
                    Những app này chưa tồn tại — nhưng sẽ sớm ra mắt. Vote để cho chúng
                    tôi biết bạn muốn đối đầu với điểm yếu nào tiếp theo.{" "}
                    <span className="font-medium text-white">
                        Phát triển hướng tới cộng đồng.
                    </span>
                </motion.p>

                {/* Ideas Grid */}
                <motion.div
                    variants={item}
                    className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
                >
                    {ideaApps.map((app, index) => (
                        <IdeaCard key={app.id} app={app} index={index} />
                    ))}
                </motion.div>

                {/* CTA Card */}
                <motion.div
                    variants={item}
                    className="mx-auto mt-16 max-w-3xl rounded-sm border border-[rgba(255,255,255,0.3)] bg-gradient-to-br from-[rgba(0,137,255,0.05)] to-transparent p-8 text-center md:p-12"
                >
                    <h3 className="font-sans text-2xl font-normal leading-tight text-white md:text-3xl">
                        Có một ý tưởng khác?
                    </h3>
                    <p className="mt-4 text-base text-[rgba(255,255,255,0.6)]">
                        Đề xuất một công cụ EdTech mới giải quyết một điểm yếu ngôn ngữ cụ
                        thể. Nếu đủ votes, chúng tôi sẽ build.
                    </p>
                    <button className="group/cta relative mt-6 inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm border border-[rgba(0,137,255,1)] bg-[rgba(0,137,255,0.12)] px-6 py-3 font-mono text-sm uppercase tracking-[0.15em] text-white transition-all hover:border-[rgba(0,137,255,1)]">
                        <span className="relative z-10">Đề Xuất Ý Tưởng</span>
                        <motion.div
                            className="absolute inset-0 -z-[1] bg-[rgba(0,137,255,0.15)]"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.4 }}
                        />
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
}
