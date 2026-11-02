"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { currentUserId, isUuid } from "@/lib/server/match-access";
import { AUDIO_BUCKET, AUDIO_TTL_DAYS } from "@/lib/server/answers";

/**
 * Handing an answer in to a class (issue #88): the audio goes up like any
 * answer sent to Chấm chéo, but it joins the class, not the open pool, and it
 * does not use up the exchange (two reviews given per answer sent). The
 * teacher hears and rates it; classmates only when the teacher turned that on.
 */

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export interface ClassWork {
  classId: string;
  className: string;
  /** Classmates may hear and rate each other's answers */
  peers: boolean;
  assignments: { id: string; title: string; due: string | null }[];
}

/** The classes this student is in that use Oratio, with the Oratio work given to them. */
export async function myClassWork(): Promise<{ classes: ClassWork[]; error?: string }> {
  if (DEMO) return { classes: [] };
  try {
    const userId = await currentUserId();
    if (!userId) return { classes: [], error: "Not authenticated" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: mine } = await admin.rpc("oratio_my_classes", { p_user: userId });
    const list = (mine ?? []) as { class_id: string; peers: boolean }[];
    if (list.length === 0) return { classes: [] };
    const ids = list.map((c) => c.class_id);
    const [{ data: classes }, { data: work }] = await Promise.all([
      admin.from("cortex_classes").select("id, name").in("id", ids),
      admin
        .from("cortex_class_assignments")
        .select("id, class_id, title, due_on, for_user")
        .in("class_id", ids)
        .eq("app", "oratio")
        .order("created_at", { ascending: false })
        .limit(60),
    ]);
    const names = new Map(((classes ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name]));
    return {
      classes: list.map((c) => ({
        classId: c.class_id,
        className: names.get(c.class_id) ?? "Lớp",
        peers: c.peers,
        // Work for the whole class or for this student only
        assignments: ((work ?? []) as { id: string; class_id: string; title: string; due_on: string | null; for_user: string | null }[])
          .filter((a) => a.class_id === c.class_id && (!a.for_user || a.for_user === userId))
          .map((a) => ({ id: a.id, title: a.title, due: a.due_on })),
      })),
    };
  } catch (error) {
    console.error("[myClassWork]", error);
    return { classes: [], error: "Không tải được lớp" };
  }
}

async function inClass(admin: any, userId: string, classId: string): Promise<boolean> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data } = await admin.rpc("oratio_my_classes", { p_user: userId });
  return ((data ?? []) as { class_id: string }[]).some((c) => c.class_id === classId);
}

/** Step 1: a one-time upload link for the audio of an answer the student hands in to a class. */
export async function requestClassUpload(answerId: string, classId: string, mimeType: string): Promise<{ path?: string; token?: string; error?: string }> {
  if (DEMO) return { error: "Chế độ demo không nộp được" };
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    if (!isUuid(answerId) || !isUuid(classId)) return { error: "Invalid answer" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: a } = await admin.from("answers").select("id, submitted_at").eq("id", answerId).eq("user_id", userId).maybeSingle();
    if (!a) return { error: "Invalid answer" };
    if (a.submitted_at) return { error: "Câu này đã gửi rồi" };
    if (!(await inClass(admin, userId, classId))) return { error: "Bạn không ở trong lớp này" };
    const ext = /ogg/.test(mimeType) ? "ogg" : /mp4|m4a|aac/.test(mimeType) ? "m4a" : "webm";
    const path = `${userId}/${answerId}.${ext}`;
    const { data, error } = await admin.storage.from(AUDIO_BUCKET).createSignedUploadUrl(path, { upsert: true });
    if (error || !data) return { error: error?.message ?? "Không tạo được link tải lên" };
    return { path, token: data.token };
  } catch (error) {
    console.error("[requestClassUpload]", error);
    return { error: "Không nộp được" };
  }
}

/** Step 2: the audio is up; the answer joins the class (and the assignment, when one was chosen). */
export async function confirmClassSubmission(answerId: string, classId: string, assignmentId: string | null, path: string): Promise<{ error?: string }> {
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    if (!isUuid(answerId) || !isUuid(classId) || (assignmentId !== null && !isUuid(assignmentId)) || typeof path !== "string" || !path.startsWith(`${userId}/${answerId}.`)) return { error: "Invalid answer" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!(await inClass(admin, userId, classId))) return { error: "Bạn không ở trong lớp này" };
    if (assignmentId) {
      const { data: work } = await admin.from("cortex_class_assignments").select("id").eq("id", assignmentId).eq("class_id", classId).eq("app", "oratio").maybeSingle();
      if (!work) return { error: "Bài này không thuộc lớp" };
    }
    const { data: files } = await admin.storage.from(AUDIO_BUCKET).list(userId, { search: answerId });
    if (!((files ?? []) as { name: string }[]).some((f) => `${userId}/${f.name}` === path)) return { error: "Chưa tải bản ghi lên xong" };

    const now = new Date();
    const { error } = await admin
      .from("answers")
      .update({
        submitted_at: now.toISOString(),
        audio_path: path,
        audio_expires_at: new Date(now.getTime() + AUDIO_TTL_DAYS * 86_400_000).toISOString(),
        class_id: classId,
        assignment_id: assignmentId,
      })
      .eq("id", answerId)
      .eq("user_id", userId)
      .is("submitted_at", null);
    if (error) return { error: error.message };
    return {};
  } catch (error) {
    console.error("[confirmClassSubmission]", error);
    return { error: "Không nộp được" };
  }
}
