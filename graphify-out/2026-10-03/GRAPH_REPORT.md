# Graph Report - cortex  (2026-10-03)

## Corpus Check
- 364 files · ~298,890 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .ico 5, .css 5, (none) 4)

## Summary
- 2887 nodes · 4748 edges · 179 communities (160 shown, 19 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 119 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `16cde610`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- workbox-01fd22c6.js
- ref_next
- useSoundEffects
- stories.ts
- cortex-core-api/package.json
- buddy/page.tsx
- Design System & Styling
- useLexicaStore
- Design System Inspired by Composio
- Design System Inspired by Composio
- ref_react
- lexicaStore.ts
- solilo/package.json
- lexica/app/page.tsx
- Features & User Flows
- SpeakMate Backend Implementation
- SynapseScenario
- synapse/package.json
- TerminalBoard.tsx
- database.ts
- AppFlow.tsx
- EventsGateway
- SupabaseService
- Story Progressive Unlock - Technical Specification
- InCallScreen.tsx
- Template Brainstorm App Mới - CORTEX HUB
- VocabCard.tsx
- createAdminClient
- ui/package.json
- cortex-types/index.ts
- LoreSelection.tsx
- lexica/package.json
- RecordingPanel.tsx
- Architecture Context
- LEXICA DEVELOPMENT ROADMAP
- HomeScreen.tsx
- dependencies
- devDependencies
- app.module.ts
- compilerOptions
- 📝 Future Enhancements (Optional)
- oratio/package.json
- landing/package.json
- package.json
- LiveKitRoom.tsx
- types/index.ts
- ecosystem.ts
- compilerOptions
- manifest.json
- compilerOptions
- compilerOptions
- solilo/src/app/layout.tsx
- compilerOptions
- compilerOptions
- next.js
- components.json
- dependencies
- GuidedRatingSlider.tsx
- review/page.tsx
- LEXICA - SITEMAP VÀ TÓM TẮT CHI TIẾT TÍNH NĂNG
- SpeakMate - MVP Roadmap
- compilerOptions
- tasks
- devDependencies
- SpeakMate (Oratio) — Project Status & Issues Tracker
- LeaderboardScreen.tsx
- useLanguage
- landing/src/app/page.tsx
- ref_lucide_react
- Do lech: master context vs code hien tai
- 2.2. Chi tiết từng Route
- helpers.ts
- CallHistoryScreen.tsx
- Manual Testing Steps
- compilerOptions
- State Management - Zustand Store
- 7.1. ELO Algorithm Details
- SOLILO — Project Plan
- SessionController.tsx
- RedisService
- scripts
- 4.6. Other UI Components
- dependencies
- Page: Màn hình Terminal (Synapse)
- ref_eslint
- dependencies
- auth/page.tsx
- landing/src/app/layout.tsx
- LEXICA - Architecture Overview
- Product Context
- Lexica — Testing Summary
- devDependencies
- Cortex Ecosystem Deployment Strategy
- devDependencies
- AppService
- 3. CÁC TÍNH NĂNG CHÍNH
- scripts
- LanguageProvider.tsx
- eslint-config/package.json
- compilerOptions
- 📅 LỘ TRÌNH CHI TIẾT (PHASED ROADMAP)
- cortex-core-api/README.md
- devDependencies
- profile/page.tsx
- ArsenalSection.tsx
- Core Components
- LEXICA Context Documentation
- FriendsScreen.tsx
- What's inside?
- Hướng dẫn Hạ tầng Core API (INFRASTRUCTURE_GUIDE.md)
- jest
- world-bibles.ts
- RoadmapSection.tsx
- lexica/context/README.md
- Data Models & Types
- 8. PWA & TECHNICAL FEATURES
- RatingScreen.tsx
- CORTEX HUB - Hướng dẫn Hoàn tất Cài đặt (SETUP_GUIDE.md)
- app.e2e-spec.ts
- LinguisticsController
- 6. GAME MODES
- ResultPanel.tsx
- CORTEX HUB System Architecture & Shared Context
- ui/tsconfig.json
- synapse-technical-architecture.md
- Core Data Structures
- 📚 File Structure
- 2. CORE GAMEPLAY LOOP & MECHANICS
- lexicaStore.test.ts
- AchievementsScreen.tsx
- CallSummaryScreen.tsx
- useFillerTracker.ts
- synapse/src/app/layout.tsx
- SYNAPSE: PROJECT CONTEXT & ARCHITECTURE
- typescript-config/package.json
- nest-cli.json
- 🎯 Quick Reference
- LEXICA Context Hub
- 4.1. Core Components
- 5. DATA MODELS & STORE
- To remove mock data and restore production state:
- Hướng dẫn Sử dụng Shared Types (`@cortex/types`)
- react-library.json
- synapse-prd.md
- scripts
- dialecta/page.tsx
- echo/page.tsx
- oratio/page.tsx
- solilo/page.tsx
- 4.2. Story Components
- 4.5. Chart Components
- scripts
- ORATIO
- cortex-types/package.json
- tsconfig.build.json
- landing/README.md
- 1. TỔNG QUAN DỰ ÁN
- lexica/next.config.ts
- lexica/README.md
- solilo/README.md
- synapse/README.md
- exports
- landing/postcss.config.mjs
- lexica/postcss.config.mjs
- vercel.json
- oratio/postcss.config.mjs
- solilo/postcss.config.mjs
- AGENTS.md
- synapse/postcss.config.mjs
- eslint-config/README.md
- simulate_full_flow.sh
- simulate_text_only.sh
- test_overwrite.sh

## God Nodes (most connected - your core abstractions)
1. `useSoundEffects()` - 62 edges
2. `useLexicaStore` - 61 edges
3. `createAdminClient()` - 32 edges
4. `createClient()` - 27 edges
5. `AppFlow()` - 24 edges
6. `compilerOptions` - 23 edges
7. `@nestjs/common` - 22 edges
8. `getSupabaseClient()` - 20 edges
9. `s` - 19 edges
10. `InCallContent()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Các Model Dữ liệu Chính:` --references--> `UserProgress`  [INFERRED]
  docs/CORTEX_SYSTEM_ARCHITECTURE.md → packages/cortex-types/index.ts
- `Các Model Dữ liệu Chính:` --references--> `ActionLog`  [INFERRED]
  docs/CORTEX_SYSTEM_ARCHITECTURE.md → packages/cortex-types/index.ts
- `4. Danh sách các Types quan trọng` --references--> `ActionLog`  [INFERRED]
  docs/SHARED_TYPES_GUIDE.md → packages/cortex-types/index.ts
- `2. Redis (Xử lý hàng đợi & Cache)` --references--> `EventsGateway`  [INFERRED]
  apps/cortex-core-api/SETUP_GUIDE.md → apps/cortex-core-api/src/modules/events/events.gateway.ts
- `3. Manual level selection` --references--> `LevelSelector()`  [INFERRED]
  apps/lexica/docs/context/flows.md → apps/lexica/app/components/LevelSelector.tsx

## Import Cycles
- 3-file cycle: `apps/lexica/app/components/VocabCard.tsx -> apps/lexica/app/store/lexicaStore.ts -> apps/lexica/app/data/stories.ts -> apps/lexica/app/components/VocabCard.tsx`
- 3-file cycle: `apps/lexica/app/components/VocabCard.tsx -> apps/lexica/app/store/lexicaStore.ts -> apps/lexica/app/lib/eloAlgorithm.ts -> apps/lexica/app/components/VocabCard.tsx`
- 4-file cycle: `apps/lexica/app/components/VocabCard.tsx -> apps/lexica/app/store/lexicaStore.ts -> apps/lexica/app/lib/eloAlgorithm.ts -> apps/lexica/app/data/vocabCards.ts -> apps/lexica/app/components/VocabCard.tsx`

## Communities (179 total, 19 thin omitted)

### Community 0 - "workbox-01fd22c6.js"
Cohesion: 0.06
Nodes (25): a, b(), constructor(), deleteCacheAndMetadata(), et, F, G, get() (+17 more)

### Community 1 - "ref_next"
Cohesion: 0.03
Nodes (32): nextConfig, metadata, metadata, metadata, container, features, item, metadata (+24 more)

### Community 2 - "useSoundEffects"
Cohesion: 0.08
Nodes (51): ALL_WORD_IDS, ChallengePage(), ChallengePageProps, GameComponent(), ChallengeButton(), ChallengeButtonProps, ComboChain(), ComboChainProps (+43 more)

### Community 3 - "stories.ts"
Cohesion: 0.09
Nodes (36): StoryComprehensionQuiz(), StoryComprehensionQuizProps, StoryMode(), StoryModeProps, StoryVocabDialogData, VOCAB_BY_ID, VOCAB_ID_BY_WORD, StoryQuizModal() (+28 more)

### Community 4 - "cortex-core-api/package.json"
Cohesion: 0.04
Nodes (44): author, description, @cortex/types, eslint, eslint-config-prettier, @eslint/js, globals, prettier (+36 more)

### Community 5 - "buddy/page.tsx"
Cohesion: 0.11
Nodes (34): BuddyCard(), BuddyPage(), StatPill(), AuthGate(), AuthGateProps, AuthContext, AuthContextValue, AuthProvider() (+26 more)

### Community 6 - "Design System & Styling"
Cohesion: 0.05
Nodes (42): Accessibility, Animations, Badges, Base Scale, Buttons, Cards, Color Contrast, Color Palette (+34 more)

### Community 7 - "useLexicaStore"
Cohesion: 0.08
Nodes (32): CortexProfile, CortexWidget(), LearnedWordsCounter(), CardWithProgress, formatNextReview(), formatNextReviewFull(), highlightWord(), LearnedWordsList() (+24 more)

### Community 8 - "Design System Inspired by Composio"
Cohesion: 0.05
Nodes (39): 1. Visual Theme & Atmosphere, 2. Color Palette & Roles, 3. Typography Rules, 4. Component Stylings, 5. Layout Principles, 6. Depth & Elevation, 7. Do's and Don'ts, 8. Responsive Behavior (+31 more)

### Community 9 - "Design System Inspired by Composio"
Cohesion: 0.05
Nodes (39): 1. Visual Theme & Atmosphere, 2. Color Palette & Roles, 3. Typography Rules, 4. Component Stylings, 5. Layout Principles, 6. Depth & Elevation, 7. Do's and Don'ts, 8. Responsive Behavior (+31 more)

### Community 10 - "ref_react"
Cohesion: 0.09
Nodes (23): AccuracyChart(), AccuracyChartProps, Period, ActivityHeatmap(), ActivityHeatmapProps, Period, CardStatesPieChart(), CardStatesPieChartProps (+15 more)

### Community 11 - "lexicaStore.ts"
Cohesion: 0.09
Nodes (29): DAY_LABELS, MONTH_LABELS, SRSCalendarProps, UserArchetype, analytics, EventProps, LexicaEvent, calculateNextReview() (+21 more)

### Community 12 - "solilo/package.json"
Cohesion: 0.05
Nodes (39): dependencies, @cortex/types, framer-motion, lucide-react, next, @radix-ui/react-slider, react, react-dom (+31 more)

### Community 13 - "lexica/app/page.tsx"
Cohesion: 0.07
Nodes (28): EnergyBar(), EnergyBarProps, ErrorBoundary, Props, State, getGreeting(), getTodayDateString(), SmartEntry() (+20 more)

### Community 14 - "Features & User Flows"
Cohesion: 0.05
Nodes (38): Boss Card Encounter, Browser Support, Challenge Flow, Data Corruption, Dynamic Deck Loading, Edge Cases & Error Handling, Entry State Check, Feature Deep-Dive: Boss Cards (+30 more)

### Community 15 - "SpeakMate Backend Implementation"
Cohesion: 0.05
Nodes (37): 10. **Speaking Part Simulator**, 1. `profiles`, 1. **Smart Matching Algorithm**, 2. `match_queue`, 2. **Scheduled Practice Sessions**, 3. `matches`, 3. **Topic Voting**, 4. **AI Speaking Analysis** (Future) (+29 more)

### Community 16 - "SynapseScenario"
Cohesion: 0.12
Nodes (9): GeminiProvider, GemmaProvider, GroqProvider, LlmProvider, SynapseController, SynapseService, Backend (NestJS - cortex-core-api), ActionLog (+1 more)

### Community 17 - "synapse/package.json"
Cohesion: 0.05
Nodes (36): dependencies, @cortex/types, lucide-react, next, react, react-dom, devDependencies, eslint (+28 more)

### Community 18 - "TerminalBoard.tsx"
Cohesion: 0.14
Nodes (24): makeId(), nowIso(), TerminalBoard(), loadStageFromArc(), onChoose(), onContinue(), onRestart(), onRetry() (+16 more)

### Community 19 - "database.ts"
Cohesion: 0.08
Nodes (29): MatchQueueWithProfile, HomeScreenProps, ProfileScreenProps, MatchDetails, UseMatchmakingOptions, UseMatchmakingReturn, useIsAuthenticated(), UseSupabaseAuthReturn (+21 more)

### Community 20 - "AppFlow.tsx"
Cohesion: 0.11
Nodes (29): Home(), AchievementsScreen, AppFlow(), CallHistoryScreen, CallSummaryScreen, FriendsScreen, InCallScreen, LeaderboardScreen (+21 more)

### Community 21 - "EventsGateway"
Cohesion: 0.07
Nodes (16): 🔄 1. Luồng Ghi nhận Hoạt động & Phần thưởng (Action & Reward Flow), 💾 2. Luồng Sao lưu & Tinh chỉnh (Backup & Refinement Flow), 🧠 3. Luồng Gợi ý Thích ứng (Adaptive Recommendation Flow), 📡 4. Sơ đồ các thành phần, CORTEX HUB - Luồng Dữ liệu Hệ thống (DATA_FLOW.md), 1. Hệ thống Phần thưởng (Reward System), 2. Kết nối từ Frontend (Client), 3. Luồng hoạt động của ActionLog (+8 more)

### Community 22 - "SupabaseService"
Cohesion: 0.11
Nodes (7): ActionsController, LogMetadata, BridgeResult, LinguisticRefinerService, SupabaseService, compromise, natural

### Community 23 - "Story Progressive Unlock - Technical Specification"
Cohesion: 0.06
Nodes (31): 1. Story Card States (on /learned page), 1. Update Story Interface, 2. New Component: StoryQuizModal, 2. Update Store State, 3. Update Helper Functions, 3. Update StoryMode Component, 4. Update StoryUnlockModal, 📝 Content Writing Tasks (+23 more)

### Community 24 - "InCallScreen.tsx"
Cohesion: 0.15
Nodes (29): assignMatchRoles(), cancelSwapRequest(), getMatchState(), getNextQuestion(), getPartForCount(), getQuestionById(), getRandomQuestion(), requestSwapRoles() (+21 more)

### Community 25 - "Template Brainstorm App Mới - CORTEX HUB"
Cohesion: 0.06
Nodes (30): 1.1 Tên App, 1.2 Pure Function, 1.3 Trụ Cột (Pillar), 1. ĐỊNH NGHĨA CỐT LÕI, 2.1 Tagline, 2.2 How It Works - 3 Bước, 2.3 Đoạn Giải Thích Cơ Chế, 2. CƠ CHẾ HOẠT ĐỘNG (+22 more)

### Community 26 - "VocabCard.tsx"
Cohesion: 0.11
Nodes (24): LEVEL_OPTIONS, LevelOption, LevelSelectorProps, LevelTest(), LevelTestProps, TEST_QUESTIONS, TestQuestion, LEVEL_INFO (+16 more)

### Community 27 - "createAdminClient"
Cohesion: 0.16
Nodes (23): getCurrentProfile(), getCurrentUser(), resetPasswordRequest(), signIn(), signOut(), signUp(), updateProfile(), cancelMatch() (+15 more)

### Community 28 - "ui/package.json"
Cohesion: 0.07
Nodes (28): dependencies, react, react-dom, devDependencies, eslint, @repo/eslint-config, @repo/typescript-config, @types/node (+20 more)

### Community 29 - "cortex-types/index.ts"
Cohesion: 0.11
Nodes (17): LEXICA_SOURCE, SessionScores, ORATIO_SOURCE, calculateOverall(), mapSoliloRatingsToMetrics(), SOLILO_SOURCE, 3. Kiến trúc Shared Types (`@cortex/types`), Các Model Dữ liệu Chính: (+9 more)

### Community 30 - "LoreSelection.tsx"
Cohesion: 0.13
Nodes (21): Home(), LORE_ICONS, LoreSelection(), LoreSelectionProps, MISSION_ICONS, SYNAPSE_FACTION_ICONS, SynapseLoreSelection(), UrbanLoreSelection() (+13 more)

### Community 31 - "lexica/package.json"
Cohesion: 0.07
Nodes (25): @cortex/types, eslint, eslint-config-next, framer-motion, lucide-react, next, react, react-dom (+17 more)

### Community 32 - "RecordingPanel.tsx"
Cohesion: 0.13
Nodes (19): 4. Implementation Checklist, Phase 2: State Machine & Timer Hooks, Phase 3: MediaRecorder API & Audio, Phase 4: Self-Rubric Evaluation & Scoring, Phase 5: Filler Tracker & Polish, Phase 6: Deploy & Smoke Test, RecordingPanel(), AudioVisualizer() (+11 more)

### Community 33 - "Architecture Context"
Cohesion: 0.08
Nodes (19): SpeechRecognition, SpeechRecognitionAlternative, SpeechRecognitionErrorEvent, SpeechRecognitionEvent, SpeechRecognitionResult, SpeechRecognitionResultList, Window, App state model (+11 more)

### Community 34 - "LEXICA DEVELOPMENT ROADMAP"
Cohesion: 0.08
Nodes (25): Bonus Features (Not in Original Roadmap) ✅ COMPLETE, LEXICA DEVELOPMENT ROADMAP, Phase 10: Design System & Animations, Phase 1: App Router Setup, PWA Config & Global Layout ✅ COMPLETE, Phase 2: Framer Motion Swipe Deck Implementation ✅ COMPLETE, Phase 3: The useVocalSwipe Hook (Web Speech API) ✅ COMPLETE, Phase 4: Mock Database Setup & ELO Routing ✅ COMPLETE, Phase 5: Story Mode UI & ORATIO Funnel ✅ COMPLETE (+17 more)

### Community 35 - "HomeScreen.tsx"
Cohesion: 0.14
Nodes (21): getCallHistory(), getGlobalStats(), getOnlineLearnersCount(), CallSession, FeedbackData, HomeScreen(), NavLink(), SessionRow() (+13 more)

### Community 36 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, bullmq, compromise, @cortex/types, franc, @google/generative-ai, ioredis, natural (+17 more)

### Community 37 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+17 more)

### Community 38 - "app.module.ts"
Cohesion: 0.16
Nodes (7): ActionsModule, LinguisticsModule, SharedModule, SupabaseModule, SynapseModule, @nestjs/common, @nestjs/config

### Community 39 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+15 more)

### Community 40 - "📝 Future Enhancements (Optional)"
Cohesion: 0.08
Nodes (23): Analytics, ✅ COMPLETED, CORTEX HUB — Implementation TODO, 🎯 CURRENT FOCUS, Deployment, Features, 📝 Future Enhancements (Optional), Performance (+15 more)

### Community 41 - "oratio/package.json"
Cohesion: 0.08
Nodes (23): clsx, @cortex/types, eslint, eslint-config-next, lucide-react, next, react, react-dom (+15 more)

### Community 42 - "landing/package.json"
Cohesion: 0.09
Nodes (21): clsx, eslint, eslint-config-next, framer-motion, lucide-react, next, react, react-dom (+13 more)

### Community 43 - "package.json"
Cohesion: 0.09
Nodes (21): devDependencies, prettier, turbo, typescript, engines, node, prettier, typescript (+13 more)

### Community 44 - "LiveKitRoom.tsx"
Cohesion: 0.16
Nodes (16): AuthScreen(), AuthScreenProps, AudioConference(), AudioIndicator(), LiveKitRoom(), LiveKitRoomProps, LoadingSpinner(), LoadingSpinnerProps (+8 more)

### Community 45 - "types/index.ts"
Cohesion: 0.19
Nodes (16): Phase 1: Project Setup & UI Shell, EvaluationPanel(), EvaluationPanelProps, CustomAudioPlayer(), CustomAudioPlayerProps, initialState, sessionReducer(), useSessionMachine() (+8 more)

### Community 46 - "ecosystem.ts"
Cohesion: 0.17
Nodes (15): AppCardProps, container, item, IdeaCard(), IdeaCardProps, container, IncubatorSection(), item (+7 more)

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 48 - "manifest.json"
Cohesion: 0.10
Nodes (19): background_color, categories, description, display, icons, name, orientation, text (+11 more)

### Community 49 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 50 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 51 - "solilo/src/app/layout.tsx"
Cohesion: 0.16
Nodes (15): ibmPlexMono, inter, metadata, RootLayout(), applyThemeToDOM(), Theme, ThemeColors, ThemeContext (+7 more)

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 54 - "next.js"
Cohesion: 0.20
Nodes (9): config, nextJsConfig, config, eslint-plugin-only-warn, eslint-plugin-prettier, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-turbo (+1 more)

### Community 55 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 56 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority, clsx, @cortex/types, livekit-client, @livekit/components-react, @livekit/components-styles, livekit-server-sdk (+10 more)

### Community 57 - "GuidedRatingSlider.tsx"
Cohesion: 0.19
Nodes (15): getActiveGuideIndex(), GuidedRatingSlider(), GuidedRatingSliderProps, getValueColor(), RatingSlider(), RatingSliderProps, BAND_DESCRIPTORS, ORATIO_BASE_URL (+7 more)

### Community 58 - "review/page.tsx"
Cohesion: 0.22
Nodes (16): blank(), buildOptions(), buildQuestions(), highlightBlank(), highlightWord(), Question, QuestionCard(), QuestionType (+8 more)

### Community 59 - "LEXICA - SITEMAP VÀ TÓM TẮT CHI TIẾT TÍNH NĂNG"
Cohesion: 0.12
Nodes (16): 10.1. Vercel Deployment, 10.2. Development Scripts, 10. DEPLOYMENT & ENVIRONMENT, 11.1. Phase 2 Features (Planned), 11.2. Phase 3 Features (Long-term), 11. FUTURE ROADMAP, 12.1. Current Limitations, 12.2. Browser Compatibility (+8 more)

### Community 60 - "SpeakMate - MVP Roadmap"
Cohesion: 0.12
Nodes (16): Border Radius, Colors, 🎨 Design System, Effects, 🚀 Getting Started, 📝 Notes, Phase 1: Core MVP ✅, Phase 2: Pre-Call Experience ✅ (+8 more)

### Community 61 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+8 more)

### Community 62 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, inputs, outputs, dependsOn, cache, persistent, dependsOn, $schema (+8 more)

### Community 63 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, eslint, eslint-config-next, jsdom, @playwright/test, tailwindcss, @tailwindcss/postcss, @testing-library/jest-dom (+8 more)

### Community 64 - "SpeakMate (Oratio) — Project Status & Issues Tracker"
Cohesion: 0.14
Nodes (15): Bugs & Issues, ~~Critical~~ — Fixed, Database Schema, Environment Variables Required, Features — Implemented & Working, Features — Not Started, Features — UI Only (Mock Data), High Priority (+7 more)

### Community 65 - "LeaderboardScreen.tsx"
Cohesion: 0.21
Nodes (13): getLeaderboard(), getUserRank(), LeaderboardEntry, TimeFrame, LeaderboardScreen(), fetchLeaderboard(), LeaderboardScreenProps, LeaderboardUser (+5 more)

### Community 66 - "useLanguage"
Cohesion: 0.23
Nodes (12): useLanguage(), IdlePanel(), IdlePanelProps, PreparationPanel(), PreparationPanelProps, RecordingPanelProps, ResultPanelProps, CueCard() (+4 more)

### Community 67 - "landing/src/app/page.tsx"
Cohesion: 0.20
Nodes (11): container, Home(), item, CortexSection(), Footer(), container, item, PartnershipSection() (+3 more)

### Community 68 - "ref_lucide_react"
Cohesion: 0.25
Nodes (9): InstallPWAPrompt(), LevelSelector(), LevelTestWelcome(), LevelTestWelcomeProps, BeforeInstallPromptEvent, InstallPromptState, useInstallPrompt(), LevelSelectPage() (+1 more)

### Community 69 - "Do lech: master context vs code hien tai"
Cohesion: 0.13
Nodes (14): Backend, Boss cards / vocal swipe, Cac note huu ich cho lan sau, Data source, Do lech: `context/` cu vs code hien tai, Do lech: master context vs code hien tai, Energy, Energy (+6 more)

### Community 70 - "2.2. Chi tiết từng Route"
Cohesion: 0.13
Nodes (15): 2.1. Cây Routes đầy đủ, 2.2. Chi tiết từng Route, 2. SITEMAP - CẤU TRÚC ROUTES, **Route: `/` (Homepage - Main Swipe Deck)**, **Route: `/learned` (Learned Words & Story Hub)**, **Route: `/level-select` (Manual Level Selection)**, **Route: `/onboarding` (First-Time User Guide)**, **Route: `/review` (Spaced Repetition Review)** (+7 more)

### Community 71 - "helpers.ts"
Cohesion: 0.23
Nodes (7): clearLexicaState(), injectLexicaState(), LexicaPersistedState, makeBypassState(), midnightTimestamp(), todayString(), @playwright/test

### Community 72 - "CallHistoryScreen.tsx"
Cohesion: 0.24
Nodes (14): CallHistoryScreenComponent(), CallHistoryScreenProps, CallSession, FeedbackBlock(), FeedbackData, formatDate(), formatDuration(), formatTime() (+6 more)

### Community 73 - "Manual Testing Steps"
Cohesion: 0.13
Nodes (14): 1. Database Setup, 2. Environment Variables, Automated Testing, Debug Page, "Error starting search", Manual Testing Steps, Prerequisites, Step 1: Open Two Browser Sessions (+6 more)

### Community 74 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+6 more)

### Community 75 - "State Management - Zustand Store"
Cohesion: 0.14
Nodes (13): 1. swipeCard(cardId, direction), 3. Energy System, Common Gotchas, Important State Actions, Initialization, Key Data Structures, Persistence Strategy, State Access Patterns (+5 more)

### Community 76 - "7.1. ELO Algorithm Details"
Cohesion: 0.14
Nodes (14): 7.1. ELO Algorithm Details, 7.2. Story Unlock Algorithm, 7.3. Spaced Repetition Algorithm, 7.4. Streak Algorithm, 7.5. Energy Reset Algorithm, 7. ALGORITHMS & SYSTEMS, `calculateStruggleRate(recentSwipes: SwipeHistory[]): number`, `generateInitialDeck(userStats, cardProgress, selectedLevel?, forcedCardIds?, shouldInjectReview?): VocabCardData[]` (+6 more)

### Community 77 - "SOLILO — Project Plan"
Cohesion: 0.14
Nodes (13): 1. High-Level Architecture, 2. State Machine Definition, 3. Data / Local State Schema, 5. Key Technical Decisions, CueCard (static data), Data Flow, IELTS Speaking Part 2 Simulator (MVP), Ratings (+5 more)

### Community 78 - "SessionController.tsx"
Cohesion: 0.22
Nodes (10): Home(), SessionController(), renderPanel(), PHASE_INDEX, PhaseIndicator(), PhaseIndicatorProps, PHASES, UserGuide() (+2 more)

### Community 79 - "RedisService"
Cohesion: 0.15
Nodes (3): 2. Redis (Caching & Queue Layer), RedisModule, RedisService

### Community 80 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, format, lint, start, start:debug, start:dev, start:prod (+5 more)

### Community 81 - "4.6. Other UI Components"
Cohesion: 0.15
Nodes (13): 4.3. Lab Components (Upgrade Modules), 4.4. Game Components, 4.6. Other UI Components, 4. COMPONENTS CHI TIẾT, **CortexWidget.tsx**, **ErrorBoundary.tsx**, **GameHub.tsx**, **InstallPWAPrompt.tsx** (+5 more)

### Community 82 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, @cortex/types, driver.js, framer-motion, lucide-react, next, next-pwa, react (+5 more)

### Community 83 - "Page: Màn hình Terminal (Synapse)"
Cohesion: 0.15
Nodes (12): 1. Header Bar, 2. TerminalBoard Panel (Left), 3. Right Sidebar (Status + History), 4. Footer Hint, Global Styles, Layout, Meta Information, Page Design Spec — Synapse (Desktop-first) (+4 more)

### Community 84 - "ref_eslint"
Cohesion: 0.23
Nodes (5): eslintConfig, eslintConfig, eslintConfig, eslintConfig, eslintConfig

### Community 85 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, canvas-confetti, clsx, framer-motion, lucide-react, motion, next, react (+4 more)

### Community 86 - "auth/page.tsx"
Cohesion: 0.24
Nodes (6): AuthPage(), container, item, AuroraBackground(), AuroraBackgroundProps, cn()

### Community 87 - "landing/src/app/layout.tsx"
Cohesion: 0.23
Nodes (8): jetbrainsMono, metadata, RootLayout(), spaceGrotesk, EcosystemRewardListener(), ScrollToTop(), canvas-confetti, socket.io-client

### Community 88 - "LEXICA - Architecture Overview"
Cohesion: 0.17
Nodes (12): 1. **State Management Strategy**, 2. **Routing**, 3. **Data Flow**, 4. **Performance**, 5. **Responsive Design**, Core Algorithms, Data Persistence, Key Architecture Decisions (+4 more)

### Community 89 - "Product Context"
Cohesion: 0.17
Nodes (11): 1. Energy, 2. ELO routing, 3. SRS, 4. Story funnel, Cam giac san pham, Dieu can nho ve "vision vs reality", Gameplay pillars hien tai, Muc nao dang la "partial" (+3 more)

### Community 90 - "Lexica — Testing Summary"
Cohesion: 0.17
Nodes (11): core-flow.spec.ts (6 tests), Cấu trúc thư mục, dead-end.spec.ts (6 tests), E2E Tests — 17 tests (pnpm test:e2e), eloAlgorithm.test.ts (33 tests), Ghi chú kỹ thuật, Lexica — Testing Summary, lexicaStore.test.ts (10 tests) (+3 more)

### Community 91 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, @next/bundle-analyzer, tailwindcss, @tailwindcss/postcss, tw-animate-css, @types/node (+4 more)

### Community 92 - "Cortex Ecosystem Deployment Strategy"
Cohesion: 0.17
Nodes (11): 1. Kiến trúc tổng thể (Architecture), 2. Triển khai Frontend (Vercel - Khuyên dùng), 3. Triển khai Backend (Railway / Render / Fly.io), 4. Cơ sở hạ tầng phụ trợ (Infrastructure), 5. Quy trình CI/CD (GitHub Actions), 6. Lưu ý về Auth Bridge (Cực kỳ quan trọng), 7. Môi trường Staging, Chiến lược Domain (Phương án Miễn phí): (+3 more)

### Community 93 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-turbo (+4 more)

### Community 95 - "3. CÁC TÍNH NĂNG CHÍNH"
Cohesion: 0.18
Nodes (11): 3.10. Sound Effects, 3.1. Energy System (Scarcity Mechanic), 3.2. ELO Routing & Adaptive Difficulty, 3.3. Card Evolution System (Mastery States), 3.4. Vocal Swipe (Killer Feature), 3.5. Story Mode (Progressive Unlock), 3.6. Spaced Repetition System (SRS), 3.7. Level System (+3 more)

### Community 96 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, lint, start, test, test:coverage, test:e2e (+3 more)

### Community 97 - "LanguageProvider.tsx"
Cohesion: 0.33
Nodes (7): getInitialLanguage(), LanguageContext, LanguageContextValue, LanguageProvider(), LANGUAGES, Language, translations

### Community 98 - "eslint-config/package.json"
Cohesion: 0.18
Nodes (10): eslint, eslint-config-prettier, @eslint/js, globals, typescript, typescript-eslint, name, private (+2 more)

### Community 99 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, extends (+2 more)

### Community 100 - "📅 LỘ TRÌNH CHI TIẾT (PHASED ROADMAP)"
Cohesion: 0.18
Nodes (10): 🛠️ CHIẾN LƯỢC TRIỂN KHAI (IMPLEMENTATION STRATEGY), CORTEX HUB - Lộ trình Phát triển "Bộ Não Vũ Trụ" (Universe Roadmap), 🟢 GIAI ĐOẠN 1: NỀN TẢNG & TRẢI NGHIỆM (EASY - INFRA & UX), 🟡 GIAI ĐOẠN 2: BỘ NÃO CƠ BẢN (MEDIUM - ANALYTICAL CORE), 🟠 GIAI ĐOẠN 3: XỬ LÝ NÂNG CAO & TƯƠNG TÁC (HARD - ADVANCED), 🔴 GIAI ĐOẠN 4: ĐA PHƯƠNG THỨC & AI (VERY HARD - MULTIMODAL), 🟣 GIAI ĐOẠN 5: VŨ TRỤ CORTEX (EXTREME - THE UNIVERSE), 🛠️ HỆ THỐNG "POWER TOOLS" TỔNG HỢP (+2 more)

### Community 101 - "cortex-core-api/README.md"
Cohesion: 0.20
Nodes (9): Compile and run the project, Deployment, Description, License, Project setup, Resources, Run tests, Stay in touch (+1 more)

### Community 102 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 103 - "profile/page.tsx"
Cohesion: 0.33
Nodes (6): container, item, ProfilePage(), LinguisticDashboard(), LinguisticProfile, supabase

### Community 104 - "ArsenalSection.tsx"
Cohesion: 0.31
Nodes (8): AppCard(), ArsenalSection(), container, item, FilterBar(), FilterBarProps, filters, Pillar

### Community 105 - "Core Components"
Cohesion: 0.20
Nodes (10): 1. VocabCard, 2. SwipeDeck, 3. EnergyBar, 4. LevelSelector, 5. LevelTestWelcome, 6. LevelTest, 7. LevelTestResult, 8. LearnedWordsList (+2 more)

### Community 106 - "LEXICA Context Documentation"
Cohesion: 0.20
Nodes (10): Be Concise, Be Specific, ✅ Best Practices, 📝 Context File Maintenance Log, 🔄 Cách Update Context Files, Keep It Sync, 📌 Key Conventions, LEXICA Context Documentation (+2 more)

### Community 107 - "FriendsScreen.tsx"
Cohesion: 0.31
Nodes (9): Friend, FriendCard(), FriendRequest, FriendRequestCard(), FriendsScreen(), FriendsScreenProps, StatusBadge(), SuggestedFriendCard() (+1 more)

### Community 108 - "What's inside?"
Cohesion: 0.20
Nodes (9): Apps and Packages, Build, Develop, Remote Caching, Turborepo starter, Useful Links, Using this example, Utilities (+1 more)

### Community 109 - "Hướng dẫn Hạ tầng Core API (INFRASTRUCTURE_GUIDE.md)"
Cohesion: 0.22
Nodes (6): 1. Supabase (Database Layer), 3. Real-time Events (Communication Layer), 4. Hệ thống Giám sát (Logging), 5. Cấu hình Môi trường (.env), Hướng dẫn Hạ tầng Core API (INFRASTRUCTURE_GUIDE.md), EventsModule

### Community 110 - "jest"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

### Community 111 - "world-bibles.ts"
Cohesion: 0.22
Nodes (8): CYBERPUNK_LORE, Mission, NARRATIVE_ARCS, ScenarioBlueprint, WASTELAND_LORE, WORLD_BIBLES, WorldLore, WrongOption

### Community 113 - "RoadmapSection.tsx"
Cohesion: 0.28
Nodes (7): container, item, RoadmapSection(), timelineItem, roadmapData, RoadmapMilestone, RoadmapPhase

### Community 114 - "lexica/context/README.md"
Cohesion: 0.22
Nodes (4): Component Hierarchy, Components Reference, Icon Usage (Lucide React), Styling Conventions

### Community 115 - "Data Models & Types"
Cohesion: 0.22
Nodes (8): Data Models & Types, DifficultyAnalysis, ELO Algorithm Types, localStorage Schema, PerformanceZone, ProgressStats, Test Question Type, Vocab Database

### Community 116 - "8. PWA & TECHNICAL FEATURES"
Cohesion: 0.22
Nodes (9): 8.1. PWA Configuration, 8.2. Touch Gestures, 8.3. Web Speech API, 8.4. Analytics, 8.5. Performance Optimizations, 8.6. Accessibility, 8.7. Error Handling, 8.8. Security (+1 more)

### Community 117 - "RatingScreen.tsx"
Cohesion: 0.28
Nodes (8): BAND_LABELS, BandSelector(), CRITERIA, CRITERION_TAGS, IELTSScores, RatingScreen(), RatingScreenProps, TagButton()

### Community 118 - "CORTEX HUB - Hướng dẫn Hoàn tất Cài đặt (SETUP_GUIDE.md)"
Cohesion: 0.25
Nodes (7): 1. Supabase (Cơ sở dữ liệu), 2. Redis (Xử lý hàng đợi & Cache), 3. Cấu hình Biến môi trường (.env), A. Lấy thông tin kết nối:, B. Tạo các bảng dữ liệu (SQL):, CORTEX HUB - Hướng dẫn Hoàn tất Cài đặt (SETUP_GUIDE.md), 🚀 Kiểm tra sau khi Setup

### Community 119 - "app.e2e-spec.ts"
Cohesion: 0.25
Nodes (4): AppModule, @nestjs/core, @nestjs/testing, supertest

### Community 121 - "6. GAME MODES"
Cohesion: 0.25
Nodes (8): 6.1. Memory Match, 6.2. Speed Quiz, 6.3. Type Challenge, 6.4. Word Scramble, 6.5. True/False Blitz, 6.6. Word Bingo, 6.7. Combo Chain, 6. GAME MODES

### Community 122 - "ResultPanel.tsx"
Cohesion: 0.43
Nodes (5): getScoreColor(), ResultPanel(), useCountUp(), logSoliloAction(), getBandDescriptor()

### Community 123 - "CORTEX HUB System Architecture & Shared Context"
Cohesion: 0.25
Nodes (7): 1. Tầm nhìn Hệ sinh thái (Ecosystem Vision), 2. Hạ tầng Kỹ thuật (Technical Infrastructure), 3. Chiến lược Tích hợp (Integration Strategy), 4. Danh mục Ứng dụng & Vai trò, 5. Hướng dẫn Mở rộng, CORTEX HUB System Architecture & Shared Context, Quy trình trao đổi dữ liệu:

### Community 124 - "ui/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, strictNullChecks, exclude, extends, include, @repo/typescript-config/react-library.json

### Community 125 - "synapse-technical-architecture.md"
Cohesion: 0.25
Nodes (7): 1.Architecture design, 2.Technology Description, 3.Route definitions, 4.1 Core API, 4.API definitions (If it includes backend services), 5.Server architecture diagram (If it includes backend services), 6.Data model(if applicable)

### Community 126 - "Core Data Structures"
Cohesion: 0.29
Nodes (7): CardState, Core Data Structures, DifficultyLevel, UserCardProgress, UserStats, VocabCardData, VocalSwipeState

### Community 127 - "📚 File Structure"
Cohesion: 0.29
Nodes (7): [ARCHITECTURE.md](./ARCHITECTURE.md), [COMPONENTS.md](./COMPONENTS.md), [DATA_MODELS.md](./DATA_MODELS.md), [FEATURES.md](./FEATURES.md), 📚 File Structure, [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md), [STYLING.md](./STYLING.md)

### Community 128 - "2. CORE GAMEPLAY LOOP & MECHANICS"
Cohesion: 0.29
Nodes (6): 1. PROJECT OVERVIEW, 2. CORE GAMEPLAY LOOP & MECHANICS, A. The Energy System (Scarcity), B. Card Evolution & ELO Routing, C. POV Micro-Scenarios (Contextual Learning), LEXICA: MASTER PROJECT CONTEXT & TECHNICAL SPECIFICATIONS

### Community 129 - "lexicaStore.test.ts"
Cohesion: 0.33
Nodes (4): getMidnightTimestamp(), resetToKnownState(), @vitejs/plugin-react, vitest

### Community 130 - "AchievementsScreen.tsx"
Cohesion: 0.43
Nodes (6): Achievement, AchievementCard(), AchievementsScreen(), AchievementsScreenProps, CategoryButton(), StatsOverview()

### Community 131 - "CallSummaryScreen.tsx"
Cohesion: 0.43
Nodes (6): CallSummaryScreen(), CallSummaryScreenProps, ExpandableSection(), ScoreBar(), SessionData, StatCard()

### Community 132 - "useFillerTracker.ts"
Cohesion: 0.29
Nodes (6): CONTEXTUAL_FILLER_PATTERNS, FillerLog, PHRASE_FILLER_PATTERNS, PURE_FILLER_PATTERNS, SpeechRecognitionErrorEvent, SpeechRecognitionEvent

### Community 133 - "synapse/src/app/layout.tsx"
Cohesion: 0.33
Nodes (5): metadata, monoFont, RootLayout(), sansFont, ThemeProvider()

### Community 134 - "SYNAPSE: PROJECT CONTEXT & ARCHITECTURE"
Cohesion: 0.29
Nodes (6): 1. Project Overview, 2. Core Architecture, 3. UI/UX Style Guidelines, 4. Pending Tasks & Future Ideas, 5. Current State (2026-04-28), SYNAPSE: PROJECT CONTEXT & ARCHITECTURE

### Community 135 - "typescript-config/package.json"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 136 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 137 - "🎯 Quick Reference"
Cohesion: 0.33
Nodes (6): Debug issue?, Implement feature?, Làm việc với state?, Onboarding mới?, 🎯 Quick Reference, Tạo component mới?

### Community 138 - "LEXICA Context Hub"
Cohesion: 0.33
Nodes (5): Cach dung thu muc nay, LEXICA Context Hub, Snapshot hien tai, Thu tu nen doc, Thu tu uu tien khi can tin "dung"

### Community 139 - "4.1. Core Components"
Cohesion: 0.33
Nodes (6): 4.1. Core Components, **EnergyBar.tsx**, **InteractiveTour.tsx**, **OnboardingModal.tsx**, **SwipeDeck.tsx**, **VocabCard.tsx**

### Community 140 - "5. DATA MODELS & STORE"
Cohesion: 0.33
Nodes (6): 5.1. Zustand Store Structure, 5.2. Persistence, 5.3. Data Files, 5. DATA MODELS & STORE, **app/data/stories.ts**, **app/data/vocabCards.ts**

### Community 141 - "To remove mock data and restore production state:"
Cohesion: 0.33
Nodes (5): 1. Delete the mock function (lines ~153-188):, 2. Change line ~200:, 3. Rebuild:, Revert Mock Data Instructions, To remove mock data and restore production state:

### Community 142 - "Hướng dẫn Sử dụng Shared Types (`@cortex/types`)"
Cohesion: 0.33
Nodes (5): 1. Cài đặt cho một App mới, 2. Sử dụng Mappers (Cầu nối dữ liệu), 3. Mở rộng Shared Types, Hướng dẫn Sử dụng Shared Types (`@cortex/types`), Ví dụ: Chuyển đổi điểm số từ Local sang Shared

### Community 143 - "react-library.json"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, extends, ./base.json, $schema

### Community 144 - "synapse-prd.md"
Cohesion: 0.33
Nodes (5): 1. Product Overview, 2.1 Feature Module, 2.3 Page Details, 2. Core Features, 3. Core Process

### Community 145 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 146 - "dialecta/page.tsx"
Cohesion: 0.40
Nodes (3): container, features, item

### Community 147 - "echo/page.tsx"
Cohesion: 0.40
Nodes (3): container, features, item

### Community 148 - "oratio/page.tsx"
Cohesion: 0.40
Nodes (3): container, features, item

### Community 149 - "solilo/page.tsx"
Cohesion: 0.40
Nodes (3): container, features, item

### Community 150 - "4.2. Story Components"
Cohesion: 0.40
Nodes (5): 4.2. Story Components, **StoryComprehensionQuiz.tsx**, **StoryMode.tsx**, **StoryQuizModal.tsx**, **StoryUnlockModal.tsx**

### Community 151 - "4.5. Chart Components"
Cohesion: 0.40
Nodes (5): 4.5. Chart Components, **AccuracyChart.tsx**, **ActivityHeatmap.tsx**, **CardStatesPieChart.tsx**, **ELOChart.tsx**

### Community 152 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 153 - "ORATIO"
Cohesion: 0.40
Nodes (4): Deploy on Vercel, Getting Started, Learn More, ORATIO

### Community 154 - "cortex-types/package.json"
Cohesion: 0.40
Nodes (4): main, name, types, version

### Community 155 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 156 - "landing/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 157 - "1. TỔNG QUAN DỰ ÁN"
Cohesion: 0.50
Nodes (4): 1.1. Thông tin cơ bản, 1.2. Tech Stack, 1.3. Design Philosophy, 1. TỔNG QUAN DỰ ÁN

### Community 158 - "lexica/next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, withPWAConfig, next-pwa

### Community 159 - "lexica/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 160 - "solilo/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 161 - "synapse/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 162 - "exports"
Cohesion: 0.50
Nodes (4): exports, ./base, ./next-js, ./react-internal

## Knowledge Gaps
- **1466 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+1461 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1651 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `app.module.ts` to `cortex-core-api/package.json`, `SynapseScenario`, `EventsGateway`, `SupabaseService`, `app.e2e-spec.ts`, `AppService`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `recharts` connect `ref_react` to `lexica/package.json`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `@nestjs/config` connect `app.module.ts` to `SynapseScenario`, `cortex-core-api/package.json`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _1466 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workbox-01fd22c6.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05541368743615935 - nodes in this community are weakly interconnected._
- **Should `ref_next` be split into smaller, more focused modules?**
  _Cohesion score 0.0289193302891933 - nodes in this community are weakly interconnected._
- **Should `useSoundEffects` be split into smaller, more focused modules?**
  _Cohesion score 0.08344988344988345 - nodes in this community are weakly interconnected._