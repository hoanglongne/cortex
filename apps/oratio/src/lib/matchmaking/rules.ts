/**
 * Pure matchmaking rules, kept out of the "use server" action file so they
 * can be unit tested.
 */

/** A queue entry counts as online if it polled within this window. */
export const QUEUE_STALE_AFTER_MS = 15_000;

/** Ignore findMatch calls closer together than this (client polls every 2s). */
export const MIN_POLL_INTERVAL_MS = 1_000;

/**
 * A "matched" queue entry younger than this means another request is
 * creating a match for this user right now; don't touch it.
 */
export const CLAIM_IN_PROGRESS_MS = 10_000;

/**
 * Allowed band gap when the two users' preferred ranges don't overlap.
 * Starts strict and widens the longer the user has been waiting.
 */
export function looseBandThreshold(waitedMs: number): number {
  if (waitedMs < 15_000) return 0.5;
  if (waitedMs < 30_000) return 1.0;
  if (waitedMs < 60_000) return 1.5;
  return 2.0;
}

export type BandCandidate = {
  band: number;
  targetMin: number;
  targetMax: number;
};

export function isBandCompatible(
  me: { band: number; wantMin: number; wantMax: number; waitedMs: number },
  them: BandCandidate
): { compatible: boolean; perfect: boolean } {
  const weWantThem = them.band >= me.wantMin && them.band <= me.wantMax;
  const theyWantUs = me.band >= them.targetMin && me.band <= them.targetMax;
  const perfect = weWantThem && theyWantUs;
  const loose =
    Math.abs(them.band - me.band) <= looseBandThreshold(me.waitedMs);
  return { compatible: perfect || loose, perfect };
}

/**
 * Queue entries must be claimed in a global order (by id) so two users
 * matching each other at the same time can't both win: whoever claims the
 * lower id first wins, the other fails on that same row.
 */
export function claimOrder(ids: string[]): string[] {
  return [...ids].sort();
}

export function msSince(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : now - t;
}
