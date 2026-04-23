'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import AuroraBackground from '@/components/AuroraBackground';
import LinguisticDashboard from '@/components/LinguisticDashboard';
import Link from 'next/link';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <AuroraBackground className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-widest opacity-50">Đang Đồng Bộ Định Danh...</div>
      </AuroraBackground>
    );
  }

  if (!user) return null;

  return (
    <AuroraBackground className="min-h-screen py-24 px-6">
      <Link 
        href="/"
        className="absolute top-8 left-8 text-sm font-mono uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2"
      >
        <span>←</span> Quay lại Hub
      </Link>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={item} className="mb-16 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.4em] text-[rgba(255,255,255,0.4)] mb-4">
            Hồ Sơ DNA Ngôn Ngữ
          </span>
          <h1 className="text-5xl md:text-6xl font-normal tracking-tighter text-white">
            {user.email?.split('@')[0]}
          </h1>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest opacity-30">
            Node ID: {user.id}
          </p>
        </motion.div>

        <motion.div variants={item}>
          <LinguisticDashboard userId={user.id} />
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
}
