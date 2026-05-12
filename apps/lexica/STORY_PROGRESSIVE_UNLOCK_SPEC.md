# Story Progressive Unlock - Technical Specification

**Created:** 12/05/2026  
**Status:** 🟡 Planned  
**Priority:** High - Core engagement feature

---

## 📋 Overview

Redesign story unlock mechanism to be more interactive and easier to unlock, reducing friction while adding player agency.

**Current Problem:**
- Stories locked behind 10/10 words (too strict)
- Passive unlock (no interaction)
- Preview shows teaser but offers no action
- Stories feel disconnected from learning journey

**Solution:**
Progressive unlock system with 2 parts + quiz alternative route.

---

## 🎯 Feature Goals

1. **Lower barrier:** Unlock Part 1 at 4/7 words (instead of 10/10)
2. **Add agency:** Allow quiz-based unlock as alternative
3. **Progressive reveal:** Split stories into Part 1 (60%) + Part 2 (40%)
4. **Better motivation:** Always show clear path to unlock

---

## 🏗️ Technical Design

### Data Structure Changes

#### 1. Update Story Interface

```typescript
// apps/lexica/app/data/stories.ts

export interface Story {
    id: string;
    title: string;
    teaser: string;
    
    // NEW: Split content into 2 parts
    part1Content: string;      // ~60% of story, unlocks at 4/7 words
    part2Content: string;      // ~40% of story, unlocks at 7/7 words
    
    vocabularyIds: string[];   // Now 7 vocab IDs (reduced from 10)
    
    // NEW: Quiz requirements
    part1QuizRequirement: number;  // Min words learned to take quiz (3)
    part2QuizRequirement: number;  // Min words learned to take quiz (5)
    
    difficultyLevel: DifficultyLevel | 'mixed';
    darkComedyLevel: 'medium' | 'high' | 'extreme';
}
```

#### 2. Update Store State

```typescript
// apps/lexica/app/store/lexicaStore.ts

interface LexicaStore {
    // EXISTING
    unlockedStories: string[];      // Full story unlocked
    readStories: string[];
    
    // NEW: Track partial unlocks
    unlockedStoryPart1: string[];   // Part 1 unlocked
    
    // NEW: Track quiz attempts
    storyQuizAttempts: Record<string, {
        part1Passed?: boolean;
        part2Passed?: boolean;
        lastAttempt?: number;
    }>;
    
    // NEW: Actions
    unlockStoryPart1: (storyId: string) => void;
    unlockStoryPart2: (storyId: string) => void;
    openStoryQuizModal: (storyId: string, part: 1 | 2) => void;
    submitStoryQuiz: (storyId: string, part: 1 | 2, score: number) => void;
}
```

#### 3. Update Helper Functions

```typescript
// apps/lexica/app/data/stories.ts

// Update from 10 to 7 words
export const STORIES: Story[] = [
    {
        id: 'story_001',
        title: 'The Meticulous Heist',
        teaser: '...',
        part1Content: `[First 60% of story content]`,
        part2Content: `[Ending 40% with climax]`,
        vocabularyIds: ['v001', 'v002', 'v003', 'v004', 'v005', 'v006', 'v007'], // 7 words
        part1QuizRequirement: 3,
        part2QuizRequirement: 5,
        difficultyLevel: 'intermediate',
        darkComedyLevel: 'high',
    },
    // ... more stories
];

// NEW: Check Part 1 unlock status
export function canUnlockPart1Naturally(story: Story, learnedWordIds: string[]): boolean {
    return getStoryLearnedCount(story, learnedWordIds) >= 4;
}

// NEW: Check Part 1 quiz eligibility
export function canTakePart1Quiz(story: Story, learnedWordIds: string[]): boolean {
    return getStoryLearnedCount(story, learnedWordIds) >= story.part1QuizRequirement;
}

// NEW: Check Part 2 unlock status
export function canUnlockPart2Naturally(story: Story, learnedWordIds: string[]): boolean {
    return getStoryLearnedCount(story, learnedWordIds) >= 7;
}

// NEW: Check Part 2 quiz eligibility
export function canTakePart2Quiz(story: Story, learnedWordIds: string[]): boolean {
    return getStoryLearnedCount(story, learnedWordIds) >= story.part2QuizRequirement;
}

// UPDATE: Preview visible at 2 words (unchanged)
export function isStoryPreviewVisible(story: Story, learnedWordIds: string[]): boolean {
    return getStoryLearnedCount(story, learnedWordIds) >= 2;
}

// DEPRECATED: Remove old isStoryUnlocked
// Replace with: isStoryPart1Unlocked, isStoryPart2Unlocked
```

---

## 🎨 UI/UX Changes

### 1. Story Card States (on /learned page)

