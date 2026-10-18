/**
 * Classes, in the browser (docs/CLASSROOM.md): join, leave, the class
 * ranking, and a class code from a /join link waiting for sign-in. The
 * numbers a class sees are built on the server (actions/classroom.ts).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { classroomApi } from "@cortex/classroom";
import { syncClasses } from "@/actions/classroom";
import { getSupabaseClient } from "@/lib/supabase/client";

export const classes = classroomApi(() => getSupabaseClient() as unknown as SupabaseClient);

const PENDING_KEY = "oratio-join-code";
const SYNCED_KEY = "oratio-classes-synced";
/** When the app opens, report at most this often (a finished call always reports). */
const SYNC_EVERY_MS = 15 * 60_000;

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string | null) {
    try {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch {
      /* private mode: the code is typed again */
    }
  },
};

/** A class code (6 letters and digits) or null. */
export const cleanCode = (raw: string | null | undefined) => {
  const c = (raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return c.length === 6 ? c : null;
};

export const pendingCode = () => cleanCode(store.get(PENDING_KEY));
export const setPendingCode = (code: string | null) => store.set(PENDING_KEY, code);

/** Sends this student's numbers to their classes; quietly, and not too often unless `force`. */
export async function reportToClasses(force = false): Promise<void> {
  const last = Number(store.get(SYNCED_KEY) ?? 0);
  if (!force && Date.now() - last < SYNC_EVERY_MS) return;
  store.set(SYNCED_KEY, String(Date.now()));
  await syncClasses().catch(() => undefined);
}

/** "hạn hôm nay", "còn 3 ngày", "đã qua hạn". */
export function dueLabel(days: number): string {
  return days < 0 ? "đã qua hạn" : days === 0 ? "hạn hôm nay" : days === 1 ? "hạn ngày mai" : `còn ${days} ngày`;
}
