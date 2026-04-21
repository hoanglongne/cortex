"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { roadmapData, type RoadmapPhase } from "@/data/roadmap";

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

const timelineItem = {
    hidden: { opacity: 0, x: -30 },
    show: {
        opacity: 1,
        x: 0,
        transition: { type: "spring" as const, stiffness: 280, damping: 26 },
    },
};

export default function RoadmapSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [activePhase, setActivePhase] = useState<RoadmapPhase>("2026");

    const filteredMilestones =
        activePhase === "2026"
            ? roadmapData.filter((m) => m.year === 2026)
            : roadmapData;

    return (
        <section
            id="roadmap"
            ref={ref}
            className="relative w-full overflow-hidden border-t border-[rgba(255,255,255,0.06)] py-32 md:py-40"
        >
            <motion.div
                variants={container}
                initial="hidden"
                animate={isInView ? "show" : "hidden"}
                className="mx-auto max-w-6xl px-6"
            >
                {/* Overline */}
                <motion.span
                    variants={item}
                    className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.5)]"
                >
                    The Roadmap
                </motion.span>

                {/* Heading */}
                <motion.h2
                    variants={item}
                    className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-[1.0] tracking-tight text-white md:text-6xl"
                >
                    Kế Hoạch Chinh Phục.
                </motion.h2>

                {/* Description */}
                <motion.p
                    variants={item}
                    className="mt-6 max-w-2xl text-lg leading-relaxed text-[rgba(255,255,255,0.6)]"
                >
                    Chu kỳ phát triển 6-8 tuần. Mỗi app đi vào production khi{" "}
                    <span className="font-medium text-white">hoàn hảo</span> — không sớm
                    hơn, không muộn hơn.
                </motion.p>

                {/* Toggle Switch */}
                <motion.div variants={item} className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <span className="font-mono text-sm uppercase tracking-[0.15em] text-[rgba(255,255,255,0.5)]">
                        View Phase:
                    </span>
                    <div className="relative inline-flex rounded-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.6)] p-1">
                        <button
                            onClick={() => setActivePhase("2026")}
                            className={`
                relative z-10 px-6 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors
                ${activePhase === "2026"
                                    ? "text-white"
                                    : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
                                }
              `}
                        >
                            2026: The English Foundation
                        </button>
                        <button
                            onClick={() => setActivePhase("2027")}
                            className={`
                relative z-10 px-6 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors
                ${activePhase === "2027"
                                    ? "text-white"
                                    : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
                                }
              `}
                        >
                            2027: The Multilingual Pivot
                        </button>

                        {/* Animated background */}
                        <motion.div
                            className="absolute top-1 h-[calc(100%-8px)] rounded-sm border border-[rgba(0,137,255,1)] bg-[rgba(0,255,255,0.12)]"
                            initial={false}
                            animate={{
                                left: activePhase === "2026" ? "4px" : "calc(50%)",
                                width: activePhase === "2026" ? "calc(50% - 4px)" : "calc(50% - 4px)",
                            }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                    </div>
                </motion.div>

                {/* Timeline */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePhase}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-16 relative"
                    >
                        {/* Vertical line */}
                        <div className="absolute left-[19px] top-0 h-full w-[1px] bg-gradient-to-b from-[rgba(0,255,255,0.4)] via-[rgba(0,137,255,0.3)] to-transparent md:left-[23px]" />

                        {/* Milestones */}
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
                            {filteredMilestones.map((milestone, index) => (
                                <motion.div
                                    key={milestone.id}
                                    variants={timelineItem}
                                    className="relative flex gap-6 md:gap-8"
                                >
                                    {/* Node */}
                                    <div className="relative z-10 flex-shrink-0">
                                        <div
                                            className="h-10 w-10 rounded-full border-2 bg-[#0f0f0f] md:h-12 md:w-12"
                                            style={{
                                                borderColor: "#0089ff",
                                                boxShadow: "0 0 16px rgba(0,137,255,0.4)",
                                            }}
                                        >
                                            <div className="flex h-full items-center justify-center font-mono text-xs font-medium text-white">
                                                {milestone.quarter}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 rounded-sm border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] p-6 backdrop-blur-sm transition-all hover:border-[rgba(255,255,255,0.12)] md:p-8">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-sans text-xl font-medium leading-tight text-white md:text-2xl">
                                                    {milestone.description}
                                                </h3>
                                                <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
                                                    {milestone.focus}
                                                </p>
                                            </div>
                                            <span className="font-mono text-sm font-medium text-signal-blue">
                                                {milestone.year}
                                            </span>
                                        </div>

                                        {/* Apps */}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {milestone.apps.map((app) => (
                                                <span
                                                    key={app}
                                                    className="inline-block rounded-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-3 py-1 font-mono text-xs text-[rgba(255,255,255,0.7)]"
                                                >
                                                    {app}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </section>
    );
}
