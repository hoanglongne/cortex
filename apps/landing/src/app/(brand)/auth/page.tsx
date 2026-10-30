'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Hand } from '@/components/brand/doodle';
import Link from 'next/link';

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
        alert('Kiểm tra email để xác nhận tài khoản.');
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
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-14">
      <div className="w-full">
        <Hand className="block">một tài khoản cho cả Cortex</Hand>
        <h1 className="mt-1 font-serif text-4xl font-semibold">{isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}</h1>
        <form onSubmit={handleAuth} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-ink-2">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-12 w-full rounded-xl border border-ink/25 bg-white px-4 text-base text-ink focus:border-moss focus:outline-none"
              placeholder="ten@vi-du.com"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-2">Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 h-12 w-full rounded-xl border border-ink/25 bg-white px-4 text-base text-ink focus:border-moss focus:outline-none"
              required
            />
          </label>
          {error && <p className="text-sm text-pen">Lỗi: {error}</p>}
          <button type="submit" disabled={loading} className="h-12 w-full rounded-full bg-ink text-sm font-semibold text-paper transition-colors hover:bg-moss-strong disabled:opacity-50">
            {loading ? 'Đang xử lý...' : isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 text-sm text-moss-strong underline underline-offset-4">
          {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
        </button>
        <p className="mt-8 text-sm text-ink-3">
          <Link href="/" className="hover:text-ink">← Về trang chủ</Link>
        </p>
      </div>
    </main>
  );
}