```
┌─────────────────────────────────────────────┐
│ 📖 The Meticulous Heist      [3/7 words]   │
│ ━━━━━━━░░░ 43%                              │
│                                             │
│ State 1: LOCKED (0-1 words learned)         │
│ "Thu thập thêm X từ để preview"             │
│                                             │
│ State 2: PREVIEW (2-3 words learned)        │
│ "Một vụ cướp ngân hàng ngu ngốc..."         │
│ [Học thêm 1 từ] để mở Part 1                │
│                                             │
│ State 3: QUIZ AVAILABLE (3 words learned)   │
│ [⚡ Unlock Part 1]                          │
│ • Học thêm 1 từ, HOẶC                       │
│ • Làm quiz với 3 từ đã học                  │
│                                             │
│ State 4: PART 1 UNLOCKED (4+ words)         │
│ ✓ Part 1 unlocked                           │
│ [📖 Đọc Part 1] | [Continue learning...]   │
│                                             │
│ State 5: PART 2 QUIZ AVAILABLE (5-6 words)  │
│ ✓ Part 1 read                               │
│ [⚡ Unlock Ending]                          │
│ • Học thêm X từ, HOẶC                       │
│ • Làm quiz với 5 từ đã học                  │
│                                             │
│ State 6: FULL STORY UNLOCKED (7 words)      │
│ ✓✓ Hoàn thành                               │
│ [📖 Đọc lại full story]                     │
└─────────────────────────────────────────────┘
```

### 2. New Component: StoryQuizModal

```typescript
// apps/lexica/app/components/StoryQuizModal.tsx

interface StoryQuizModalProps {
    storyId: string;
    part: 1 | 2;  // Which part to unlock
    onPass: () => void;
    onFail: () => void;
    onClose: () => void;
}

// Quiz format:
// - 5 multiple choice questions
// - Use only words user has learned from this story
// - Must get 4/5 correct to pass
// - On pass: auto-unlock the part
```

### 3. Update StoryMode Component

```typescript
// apps/lexica/app/components/StoryMode.tsx

// Add part prop
interface StoryModeProps {
    storyId: string;
    part: 'part1' | 'part2' | 'full';  // NEW
    onClose: () => void;
    onFinish: () => void;
}

// Display logic:
// - If part='part1': show part1Content + CTA for part 2
// - If part='part2': show part1 + part2 (full story)
// - If part='full': show everything (for re-reading)
```

### 4. Update StoryUnlockModal

Replace generic "Story Unlocked!" with context-specific messages:

```
Part 1 Unlocked:
"📖 Part 1 Unlocked!"
"Bạn đã mở khóa 60% đầu của câu chuyện"

Part 2 Unlocked:
"🎉 Ending Unlocked!"
"Bạn đã hoàn thành full story!"
```

---

## 🔄 User Flows

### Flow 1: Natural Learning Path

```
User learns words → 4 words reached
→ Part 1 auto-unlocks
→ Modal: "Part 1 Unlocked! Đọc ngay?"
→ Read Part 1 → See "To be continued..."
→ Continue learning → 7 words reached
→ Part 2 auto-unlocks
→ Modal: "Ending Unlocked!"
→ Read full story
```

### Flow 2: Quiz Shortcut Path

```
User learns 3 words
→ Story card shows "⚡ Unlock Part 1" button
→ Click → StoryQuizModal opens
→ Answer 5 questions (4/5 to pass)
→ PASS: Part 1 unlocks immediately
→ FAIL: "Học thêm từ hoặc thử lại sau 1h"
```

### Flow 3: Mixed Path

```
User learns 3 words
→ Takes quiz for Part 1 → Pass
→ Reads Part 1
→ Learns 2 more words (total 5)
→ Takes quiz for Part 2 → Pass
→ Unlocks ending early (without reaching 7 words)
```

---

## ⚙️ Implementation Steps

### Phase 1: Data Migration (Day 1)

1. ✅ Update Story interface with part1Content, part2Content
2. ✅ Split existing 3 stories into 2 parts each
3. ✅ Reduce vocabularyIds from 10 → 7 per story
4. ✅ Add quiz requirement fields
5. ✅ Update helper functions

### Phase 2: Store & Logic (Day 1-2)

1. ✅ Add unlockedStoryPart1 state
2. ✅ Add storyQuizAttempts state
3. ✅ Add unlockStoryPart1/Part2 actions
4. ✅ Update checkStoryUnlock logic (check both parts)
5. ✅ Add quiz submission logic with cooldown

### Phase 3: UI Components (Day 2-3)

1. ✅ Create StoryQuizModal component
   - 5 question quiz interface
   - Score display
   - Pass/fail handling
   
