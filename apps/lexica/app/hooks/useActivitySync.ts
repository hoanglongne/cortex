'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLexicaStore } from '../store/lexicaStore';
import { upsertDailyActivity } from '../lib/buddy';
import { localDate } from '../lib/engagement/ghost';

/**
 * Sync daily activity lên Supabase mỗi khi store thay đổi, ở mọi trang
 * (components/BuddySync): buddies see today's progress without opening Buddy.
 * Debounce 5 giây để tránh spam request.
 * Chỉ chạy khi user đã đăng nhập.
 */
export function useActivitySync() {
    const { user } = useAuth();
    const dailyProgress = useLexicaStore(s => s.dailyProgress);
    const dailyGoal = useLexicaStore(s => s.dailyGoal);
    const currentStreak = useLexicaStore(s => s.currentStreak);
    const todayLearnedWords = useLexicaStore(s => s.todayLearnedWords);
    const daysDone = useLexicaStore(s => s.daysDone);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!user) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const wordsLearnedToday = todayLearnedWords instanceof Set
                ? todayLearnedWords.size
                : Object.keys(todayLearnedWords ?? {}).length;

            upsertDailyActivity({
                user_id: user.id,
                words_swiped: dailyProgress,
                words_learned_today: wordsLearnedToday,
                daily_goal: dailyGoal,
                // The day's goal: the Today session finished, or the day's cards swiped.
                goal_met: daysDone.includes(localDate()) || dailyProgress >= dailyGoal,
                streak: currentStreak,
            });
        }, 5000);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [user, dailyProgress, dailyGoal, currentStreak, todayLearnedWords, daysDone]);
}
