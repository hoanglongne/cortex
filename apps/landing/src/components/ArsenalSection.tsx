"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ecosystemApps, type Pillar } from "@/data/ecosystem";
import FilterBar from "./FilterBar";
import AppCard from "./AppCard";

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.03,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 450, damping: 32 },
    },
};

export default function ArsenalSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [activePillar, setActivePillar] = useState<Pillar | "All">("All");

    // Filter apps: Live or Development status only
    const arsenalApps = ecosystemApps.filter(
        (app) => app.status === "Live" || app.status === "Development"
    );

    // Apply pillar filter
    const filteredApps =
        activePillar === "All"
            ? arsenalApps
            : arsenalApps.filter((app) => app.pillar === activePillar);

    return (
        <section
            id="ecosystem"
            ref={ref}
            className="relative w-full overflow-hidden border-t border-[rgba(255,255,255,0.06)] py-32 md:py-40"
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
                    The Arsenal
                </motion.span>

                {/* Heading */}
                <motion.h2
                    variants={item}
                    className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-[1.0] tracking-tight text-white md:text-6xl"
                >
                    Vũ Khí Chiến Đấu.
                    <br />
                    Không Dư Thừa. Chỉ Hiệu Quả.
                </motion.h2>

                {/* Description */}
                <motion.p
                    variants={item}
                    className="mt-6 max-w-2xl text-lg leading-relaxed text-[rgba(255,255,255,0.6)]"
                >
                    Mỗi app giải quyết{" "}
                    <span className="font-medium text-white">đúng một</span> điểm yếu cụ
                    thể. Không bloatware. Không tính năng vô nghĩa. Pure function —
                    surgical precision.
                </motion.p>

                {/* Filter Bar */}
                <motion.div variants={item} className="mt-12">
                    <FilterBar
                        activePillar={activePillar}
                        onFilterChange={setActivePillar}
                    />
                </motion.div>

                {/* Bento Grid */}
                <div className="mt-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePillar}
                            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {filteredApps.map((app, index) => (
                                <AppCard key={app.id} app={app} index={index} />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Empty state */}
                    {filteredApps.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <p className="font-mono text-sm uppercase tracking-[0.2em] text-[rgba(255,255,255,0.3)]">
                                No apps in this category yet
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </section>
    );
}