2. ✅ Update StoryMode component
   - Add part prop
   - Show "Part 1" or "Full Story" header
   - Add "Continue to Part 2" CTA after Part 1
   
3. ✅ Update StoryUnlockModal
   - Context-aware messaging (Part 1 vs Part 2)
   
4. ✅ Update story cards in /learned page
   - New state rendering logic
   - Quiz unlock buttons
   - Progress indicators

### Phase 4: Polish & Testing (Day 3-4)

1. ✅ Add animations for part unlock
2. ✅ Test all flows (natural, quiz, mixed)
3. ✅ Add analytics events
4. ✅ Handle edge cases (see below)

---

## 🚨 Edge Cases & Considerations

### Quiz System

**Q: Quiz cooldown?**
- A: 1 hour cooldown on failed attempts per part
- Store timestamp in storyQuizAttempts

**Q: Quiz question generation?**
- A: Pre-generate 10 questions per story in stories.ts
- Randomly select 5 from pool of learned words

**Q: Can retry quiz after passing?**
- A: No, once passed = permanent unlock

**Q: What if user has 10 old learned words?**
- A: Auto-unlock both parts immediately (migration logic)

### State Management

**Q: What if user learns word after taking quiz?**
- A: Doesn't matter, unlock status persists

**Q: Can go back to Part 1 after reading Part 2?**
- A: Yes, "Đọc lại full story" shows both parts

**Q: What happens to old unlockedStories state?**
- A: Migration: Move to both unlockedStoryPart1 + unlockedStories (full)

### UX

**Q: Show Part 1 CTA on main learning screen?**
- A: Optional enhancement - small badge "Story Part 1 ready!"

**Q: Notification when Part 1 unlocks?**
- A: Yes, modal popup after swipe action that triggers unlock

**Q: Story read tracking?**
- A: Track separately: readStoryPart1, readStories (full)

---

## 📊 Success Metrics

Track these analytics events:

```typescript
analytics.storyPart1Unlocked(storyId, method: 'natural' | 'quiz')
analytics.storyPart1Read(storyId)
analytics.storyPart2Unlocked(storyId, method: 'natural' | 'quiz')
analytics.storyFullRead(storyId)
analytics.storyQuizAttempt(storyId, part, score, passed)
analytics.storyQuizFailed(storyId, part, score)
```

**Success indicators:**
- % stories Part 1 unlocked increases
- % quiz unlocks vs natural unlocks
- Average time from Part 1 to Part 2
- Story completion rate increases

---

## 🎨 Design Tokens

```typescript
// Colors for story system
const STORY_COLORS = {
    locked: 'text-slate-500',
    preview: 'text-slate-400',
    part1Unlocked: 'text-cyan-400',
    fullUnlocked: 'text-cyan-300',
    quizAvailable: 'text-amber-400',
    progressBar: {
        incomplete: 'bg-slate-700',
        part1: 'bg-cyan-500',
        part2: 'bg-cyan-400',
    }
};
```

---

## 📝 Content Writing Tasks

Need to split 3 existing stories:

1. **"The Meticulous Heist"**
   - Part 1: Setup + failed entry attempt
   - Part 2: Escape + revelation about pizza box

2. **"The Apocalypse Job Interview"**
   - Part 1: Interview start through references discussion
   - Part 2: Exit interview chase scene

3. **"The Sophisticated Time Traveler"**
   - Part 1: Arrival through inventor meeting
   - Part 2: Timeline fork disaster

Each part should end on a cliffhanger or natural pause point.

---

## 🔗 Related Files

**To Create:**
- `apps/lexica/app/components/StoryQuizModal.tsx`

**To Modify:**
- `apps/lexica/app/data/stories.ts`
- `apps/lexica/app/store/lexicaStore.ts`
- `apps/lexica/app/components/StoryMode.tsx`
- `apps/lexica/app/components/StoryUnlockModal.tsx`
- `apps/lexica/app/learned/page.tsx`

**To Test:**
- All story unlock flows
- Quiz pass/fail scenarios
- State persistence across sessions

---

## ✅ Definition of Done

- [ ] All 3 stories split into 2 parts (7 words each)
- [ ] Part 1 unlocks at 4/7 words
- [ ] Part 2 unlocks at 7/7 words
- [ ] Quiz system working (5 questions, 4/5 to pass)
- [ ] Quiz cooldown enforced (1 hour)
- [ ] Story cards show all 6 states correctly
- [ ] Animations polished
- [ ] Analytics events firing
- [ ] No TypeScript errors
- [ ] Manual testing on mobile + desktop
- [ ] Old unlocked stories migrated correctly

---

**Next Steps:**
1. Review spec with team/user
2. Begin Phase 1 (data migration)
3. Implement incrementally following phases
4. Test each phase before moving to next

**Estimated Time:** 3-4 days full implementation
