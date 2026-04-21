"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ecosystemApps } from "@/data/ecosystem";

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
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

export default function CortexSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Get the 4 live apps for the node graph
    const liveApps = ecosystemApps.filter((app) => app.status === "Live");

    return (
        <section
            id="cortex"
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
                    The Operating System
                </motion.span>

                {/* Heading */}
                <motion.h2
                    variants={item}
                    className="mt-4 max-w-3xl font-sans text-5xl font-normal leading-[1.0] tracking-tight text-white md:text-6xl"
                >
                    CORTEX: Não Trung Ương
                </motion.h2>

                {/* Description */}
                <motion.p
                    variants={item}
                    className="mt-6 max-w-2xl text-lg leading-relaxed text-[rgba(255,255,255,0.6)]"
                >
                    CORTEX không phải là một app — nó là{" "}
                    <span className="font-medium text-white">hệ điều hành ngôn ngữ</span>{" "}
                    chạy ngầm phía sau. Mọi sai lầm bạn mắc phải trong App A sẽ được ghi
                    nhận, phân tích, và{" "}
                    <span className="font-medium text-white">
                        ép bạn đối đầu lại chúng
                    </span>{" "}
                    trong App B. Không có chỗ trốn.
                </motion.p>

                {/* Node Graph */}
                <motion.div variants={item} className="mt-16 flex justify-center">
                    <div className="relative h-[400px] w-full max-w-2xl md:h-[500px]">
                        <svg
                            viewBox="0 0 600 500"
                            className="h-full w-full"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Connection lines */}
                            {liveApps.map((app, index) => {
                                const angle = (index * Math.PI * 2) / liveApps.length - Math.PI / 2;
                                const x = 300 + Math.cos(angle) * 180;
                                const y = 250 + Math.sin(angle) * 180;

                                return (
                                    <motion.line
                                        key={`line-${app.id}`}
                                        x1="300"
                                        y1="250"
                                        x2={x}
                                        y2={y}
                                        stroke="url(#lineGradient)"
                                        strokeWidth="1"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={
                                            isInView
                                                ? { pathLength: 1, opacity: 0.4 }
                                                : { pathLength: 0, opacity: 0 }
                                        }
                                        transition={{
                                            duration: 1.2,
                                            delay: 0.3 + index * 0.1,
                                            ease: "easeOut",
                                        }}
                                    />
                                );
                            })}

                            {/* Gradient definition for lines */}
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0089ff" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#0089ff" stopOpacity="0.2" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Satellite app nodes */}
                            {liveApps.map((app, index) => {
                                const angle = (index * Math.PI * 2) / liveApps.length - Math.PI / 2;
                                const x = 300 + Math.cos(angle) * 180;
                                const y = 250 + Math.sin(angle) * 180;

                                return (
                                    <g key={app.id}>
                                        {/* Outer glow */}
                                        <motion.circle
                                            cx={x}
                                            cy={y}
                                            r="20"
                                            fill={app.colorAccent}
                                            opacity="0.15"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                isInView
                                                    ? { scale: 1, opacity: 0.15 }
                                                    : { scale: 0, opacity: 0 }
                                            }
                                            transition={{
                                                duration: 0.5,
                                                delay: 0.5 + index * 0.1,
                                                type: "spring",
                                                stiffness: 200,
                                            }}
                                        />
                                        {/* Node circle */}
                                        <motion.circle
                                            cx={x}
                                            cy={y}
                                            r="12"
                                            fill="rgba(255,255,255,0.05)"
                                            stroke={app.colorAccent}
                                            strokeWidth="2"
                                            filter="url(#glow)"
                                            initial={{ scale: 0 }}
                                            animate={isInView ? { scale: 1 } : { scale: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 0.5 + index * 0.1,
                                                type: "spring",
                                                stiffness: 200,
                                            }}
                                        />
                                        {/* App label */}
                                        <motion.text
                                            x={x}
                                            y={y + 35}
                                            textAnchor="middle"
                                            className="fill-white font-mono text-xs"
                                            initial={{ opacity: 0 }}
                                            animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
                                            transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                                        >
                                            {app.name}
                                        </motion.text>
                                    </g>
                                );
                            })}

                            {/* Central CORTEX node */}
                            <motion.g
                                initial={{ scale: 0 }}
                                animate={isInView ? { scale: 1 } : { scale: 0 }}
                                transition={{
                                    duration: 0.7,
                                    delay: 0.2,
                                    type: "spring",
                                    stiffness: 180,
                                }}
                            >
                                {/* Pulsing outer ring */}
                                <motion.circle
                                    cx="300"
                                    cy="250"
                                    r="45"
                                    fill="none"
                                    stroke="#0089ff"
                                    strokeWidth="1"
                                    opacity="0.3"
                                    animate={{
                                        scale: [1, 1.15, 1],
                                        opacity: [0.3, 0.1, 0.3],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                                {/* Core circle */}
                                <circle
                                    cx="300"
                                    cy="250"
                                    r="35"
                                    fill="rgba(0,137,255,0.08)"
                                    stroke="#0089ff"
                                    strokeWidth="2"
                                    filter="url(#glow)"
                                />
                                {/* CORTEX label */}
                                <text
                                    x="300"
                                    y="255"
                                    textAnchor="middle"
                                    className="fill-white font-mono text-sm font-medium tracking-wider"
                                >
                                    CORTEX
                                </text>
                            </motion.g>
                        </svg>
                    </div>
                </motion.div>

                {/* Bottom card with key message */}
                <motion.div
                    variants={item}
                    className="mx-auto mt-16 max-w-3xl rounded-[4px] border border-[rgba(255,255,255,0.15)] bg-[#000000] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] md:p-12"
                >
                    <h3 className="font-sans text-2xl font-normal leading-tight text-white md:text-3xl">
                        "CORTEX nhớ sai lầm của bạn ở App A,
                        <br />
                        và ép bạn đối đầu lại chúng ở App B."
                    </h3>
                    <p className="mt-4 font-mono text-sm uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                        Centralized Linguistic Profile — No Escape Policy
                    </p>
                </motion.div>
            </motion.div>
        </section>
    );
}
