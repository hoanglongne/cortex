"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { IeltsQuestion } from "@/lib/types/database";
import { TOTAL_QUESTIONS, getPartAndPosition } from "@/lib/question-utils";
import { isUuid, requireParticipant, type AdminClient } from "@/lib/server/match-access";
import { assignedWork, preferredPool } from "@/lib/server/classroom";

/**
 * In-call Q&A. Every action checks that the signed-in user is part of the
 * match; the ones that change it also check the user's role. Writes are
 * conditional on the state they were based on, so two clicks at the same
 * moment can't both apply.
 */

/** Activity is written at most this often per match (it drives abandon detection). */
const ACTIVITY_EVERY_MS = 20_000;

type Fail = { success: false; error: string };
const fail = (error: string): Fail => ({ success: false, error });
const errorText = (e: unknown) => (e instanceof Error ? e.message : "Unknown error");

/**
 * Match state for the in-call screen: roles, current question, progress and
 * status. Also records that this user is still on the call.
 */
export async function getMatchState(matchId: string): Promise<{
  success: boolean;
  status?: string;
  started?: boolean;
  interviewer_id?: string | null;
  candidate_id?: string | null;
  current_question_id?: string | null;
  questions_asked_count?: number;
  swap_requested_by?: string | null;
  error?: string;
}> {
  try {
    const access = await requireParticipant(matchId);
    if (!access.ok) return fail(access.error);
    const { match, admin } = access;

    if (match.status === "active") {
      const since = new Date(Date.now() - ACTIVITY_EVERY_MS).toISOString();
      await admin
        .from("matches")
        .update({ last_activity_at: new Date().toISOString() })
        .eq("id", match.id)
        .eq("status", "active")
        .or(`last_activity_at.is.null,last_activity_at.lt."${since}"`);
    }

    return {
      success: true,
      status: match.status,
      started: !!match.started_at,
      interviewer_id: match.interviewer_id,
      candidate_id: match.candidate_id,
      current_question_id: match.current_question_id,
      questions_asked_count: (match.questions_asked || []).length,
      swap_requested_by: match.swap_requested_by,
    };
  } catch (error) {
    console.error("[getMatchState]", error);
    return fail(errorText(error));
  }
}

/** Assigns roles at random if the match has none yet. */
export async function assignMatchRoles(matchId: string): Promise<{
  success: boolean;
  interviewer_id?: string;
  candidate_id?: string;
  error?: string;
}> {
  try {
    const access = await requireParticipant(matchId);
    if (!access.ok) return fail(access.error);
    const { match, admin } = access;

    if (!match.interviewer_id || !match.candidate_id) {
      const user1First = Math.random() > 0.5;
      await admin
        .from("matches")
        .update({
          interviewer_id: user1First ? match.user1_id : match.user2_id,
          candidate_id: user1First ? match.user2_id : match.user1_id,
        })
        .eq("id", match.id)
        .is("interviewer_id", null);
    }

    // Read back: the partner may have assigned them a moment earlier
    const { data } = await admin.from("matches").select("interviewer_id, candidate_id").eq("id", match.id).single();
    if (!data?.interviewer_id) return fail("Could not assign roles");
    return { success: true, interviewer_id: data.interviewer_id, candidate_id: data.candidate_id };
  } catch (error) {
    console.error("[assignMatchRoles]", error);
    return fail(errorText(error));
  }
}

/**
 * A random question of one part, not in `exclude`. What the candidate's
 * teacher assigned comes first: their questions, then their topics.
 */
async function randomQuestion(client: AdminClient, part: number, exclude: string[], candidateId: string | null): Promise<IeltsQuestion | null> {
  const [{ data, error }, work] = await Promise.all([client.from("ielts_questions").select("*").eq("part", part), assignedWork(client, candidateId)]);
  if (error || !data) return null;
  const from = preferredPool(data as IeltsQuestion[], part, exclude, work);
  return from.length > 0 ? from[Math.floor(Math.random() * from.length)] : null;
}

/**
 * Moves the match to its next question (interviewer only). When the previous
 * question ended a turn, roles swap in the same write.
 */
export async function getNextQuestion(matchId: string): Promise<{
  success: boolean;
  question?: IeltsQuestion;
  progress?: ReturnType<typeof getPartAndPosition>;
  autoSwapped?: boolean;
  completed?: boolean;
  newInterviewerId?: string | null;
  error?: string;
}> {
  try {
    const access = await requireParticipant(matchId);
    if (!access.ok) return fail(access.error);
    const { userId, match, admin } = access;

    if (match.status !== "active") return fail("The call is not active");
    if (match.interviewer_id !== userId) return fail("Only the interviewer can move to the next question");

    const asked: string[] = match.questions_asked || [];
    if (asked.length >= TOTAL_QUESTIONS) return { success: true, completed: true };

    const progress = getPartAndPosition(asked.length);
    const swap =
      asked.length > 0 &&
      getPartAndPosition(asked.length - 1).isLastQuestionOfTurn &&
      !!match.interviewer_id &&
      !!match.candidate_id;

    // After a swap the interviewer (this user) becomes the one answering.
    const candidateId = swap ? match.interviewer_id : match.candidate_id;
    const question = await randomQuestion(admin, progress.part, asked, candidateId);
    if (!question) return fail(`No questions found for part ${progress.part}`);

    const update: Record<string, unknown> = {
      current_question_id: question.id,
      questions_asked: [...asked, question.id],
    };
    if (!match.topic) update.topic = question.category;
    if (swap) {
      update.interviewer_id = match.candidate_id;
      update.candidate_id = match.interviewer_id;
      update.swap_requested_by = null;
    }

    let write = admin.from("matches").update(update).eq("id", match.id).eq("interviewer_id", userId);
    write = match.current_question_id
      ? write.eq("current_question_id", match.current_question_id)
      : write.is("current_question_id", null);
    const { data, error } = await write.select("id");

    if (error) return fail(error.message);
    if (!data || data.length === 0) return fail("The question already changed");

    return {
      success: true,
      question,
      progress,
      autoSwapped: swap,
      newInterviewerId: swap ? match.candidate_id : match.interviewer_id,
    };
  } catch (error) {
    console.error("[getNextQuestion]", error);
    return fail(errorText(error));
  }
}

