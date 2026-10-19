import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";
import { isCronRequest } from "@/lib/server/cron-auth";

/**
 * Daily at 20:10 Vietnam time (vercel.json crons): a web push to everyone who
 * turned on "Nhắc giờ thi", 20 minutes before Giờ thi opens. Needs
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT.
 */
export async function GET(request: NextRequest) {
  if (!isCronRequest(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return NextResponse.json({ error: "VAPID keys not set" }, { status: 500 });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:hello@oratio.app", publicKey, privateKey);

  // The date in Vietnam, so a retry the same evening doesn't send twice
  const today = new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
  const payload = JSON.stringify({
    title: "Giờ thi mở lúc 20:30",
    body: "20 phút nữa phòng thi mở. Vào thi thử với người thật nhé.",
    url: "/",
  });

  const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  let sent = 0;
  let removed = 0;
  for (let i = 0; i < 50; i++) {
    const { data, error } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .or(`last_sent_on.is.null,last_sent_on.lt.${today}`)
      .limit(200);
    if (error) return NextResponse.json({ error: error.message, sent }, { status: 500 });
    const subs = (data ?? []) as { endpoint: string; p256dh: string; auth: string }[];
    if (subs.length === 0) break;

    const gone: string[] = [];
    await Promise.all(
      subs.map((s) =>
        webpush
          .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 1800 })
          .then(() => sent++)
          .catch((err: { statusCode?: number }) => {
            // The browser dropped the subscription
            if (err.statusCode === 404 || err.statusCode === 410) gone.push(s.endpoint);
          })
      )
    );
    if (gone.length) {
      await admin.from("push_subscriptions").delete().in("endpoint", gone);
      removed += gone.length;
    }
    // Marked even when a send failed for another reason, so the loop ends
    await admin
      .from("push_subscriptions")
      .update({ last_sent_on: today })
      .in(
        "endpoint",
        subs.map((s) => s.endpoint).filter((e) => !gone.includes(e))
      );
  }
  return NextResponse.json({ sent, removed });
}
