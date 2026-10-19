"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { currentUserId, isUuid } from "@/lib/server/match-access";
import { AUDIO_BUCKET, AUDIO_TTL_DAYS, bandsFor, exchangeCounts, type ReceivedReview } from "@/lib/server/answers";
import { submissionsLeft, type AnswerBand } from "@/lib/review-scoring";
import { lexicaWordsIn } from "@/lib/transcript-metrics";

/**
 * Answers (docs/ORATIO_REDESIGN.md §5.1): every spoken answer is saved with
 * its on-device metrics. Audio stays on the device unless the learner sends
 * that answer to Chấm chéo.
 */

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export interface AnswerInput {
  questionId: string;
  mode: "solo" | "live";
  /** The first take of this question in the same run */
  retakeOf?: string | null;
  durationMs: number;
  speakingMs: number;
  longPauses: number;
  longestPauseMs: number;
  /** From on-device Whisper; omitted when transcription is off */
  transcript?: string | null;
  wordCount?: number | null;
  wpm?: number | null;
  meanRunWords?: number | null;
  fillers?: number | null;
  lexicalDiversity?: number | null;
}

export interface MyAnswer {
  id: string;
  questionText: string;
  part: number;
  mode: "solo" | "live";
  retakeOf: string | null;
  createdAt: string;
  durationMs: number;
  speakingMs: number;
  longPauses: number;
  longestPauseMs: number;
  transcript: string | null;
  wordCount: number | null;
  wpm: number | null;
  meanRunWords: number | null;
  fillers: number | null;
  lexicalDiversity: number | null;
  lexicaWords: string[];
  submittedAt: string | null;
  /** Peer band range once reviewed */
  band: AnswerBand | null;
  reviews: ReceivedReview[];
}

const int = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(0, Math.round(v))) : 0);
const num = (v: unknown, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(0, Math.round(v * 1000) / 1000)) : null;

/** The learner's Lexica words: the latest few for hints, all for matching. */
export async function getLexicaWords(): Promise<{ recent: string[]; all: string[] }> {
  if (DEMO) return { recent: [], all: [] };
  try {
    const userId = await currentUserId();
    if (!userId) return { recent: [], all: [] };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data } = await admin
      .from("user_vocabulary")
      .select("word, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(2000);
    const all = ((data ?? []) as { word: string }[]).map((r) => r.word).filter(Boolean);
    return { recent: all.slice(0, 3), all };
  } catch (error) {
    // Lexica's table may not exist in an Oratio-only project
    console.error("[getLexicaWords]", error);
    return { recent: [], all: [] };
  }
}

export async function saveAnswer(input: AnswerInput): Promise<{ id?: string; lexicaWords?: string[]; error?: string }> {
  if (DEMO) return { error: "Chế độ demo không lưu câu trả lời" };
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    if (!input || !isUuid(input.questionId)) return { error: "Invalid question" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    // The question text and part come from our table, not from the client
    const { data: q } = await admin.from("ielts_questions").select("id, part, question_text").eq("id", input.questionId).maybeSingle();
    if (!q) return { error: "Invalid question" };

    let retakeOf: string | null = null;
    if (input.retakeOf && isUuid(input.retakeOf)) {
      const { data: first } = await admin.from("answers").select("id").eq("id", input.retakeOf).eq("user_id", userId).maybeSingle();
      retakeOf = first?.id ?? null;
    }

    const transcript = typeof input.transcript === "string" && input.transcript.trim() ? input.transcript.trim().slice(0, 8000) : null;
    // Lexica words are matched here against the learner's own list
    let lexicaWords: string[] = [];
    if (transcript) {
      const { data: vocab } = await admin.from("user_vocabulary").select("word").eq("user_id", userId).limit(2000);
      lexicaWords = lexicaWordsIn(transcript, ((vocab ?? []) as { word: string }[]).map((v) => v.word)).slice(0, 50);
    }

    const { data, error } = await admin
      .from("answers")
      .insert({
        user_id: userId,
        question_id: q.id,
        question_text: q.question_text,
        part: q.part,
        mode: input.mode === "live" ? "live" : "solo",
        retake_of: retakeOf,
        duration_ms: int(input.durationMs, 600_000),
        speaking_ms: int(input.speakingMs, 600_000),
        long_pauses: int(input.longPauses, 1000),
        longest_pause_ms: int(input.longestPauseMs, 600_000),
        transcript,
        word_count: transcript ? int(input.wordCount, 10_000) : null,
        wpm: transcript ? num(input.wpm, 999) : null,
        mean_run_words: transcript ? num(input.meanRunWords, 999) : null,
        fillers: transcript ? int(input.fillers, 10_000) : null,
        lexical_diversity: transcript ? num(input.lexicalDiversity, 1) : null,
        lexica_words: lexicaWords,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    return { id: data.id as string, lexicaWords };
  } catch (error) {
    console.error("[saveAnswer]", error);
    return { error: "Không lưu được câu trả lời" };
  }
}

const ANSWER_COLS =
  "id, question_text, part, mode, retake_of, created_at, duration_ms, speaking_ms, long_pauses, longest_pause_ms, transcript, word_count, wpm, mean_run_words, fillers, lexical_diversity, lexica_words, submitted_at";

/** The signed-in user's answers, newest first, with peer bands. */
export async function listMyAnswers(opts: { limit?: number; before?: string; submittedOnly?: boolean } = {}): Promise<{
  answers: MyAnswer[];
  error?: string;
}> {
  if (DEMO) return { answers: [] };
  try {
    const userId = await currentUserId();
    if (!userId) return { answers: [], error: "Not authenticated" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    let query = admin
      .from("answers")
      .select(ANSWER_COLS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(opts.limit ?? 50, 1), 200));
    if (opts.before && !Number.isNaN(Date.parse(opts.before))) query = query.lt("created_at", opts.before);
    if (opts.submittedOnly) query = query.not("submitted_at", "is", null);
    const { data, error } = await query;
    if (error) return { answers: [], error: error.message };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data ?? []) as any[];
    const bands = await bandsFor(admin, rows.filter((r) => r.submitted_at).map((r) => r.id));
    const n = (v: unknown) => (v === null || v === undefined ? null : Number(v));
    return {
      answers: rows.map((r) => ({
        id: r.id,
        questionText: r.question_text,
        part: r.part,
        mode: r.mode,
        retakeOf: r.retake_of,
        createdAt: r.created_at,
        durationMs: r.duration_ms,
        speakingMs: r.speaking_ms,
        longPauses: r.long_pauses,
        longestPauseMs: r.longest_pause_ms,
        transcript: r.transcript,
        wordCount: n(r.word_count),
        wpm: n(r.wpm),
        meanRunWords: n(r.mean_run_words),
        fillers: n(r.fillers),
        lexicalDiversity: n(r.lexical_diversity),
        lexicaWords: r.lexica_words ?? [],
        submittedAt: r.submitted_at,
        band: bands.get(r.id)?.band ?? null,
        reviews: bands.get(r.id)?.reviews ?? [],
      })),
    };
  } catch (error) {
    console.error("[listMyAnswers]", error);
    return { answers: [], error: "Không tải được câu trả lời" };
  }
}

export async function deleteAnswer(answerId: string): Promise<{ error?: string }> {
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    if (!isUuid(answerId)) return { error: "Invalid answer" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: a } = await admin.from("answers").select("id, audio_path").eq("id", answerId).eq("user_id", userId).maybeSingle();
    if (!a) return { error: "Invalid answer" };
    if (a.audio_path) await admin.storage.from(AUDIO_BUCKET).remove([a.audio_path]);
    await admin.from("answers").delete().eq("id", answerId).eq("user_id", userId);
    return {};
  } catch (error) {
    console.error("[deleteAnswer]", error);
    return { error: "Không xoá được" };
  }
}

