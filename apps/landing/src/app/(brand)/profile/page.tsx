'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Hand } from '@/components/brand/doodle';
import LinguisticDashboard from '@/components/LinguisticDashboard';

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

  if (loading) return <main className="mx-auto max-w-3xl px-5 py-20 text-ink-3">Đang tải...</main>;
  if (!user) return null;

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <Hand className="block">hồ sơ của bạn</Hand>
      <h1 className="mt-1 font-serif text-4xl font-semibold">{user.email?.split('@')[0]}</h1>
      <p className="mt-2 text-ink-2">{user.email}</p>
      {/* The learning profile keeps its own dark look for now */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-[#0f0f0f] p-4 text-white sm:p-6">
        <LinguisticDashboard userId={user.id} />
      </div>
    </main>
  );
}
