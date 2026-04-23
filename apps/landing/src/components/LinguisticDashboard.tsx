'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface LinguisticProfile {
  vocabulary_size: number;
  fluency_score: number;
  active_vocab_count: number;
  passive_vocab_count: number;
  top_topics: string[];
  passive_vocab_samples: string[];
  difficulty_recommendation?: {
    recommendation: string;
    message: string;
    targetFluency: number;
  };
}

export default function LinguisticDashboard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<LinguisticProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Fetching profile for userId:', userId);
      const { data, error } = await supabase
        .from('linguistic_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
      }
      if (data && data.length > 0) {
        console.log('Profile data received:', data[0]);
        setProfile(data[0]);
      } else {
        console.log('No profile data found for this user');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <div className="text-white opacity-50 font-mono text-xs uppercase tracking-widest">Đang tải phân tích cortex...</div>;
  if (!profile) return <div className="text-white opacity-50 font-mono text-xs uppercase tracking-widest">Chưa có dữ liệu ngôn ngữ. Hãy bắt đầu luyện tập!</div>;

  const activeCount = profile.active_vocab_count || 0;
  const passiveCount = profile.passive_vocab_count || 0;
  const totalVocab = activeCount + passiveCount;
  const activationRate = totalVocab > 0 ? (activeCount / totalVocab) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto p-4">
      {/* Fluency Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.03] border border-white/10 p-8 rounded-sm"
      >
        <h3 className="text-xs font-mono uppercase tracking-[0.3em] mb-8 text-[rgba(255,255,255,0.4)]">Chỉ Số Trôi Chảy</h3>
        <div className="text-6xl font-normal tracking-tighter mb-4 text-white">{Math.round(profile.fluency_score || 0)}%</div>
        <div className="w-full bg-white/5 h-[2px] overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${profile.fluency_score || 0}%` }}
            className="h-full bg-white"
          />
        </div>
      </motion.div>

      {/* Vocab Bridge Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.03] border border-white/10 p-8 rounded-sm"
      >
        <h3 className="text-xs font-mono uppercase tracking-[0.3em] mb-8 text-[rgba(255,255,255,0.4)]">Kích Hoạt Từ Vựng</h3>
        <div className="flex flex-col gap-1 mb-4">
          <div className="text-6xl font-normal tracking-tighter text-white">{Math.round(activationRate)}%</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[rgba(255,255,255,0.3)] mt-2">
            {activeCount} Sống / {passiveCount} Chết
          </div>
        </div>
        <div className="w-full bg-white/5 h-[2px] overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${activationRate}%` }}
            className="h-full bg-white/60"
          />
        </div>
      </motion.div>

      {/* Recommendation Card */}
      {profile.difficulty_recommendation && profile.difficulty_recommendation.recommendation && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 bg-white/[0.03] border border-white/10 p-8 rounded-sm"
        >
          <div className="flex flex-col gap-4">
            <div className={`w-fit px-3 py-1 rounded-sm font-mono text-[10px] font-bold tracking-widest border ${
              profile.difficulty_recommendation.recommendation === 'HARD' ? 'border-red-500/50 text-red-500' : 
              profile.difficulty_recommendation.recommendation === 'EASY' ? 'border-blue-500/50 text-blue-500' : 'border-white/20 text-white/60'
            }`}>
              {profile.difficulty_recommendation.recommendation} MODE
            </div>
            <p className="text-xl font-normal tracking-tight text-white/90 italic">&ldquo;{profile.difficulty_recommendation.message}&rdquo;</p>
          </div>
        </motion.div>
      )}

      {/* Topics Card */}
      <div className="md:col-span-2 mt-8">
        <h3 className="text-xs font-mono uppercase tracking-[0.3em] mb-6 text-[rgba(255,255,255,0.4)]">Chủ Đề Thế Mạnh</h3>
        <div className="flex flex-wrap gap-3">
          {profile.top_topics && profile.top_topics.length > 0 ? (
            profile.top_topics.map((topic, i) => (
              <span key={i} className="bg-white/[0.05] border border-white/10 px-4 py-2 rounded-sm text-xs font-mono text-white/70 tracking-wider">
                #{topic.toUpperCase()}
              </span>
            ))
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-20 text-white italic">Hệ thống chưa ghi nhận chủ đề nào...</span>
          )}
        </div>
      </div>
    </div>
  );
}
