/**
 * Screenshots every Lexica screen at phone size, in several user states.
 * Used to review visual changes (e.g. the design-system migration).
 *
 *   pnpm --filter @cortex/lexica dev -- --port 3011   (in another shell)
 *   node scripts/screenshots.mjs http://localhost:3011 ./screens/after
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:3011';
const OUT = process.argv[3] ?? './screens';
mkdirSync(OUT, { recursive: true });

const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const midnight = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const learnedIds = ['v001', 'v002', 'v003', 'v004', 'v005', 'v006', 'v007', 'v008', 'v009', 'v010'];
const progress = Object.fromEntries(
    learnedIds.map((id, i) => [
        id,
        {
            cardId: id,
            state: ['seed', 'sprout', 'gold', 'mastered'][i % 4],
            lastReviewedAt: Date.now() - i * 86400000,
            nextReviewAt: Date.now() - 1000,
            reviewCount: 2 + (i % 3),
            wrongCount: i % 2,
        },
    ]),
);
const history = Object.fromEntries(
    Array.from({ length: 21 }, (_, i) => {
        const d = new Date(Date.now() - i * 86400000);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return [key, { swipes: 10 + (i % 7) * 3, correct: 8 + (i % 5), wrong: 2 + (i % 3), eloChange: (i % 5) * 4 - 6 }];
    }),
);

const base = {
    hasSeenOnboarding: true,
    hasSeenWelcome: true,
    selectedLevel: 'intermediate',
    energy: 24,
    maxEnergy: 30,
    lastEnergyReset: midnight(),
    userStats: { currentElo: 1040, totalSwipes: 120, correctSwipes: 90, wrongSwipes: 30, recentSwipes: [], seenCardIds: learnedIds },
    cardProgress: {},
    learnedWords: [],
    todayLearnedWords: [],
    lastLearnedWordsReset: today(),
    swipeMode: 'touch',
    soundEnabled: false,
    autoReviewInDeck: false,
    currentStreak: 7,
    longestStreak: 12,
    lastActivityDate: today(),
    highestElo: 1060,
    studyHistory: {},
    dailyGoal: 20,
    dailyProgress: 12,
    lastGoalSetDate: today(),
    userArchetype: 'tech',
    unlockedStories: [],
    unlockedStoryPart1: [],
    readStories: [],
    readStoryPart1: [],
    storyQuizAttempts: {},
    testScore: null,
    recommendedLevel: null,
    isInTest: false,
};
const active = { ...base, cardProgress: progress, learnedWords: learnedIds, todayLearnedWords: learnedIds.slice(0, 4), studyHistory: history };

/** [file name, path, persisted state (null = fresh visitor), button text to click, key to press] */
const SHOTS = [
    ['01-fresh-home', '/', null],
    ['02-onboarding', '/onboarding', { hasSeenOnboarding: false, hasSeenWelcome: false, selectedLevel: null }],
    ['03-test-intro', '/test', { ...base, selectedLevel: null }],
    ['04-test-quiz', '/test/quiz', { ...base, selectedLevel: null, isInTest: true }],
    ['05-test-result', '/test/result?score=4', { ...base, selectedLevel: null, testScore: 4, recommendedLevel: 'intermediate' }],
    ['06-level-select', '/level-select', base],
    ['07-home-goal-picker', '/', { ...base, lastGoalSetDate: null, dailyProgress: 0 }],
    ['08-home-menu', '/', active],
    ['08b-swipe-deck', '/', active, 'Tiếp tục học'],
    ['08c-swipe-revealed', '/', active, 'Tiếp tục học', ' '],
    ['09-swipe-voice-mode', '/', { ...active, swipeMode: 'voice' }, 'Tiếp tục học'],
    ['10-home-no-energy', '/', { ...active, energy: 0 }],
    ['11-home-cortex-reminder', '/?cortexReminder=1', active],
    ['12-home-review-preview', '/?reviewPreview=5', active],
    ['13-stories', '/stories', { ...active, unlockedStoryPart1: ['story_001'], unlockedStories: ['story_001'] }],
    ['14-story-reader', '/story/story_001', { ...active, unlockedStoryPart1: ['story_001'], unlockedStories: ['story_001'] }],
    ['15-story-unlock', '/story/story_002/unlock', active],
    ['16-story-unlock-quiz', '/story/story_002/unlock-quiz', active],
    ['17-learned', '/learned', active],
    ['18-review', '/review', active],
    ['19-stats', '/stats', active],
    ['20-buddy', '/buddy', active],
    ['21-challenge', '/challenge/demo', active],
];

const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
for (const [name, path, state, click, key] of SHOTS) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    if (state) {
        const value = JSON.stringify({ state, version: 0 });
        await page.addInitScript((v) => {
            try {
                localStorage.setItem('lexica-storage', v);
                localStorage.setItem('lexica_tour_done', 'true');
                localStorage.setItem('cortex_reminder_dismissed', new Date().toISOString());
            } catch {}
        }, value);
    }
    try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60_000 });
        await page.waitForTimeout(1500);
        if (click) {
            await page.getByRole('button', { name: click }).first().click();
            await page.waitForTimeout(1200);
        }
        if (key) {
            await page.keyboard.press(key === ' ' ? 'Space' : key);
            await page.waitForTimeout(600);
        }
        await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
        console.log('ok', name, '→', page.url().replace(BASE, ''));
    } catch (err) {
        console.log('FAIL', name, String(err).split('\n')[0]);
    }
    await context.close();
}
await browser.close();
