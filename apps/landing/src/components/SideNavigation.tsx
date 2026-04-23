"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: "hero", label: "Khởi Đầu" },
  { id: "cortex", label: "CORTEX" },
  { id: "ecosystem", label: "Vũ Khí" },
  { id: "incubator", label: "Vườn Ươm" },
  { id: "roadmap", label: "Lộ Trình" },
  { id: "partnership", label: "Hợp Tác" },
];

export default function SideNavigation() {
  const [activeSection, setActiveSection] = useState("hero");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      <div className="flex flex-col gap-4">
        {sections.map(({ id, label }) => (
          <div
            key={id}
            className="relative flex items-center justify-start group"
            onMouseEnter={() => setHoveredSection(id)}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {/* Label */}
            <AnimatePresence>
              {hoveredSection === id && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-8 font-mono text-xs uppercase tracking-wider text-white whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Dot */}
            <button
              onClick={() => scrollToSection(id)}
              className="relative w-3 h-3 transition-all duration-300"
              aria-label={`Navigate to ${label}`}
            >
              {/* Outer ring */}
              <div
                className={`absolute inset-0 rounded-full border transition-all duration-300 ${
                  activeSection === id
                    ? "border-[#0089ff] scale-150"
                    : "border-white/30 scale-100"
                }`}
              />

              {/* Inner dot */}
              <motion.div
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  activeSection === id ? "bg-[#0089ff]" : "bg-white/40"
                }`}
                animate={{
                  scale: activeSection === id ? 1 : 0.6,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Glow effect for active */}
              {activeSection === id && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#0089ff] blur-md opacity-50"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.3, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Scroll progress line */}
      <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-white/10" />
      <motion.div
        className="absolute left-[5px] top-0 w-[2px] bg-[#0089ff]/50"
        style={{
          height: `${
            ((sections.findIndex((s) => s.id === activeSection) + 1) /
              sections.length) *
            100
          }%`,
        }}
        transition={{ duration: 0.3 }}
      />
    </nav>
  );
}
