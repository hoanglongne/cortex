import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { AUDIO_BUCKET } from "@/lib/server/answers";

/**
 * Daily (vercel.json crons): deletes Chấm chéo audio older than 30 days.
 * Scores and transcripts stay; anchors are never deleted. Vercel sends
 * "Authorization: Bearer $CRON_SECRET".
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const given = new TextEncoder().encode(request.headers.get("authorization") ?? "");
  const expected = new TextEncoder().encode(`Bearer ${secret}`);
  if (!secret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  let removed = 0;
  // In batches, so one run copes with a backlog
  for (let i = 0; i < 20; i++) {
    const { data, error } = await admin
      .from("answers")
      .select("id, audio_path")
      .not("audio_path", "is", null)
      .neq("mode", "anchor")
      .lt("audio_expires_at", new Date().toISOString())
      .limit(100);
    if (error) return NextResponse.json({ error: error.message, removed }, { status: 500 });
    const rows = (data ?? []) as { id: string; audio_path: string }[];
    if (rows.length === 0) break;
    const { error: storageError } = await admin.storage.from(AUDIO_BUCKET).remove(rows.map((r) => r.audio_path));
    if (storageError) return NextResponse.json({ error: storageError.message, removed }, { status: 500 });
    await admin
      .from("answers")
      .update({ audio_path: null })
      .in(
        "id",
        rows.map((r) => r.id)
      );
    removed += rows.length;
  }
  return NextResponse.json({ removed });
}
