import { claimOrder } from "./rules";

/** Supabase admin client (untyped, like the rest of matchmaking.ts). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueueClient = any;

/**
 * Atomically flip a queue entry from waiting -> matched. Only one concurrent
 * caller can succeed for a given row.
 */
export async function claimQueueEntry(adminClient: QueueClient, entryId: string): Promise<boolean> {
  const { data, error } = await adminClient
    .from("match_queue")
    .update({ status: "matched", last_seen_at: new Date().toISOString() })
    .eq("id", entryId)
    .eq("status", "waiting")
    .select("id");
  return !error && Array.isArray(data) && data.length > 0;
}

/** Undo a claim so the entry can be matched again. */
export async function releaseQueueEntries(adminClient: QueueClient, entryIds: string[]) {
  if (entryIds.length === 0) return;
  await adminClient
    .from("match_queue")
    .update({ status: "waiting" })
    .in("id", entryIds)
    .eq("status", "matched");
}

/**
 * Claim every entry in a global order. On failure, release what was claimed.
 */
export async function claimAll(
  adminClient: QueueClient,
  entryIds: string[]
): Promise<{ ok: true } | { ok: false; failedId: string }> {
  const claimed: string[] = [];
  for (const id of claimOrder(entryIds)) {
    if (!(await claimQueueEntry(adminClient, id))) {
      await releaseQueueEntries(adminClient, claimed);
      return { ok: false, failedId: id };
    }
    claimed.push(id);
  }
  return { ok: true };
}
