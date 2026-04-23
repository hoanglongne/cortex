"use client";

import { motion } from "framer-motion";
import { type EcosystemApp, pillarMap, statusMap, languageMap } from "@/data/ecosystem";
import { useState } from "react";

interface AppCardProps {
    app: EcosystemApp;
    index: number;
}

export default function AppCard({ app, index }: AppCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.a
            href={app.href || "#"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: 0.4,
                delay: index * 0.08,
                type: "spring",
                stiffness: 300,
                damping: 26,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col rounded-sm border border-[rgba(255,255,255,0.3)] bg-[#000000] p-6 transition-all hover:border-[rgba(255,255,255,0.4)] md:p-8"
            style={{
                boxShadow: isHovered
                    ? `0 0 40px ${app.colorAccent}20, 4px 4px 0px 0px rgba(0,0,0,0.3)`
                    : "4px 4px 0px 0px rgba(0,0,0,0.3)",
            }}
        >
            {/* Background glow on hover */}
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-sm opacity-0 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${app.colorAccent}15 0%, transparent 70%)`,
                    opacity: isHovered ? 1 : 0,
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="font-sans text-2xl font-medium leading-tight text-white">
                            {app.name}
                        </h3>
                        <span className="mt-2 inline-block font-mono text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                            Trụ Cột: {pillarMap[app.pillar]}
                        </span>
                    </div>

                    {/* Color indicator */}
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{
                            backgroundColor: app.colorAccent,
                            boxShadow: isHovered
                                ? `0 0 12px ${app.colorAccent}`
                                : `0 0 6px ${app.colorAccent}80`,
                        }}
                    />
                </div>

                {/* Pure Function Description */}
                <p className="mt-auto text-base leading-relaxed text-[rgba(255,255,255,0.6)]">
                    {app.pureFunctionDesc}
                </p>

                {/* Status badge */}
                <div className="mt-4 flex items-center gap-2">
                    <span
                        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
                        style={{
                            color: app.status === 'Live' ? '#0089ff' : 'rgba(255,255,255,0.6)'
                        }}
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                                backgroundColor: app.status === 'Live' ? '#0089ff' : 'rgba(255,255,255,0.6)'
                            }}
                        />
                        {statusMap[app.status]}
                    </span>
                    {app.language && (
                        <span className="font-mono text-xs text-[rgba(255,255,255,0.4)] uppercase">
                            • {languageMap[app.language]}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover arrow indicator */}
            <motion.div
                className="absolute bottom-6 right-6 text-[rgba(255,255,255,0.4)]"
                initial={{ opacity: 0, x: -4 }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    x: isHovered ? 0 : -4,
                }}
                transition={{ duration: 0.2 }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M3 8H13M13 8L9 4M13 8L9 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </motion.div>
        </motion.a>
    );
}
