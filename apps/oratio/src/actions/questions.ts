"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { IeltsQuestion } from "@/lib/types/database";
import { QUESTIONS_PER_PART, TOTAL_PARTS, TOTAL_QUESTIONS, getPartAndPosition, totalQuestionsForPart } from "@/lib/question-utils";

/**
 * Get match state including roles, current question, and progress (uses admin client to bypass RLS)
 */
export async function getMatchState(
    matchId: string
): Promise<{
    success: boolean;
    interviewer_id?: string | null;
    candidate_id?: string | null;
    current_question_id?: string | null;
    questions_asked_count?: number;
    swap_requested_by?: string | null;
    error?: string;
}> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from("matches")
            .select("interviewer_id, candidate_id, current_question_id, questions_asked, swap_requested_by")
            .eq("id", matchId)
            .single();

        if (error) {
            console.error("[getMatchState] Error:", error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            interviewer_id: data.interviewer_id,
            candidate_id: data.candidate_id,
            current_question_id: data.current_question_id,
            questions_asked_count: (data.questions_asked as string[] || []).length,
            swap_requested_by: data.swap_requested_by,
        };
    } catch (error) {
        console.error("[getMatchState] Exception:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Assign roles to a match if not already assigned (uses admin client)
 */
export async function assignMatchRoles(
    matchId: string
): Promise<{
    success: boolean;
    interviewer_id?: string;
    candidate_id?: string;
    error?: string;
}> {
    try {
        const adminClient = createAdminClient();

        // Get match
        const { data: match, error: fetchError } = await adminClient
            .from("matches")
            .select("user1_id, user2_id, interviewer_id, candidate_id")
            .eq("id", matchId)
            .single();

        if (fetchError || !match) {
            return { success: false, error: "Match not found" };
        }

        // If already assigned, return existing
        if (match.interviewer_id && match.candidate_id) {
            return {
                success: true,
                interviewer_id: match.interviewer_id,
                candidate_id: match.candidate_id,
            };
        }

        // Randomly assign
        const isUser1Interviewer = Math.random() > 0.5;
        const interviewer_id = isUser1Interviewer ? match.user1_id : match.user2_id;
        const candidate_id = isUser1Interviewer ? match.user2_id : match.user1_id;

        const { error: updateError } = await adminClient
            .from("matches")
            .update({ interviewer_id, candidate_id })
            .eq("id", matchId);

        if (updateError) {
            console.error("[assignMatchRoles] Update error:", updateError);
            return { success: false, error: updateError.message };
        }

        return { success: true, interviewer_id, candidate_id };
    } catch (error) {
        console.error("[assignMatchRoles] Exception:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// Part/turn logic imported from @/lib/question-utils

function getPartForCount(questionCount: number): number {
    return getPartAndPosition(questionCount).part;
}

/**
 * Get a random IELTS question by part
 */
export async function getRandomQuestion(
    part: number,
    difficulty?: "easy" | "medium" | "hard",
    excludeIds: string[] = []
): Promise<{ success: boolean; question?: IeltsQuestion; error?: string }> {
    try {
        const adminClient = createAdminClient();

        let query = adminClient
            .from("ielts_questions")
            .select("*")
            .eq("part", part);

        if (difficulty) {
            query = query.eq("difficulty", difficulty);
        }

        if (excludeIds.length > 0) {
            query = query.not("id", "in", `(${excludeIds.join(",")})`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching question:", error);
            return { success: false, error: error.message };
        }

        if (!data || data.length === 0) {
            return { success: false, error: "No questions found for part " + part };
        }

        // Pick a random question from results
        const randomIndex = Math.floor(Math.random() * data.length);
        const question = data[randomIndex] as IeltsQuestion;

        return { success: true, question };
    } catch (error) {
        console.error("Error in getRandomQuestion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get the next question for a match (automatically picks based on progress)
 * Returns question + progress info for UI
 * Also handles auto-swap when a turn ends
 */
export async function getNextQuestion(
    matchId: string
): Promise<{
    success: boolean;
    question?: IeltsQuestion;
    progress?: ReturnType<typeof getPartAndPosition>;
    autoSwapped?: boolean;
    completed?: boolean;
    newInterviewerId?: string | null;
    error?: string;
}> {
    try {
        const adminClient = createAdminClient();

        const { data: match, error: matchError } = await adminClient
            .from("matches")
            .select("*")
            .eq("id", matchId)
            .single();

        if (matchError || !match) {
            return { success: false, error: "Match not found" };
        }

        const questionsAsked: string[] = match.questions_asked || [];
        const questionCount = questionsAsked.length;

        // Check if session is complete (all questions asked)
        if (questionCount >= TOTAL_QUESTIONS) {
            return { success: true, completed: true };
        }

        const progress = getPartAndPosition(questionCount);

        // Determine if auto-swap is needed (previous question was last of a turn)
        let autoSwapped = false;
        let newInterviewerId = match.interviewer_id as string | null;
        if (questionCount > 0) {
            const prevProgress = getPartAndPosition(questionCount - 1);
            if (prevProgress.isLastQuestionOfTurn && match.interviewer_id && match.candidate_id) {
                autoSwapped = true;
                newInterviewerId = match.candidate_id;
            }
        }

        // Fetch the next question
        const result = await getRandomQuestion(progress.part, undefined, questionsAsked);

        if (!result.success || !result.question) {
            return result;
        }

        // Single atomic DB update: swap roles + set question + append to asked list
        const updateData: Record<string, unknown> = {
            current_question_id: result.question.id,
            questions_asked: [...questionsAsked, result.question.id],
        };
        if (autoSwapped) {
            updateData.interviewer_id = match.candidate_id;
            updateData.candidate_id = match.interviewer_id;
            updateData.swap_requested_by = null;
        }

        const { error: updateError } = await adminClient
            .from("matches")
            .update(updateData)
            .eq("id", matchId);

        if (updateError) {
            console.error("Error updating match:", updateError);
            return { success: false, error: updateError.message };
        }

        return {
            success: true,
            question: result.question,
            progress,
            autoSwapped,
            newInterviewerId,
        };
    } catch (error) {
        console.error("Error in getNextQuestion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Mark a question as the current question and add to asked list
 */
export async function setCurrentQuestion(
    matchId: string,
    questionId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const adminClient = createAdminClient();

        // Get current match
        const { data: match, error: fetchError } = await adminClient
            .from("matches")
            .select("questions_asked")
            .eq("id", matchId)
            .single();

        if (fetchError || !match) {
            return { success: false, error: "Match not found" };
        }

        const questionsAsked = match.questions_asked || [];

        // Update match with new current question and add to asked list
        const { error: updateError } = await adminClient
            .from("matches")
            .update({
                current_question_id: questionId,
                questions_asked: [...questionsAsked, questionId],
            })
            .eq("id", matchId);

        if (updateError) {
            console.error("Error updating match:", updateError);
            return { success: false, error: updateError.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in setCurrentQuestion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Request a role swap (needs partner's consent)
 */
export async function requestSwapRoles(
    matchId: string,
    requestedBy: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const adminClient = createAdminClient();

        const { error } = await adminClient
            .from("matches")
            .update({ swap_requested_by: requestedBy })
            .eq("id", matchId);

        if (error) {
            console.error("Error requesting swap:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in requestSwapRoles:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Respond to a swap request (accept or decline)
 */
export async function respondToSwapRequest(
    matchId: string,
    accept: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        const adminClient = createAdminClient();

        if (!accept) {
            // Decline: just clear the request
            const { error } = await adminClient
                .from("matches")
                .update({ swap_requested_by: null })
                .eq("id", matchId);

            if (error) return { success: false, error: error.message };
            return { success: true };
        }

        // Accept: swap roles + clear request
        const { data: match, error: fetchError } = await adminClient
            .from("matches")
            .select("interviewer_id, candidate_id")
            .eq("id", matchId)
            .single();

        if (fetchError || !match) {
            return { success: false, error: "Match not found" };
        }

        const { error: updateError } = await adminClient
            .from("matches")
            .update({
                interviewer_id: match.candidate_id,
                candidate_id: match.interviewer_id,
                swap_requested_by: null,
            })
            .eq("id", matchId);

        if (updateError) {
            console.error("Error accepting swap:", updateError);
            return { success: false, error: updateError.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in respondToSwapRequest:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Cancel a pending swap request (by the requester)
 */
export async function cancelSwapRequest(
    matchId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from("matches")
            .update({ swap_requested_by: null })
            .eq("id", matchId);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (error) {
        console.error("Error in cancelSwapRequest:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Initialize roles when a match starts (randomly assign interviewer/candidate)
 */
export async function initializeRoles(
    matchId: string,
    user1Id: string,
    user2Id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        console.log("[initializeRoles] Starting with:", { matchId, user1Id, user2Id });
        const adminClient = createAdminClient();

        // Randomly assign who is interviewer first
        const isUser1Interviewer = Math.random() > 0.5;
        console.log(`[initializeRoles] Random assignment: user1 is ${isUser1Interviewer ? "interviewer" : "candidate"}`);

        const { data, error: updateError } = await adminClient
            .from("matches")
            .update({
                interviewer_id: isUser1Interviewer ? user1Id : user2Id,
                candidate_id: isUser1Interviewer ? user2Id : user1Id,
            })
            .eq("id", matchId)
            .select();

        if (updateError) {
            console.error("[initializeRoles] Error updating match:", updateError);
            return { success: false, error: updateError.message };
        }

        console.log("[initializeRoles] ✅ Roles assigned successfully:", data);
        return { success: true };
    } catch (error) {
        console.error("Error in initializeRoles:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get a question by ID
 */
export async function getQuestionById(
    questionId: string
): Promise<{ success: boolean; question?: IeltsQuestion; error?: string }> {
    try {
        const adminClient = createAdminClient();

        const { data, error } = await adminClient
            .from("ielts_questions")
            .select("*")
            .eq("id", questionId)
            .single();

        if (error) {
            console.error("Error fetching question:", error);
            return { success: false, error: error.message };
        }

        return { success: true, question: data as IeltsQuestion };
    } catch (error) {
        console.error("Error in getQuestionById:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
