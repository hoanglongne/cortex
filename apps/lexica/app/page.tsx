'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Award, RotateCcw, Check, Brain, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';
import SwipeDeck from './components/SwipeDeck';
import HomeHeader from './components/HomeHeader';
import TodayCard from './components/TodayCard';
import StepNumbers from './components/StepNumbers';
import PaceCard from './components/PaceCard';
import PaceNudge from './components/PaceNudge';
import LevelHintCard from './components/LevelHintCard';
import RetakeCard from './components/RetakeCard';
import RecentWords from './components/RecentWords';
import GuideCard from './components/GuideCard';
import PledgeCard from './components/PledgeCard';
import Motivation from './components/Motivation';
import DailyProgress from './components/DailyProgress';
import OnboardingModal from './components/OnboardingModal';
// Level selection now handled by route: /level-select
import { useLexicaStore, initializeLexicaStore } from './store/lexicaStore';
import { getProgressStats } from './lib/eloAlgorithm';
import { useSoundEffects } from './hooks/useSoundEffects';
import { CORTEX_HUB_URL } from './lib/cortexConfig';
import { analytics } from './lib/analytics';

/** Home's "four numbers" with a heading, so a new learner knows what they count. */
function WordSteps() {
  return (
    <section aria-label="Từ của bạn đi tới đâu" className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
        <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Từ của bạn đi tới đâu</p>
        <Link href="/guide" className="text-xs text-subtle hover:text-ink">Bốn bước là gì?</Link>
      </div>
      <StepNumbers />
    </section>
  );
}

