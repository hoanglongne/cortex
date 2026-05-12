import { DifficultyLevel } from '../components/VocabCard';
import { VOCAB_DATABASE } from './vocabCards';

export interface Story {
    id: string;
    title: string;
    teaser: string;

    // Progressive unlock: stories split into 2 parts
    part1Content: string;      // ~60% of story, unlocks at 4/7 words
    part2Content: string;      // ~40% of story, unlocks at 7/7 words

    content: string; // Legacy fallback (full story for backwards compat)
    vocabularyIds: string[]; // 7 vocab card IDs (reduced from 10)

    // Quiz unlock requirements
    part1QuizRequirement: number;  // Min words to take Part 1 quiz (default: 3)
    part2QuizRequirement: number;  // Min words to take Part 2 quiz (default: 5)

    difficultyLevel: DifficultyLevel | 'mixed';
    darkComedyLevel: 'medium' | 'high' | 'extreme';
}

const VOCAB_BY_ID = new Map(VOCAB_DATABASE.map(vocab => [vocab.id, vocab]));

/**
 * Pre-generated absurd dark-comedy stories
 * Each story contains exactly 7 vocabulary words, split into 2 parts:
 * - Part 1 unlocks at 4/7 words (or quiz with 3 words)
 * - Part 2 unlocks at 7/7 words (or quiz with 5 words)
 */
export const STORIES: Story[] = [
    {
        id: 'story_001',
        title: 'The Meticulous Heist',
        teaser: 'Một vụ cướp ngân hàng ngu ngốc đến mức guard phải mở cửa chỉ để đuổi bạn đi.',
        difficultyLevel: 'intermediate',
        darkComedyLevel: 'high',
        vocabularyIds: ['v001', 'v002', 'v003', 'v004', 'v005', 'v006', 'v007'],
        part1QuizRequirement: 3,
        part2QuizRequirement: 5,
        part1Content: `You arrive at the bank at 3 AM with an {abundant} amount of confidence and zero common sense.

Your {cognitive} process is simple: if the movie made it look easy, it must be real life. Unfortunately, you immediately face a moral {dilemma}: steal money or go home and sleep.

You decide to test whether this plan is actually {feasible}. The answer becomes obvious when the front door is locked and the guard starts recording you.`,
        part2Content: `Trying to look {pragmatic}, you explain that you're "auditing their night security." Your excuse is so {ambiguous} that even you don't understand it.

The guard, somehow {resilient} after years of nonsense, asks you to leave for the third time. You keep talking about economic freedom until he opens the door just to get rid of you.

As you walk out, you notice one detail: your "master plan" was written on a pizza box in glitter pen.`,
        content: `You arrive at the bank at 3 AM with an {abundant} amount of confidence and zero common sense.

Your {cognitive} process is simple: if the movie made it look easy, it must be real life. Unfortunately, you immediately face a moral {dilemma}: steal money or go home and sleep.

You decide to test whether this plan is actually {feasible}. The answer becomes obvious when the front door is locked and the guard starts recording you.

Trying to look {pragmatic}, you explain that you're "auditing their night security." Your excuse is so {ambiguous} that even you don't understand it.

The guard, somehow {resilient} after years of nonsense, asks you to leave for the third time. You keep talking about economic freedom until he opens the door just to get rid of you.

As you walk out, you notice one detail: your "master plan" was written on a pizza box in glitter pen.`,
    },
    {
        id: 'story_002',
        title: 'The Apocalypse Job Interview',
        teaser: 'Bạn đi phỏng vấn việc làm giữa tận thế zombie và vẫn phải trả lời HR như không có gì xảy ra.',
        difficultyLevel: 'advanced',
        darkComedyLevel: 'extreme',
        vocabularyIds: ['v011', 'v012', 'v013', 'v014', 'v015', 'v016', 'v017'],
        part1QuizRequirement: 3,
        part2QuizRequirement: 5,
        part1Content: `You enter the office lobby with a {meticulous} resume while zombies are already in the parking lot.

Panic is {ubiquitous}, but you stay calm because confidence is temporary, like all things {ephemeral}.

The interviewer compliments your {eloquent} answer about leadership, though his left eye falls into his coffee mid-sentence.`,
        part2Content: `"Your survival plan sounds {plausible}," he says. "Now let me {scrutinize} your references."

You remain {candid}: "All my references were eaten ten minutes ago."

He pauses, then asks why you want this role. "Because my previous life was too boring," you reply, as a zombie HR intern crawls under the table.

He nods. "Adaptability is essential to this company culture. You're hired if you survive the exit interview."

The exit interview is just running to the helicopter while signing tax forms.`,
        content: `You enter the office lobby with a {meticulous} resume while zombies are already in the parking lot.

Panic is {ubiquitous}, but you stay calm because confidence is temporary, like all things {ephemeral}.

The interviewer compliments your {eloquent} answer about leadership, though his left eye falls into his coffee mid-sentence.

"Your survival plan sounds {plausible}," he says. "Now let me {scrutinize} your references."

You remain {candid}: "All my references were eaten ten minutes ago."

He pauses, then asks why you want this role. "Because my previous life was too boring," you reply, as a zombie HR intern crawls under the table.

He nods. "Adaptability is essential to this company culture. You're hired if you survive the exit interview."

The exit interview is just running to the helicopter while signing tax forms.`,
    },
    {
        id: 'story_003',
        title: 'The Sophisticated Time Traveler',
        teaser: 'Một chuyến du hành thời gian biến thành thảm họa vì bạn nói quá nhiều với nhầm người.',
        difficultyLevel: 'expert',
        darkComedyLevel: 'extreme',
        vocabularyIds: ['v021', 'v022', 'v023', 'v024', 'v025', 'v026', 'v027'],
        part1QuizRequirement: 3,
        part2QuizRequirement: 5,
        part1Content: `You travel back to 1920 and immediately face a historical {conundrum}: fix the timeline or avoid being arrested for your futuristic shoes.

Your panic will only {exacerbate} the mission, so you try to {mitigate} chaos by pretending to be a quiet accountant.

Then someone asks why your watch has a touchscreen. You invent a long explanation full of philosophical {nuance} and fake confidence.`,
        part2Content: `Unfortunately, your lies are too {prolific}. Every answer creates three new questions and two suspicious uncles.

To stay hidden, you remove all {redundant} gadgets and keep only one {tangible} objective: stop the inventor before lunch.

At the peak of your speech, you deliver a perfectly composed warning about the future. The inventor smiles and calls your logic "beautifully arbitrary."

Then he invents the dangerous sandwich anyway. By sunset, the timeline has forked into 47 cursed realities where everyone debates condiments for eternity.`,
        content: `You travel back to 1920 and immediately face a historical {conundrum}: fix the timeline or avoid being arrested for your futuristic shoes.

Your panic will only {exacerbate} the mission, so you try to {mitigate} chaos by pretending to be a quiet accountant.

Then someone asks why your watch has a touchscreen. You invent a long explanation full of philosophical {nuance} and fake confidence.

Unfortunately, your lies are too {prolific}. Every answer creates three new questions and two suspicious uncles.

To stay hidden, you remove all {redundant} gadgets and keep only one {tangible} objective: stop the inventor before lunch.

At the peak of your speech, you deliver a perfectly composed warning about the future. The inventor smiles and calls your logic "beautifully arbitrary."

Then he invents the dangerous sandwich anyway. By sunset, the timeline has forked into 47 cursed realities where everyone debates condiments for eternity.`,
    },
];