/** Asks the partner to swap roles. */
export async function requestSwapRoles(matchId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const access = await requireParticipant(matchId);
    if (!access.ok) return fail(access.error);
    const { userId, match, admin } = access;
    if (match.status !== "active") return fail("The call is not active");

    const { error } = await admin
      .from("matches")
      .update({ swap_requested_by: userId })
      .eq("id", match.id)
      .is("swap_requested_by", null);
    if (error) return fail(error.message);
    return { success: true };
  } catch (error) {
    console.error("[requestSwapRoles]", error);
    return fail(errorText(error));
  }
}

/** The partner of whoever asked accepts or declines the swap. */
export async function respondToSwapRequest(
  matchId: string,
  accept: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const access = await requireParticipant(matchId);
    if (!access.ok) return fail(access.error);
    const { userId, match, admin } = access;

    const requester = match.swap_requested_by;
    if (!requester || requester === userId) return fail("No swap request to answer");

    const update: Record<string, unknown> = { swap_requested_by: null };
    if (accept && match.interviewer_id && match.candidate_id) {
      update.interviewer_id = match.candidate_id;
      update.candidate_id = match.interviewer_id;
    }

    const { error } = await admin
      .from("matches")
      .update(update)
      .eq("id", match.id)
      .eq("swap_requested_by", requester);
    if (error) return fail(error.message);
    return { success: true };
  } catch (error) {
    console.error("[respondToSwapRequest]", error);
    return fail(errorText(error));
  }
}

/** Withdraws your own swap request. */
export async function cancelSwapRequest(matchId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const access = await requireParticipant(matchId);
    if (!access.ok) return fail(access.error);
    const { userId, match, admin } = access;

    const { error } = await admin
      .from("matches")
      .update({ swap_requested_by: null })
      .eq("id", match.id)
      .eq("swap_requested_by", userId);
    if (error) return fail(error.message);
    return { success: true };
  } catch (error) {
    console.error("[cancelSwapRequest]", error);
    return fail(errorText(error));
  }
}

/** One question by id (signed-in users only; questions are not secret). */
export async function getQuestionById(
  questionId: string
): Promise<{ success: boolean; question?: IeltsQuestion; error?: string }> {
  try {
    if (!isUuid(questionId)) return fail("Invalid question");
    const supabase = await createClient();
    const { data, error } = await supabase.from("ielts_questions").select("*").eq("id", questionId).single();
    if (error || !data) return fail(error?.message ?? "Question not found");
    return { success: true, question: data as IeltsQuestion };
  } catch (error) {
    console.error("[getQuestionById]", error);
    return fail(errorText(error));
  }
}

/** A short mock test to practise alone: 4 Part 1, one Part 2 card, 3 Part 3. */
export async function getSoloQuestions(): Promise<{ success: boolean; questions?: IeltsQuestion[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return fail("Not authenticated");

    const { data, error } = await supabase.from("ielts_questions").select("*");
    if (error || !data) return fail(error?.message ?? "No questions");

    const all = data as IeltsQuestion[];
    const work = await assignedWork(createAdminClient(), user.id);
    const shuffle = <T,>(xs: T[]) => {
      for (let i = xs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [xs[i], xs[j]] = [xs[j], xs[i]];
      }
      return xs;
    };
    // What a teacher assigned comes first, then any questions of the part
    const pick = (part: number, n: number, taken: IeltsQuestion[] = []) => {
      const first = shuffle(preferredPool(all, part, taken.map((q) => q.id), work));
      const rest = shuffle(all.filter((q) => q.part === part && !first.includes(q) && !taken.includes(q)));
      return [...first, ...rest].slice(0, n);
    };
    const part1 = pick(1, 1);
    // Part 1 questions of one category read like a real interview
    const sameTopic = shuffle(all.filter((q) => q.part === 1 && q.category === part1[0]?.category && q.id !== part1[0]?.id));
    const more = [...sameTopic.filter((q) => work.questionIds.has(q.id)), ...sameTopic.filter((q) => !work.questionIds.has(q.id))];
    const questions = [...part1, ...more.slice(0, 3), ...pick(2, 1), ...pick(3, 3)];
    return { success: true, questions };
  } catch (error) {
    console.error("[getSoloQuestions]", error);
    return fail(errorText(error));
  }
}
