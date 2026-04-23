"use client";

import { motion } from "framer-motion";
import { type Pillar, pillarMap } from "@/data/ecosystem";

interface FilterBarProps {
    activePillar: Pillar | "All";
    onFilterChange: (pillar: Pillar | "All") => void;
}

const filters: Array<Pillar | "All"> = [
    "All",
    "Biological",
    "Psychological",
    "Cognitive",
    "Combat",
];

export default function FilterBar({
    activePillar,
    onFilterChange,
}: FilterBarProps) {
    return (
        <div className="flex flex-wrap gap-3 justify-center">
            {filters.map((filter) => {
                const isActive = activePillar === filter;
                const label = filter === "All" ? "Tất Cả" : pillarMap[filter];

                return (
                    <motion.button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
                        className={`
              relative px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-colors
              ${isActive
                                ? "text-white"
                                : "text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)]"
                            }
            `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Active indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="activeFilter"
                                className="absolute inset-0 rounded-sm border border-[rgba(0,137,255,1)] bg-[rgba(0,255,255,0.08)]"
                                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            />
                        )}
                        <span className="relative z-10">{label}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