export function getStoryLearnedCount(story: Story, learnedWordIds: string[]): number {
    const learnedSet = new Set(learnedWordIds);
    return story.vocabularyIds.filter(vocabularyId => learnedSet.has(vocabularyId)).length;
}

export function isStoryPreviewVisible(story: Story, learnedWordIds: string[]): boolean {
    // Show preview once the user has learned at least 2 words specific to this story.
    return getStoryLearnedCount(story, learnedWordIds) >= 2;
}

// Progressive Unlock: Part 1 helpers
export function canUnlockPart1Naturally(story: Story, learnedWordIds: string[]): boolean {
    return getStoryLearnedCount(story, learnedWordIds) >= 4;
}

export function canTakePart1Quiz(story: Story, learnedWordIds: string[]): boolean {
    return getStoryLearnedCount(story, learnedWordIds) >= story.part1QuizRequirement;
}

export function isStoryPart1Unlocked(
    story: Story,
    learnedWordIds: string[],
    unlockedPart1Ids: string[],
    quizAttempts: Record<string, { part1Passed?: boolean }>
): boolean {
    // Already unlocked via store
    if (unlockedPart1Ids.includes(story.id)) return true;

    // Unlocked via quiz
    if (quizAttempts[story.id]?.part1Passed) return true;

    // Natural unlock
    return canUnlockPart1Naturally(story, learnedWordIds);
}

// Progressive Unlock: Part 2 helpers
export function canUnlockPart2Naturally(story: Story, learnedWordIds: string[]): boolean {
    return getStoryLearnedCount(story, learnedWordIds) >= story.vocabularyIds.length; // 7 words
}

export function canTakePart2Quiz(story: Story, learnedWordIds: string[]): boolean {
    return getStoryLearnedCount(story, learnedWordIds) >= story.part2QuizRequirement;
}

