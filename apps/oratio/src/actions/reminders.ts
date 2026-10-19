"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { currentUserId } from "@/lib/server/match-access";

/** Web push subscriptions for the exam-time reminder (/api/cron/exam-reminder). */

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

const isPushEndpoint = (v: unknown): v is string => {
  if (typeof v !== "string" || v.length > 1000) return false;
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
};

export async function savePushSubscription(sub: PushSubscriptionInput): Promise<{ error?: string }> {
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    const p256dh = sub?.keys?.p256dh;
    const auth = sub?.keys?.auth;
    if (!isPushEndpoint(sub?.endpoint) || typeof p256dh !== "string" || typeof auth !== "string" || p256dh.length > 200 || auth.length > 100) {
      return { error: "Invalid subscription" };
    }
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { error } = await admin
      .from("push_subscriptions")
      .upsert({ endpoint: sub.endpoint, user_id: userId, p256dh, auth }, { onConflict: "endpoint" });
    return error ? { error: error.message } : {};
  } catch (error) {
    console.error("[savePushSubscription]", error);
    return { error: "Không bật được nhắc" };
  }
}

export async function removePushSubscription(endpoint: string): Promise<{ error?: string }> {
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    if (!isPushEndpoint(endpoint)) return { error: "Invalid subscription" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    await admin.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", userId);
    return {};
  } catch (error) {
    console.error("[removePushSubscription]", error);
    return { error: "Không tắt được nhắc" };
  }
}
