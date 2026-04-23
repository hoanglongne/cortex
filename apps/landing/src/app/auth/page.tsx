'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import AuroraBackground from '@/components/AuroraBackground';
import Link from 'next/link';

const container: Variants = {
  hidden: {},
  show: {
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

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Save userId to localStorage for cross-app synchronization
        if (data.user) {
          localStorage.setItem('cortex_user_id', data.user.id);
        }
        
        router.push('/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-6">
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
        className="relative z-10 w-full max-w-sm"
      >
        <motion.div variants={item} className="mb-12 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.4em] text-[rgba(255,255,255,0.4)] mb-4">
            Giao Thức Bảo Mật
          </span>
          <h1 className="text-5xl font-normal tracking-tighter text-white">
            {isSignUp ? 'Khởi Tạo' : 'Truy Cập'}
          </h1>
        </motion.div>
        
        <motion.form variants={item} onSubmit={handleAuth} className="space-y-8">
          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase tracking-widest text-[rgba(255,255,255,0.4)] ml-1">
              Định Danh (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[4px] px-4 py-4 text-base text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/30"
              placeholder="ten@vi-du.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase tracking-widest text-[rgba(255,255,255,0.4)] ml-1">
              Mật Mã (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[4px] px-4 py-4 text-base text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs font-mono uppercase tracking-tight text-center"
            >
              Lỗi: {error}
            </motion.p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold text-sm uppercase tracking-widest py-5 rounded-[4px] transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Đang Xử Lý...' : isSignUp ? 'Tạo Node Mới' : 'Thiết Lập Liên Kết'}
          </button>
        </motion.form>
        
        <motion.div variants={item} className="mt-10 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-mono uppercase tracking-[0.2em] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
          >
            {isSignUp ? 'Đã có định danh? Đăng Nhập' : 'Chưa có Node? Đăng Ký'}
          </button>
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
}