export function isStoryPart2Unlocked(
    story: Story,
    learnedWordIds: string[],
    unlockedStoryIds: string[],
    quizAttempts: Record<string, { part2Passed?: boolean }>
): boolean {
    // Already unlocked via store (full story)
    if (unlockedStoryIds.includes(story.id)) return true;

    // Unlocked via quiz
    if (quizAttempts[story.id]?.part2Passed) return true;

    // Natural unlock
    return canUnlockPart2Naturally(story, learnedWordIds);
}

// Legacy: Keep for backwards compatibility
export function isStoryUnlocked(story: Story, learnedWordIds: string[]): boolean {
    // Now means "Part 2 unlocked" (full story)
    return getStoryLearnedCount(story, learnedWordIds) >= story.vocabularyIds.length;
}

export function getUnlockableStory(
    learnedWordIds: string[],
    unlockedStoryIds: string[]
): Story | null {
    return STORIES.find(story => {
        const alreadyUnlocked = unlockedStoryIds.includes(story.id);
        return !alreadyUnlocked && isStoryUnlocked(story, learnedWordIds);
    }) || null;
}

/**
 * When a pack reaches 4-6/7 learned words, force-inject remaining words
 * into upcoming decks so the user can finish the pack quickly.
 */
export function getStoryCatchUpWordIds(
    learnedWordIds: string[],
    maxWordsToInject = 3
): string[] {
    const candidatePacks = STORIES
        .map(story => {
            const learnedCount = getStoryLearnedCount(story, learnedWordIds);
            return {
                story,
                learnedCount,
                missingWordIds: story.vocabularyIds.filter(id => !learnedWordIds.includes(id)),
            };
        })
        .filter(item => item.learnedCount >= 4 && item.learnedCount < item.story.vocabularyIds.length)
        .sort((a, b) => b.learnedCount - a.learnedCount);

    if (candidatePacks.length === 0) {
        return [];
    }

    return candidatePacks[0].missingWordIds.slice(0, maxWordsToInject);
}

/**
 * Get story by learned words count
 * Unlock stories sequentially based on total words learned
 * Every 7 words = 1 new story unlocked
 */
export function getStoryForProgress(
    learnedWordIds: string[],
    unlockedStoryIds: string[]
): Story | null {
    // Legacy helper kept for compatibility. Story packs now unlock per-pack at 7/7.
    const unlockableStory = getUnlockableStory(learnedWordIds, unlockedStoryIds);
    if (unlockableStory) {
        return unlockableStory;
    }

    const totalLearned = learnedWordIds.length;

    // Calculate how many stories should be unlocked (7 words per story)
    const storiesShouldBeUnlocked = Math.floor(totalLearned / 7);

    // Check if there's a new story to unlock
    if (storiesShouldBeUnlocked > unlockedStoryIds.length) {
        // Find the next story that hasn't been unlocked yet
        const nextStory = STORIES.find(story => !unlockedStoryIds.includes(story.id));
        return nextStory || null;
    }

    return null;
}

/**
 * Parse story content and highlight vocabulary words
 * Returns array of text segments with highlighting info
 */
export function parseStoryContent(content: string): Array<{ text: string; isVocab: boolean }> {
    const segments: Array<{ text: string; isVocab: boolean }> = [];
    const regex = /\{([^}]+)\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            segments.push({
                text: content.substring(lastIndex, match.index),
                isVocab: false,
            });
        }

        // Add the vocabulary word (without braces)
        segments.push({
            text: match[1],
            isVocab: true,
        });

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        segments.push({
            text: content.substring(lastIndex),
            isVocab: false,
        });
    }

    return segments;
}

/**
 * Enhanced parser that includes vocab IDs for interactive stories
 */
export function parseStoryContentWithIds(
    content: string,
    vocabularyIds: string[]
): Array<{ text: string; isVocab: boolean; vocabId?: string }> {
    const segments: Array<{ text: string; isVocab: boolean; vocabId?: string }> = [];
    const regex = /\{([^}]+)\}/g;
    let lastIndex = 0;
    let match;
    let vocabIndex = 0;

    while ((match = regex.exec(content)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            segments.push({
                text: content.substring(lastIndex, match.index),
                isVocab: false,
            });
        }

        // Add the vocabulary word (without braces) with its ID
        segments.push({
            text: match[1],
            isVocab: true,
            vocabId: vocabularyIds[vocabIndex] || undefined,
        });

        vocabIndex++;
        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        segments.push({
            text: content.substring(lastIndex),
            isVocab: false,
        });
    }

    return segments;
}
