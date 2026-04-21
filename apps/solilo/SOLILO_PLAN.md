# SOLILO — Project Plan
### IELTS Speaking Part 2 Simulator (MVP)
> *"The Interrogation Room"* — A hardcore, ultra-minimalist practice funnel for ORATIO.

---

## 1. High-Level Architecture

```
/app                          ← Next.js App Router (single-page app)
├── layout.tsx                ← Root layout: dark mode globals, font loading
├── page.tsx                  ← Entry point: renders <SessionController />
├── globals.css               ← Tailwind directives + custom CSS vars
│
/components
├── SessionController.tsx     ← Orchestrator: reads machine state → renders correct phase panel
├── panels/
│   ├── IdlePanel.tsx         ← "Start Mock Test" + mic permission gate
│   ├── PreparationPanel.tsx  ← Cue card + textarea + 60s countdown
│   ├── RecordingPanel.tsx    ← Audio visualizer + 120s countdown + minimized notes
│   ├── EvaluationPanel.tsx   ← Audio playback + 4 self-rating sliders
│   └── ResultPanel.tsx       ← Final score + ORATIO CTA
├── ui/
│   ├── CountdownTimer.tsx    ← font-mono countdown display (mm:ss)
│   ├── AudioVisualizer.tsx   ← Canvas/CSS waveform driven by AnalyserNode
│   ├── RatingSlider.tsx      ← Single 1.0–9.0 step slider (0.5 increments)
│   ├── CueCard.tsx           ← Serif-styled IELTS Part 2 topic card
│   └── FillerFlash.tsx       ← Subtle red screen flash on filler increment
│
/hooks
├── useSessionMachine.ts      ← Core state machine (useReducer-based)
├── useCountdown.ts           ← Generic countdown timer hook
├── useMediaRecorder.ts       ← MediaRecorder API wrapper → Blob
├── useAudioVisualizer.ts     ← AnalyserNode → canvas draw loop
├── useFillerTracker.ts       ← Stub hook (manual increment now, Web Speech later)
│
/lib
├── cueCards.ts               ← Static array of IELTS Part 2 cue card data
├── scoring.ts                ← Average score calculator + band rounding
└── constants.ts              ← Timing constants, ORATIO base URL, etc.
│
/types
└── index.ts                  ← Shared TypeScript types & interfaces
```

### Data Flow

```
User clicks "Start" 
  → useSessionMachine dispatches IDLE → PREPARATION
    → useCountdown(60) starts
      → timer hits 0 → dispatches PREPARATION → RECORDING
        → useMediaRecorder.start() + useCountdown(120) starts
          → timer hits 0 → useMediaRecorder.stop() → dispatches RECORDING → EVALUATION
            → user plays blob, rates on 4 sliders → dispatches EVALUATION → RESULT
              → score displayed + ORATIO CTA
                → "Try Again" resets → IDLE
```

---

## 2. State Machine Definition

### States

| State         | Entry Condition                | Exit Condition                         | Duration  |
|---------------|--------------------------------|----------------------------------------|-----------|
| `IDLE`        | App load / reset               | User clicks "Start" + mic granted      | ∞ (user)  |
| `PREPARATION` | Mic permission confirmed       | Countdown reaches 0                    | 60s       |
| `RECORDING`   | Prep countdown expires         | Countdown reaches 0                    | 120s      |
| `EVALUATION`  | Recording countdown expires    | User submits all 4 ratings             | ∞ (user)  |
| `RESULT`      | Ratings submitted              | User clicks "Try Again" or ORATIO CTA  | ∞ (user)  |

### Reducer Shape

```typescript
type SessionState =
  | { phase: 'IDLE' }
  | { phase: 'PREPARATION'; cueCard: CueCard; notes: string }
  | { phase: 'RECORDING';   cueCard: CueCard; notes: string }
  | { phase: 'EVALUATION';  cueCard: CueCard; audioBlob: Blob; ratings: Ratings }
  | { phase: 'RESULT';      cueCard: CueCard; audioBlob: Blob; ratings: Ratings; score: number };

type SessionAction =
  | { type: 'START';              cueCard: CueCard }
  | { type: 'UPDATE_NOTES';      notes: string }
  | { type: 'BEGIN_RECORDING' }
  | { type: 'FINISH_RECORDING';  audioBlob: Blob }
  | { type: 'UPDATE_RATING';     criterion: RatingCriterion; value: number }
  | { type: 'SUBMIT_EVALUATION' }
  | { type: 'RESET' };
```

### Transition Diagram

```
  ┌──────┐   START     ┌─────────────┐  timer=0  ┌───────────┐
  │ IDLE │────────────▶│ PREPARATION │──────────▶│ RECORDING │
  └──────┘             └─────────────┘           └───────────┘
     ▲                                                │
     │  RESET                                    timer=0
     │                                                │
  ┌──────────┐  SUBMIT   ┌────────────┐              │
  │  RESULT  │◀──────────│ EVALUATION │◀─────────────┘
  └──────────┘           └────────────┘
```

---

## 3. Data / Local State Schema

### CueCard (static data)

```typescript
interface CueCard {
  id: string;            // e.g. "part2-015"
  topic: string;         // e.g. "Describe a book that had a major influence on you."
  bullets: string[];     // 3-4 sub-prompts: "You should say: ..."
  followUp: string;      // "...and explain why it influenced you."
}
```

### Ratings

```typescript
type RatingCriterion = 'fluency' | 'lexical' | 'grammar' | 'pronunciation';

interface Ratings {
  fluency:        number | null;  // 1.0 – 9.0 (0.5 step)
  lexical:        number | null;
  grammar:        number | null;
  pronunciation:  number | null;
}
```