function greetingFor(hour: number): string {
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 14) return 'Chào buổi trưa';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function HomeContent() {
  const [greeting] = useState(() => greetingFor(new Date().getHours()));
  const cardProgress = useLexicaStore(state => state.cardProgress);
  const learnedCount = useLexicaStore(state => state.learnedWords.size);
  const selectedLevel = useLexicaStore(state => state.selectedLevel);
  const hasSeenWelcome = useLexicaStore(state => state.hasSeenWelcome);
  const isInTest = useLexicaStore(state => state.isInTest);
  const testScore = useLexicaStore(state => state.testScore);
  const hasSeenOnboarding = useLexicaStore(state => state.hasSeenOnboarding);
  const dailyGoal = useLexicaStore(state => state.dailyGoal);
  const dailyProgress = useLexicaStore(state => state.dailyProgress);
  const path = useLexicaStore(state => state.path);

  const setSelectedLevel = useLexicaStore(state => state.setSelectedLevel);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { buttonPress, click } = useSoundEffects();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Helper function to change level - ensures proper redirect to /level-select
  const handleChangeLevel = () => {
    // Set hasSeenWelcome to true to skip test welcome screen
    const store = useLexicaStore.getState();
    if (!store.hasSeenWelcome) {
      store.skipToManual(); // This sets hasSeenWelcome: true
    }
    setSelectedLevel(null);
  };
  const forceCortexReminder = searchParams.get('cortexReminder') === '1';

  // Session state - track if user has started learning session
  // A free swipe session (the Drop's cards, from "Luyện"): /?swipe=1
  const [sessionStarted, setSessionStarted] = useState(() => searchParams.get('swipe') === '1');

  const [showCortexReminder, setShowCortexReminder] = useState(false);

  // Goal celebration state
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);
  const [showOverlearningReminder, setShowOverlearningReminder] = useState(false);
  const previousProgressRef = useRef<number | null>(null);
  const hasShownGoalCelebration = useRef<boolean>(false);
  const hasShownOverlearningReminder = useRef<boolean>(false);


  // Initialize store on mount
  useEffect(() => {
    initializeLexicaStore();
    analytics.appOpen();
    // Push notifications are off until there is a subscribe route and a
    // service worker push handler; see docs/PRELAUNCH_PLAN.md.
  }, []);


  // Redirect to onboarding or test if needed
  useEffect(() => {
    // Skip redirects if we're in preview mode (for testing modals)
    if (forceCortexReminder) {
      return;
    }

    // First time user → Onboarding
    if (!hasSeenOnboarding) {
      router.replace('/onboarding');
      return;
    }

    // Onboarding done but no level selected AND hasn't seen test welcome → Test
    // If user has seen welcome (clicked "Tự chọn level"), let them choose manually
    if (!selectedLevel && !isInTest && testScore === null && !hasSeenWelcome) {
      router.replace('/test');
      return;
    }

    // In test flow → Navigate to test pages
    if (isInTest && !selectedLevel) {
      router.replace('/test/quiz');
      return;
    }

    // Test completed but not accepted → Show result
    if (testScore !== null && !selectedLevel) {
      router.replace('/test/result');
      return;
    }

    // User has completed onboarding, seen test welcome, but no level selected → Level Select
    // This happens when user clicks "Tự chọn level" or "Đổi level"
    if (!selectedLevel && hasSeenWelcome && !isInTest && testScore === null) {
      router.replace('/level-select');
      return;
    }

    // Level known but no path yet: pick the branch and the pace (docs/LEXICA_DIRECTION.md).
    if (selectedLevel && !path) {
      router.replace('/path/setup');
    }
  }, [hasSeenOnboarding, selectedLevel, isInTest, testScore, hasSeenWelcome, router, forceCortexReminder, path]);

  const progressStats = getProgressStats(cardProgress);
  const dueToday = progressStats.dueToday;

  // Update badge count when progress changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'setAppBadge' in navigator) {
      navigator.setAppBadge(progressStats.dueToday).catch(console.error);
    }
  }, [progressStats.dueToday]);

  // Show Cortex Hub reminder after every 25 words learned (if not connected)
  useEffect(() => {
    // ?cortexReminder=1 forces the modal instantly (dev/preview only)
    if (forceCortexReminder) {
      const t = setTimeout(() => setShowCortexReminder(true), 0);
      return () => clearTimeout(t);
    }

    // Nothing to connect to when Cortex isn't configured
    if (!CORTEX_HUB_URL) return;

    // Check if already connected
    const cortexUserId = localStorage.getItem('cortex_user_id');
    if (cortexUserId) return; // Already connected, no need to remind

    // Check when last dismissed
    const lastDismissedStr = localStorage.getItem('cortex_reminder_dismissed');
    if (lastDismissedStr) {
      const lastDismissed = new Date(lastDismissedStr);
      const now = new Date();
      const hoursSinceDismiss = (now.getTime() - lastDismissed.getTime()) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) return; // Dismissed within last 24 hours
    }

    // Check learned count - show every 25 words
    const lastShownCount = parseInt(localStorage.getItem('cortex_reminder_last_count') || '0');
    if (learnedCount >= lastShownCount + 25 && learnedCount > 0) {
      const t = setTimeout(() => {
        setShowCortexReminder(true);
        localStorage.setItem('cortex_reminder_last_count', learnedCount.toString());
      }, 1500); // Show after 1.5s delay
      return () => clearTimeout(t);
    }
  }, [learnedCount, forceCortexReminder]);




  // Track goal completion and show celebration
  useEffect(() => {
    const previousProgress = previousProgressRef.current;

    // Skip on first render (page load) - initialize the ref
    if (previousProgress === null) {
      previousProgressRef.current = dailyProgress;
      return;
    }

    // Check if we just reached the goal (progress changed from below to equal/above goal)
    if (previousProgress < dailyGoal && dailyProgress >= dailyGoal && dailyProgress > 0 && !hasShownGoalCelebration.current) {
      hasShownGoalCelebration.current = true;

      // Play celebration
      setTimeout(() => {
        setShowGoalCelebration(true);
      }, 500); // Small delay for better UX

      // Auto-hide after 4 seconds
      const hideTimer = setTimeout(() => {
        setShowGoalCelebration(false);
      }, 4500);

      return () => clearTimeout(hideTimer);
    }

    // Check if user reached 30 words - show overlearning reminder
    if (previousProgress < 30 && dailyProgress >= 30 && !hasShownOverlearningReminder.current) {
      hasShownOverlearningReminder.current = true;

      setTimeout(() => {
        setShowOverlearningReminder(true);
      }, 800);
      // No auto-dismiss - user must click button to close
    }

    // Update ref
    previousProgressRef.current = dailyProgress;
  }, [dailyProgress, dailyGoal]);

  return (
    <div className="relative h-screen flex flex-col bg-bg overflow-hidden">
      {/* Cortex Hub Reminder Modal */}
      <AnimatePresence>
        {showCortexReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="w-full max-w-sm bg-surface border border-accent/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-accent/20">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-lg font-bold text-ink">Kết nối Cortex Hub</h2>
              </div>
              <p className="text-ink-2 text-sm mb-1">
                Bạn đã học được <span className="text-accent font-bold">{learnedCount} từ</span>!
              </p>
              <p className="text-muted text-xs mb-6">
                Kết nối Cortex Hub để đồng bộ tiến độ học tập của bạn qua tất cả ứng dụng trong hệ sinh thái Cortex. Dữ liệu được phân tích bằng AI để cải thiện hiệu quả học tập.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    click();
                    setShowCortexReminder(false);
                    localStorage.setItem('cortex_reminder_dismissed', new Date().toISOString());
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-line-strong text-ink-2 text-sm font-medium hover:border-line-strong hover:text-ink transition-colors"
                >
                  Để sau
                </button>
                <button
                  onClick={() => {
                    buttonPress();
                    setShowCortexReminder(false);
                    if (CORTEX_HUB_URL) window.open(CORTEX_HUB_URL, '_blank');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-strong text-on-accent text-sm font-bold transition-colors"
                >
                  Kết nối ngay →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Celebration Modal */}
      <AnimatePresence>
        {showGoalCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowGoalCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-full max-w-sm bg-surface border-2 border-accent/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle background glow effect */}
              <div className="absolute inset-0 bg-accent/5 pointer-events-none" />

              <div className="text-center relative z-10">
                {/* Celebration Icon with bounce */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    delay: 0.1,
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                  }}
                  className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-accent/20 border-2 border-accent/50 flex items-center justify-center relative"
                >
                  {/* Pulsing ring effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-2xl border-2 border-accent"
                  />
                  <Award className="w-10 h-10 text-accent" />
                </motion.div>

                {/* Title with bounce */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-ink mb-3"
                >
                  Tuyệt vời!
                </motion.h2>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-ink-2 text-base mb-2">
                    Bạn vừa hoàn thành mục tiêu hôm nay
                  </p>

                  {/* Goal achievement badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/15 border border-accent/30 rounded-xl mb-3">
                    <Check className="w-5 h-5 text-accent" />
                    <span className="text-accent font-bold text-lg">{dailyGoal} từ vựng</span>
                  </div>
                </motion.div>

                {/* Encouragement */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted text-sm mt-4 leading-relaxed"
                >
                  {dailyProgress > dailyGoal
                    ? 'Tiếp tục duy trì phong độ này nhé!'
                    : 'Bạn cũng có thể học thêm để vượt mục tiêu!'}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlearning Reminder (30+ words) */}
      <AnimatePresence>
        {showOverlearningReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowOverlearningReminder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md bg-surface border-2 border-warning/50 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {/* Warning Icon */}
                <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-warning/20 border border-warning/40 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-warning" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-ink mb-3">
                  Lưu ý về việc học quá nhiều
                </h2>

                {/* Message */}
                <p className="text-ink-2 text-sm mb-4 leading-relaxed">
                  Bạn đã học <span className="text-warning font-bold">{dailyProgress} từ mới</span> hôm nay.
                  Học quá nhiều từ trong một ngày có thể làm giảm khả năng ghi nhớ từng từ.
                </p>

                <div className="bg-surface-2/50 border border-line-strong rounded-xl p-4 text-left space-y-2">
                  <p className="text-ink-2 text-xs font-medium">Gợi ý cho bạn:</p>
                  <div className="space-y-1.5">
                    <Link
                      href="/learned#practice-section"
                      onClick={() => {
                        buttonPress();
                        setShowOverlearningReminder(false);
                      }}
                      className="flex items-center gap-2 text-accent text-xs hover:text-accent transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Ôn tập từ đã học để củng cố trí nhớ
                    </Link>
                    <Link
                      href="/learned"
                      onClick={() => {
                        buttonPress();
                        setShowOverlearningReminder(false);
                      }}
                      className="flex items-center gap-2 text-accent text-xs hover:text-accent transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Thử Deep Dive Labs để hiểu sâu hơn
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => {
                    click();
                    setShowOverlearningReminder(false);
                  }}
                  className="mt-4 w-full py-2.5 bg-surface-2 hover:bg-surface-3 border border-line-strong rounded-lg text-ink-2 text-sm font-medium transition-colors"
                >
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding re-trigger modal (? button) */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Desktop header: logo, level, streak and the places to go */}
      <HomeHeader due={dueToday} onChangeLevel={() => { click(); handleChangeLevel(); }} />

      {/* Help Button - Desktop Only */}
      <button
        onClick={() => { click(); setShowOnboarding(true); }}
        className="hidden lg:flex fixed bottom-5 right-5 z-50 w-8 h-8 rounded-full bg-surface-2 border border-line-strong hover:border-accent hover:bg-surface-3 transition-colors items-center justify-center text-muted hover:text-accent text-sm font-bold"
        aria-label="Hướng dẫn"
      >
        ?
      </button>

      {/* Main: learning first (Today, the four numbers, Luyện thêm); the game layer after it on mobile, in a narrow right column on desktop */}
      <main className={`flex-1 flex flex-col items-center gap-4 px-3 sm:px-4 pt-3 sm:pt-4 pb-24 max-w-6xl xl:max-w-7xl mx-auto w-full lg:grid lg:items-start lg:content-start lg:gap-8 lg:px-8 lg:pt-8 lg:pb-8 lg:overflow-y-auto ${sessionStarted ? 'justify-center overflow-hidden lg:grid-cols-1' : 'overflow-y-auto lg:grid-cols-[minmax(0,1fr)_340px] lg:max-w-6xl'}`}>

        {sessionStarted ? (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-md lg:max-w-xl flex items-center gap-3 mb-3">
              <button onClick={() => { click(); setSessionStarted(false); }} className="h-9 px-3 rounded-lg border border-line text-sm text-muted hover:text-ink flex items-center gap-1.5" aria-label="Về trang chủ">
                <ArrowLeft className="w-4 h-4" /> Về
              </button>
              <div className="flex-1"><DailyProgress done={dailyProgress} goal={dailyGoal} /></div>
            </div>
            <div className="w-full max-w-md lg:max-w-xl flex items-center justify-center mb-28 lg:mb-24" data-tour-id="swipe-deck">
              <ErrorBoundary>
                <SwipeDeck />
              </ErrorBoundary>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl mx-auto flex flex-col gap-4 lg:max-w-none">
            {/* Mobile: a greeting; the day and streak live in "Nhịp học" */}
            <div className="lg:hidden flex items-center justify-between px-1">
              <span className="font-semibold text-ink text-base tracking-wide">LEXICA</span>
              <span className="text-sm text-muted">{greeting}</span>
            </div>
            <ErrorBoundary>
              <TodayCard />
            </ErrorBoundary>
            <LevelHintCard />
            <RetakeCard />
            <GuideCard />
            <PledgeCard />
            <div className="lg:hidden flex flex-col gap-4">
              <PaceCard />
              <PaceNudge />
              <WordSteps />
            </div>
            <RecentWords />
            <div className="lg:hidden">
              <Motivation variant="strip" />
            </div>
          </div>
        )}



        {/* Desktop: the game layer, narrow and quiet */}
        {!sessionStarted && (
          <div className="hidden lg:flex flex-col gap-4 self-start">
            <PaceCard />
            <PaceNudge />
            <WordSteps />
            <Motivation variant="column" />
          </div>
        )}
      </main>


      {/* Story modals now handled by dedicated routes */}
    </div>
  );
}

// ─── Wrapper với Suspense boundary ────────────────────────────────────────────

function HomePageFallback() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-line border-t-accent animate-spin" />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomeContent />
    </Suspense>
  );
}
