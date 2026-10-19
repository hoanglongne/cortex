import { timingSafeEqual } from "node:crypto";

/** Vercel cron calls send "Authorization: Bearer $CRON_SECRET". */
export function isCronRequest(authorization: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = new TextEncoder().encode(authorization ?? "");
  const expected = new TextEncoder().encode(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
