import { oratioModule, progressOf, type Bands, type OratioMetrics, type Session } from "@cortex/classroom-oratio";
import type { Assignment } from "@cortex/classroom";
import { CRITERIA } from "@/lib/feedback";
import type { AdminClient } from "@/lib/server/match-access";

/**
 * Classes (docs/CLASSROOM.md, module packages/classroom-oratio), server side:
 * what a student reports, built from Oratio's own tables so it can't be
 * made up in the browser, and the questions a teacher gave, to ask first.
 * Not a "use server" file: nothing here is a public endpoint.
 */

/** Calls under a minute don't count, and one call counts 90 minutes at most (as in the stats trigger). */
export function callMinutes(startedAt: string, endedAt: string): number {
  const s = (Date.parse(endedAt) - Date.parse(startedAt)) / 1000;
  return s >= 60 ? Math.min(90, Math.round(s / 60)) : 0;
}

/** Averages of the latest ratings, per criterion and overall (IELTS rounding to .5). */
export function bandAverages(rows: readonly { scores: Record<string, number> | null }[]): { bands: Bands | null; count: number } {
  const scored = rows.filter((r) => r.scores && CRITERIA.every((c) => typeof r.scores![c] === "number"));
  if (scored.length === 0) return { bands: null, count: 0 };
  const bands: Bands = {};
  for (const c of CRITERIA) bands[c] = Math.round((scored.reduce((n, r) => n + r.scores![c], 0) / scored.length) * 2) / 2;
  bands.overall = Math.round((CRITERIA.reduce((n, c) => n + (bands[c] ?? 0), 0) / CRITERIA.length) * 2) / 2;
  return { bands, count: scored.length };
}

interface Profile {
  total_sessions: number | null;
  total_minutes: number | null;
  current_band: number | null;
  target_band: number | null;
  current_streak: number | null;
}

/** A student's Oratio numbers for their classes, from the database. */
export async function buildMetrics(admin: AdminClient, userId: string, assignments: readonly Assignment[]): Promise<{ metrics: OratioMetrics; streak: number }> {
  const [{ data: profile }, { data: feedback }] = await Promise.all([
    admin.from("profiles").select("total_sessions, total_minutes, current_band, target_band, current_streak").eq("id", userId).maybeSingle(),
    admin.from("session_feedback").select("scores").eq("to_user_id", userId).order("created_at", { ascending: false }).limit(20),
  ]);
  const p = (profile ?? {}) as Partial<Profile>;
  const { bands, count } = bandAverages((feedback ?? []) as { scores: Record<string, number> | null }[]);

  const progress: OratioMetrics["progress"] = {};
  if (assignments.length > 0) {
    const since = assignments.map((a) => a.created_at).sort()[0];
    const { data: calls } = await admin
      .from("matches")
      .select("started_at, ended_at, questions_asked")
      .eq("status", "finished")
      .not("started_at", "is", null)
      .not("ended_at", "is", null)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .gte("ended_at", since)
      .order("ended_at", { ascending: false })
      .limit(500);
    const sessions: Session[] = ((calls ?? []) as { started_at: string; ended_at: string; questions_asked: string[] | null }[])
      .map((c) => ({ ended_at: c.ended_at, minutes: callMinutes(c.started_at, c.ended_at), questions: c.questions_asked ?? [] }))
      .filter((s) => s.minutes > 0);
    const ids = [...new Set(sessions.flatMap((s) => s.questions))];
    const { data: qs } = ids.length ? await admin.from("ielts_questions").select("id, part, category").in("id", ids) : { data: [] };
    const byId = new Map(((qs ?? []) as { id: string; part: number; category: string }[]).map((q) => [q.id, q]));
    for (const a of assignments) progress[a.id] = progressOf(a, sessions, (id) => byId.get(id));
  }

  const metrics: OratioMetrics = {
    sessions: p.total_sessions ?? 0,
    minutes: p.total_minutes ?? 0,
    ratings: count,
    band: bands,
    current_band: p.current_band ?? null,
    target_band: p.target_band ?? null,
    progress,
  };
  return { metrics, streak: p.current_streak ?? 0 };
}

/** What a teacher asked this student to practise: questions to ask first, topics to lean on. */
export interface AssignedWork {
  questionIds: Set<string>;
  topics: { category: string; part: number | null }[];
}

const NOTHING: AssignedWork = { questionIds: new Set(), topics: [] };
/** Work given more than this long ago, or overdue by a week, stops steering the questions. */
const FRESH_DAYS = 60;

export async function assignedWork(admin: AdminClient, userId: string | null, now = Date.now()): Promise<AssignedWork> {
  if (!userId) return NOTHING;
  try {
    const { data: members } = await admin.from("cortex_class_members").select("class_id").eq("user_id", userId);
    const classIds = ((members ?? []) as { class_id: string }[]).map((m) => m.class_id);
    if (classIds.length === 0) return NOTHING;
    const { data: classes } = await admin.from("cortex_classes").select("id").in("id", classIds).eq("archived", false).contains("apps", ["oratio"]);
    const live = ((classes ?? []) as { id: string }[]).map((c) => c.id);
    if (live.length === 0) return NOTHING;
    const { data: rows } = await admin
      .from("cortex_class_assignments")
      .select("kind, payload, due_on")
      .in("class_id", live)
      .eq("app", "oratio")
      .gte("created_at", new Date(now - FRESH_DAYS * 86_400_000).toISOString());
    const weekAgo = new Date(now - 7 * 86_400_000).toISOString().slice(0, 10);
    const out: AssignedWork = { questionIds: new Set(), topics: [] };
    for (const r of (rows ?? []) as { kind: string; payload: unknown; due_on: string | null }[]) {
      if (r.due_on && r.due_on < weekAgo) continue;
      const p = oratioModule.parsePayload(r.kind, r.payload);
      if (p.kind === "questions") p.question_ids.forEach((id) => out.questionIds.add(id));
      else if (p.kind === "topic" && p.category) out.topics.push({ category: p.category, part: p.part });
    }
    return out;
  } catch {
    // Classes are extra: a missing table or a slow query never blocks a call.
    return NOTHING;
  }
}

/** Questions to pick from, best first: assigned ones, then the assigned topics', then any. */
export function preferredPool<Q extends { id: string; part: number; category: string }>(all: readonly Q[], part: number, exclude: readonly string[], work: AssignedWork): Q[] {
  const skip = new Set(exclude);
  const open = all.filter((q) => q.part === part && !skip.has(q.id));
  const assigned = open.filter((q) => work.questionIds.has(q.id));
  if (assigned.length) return assigned;
  const topical = open.filter((q) => work.topics.some((t) => t.category === q.category && (t.part === null || t.part === part)));
  if (topical.length) return topical;
  return open.length ? open : all.filter((q) => q.part === part);
}
