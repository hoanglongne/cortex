"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AuroraBackground from "@/components/AuroraBackground";
import SideNavigation from "@/components/SideNavigation";
import CortexSection from "@/components/CortexSection";
import ArsenalSection from "@/components/ArsenalSection";
import IncubatorSection from "@/components/IncubatorSection";
import RoadmapSection from "@/components/RoadmapSection";
import PartnershipSection from "@/components/PartnershipSection";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 24 },
  },
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      {/* Side Navigation */}
      <SideNavigation />

      {/* Auth Button - Fixed at top */}
      <motion.div variants={item} initial="hidden" animate="show" className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50">
        {user ? (
          <div className="flex flex-col xs:flex-row items-end xs:items-center gap-2 xs:gap-4">
            <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[150px] sm:max-w-none">{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs sm:text-sm border text-white border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-white/5 transition-all whitespace-nowrap"
            >
              Đăng Xuất
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="text-xs sm:text-sm border text-white border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-white/5 transition-all whitespace-nowrap"
          >
            Đăng Nhập / Đăng Ký
          </Link>
        )}
      </motion.div>

      {/* Hero Section */}
      <AuroraBackground id="hero" className="min-h-screen flex flex-col items-center justify-center">
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-6xl flex flex-col items-center px-6 sm:px-8 md:px-10 py-24 sm:py-32 md:py-48 text-center"
        >

          {/* Overline tag */}
          <motion.span
            variants={item}
            className="mb-4 sm:mb-6 md:mb-8 inline-block font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] text-[rgba(255,255,255,0.5)]"
          >
            Cortex Hub — Language Tech Ecosystem
          </motion.span>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-normal leading-tight sm:leading-tight md:leading-[0.87] tracking-tight text-white max-w-4xl"
          >
            Ngừng Nhồi Nhét.
            <br />
            Bắt Đầu Thực Chiến.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={item}
            className="mt-5 sm:mt-6 md:mt-8 max-w-xs sm:max-w-md md:max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-[rgba(255,255,255,0.6)]"
          >
            Không app cồng kềnh. Không tính năng thừa. Mỗi công cụ giải quyết{" "}
            <span className="font-medium text-white">đúng một</span> điểm yếu
            ngôn ngữ — nhanh, chính xác, và tàn nhẫn.
          </motion.p>

          {/* CTA */}
          <motion.div variants={item} className="mt-7 sm:mt-8 md:mt-12 flex flex-col xs:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none">
            <a
              href="#ecosystem"
              className="inline-flex items-center justify-center rounded-[4px] bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-[#0a0a0a] transition-opacity hover:opacity-90"
            >
              Truy Cập Hệ Sinh Thái
            </a>
            {user && (
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-[4px] border border-[rgba(255,255,255,0.3)] bg-transparent px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-white transition-all hover:border-white hover:bg-[rgba(255,255,255,0.05)] shadow-lg shadow-white/5"
              >
                Xem Dashboard
              </Link>
            )}
          </motion.div>
        </motion.section>
      </AuroraBackground>

      {/* Sections with diagonal grid background */}
      <div className="diagonal-grid">
        {/* CORTEX Section */}
        <CortexSection />

        {/* Arsenal Section */}
        <ArsenalSection />

        {/* Incubator Section */}
        <IncubatorSection />

        {/* Roadmap Section */}
        <RoadmapSection />

        {/* Partnership Section */}
        <PartnershipSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
