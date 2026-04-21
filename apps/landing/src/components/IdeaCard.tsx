"use client";

import { motion } from "framer-motion";
import type { EcosystemApp } from "@/data/ecosystem";
import { useState } from "react";

interface IdeaCardProps {
    app: EcosystemApp;
    index: number;
}

export default function IdeaCard({ app, index }: IdeaCardProps) {
    const [upvotes, setUpvotes] = useState(app.upvotes || 0);
    const [hasVoted, setHasVoted] = useState(false);

    const handleVote = () => {
        if (!hasVoted) {
            setUpvotes(upvotes + 1);
            setHasVoted(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: index * 0.08,
                type: "spring",
                stiffness: 300,
                damping: 26,
            }}
            className="group relative flex flex-col rounded-sm border border-[rgba(255,255,255,0.3)] bg-[#000000] p-6 transition-all hover:border-[rgba(255,255,255,0.4)] md:p-8"
        >
            {/* Content */}
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-sans text-xl font-medium leading-tight text-white">
                            {app.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                                {app.pillar}
                            </span>
                            {app.targetLaunchDate && (
                                <>
                                    <span className="text-[rgba(255,255,255,0.3)]">•</span>
                                    <span
                                        className="font-mono text-xs tracking-wide"
                                        style={{ color: app.colorAccent }}
                                    >
                                        {app.targetLaunchDate}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Color indicator */}
                    <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                            backgroundColor: app.colorAccent,
                            boxShadow: `0 0 8px ${app.colorAccent}60`,
                        }}
                    />
                </div>

                {/* Pure Function Description */}
                <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.6)]">
                    {app.pureFunctionDesc}
                </p>

                {/* Vote Section */}
                <div className="mt-6 flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-4">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[rgba(255,255,255,0.4)]">
                            Community Interest
                        </span>
                        <span className="font-mono text-lg font-medium text-white">
                            {upvotes}
                        </span>
                    </div>

                    <button
                        onClick={handleVote}
                        disabled={hasVoted}
                        className={`
              group/btn relative overflow-hidden rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-all
              ${hasVoted
                                ? "border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.3)] cursor-not-allowed"
                                : "border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] hover:border-[rgba(0,137,255,1)] hover:text-white"
                            }
            `}
                    >
                        {hasVoted ? "Voted" : "Vote"}
                        {!hasVoted && (
                            <motion.div
                                className="absolute inset-0 -z-10 bg-[rgba(0,255,255,0.05)]"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
