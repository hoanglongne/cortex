// Questions per part for each user's turn as candidate
// Each part: user A is candidate → swap → user B is candidate → advance to next part
// Part 1: 4 questions per turn (warm-up, personal)
// Part 2: 2 questions per turn (long-turn topic card)
// Part 3: 3 questions per turn (abstract discussion)
export const QUESTIONS_PER_PART = { 1: 4, 2: 2, 3: 3 } as const;
export const TOTAL_PARTS = 3;
export const TOTAL_QUESTIONS = (QUESTIONS_PER_PART[1] + QUESTIONS_PER_PART[2] + QUESTIONS_PER_PART[3]) * 2; // 18

// Total questions per part (both turns combined)
export function totalQuestionsForPart(part: number): number {
    return (QUESTIONS_PER_PART[part as keyof typeof QUESTIONS_PER_PART] ?? 3) * 2;
}

// Calculate which part and position within that part based on total questions asked
export function getPartAndPosition(totalAsked: number): {
    part: number;
    questionInPart: number;    // 1-based position within current part
    questionsInPart: number;   // total questions in current part (both turns)
    turnInPart: 1 | 2;        // which turn within the part (1st or 2nd user)
    questionInTurn: number;    // 1-based position within current turn
    questionsPerTurn: number;  // questions per turn for this part
    isLastQuestionOfTurn: boolean;
    shouldAutoSwap: boolean;   // true when we just finished a turn (but not end of part's 2nd turn)
} {
    let remaining = totalAsked;
    for (let p = 1; p <= TOTAL_PARTS; p++) {
        const perTurn = QUESTIONS_PER_PART[p as keyof typeof QUESTIONS_PER_PART];
        const total = perTurn * 2;
        if (remaining < total) {
            const turnInPart = remaining < perTurn ? 1 : 2;
            const questionInTurn = turnInPart === 1 ? remaining + 1 : (remaining - perTurn) + 1;
            return {
                part: p,
                questionInPart: remaining + 1,
                questionsInPart: total,
                turnInPart: turnInPart as 1 | 2,
                questionInTurn,
                questionsPerTurn: perTurn,
                isLastQuestionOfTurn: questionInTurn === perTurn,
                shouldAutoSwap: false,
            };
        }
        remaining -= total;
    }
    // Past all parts — stay on part 3
    const perTurn = QUESTIONS_PER_PART[3];
    return {
        part: 3,
        questionInPart: 1,
        questionsInPart: perTurn * 2,
        turnInPart: 1,
        questionInTurn: 1,
        questionsPerTurn: perTurn,
        isLastQuestionOfTurn: false,
        shouldAutoSwap: false,
    };
}
