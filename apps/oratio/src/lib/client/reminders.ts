"use client";

import { useCallback, useEffect, useState } from "react";
import { removePushSubscription, savePushSubscription } from "@/actions/reminders";
import { examCalendarIcs } from "@/lib/exam-calendar";

/**
 * "Nhắc giờ thi": a web push 20 minutes before Giờ thi. Needs the service
 * worker (production builds), notification permission and, on iPhone, the
 * app installed to the home screen. Otherwise offer the calendar file.
 */
export type ReminderState = "loading" | "on" | "off" | "denied" | "ios-install" | "unsupported";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const supported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

async function registration() {
  return (await navigator.serviceWorker.getRegistration()) ?? null;
}

export function useExamReminder() {
  const [state, setState] = useState<ReminderState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next: ReminderState;
      if (!supported() || !VAPID) next = isIos() && !standalone() ? "ios-install" : "unsupported";
      else if (Notification.permission === "denied") next = "denied";
      else {
        const reg = await registration();
        next = reg && (await reg.pushManager.getSubscription()) ? "on" : reg ? "off" : "unsupported";
      }
      if (!cancelled) setState(next);
    })().catch(() => !cancelled && setState("unsupported"));
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(async () => {
    setError(null);
    try {
      const reg = await registration();
      if (!reg || !VAPID) return setState("unsupported");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState(permission === "denied" ? "denied" : "off");
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID) });
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const res = await savePushSubscription(json);
      if (res.error) {
        await sub.unsubscribe();
        setError("Chưa bật được nhắc, thử lại sau.");
        return;
      }
      setState("on");
    } catch {
      setError("Chưa bật được nhắc, thử lại sau.");
    }
  }, []);

  const disable = useCallback(async () => {
    setError(null);
    try {
      const sub = await (await registration())?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setError("Chưa tắt được nhắc, thử lại sau.");
    }
  }, []);

  return { state, error, enable, disable };
}

/** Downloads Giờ thi as a repeating calendar event. */
export function downloadExamCalendar() {
  const blob = new Blob([examCalendarIcs(window.location.origin)], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gio-thi-oratio.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