### Session Context (in-memory, no persistence)

```typescript
interface SessionContext {
  cueCard:     CueCard | null;
  notes:       string;
  audioBlob:   Blob | null;
  ratings:     Ratings;
  fillerCount: number;
  finalScore:  number | null;
}
```

> **No database.** All state lives in React state/context for the MVP. Audio blob is held in memory and discarded on reset.

---

## 4. Implementation Checklist

### Phase 1: Project Setup & UI Shell
- [x] Initialize Next.js project with TypeScript + Tailwind CSS (`create-next-app`)
- [x] Configure Tailwind: dark mode colors (`slate-900`/`#0F172A`), extend with mono + serif font families
- [x] Set up `globals.css` with base dark-mode body styles
- [x] Create `layout.tsx` with metadata, font imports, dark background
- [x] Create `types/index.ts` with all shared interfaces (`CueCard`, `Ratings`, `SessionState`, `SessionAction`, etc.)
- [x] Create `lib/constants.ts` (timing values, ORATIO URL placeholder)
- [x] Create `lib/cueCards.ts` with 10–15 real IELTS Part 2 cue cards
- [x] Create `lib/scoring.ts` (average + IELTS band rounding utility)
- [x] Build static UI components (no logic): `CountdownTimer`, `CueCard`, `RatingSlider`
- [x] Build panel shells (static markup only): `IdlePanel`, `PreparationPanel`, `RecordingPanel`, `EvaluationPanel`, `ResultPanel`
- [x] Build `SessionController` that renders a panel based on a hardcoded phase (for visual testing)
- [x] Wire `page.tsx` → `SessionController`; verify dark-mode renders correctly

### Phase 2: State Machine & Timer Hooks
- [x] Implement `useSessionMachine` (useReducer): all states, transitions, and guards
- [x] Implement `useCountdown` hook (generic: takes seconds, returns `{ remaining, isFinished }`, calls `onComplete`)
- [x] Wire `SessionController` to `useSessionMachine` (replace hardcoded phase)
- [x] Wire `PreparationPanel` to `useCountdown(60)` → auto-transition to `RECORDING`
- [x] Wire `RecordingPanel` to `useCountdown(120)` → auto-transition to `EVALUATION`
- [x] Wire `IdlePanel` "Start" button → dispatches `START` with random cue card
- [x] Wire `EvaluationPanel` submit → dispatches `SUBMIT_EVALUATION`
- [x] Wire `ResultPanel` "Try Again" → dispatches `RESET`
- [x] End-to-end flow test: click through all 5 phases in browser

### Phase 3: MediaRecorder API & Audio
- [x] Implement `useMediaRecorder` hook (request mic, start/stop, produce Blob)
- [x] Integrate mic permission check into `IdlePanel` (gate the Start button)
- [x] Auto-start recording when entering `RECORDING` phase
- [x] Auto-stop recording when `RECORDING` countdown expires; pass Blob to state
- [x] Implement `useAudioVisualizer` hook (AnalyserNode → canvas requestAnimationFrame)
- [x] Build `AudioVisualizer` component (canvas waveform/bars, interrogation-room aesthetic)
- [x] Show visualizer in `RecordingPanel`
- [x] Build audio playback controls in `EvaluationPanel` (native `<audio>` from Blob URL)

### Phase 4: Self-Rubric Evaluation & Scoring
- [x] Polish `RatingSlider` (1.0–9.0, 0.5 steps, value label, Tailwind-only or Radix Slider)
- [x] Wire 4 sliders in `EvaluationPanel` to ratings state
- [x] Require all 4 ratings before enabling "Submit" button
- [x] Compute final score on submit (average, round to nearest 0.5)
- [x] Display score in `ResultPanel` with band descriptor text

### Phase 5: Filler Tracker & Polish
- [x] Implement `useFillerTracker` stub hook (expose `fillerCount` + `increment()`)
- [x] Build `FillerFlash` component (red flash overlay on increment)
- [x] Integrate filler tracker into `RecordingPanel` (temporary manual trigger for testing)
- [ ] Add entrance/exit transitions between panels (CSS or Framer Motion lite)
- [x] Build the ORATIO CTA in `ResultPanel` (link with `?topic={cueCard.id}`)
- [ ] Responsive pass: ensure mobile-first layout works on 375px+
- [x] Accessibility pass: focus management, aria-labels on sliders/buttons, screen-reader text for timer
- [ ] Final visual QA: typography hierarchy, spacing, interrogation-room vibe consistency

### Phase 6: Deploy & Smoke Test
- [ ] Add `next.config.ts` adjustments if needed (output, images, etc.)
- [ ] Deploy to Vercel (or preferred platform)
- [ ] End-to-end smoke test on deployed URL (desktop + mobile)
- [ ] Confirm ORATIO CTA link works with topic ID passthrough

---

## 5. Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | `useReducer` + discriminated union | Simple, type-safe, no external deps. Sufficient for single-session flow. |
| Slider component | Radix UI `@radix-ui/react-slider` | Accessible, unstyled, tiny bundle. Tailwind-friendly. Only external UI dep. |
| Audio recording | Native `MediaRecorder` API | No backend needed. Blob stays in memory. |
| Audio visualization | `AnalyserNode` + `<canvas>` | Real-time waveform. No library needed. |
| Animations | CSS transitions (+ Framer Motion only if needed) | Minimal bundle. Interrogation-room vibe = sharp cuts, not floaty animations. |
| Routing | Single page (`/`) | One flow, one page. No router complexity. |
| Persistence | None | MVP is sessionless. Audio discarded on reset. |

---

*Plan generated. Awaiting approval before writing application code.*