/**
 * Step 1 of sending an answer to Chấm chéo: checks the learner may send one
 * and returns a one-time upload URL for its audio.
 */
export async function requestAudioUpload(
  answerId: string,
  mimeType: string
): Promise<{ path?: string; token?: string; error?: string }> {
  if (DEMO) return { error: "Chế độ demo không gửi được" };
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    if (!isUuid(answerId)) return { error: "Invalid answer" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: a } = await admin.from("answers").select("id, submitted_at").eq("id", answerId).eq("user_id", userId).maybeSingle();
    if (!a) return { error: "Invalid answer" };
    if (a.submitted_at) return { error: "Câu này đã gửi rồi" };

    const { given, submitted } = await exchangeCounts(admin, userId);
    if (submissionsLeft(given, submitted) <= 0) return { error: "Chấm 2 câu của người khác để được gửi thêm 1 câu" };

    const ext = /ogg/.test(mimeType) ? "ogg" : /mp4|m4a|aac/.test(mimeType) ? "m4a" : "webm";
    const path = `${userId}/${answerId}.${ext}`;
    const { data, error } = await admin.storage.from(AUDIO_BUCKET).createSignedUploadUrl(path, { upsert: true });
    if (error || !data) return { error: error?.message ?? "Không tạo được link tải lên" };
    return { path, token: data.token };
  } catch (error) {
    console.error("[requestAudioUpload]", error);
    return { error: "Không gửi được" };
  }
}

/** Step 2: the audio is uploaded; the answer joins the review queue. */
export async function confirmSubmission(answerId: string, path: string): Promise<{ error?: string }> {
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    if (!isUuid(answerId) || typeof path !== "string" || !path.startsWith(`${userId}/${answerId}.`)) return { error: "Invalid answer" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const { data: files } = await admin.storage.from(AUDIO_BUCKET).list(userId, { search: answerId });
    if (!((files ?? []) as { name: string }[]).some((f) => `${userId}/${f.name}` === path)) return { error: "Chưa tải bản ghi lên xong" };

    // Credits are checked again: two tabs could race step 1
    const { given, submitted } = await exchangeCounts(admin, userId);
    if (submissionsLeft(given, submitted) <= 0) {
      await admin.storage.from(AUDIO_BUCKET).remove([path]);
      return { error: "Chấm 2 câu của người khác để được gửi thêm 1 câu" };
    }

    const now = new Date();
    const { error } = await admin
      .from("answers")
      .update({
        submitted_at: now.toISOString(),
        audio_path: path,
        audio_expires_at: new Date(now.getTime() + AUDIO_TTL_DAYS * 86_400_000).toISOString(),
      })
      .eq("id", answerId)
      .eq("user_id", userId)
      .is("submitted_at", null);
    if (error) return { error: error.message };
    return {};
  } catch (error) {
    console.error("[confirmSubmission]", error);
    return { error: "Không gửi được" };
  }
}
