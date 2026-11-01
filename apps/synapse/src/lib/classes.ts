/**
 * Classes, the student's side in Synapse (docs/CLASSROOM.md): join with the
 * class code, see the work the teacher gave, report the numbers. The class
 * system is shared by Cortex apps (@cortex/classroom); what a Synapse lesson is
 * and what Synapse reports is the Synapse module (@cortex/classroom-synapse).
 * Numbers and phrase names only. The pure parts are unit tested.
 */
import { classroomApi, type Assignment, type ClassInfo } from "@cortex/classroom";
import { applyRun, counts, SYNAPSE, synapseModule, type EndingTier, type SynapseMetrics } from "@cortex/classroom-synapse";
import { statusCounts, weakPhrases, type Progress } from "./level";
import { getSupabaseClient } from "./supabase";

export type { ClassInfo, Assignment };

const api = classroomApi(getSupabaseClient);
export const joinClass = api.joinClass;
export const leaveClass = api.leaveClass;
/** Classes that use Synapse, with their Synapse work. */
export const myClasses = () => api.myClasses(SYNAPSE);

const CLASSES_KEY = "synapse-classes-v1";

export function readCachedClasses(): ClassInfo[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLASSES_KEY) ?? "[]") as unknown;
    return Array.isArray(v) ? (v as ClassInfo[]) : [];
  } catch {
    return [];
  }
}

export function cacheClasses(list: ClassInfo[]): void {
  try {
    localStorage.setItem(CLASSES_KEY, JSON.stringify(list));
  } catch {
    // Private mode.
  }
}

/** The Synapse work of the classes this person is a student in. */
export const synapseWork = (classes: readonly Pick<ClassInfo, "role" | "assignments">[]): Assignment[] =>
  classes.filter((c) => c.role === "student").flatMap((c) => c.assignments.filter((a) => a.app === SYNAPSE));

/** What a finished mission does to the numbers: one more run, and each assignment it counts for. */
export function settleRun(p: Progress, work: readonly Pick<Assignment, "id" | "kind" | "payload" | "created_at">[], run: { mission_id: string; review: boolean; ending: EndingTier; at: string }): Progress {
  const homework = { ...p.homework };
  for (const a of work) if (counts(a, run)) homework[a.id] = applyRun(homework[a.id], run.ending);
  return { ...p, runs: p.runs + 1, homework };
}

/** What Synapse reports to the classes: numbers and the phrase names the student keeps missing. */
export function metricsOf(p: Progress): SynapseMetrics {
  return { runs: p.runs, cleared: p.cleared.length, solid: statusCounts(p).solid, weak: weakPhrases(p).slice(0, 5), progress: p.homework };
}

/** How a piece of work stands for the student, in words. */
export function workLine(a: Pick<Assignment, "id" | "kind" | "payload">, p: Progress): { text: string; done: boolean } {
  const d = p.homework[a.id];
  if (d?.done) return { text: "Đã xong", done: true };
  return { text: d?.tries ? `Đã thử ${d.tries} lần` : "Chưa chơi", done: false };
}

let last = "";

/** Sends the numbers to every class this student is in, when they changed. */
export async function reportNow(p: Progress): Promise<void> {
  const classes = readCachedClasses().filter((c) => c.role === "student");
  const client = getSupabaseClient();
  if (classes.length === 0 || !client) return;
  const { data } = await client.auth.getSession();
  if (!data.session) return;
  const metrics = metricsOf(p);
  const key = JSON.stringify(metrics);
  if (key === last) return;
  try {
    await api.report(SYNAPSE, metrics, 0);
    last = key;
  } catch {
    // Offline: the next change or visit reports again.
  }
}

/** Fetches the classes, caches them, and returns them (the cached list when offline). */
export async function refreshClasses(): Promise<ClassInfo[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const list = await myClasses();
    cacheClasses(list);
    return list;
  } catch {
    return readCachedClasses();
  }
}

export { synapseModule };
