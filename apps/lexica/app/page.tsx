'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { TrendingUp, BookOpen, Award, Settings, RotateCcw, X, BarChart3, TrendingDown, Zap, Check, Mic, Hand, Brain, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';
import SwipeDeck from './components/SwipeDeck';
import SmartEntry from './components/SmartEntry';
import OnboardingModal from './components/OnboardingModal';
// Story modals now handled by routes: /story/[id], /story/[id]/unlock-quiz, /story/[id]/unlock
// Level selection now handled by route: /level-select
import { useLexicaStore, initializeLexicaStore } from './store/lexicaStore';
import { getDifficultyAnalysis, getProgressStats } from './lib/eloAlgorithm';
import { useSoundEffects } from './hooks/useSoundEffects';
import { CORTEX_HUB_URL } from './lib/cortexConfig';
import { analytics } from './lib/analytics';

function HomeContent() {
  const userStats = useLexicaStore(state => state.userStats);
  const cardProgress = useLexicaStore(state => state.cardProgress);
  const learnedCount = useLexicaStore(state => state.learnedWords.size);
  const selectedLevel = useLexicaStore(state => state.selectedLevel);
  const hasSeenWelcome = useLexicaStore(state => state.hasSeenWelcome);
  const isInTest = useLexicaStore(state => state.isInTest);
  const testScore = useLexicaStore(state => state.testScore);
  const swipeMode = useLexicaStore(state => state.swipeMode);
  const hasSeenOnboarding = useLexicaStore(state => state.hasSeenOnboarding);
  const dailyGoal = useLexicaStore(state => state.dailyGoal);
  const dailyProgress = useLexicaStore(state => state.dailyProgress);

  const setSelectedLevel = useLexicaStore(state => state.setSelectedLevel);
  const resetProgress = useLexicaStore(state => state.resetProgress);
  const setSwipeMode = useLexicaStore(state => state.setSwipeMode);

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
  const previewDue = Number(searchParams.get('reviewPreview') ?? 0);
  const forceCortexReminder = searchParams.get('cortexReminder') === '1';

  // Session state - track if user has started learning session
  const [sessionStarted, setSessionStarted] = useState(false);

  // Mobile stats modal state
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(() => false);
  const [showCortexReminder, setShowCortexReminder] = useState(false);

  // Goal celebration state
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);
  const [showOverlearningReminder, setShowOverlearningReminder] = useState(false);
  const previousProgressRef = useRef<number | null>(null);
  const hasShownGoalCelebration = useRef<boolean>(false);
  const hasShownOverlearningReminder = useRef<boolean>(false);

  // Difficulty status notification state
  const [showDifficultyStatus, setShowDifficultyStatus] = useState(false);
  const previousStatusRef = useRef<string | null>(null);

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
    if (forceCortexReminder || previewDue > 0) {
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
  }, [hasSeenOnboarding, selectedLevel, isInTest, testScore, hasSeenWelcome, router, forceCortexReminder, previewDue]);

  // Debug: Get difficulty analysis
  const analysis = getDifficultyAnalysis(userStats);
  const progressStats = getProgressStats(cardProgress);
  const dueToday = previewDue || progressStats.dueToday;

  // Update badge count when progress changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'setAppBadge' in navigator) {
      navigator.setAppBadge(progressStats.dueToday).catch(console.error);
    }
  }, [progressStats.dueToday]);

  // Show review prompt once per day when there are due cards
  useEffect(() => {
    // ?reviewPreview=N forces the modal instantly (dev/preview only)
    if (previewDue > 0) {
      const t = setTimeout(() => setShowReviewPrompt(true), 0);
      return () => clearTimeout(t);
    }
    const todayKey = `reviewPromptShown_${new Date().toDateString()}`;
    if (progressStats.dueToday > 0 && !sessionStorage.getItem(todayKey)) {
      sessionStorage.setItem(todayKey, '1');
      const t = setTimeout(() => setShowReviewPrompt(true), 800);
      return () => clearTimeout(t);
    }
  }, [progressStats.dueToday, previewDue]);

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

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'very-hard':
      case 'challenging':
        return {
          icon: TrendingDown,
          color: 'text-ink-2',
          bgColor: 'bg-surface-2/50',
          borderColor: 'border-line-strong',
        };
      case 'too-easy':
      case 'easy':
        return {
          icon: TrendingUp,
          color: 'text-accent',
          bgColor: 'bg-accent/10',
          borderColor: 'border-accent/30',
        };
      case 'perfect':
        return {
          icon: Zap,
          color: 'text-accent',
          bgColor: 'bg-accent/10',
          borderColor: 'border-accent/30',
        };
      default:
        return {
          icon: Check,
          color: 'text-muted',
          bgColor: 'bg-surface-2/50',
          borderColor: 'border-line-strong',
        };
    }
  };

  const statusDisplay = getStatusDisplay(analysis.status);
  const isVoiceMode = swipeMode === 'voice';

  // Track status changes and show notification
  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    // Only show if status actually changed (not initial load)
    if (previousStatus !== null && previousStatus !== analysis.status) {
      // Schedule state update for next tick to avoid cascading renders
      const showTimer = setTimeout(() => {
        setShowDifficultyStatus(true);
      }, 0);

      // Auto-hide after 5 seconds
      const hideTimer = setTimeout(() => {
        setShowDifficultyStatus(false);
      }, 5000);

      // Update ref for next comparison
      previousStatusRef.current = analysis.status;

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }

    // Set initial value
    if (previousStatus === null) {
      previousStatusRef.current = analysis.status;
    }
  }, [analysis.status]);

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
      {/* Review Prompt Modal */}
      <AnimatePresence>
        {showReviewPrompt && (
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
              className="w-full max-w-sm bg-surface border border-line rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-warning/20">
                  <RotateCcw className="w-6 h-6 text-warning" />
                </div>
                <h2 className="text-lg font-bold text-ink">Ôn tập hôm nay</h2>
              </div>
              <p className="text-ink-2 text-sm mb-1">
                Bạn có <span className="text-warning font-bold">{previewDue || progressStats.dueToday} từ</span> cần ôn lại hôm nay.
              </p>
              <p className="text-muted text-xs mb-6">
                Ôn tập giúp củng cố trí nhớ và tăng tốc độ ghi nhớ dài hạn.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    click();
                    setShowReviewPrompt(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-line-strong text-ink-2 text-sm font-medium hover:border-line-strong hover:text-ink transition-colors"
                >
                  Để sau
                </button>
                <button
                  onClick={() => {
                    buttonPress();
                    setShowReviewPrompt(false);
                    router.push('/review');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-warning hover:bg-warning text-on-accent text-sm font-bold transition-colors"
                >
                  Ôn ngay →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Logo - Desktop Only */}
      <div className="hidden lg:block fixed top-4 left-4 md:top-6 md:left-6 z-50">
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          LEXICA
        </h1>
      </div>

      {/* Help Button - Desktop Only */}
      <button
        onClick={() => { click(); setShowOnboarding(true); }}
        className="hidden lg:flex fixed bottom-5 right-5 z-50 w-8 h-8 rounded-full bg-surface-2 border border-line-strong hover:border-accent hover:bg-surface-3 transition-colors items-center justify-center text-muted hover:text-accent text-sm font-bold"
        aria-label="Hướng dẫn"
      >
        ?
      </button>

      {/* Mobile Progress Bar - shown above main when session is active */}
      {sessionStarted && (
        <div className="lg:hidden w-full shrink-0 px-4 pt-3 pb-2">
          <DailyProgress done={dailyProgress} goal={dailyGoal} />
        </div>
      )}

      {/* Main Content Area - Two Column Layout on Desktop */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 px-3 sm:px-4 pt-3 sm:pt-4 pb-16 lg:pt-8 lg:pb-8 max-w-6xl mx-auto w-full overflow-hidden">

        {/* Left Column - Smart Entry or Swipe Deck */}
        <div className="w-full lg:flex-1 lg:max-w-lg flex flex-col items-center justify-center lg:h-full lg:min-h-150">
          {/* Daily Progress Bar - desktop only (mobile version is above <main>) */}
          {sessionStarted && (
            <div className="hidden lg:block w-full max-w-md mb-6 px-4">
              <DailyProgress done={dailyProgress} goal={dailyGoal} />
            </div>
          )}

          <div className={`w-full max-w-md flex items-center justify-center ${sessionStarted ? 'mb-28' : ''}`} data-tour-id="swipe-deck">
            <ErrorBoundary>
              {sessionStarted ? (
                <SwipeDeck />
              ) : (
                <SmartEntry onStartSession={() => setSessionStarted(true)} />
              )}
            </ErrorBoundary>
          </div>
        </div>

        {/* Difficulty Status Notification - Fixed to avoid layout shift */}
        <AnimatePresence>
          {showDifficultyStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40"
            >
              <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${statusDisplay.bgColor} ${statusDisplay.borderColor} shadow-lg backdrop-blur-sm`}>
                <statusDisplay.icon className={`w-6 h-6 ${statusDisplay.color} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className={`text-base font-bold ${statusDisplay.color}`}>
                    {analysis.message.split(' - ')[0]}
                  </p>
                  <p className="text-sm text-ink-2 mt-1">
                    {analysis.message.split(' - ')[1]}
                  </p>
                </div>
                <button
                  onClick={() => {
                    click();
                    setShowDifficultyStatus(false);
                  }}
                  className="p-1 hover:bg-surface-2/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Navigation Bar - Fixed */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg/95 backdrop-blur-md border-t border-line">
          <div className="flex items-stretch max-w-md mx-auto">
            <button
              onClick={() => { click(); setShowMobileStats(true); }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-muted hover:text-ink-2 transition-colors active:scale-95"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-[10px]">Thống kê</span>
            </button>

            <Link href="/learned" className="flex-1">
              <div className="flex flex-col items-center justify-center gap-0.5 py-3 text-muted hover:text-ink-2 transition-colors active:scale-95 h-full relative">
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px]">Đã học</span>
                {learnedCount > 0 && (
                  <span className="absolute top-2 right-1/4 translate-x-full text-[9px] font-bold text-accent">{learnedCount}</span>
                )}
              </div>
            </Link>

            <Link href="/buddy" className="flex-1">
              <div className="flex flex-col items-center justify-center gap-0.5 py-3 text-accent hover:text-accent transition-colors active:scale-95 h-full">
                <Users className="w-4 h-4" />
                <span className="text-[10px]">Study Buddy</span>
              </div>
            </Link>

            {dueToday > 0 && (
              <Link href="/review" className="flex-1">
                <div className="flex flex-col items-center justify-center gap-0.5 py-3 text-warning hover:text-warning transition-colors active:scale-95 h-full">
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[10px]">{dueToday} từ</span>
                </div>
              </Link>
            )}

            <button
              onClick={() => { click(); handleChangeLevel(); }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-muted hover:text-ink-2 transition-colors active:scale-95"
              aria-label="Đổi level"
            >
              <Settings className="w-4 h-4" />
              <span className="text-[10px]">Đổi level</span>
            </button>

            <button
              onClick={() => { click(); setShowOnboarding(true); }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-muted hover:text-ink-2 transition-colors active:scale-95"
              aria-label="Hướng dẫn"
            >
              <span className="text-sm font-bold leading-none">?</span>
              <span className="text-[10px]">Trợ giúp</span>
            </button>
          </div>
        </div>

        {/* Right Column - Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 self-center gap-6">

          {/* Mode Toggle */}
          <button
            data-tour-id="voice-mode-toggle"
            onClick={() => { click(); setSwipeMode(isVoiceMode ? 'touch' : 'voice'); }}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors w-full ${isVoiceMode
 ? 'bg-accent/10 border-accent/30 text-accent'
 : 'bg-surface/40 border-line/60 text-muted hover:text-ink-2 hover:border-line-strong'
 }`}
          >
            {isVoiceMode ? <Mic className="w-4 h-4 shrink-0" /> : <Hand className="w-4 h-4 shrink-0" />}
            {isVoiceMode ? 'Voice Mode' : 'Touch Mode'}
          </button>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center" data-tour-id="elo-rating">
              <span className="text-sm text-muted">ELO</span>
              <span className="text-sm font-mono text-accent">{userStats.currentElo}</span>
            </div>
            <div className="flex justify-between items-center" data-tour-id="learned-counter">
              <span className="text-sm text-muted">Đã học</span>
              <span className="text-sm font-semibold text-ink">{learnedCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Thành thạo</span>
              <span className="text-sm font-semibold text-ink">{progressStats.mastered}</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="border-t border-line pt-4 space-y-0.5">
            <Link href="/learned" data-tour-id="learned-words-link"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-ink hover:bg-surface/60 transition-colors">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Từ đã học</span>
              {learnedCount > 0 && <span className="ml-auto text-xs text-subtle">{learnedCount}</span>}
            </Link>
            <Link href="/buddy" data-tour-id="buddy-link"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-accent hover:text-accent hover:bg-surface/60 transition-colors">
              <Users className="w-4 h-4 shrink-0" />
              <span>Study Buddy</span>
            </Link>
            {dueToday > 0 && (
              <Link href="/review" data-tour-id="review-link"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-warning hover:text-warning hover:bg-surface/60 transition-colors">
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Ôn tập</span>
                <span className="ml-auto text-xs">{dueToday} từ</span>
              </Link>
            )}
            <Link href="/stats"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-ink hover:bg-surface/60 transition-colors">
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Thống kê</span>
            </Link>
          </div>

          {/* Settings */}
          <div className="border-t border-line pt-4 space-y-0.5">
            <button
              onClick={() => { click(); handleChangeLevel(); }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-ink-2 hover:bg-surface/60 transition-colors w-full text-left"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Đổi level</span>
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => { click(); resetProgress(); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-subtle hover:text-muted hover:bg-surface/60 transition-colors w-full text-left"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Mobile Stats Modal */}
      <AnimatePresence>
        {showMobileStats && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileStats(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-accent/30 rounded-t-3xl z-50 lg:hidden max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-surface border-b border-line px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">Thống kê</h3>
                <button
                  onClick={() => {
                    click();
                    setShowMobileStats(false);
                  }}
                  className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Voice/Touch Mode Toggle */}
                <div className="space-y-3 pb-4 border-b border-line">
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-sm">Chế độ swipe</span>
                    <button
                      onClick={() => {
                        click();
                        setSwipeMode(isVoiceMode ? 'touch' : 'voice');
                      }}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${isVoiceMode
 ? 'bg-accent/12 border-accent/35 text-accent'
 : 'bg-surface-2/40 border-line-strong/50 text-ink hover:border-line-strong/60'
 }`}
                    >
                      {isVoiceMode ? <Mic className="w-3.5 h-3.5" /> : <Hand className="w-3.5 h-3.5" />}
                      {isVoiceMode ? 'Voice Mode' : 'Touch Mode'}
                    </button>
                  </div>
                  <p className="text-xs text-muted">
                    Voice mode yêu cầu đọc đúng từ trên cùng 3 lần liên tiếp.
                  </p>
                </div>

                {/* Performance Stats */}
                <div className="space-y-3">
                  <h3 className="text-muted text-xs uppercase font-mono font-medium">Performance</h3>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-ink-2 text-sm">ELO Rating</span>
                    </div>
                    <span className="text-accent font-mono font-semibold">{userStats.currentElo}</span>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="space-y-3 pt-4 border-t border-line">
                  <h3 className="text-muted text-xs uppercase font-mono font-medium">Progress</h3>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent" />
                      <span className="text-ink-2 text-sm">Learned</span>
                    </div>
                    <span className="text-accent font-semibold">{learnedCount}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted" />
                      <span className="text-ink-2 text-sm">Mastered</span>
                    </div>
                    <span className="text-ink font-semibold">{progressStats.mastered}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-line">
                  <Link href="/stats">
                    <button
                      onClick={() => {
                        click();
                        setShowMobileStats(false);
                      }}
                      className="w-full mb-2 px-4 py-2.5 rounded-lg bg-accent/10 hover:bg-accent-strong/15 border border-accent/30 hover:border-accent/50 text-accent hover:text-accent text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Xem thống kê chi tiết
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      click();
                      handleChangeLevel();
                      setShowMobileStats(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface-2/50 hover:bg-surface-2 text-ink text-sm font-medium transition-colors border border-line-strong/50 hover:border-line-strong flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Đổi level
                  </button>
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={() => {
                        click();
                        resetProgress();
                        setShowMobileStats(false);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-2/30 hover:bg-surface-2/50 text-muted text-sm font-medium transition-colors border border-line-strong/30 hover:border-line-strong flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Progress
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

/** Segmented daily-goal bar in the design system's "Focus" style. */
function DailyProgress({ done, goal }: { done: number; goal: number }) {
  const segments = Math.max(1, Math.min(goal, 30));
  const filled = Math.min(segments, Math.round((done / Math.max(goal, 1)) * segments));
  return (
    <div className="space-y-2" aria-label={`Tiến độ hôm nay ${done}/${goal} từ`}>
      <div className="flex items-center justify-between font-mono text-xs text-muted">
        <span>Hôm nay</span>
        <span><span className="text-ink">{done}</span><span className="text-subtle">/{goal}</span> từ</span>
      </div>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}>
        {Array.from({ length: segments }, (_, i) => (
          <div key={i} className={`h-[3px] ${i < filled ? 'bg-accent' : 'bg-surface-3'}`} />
        ))}
      </div>
    </div>
  );
}
