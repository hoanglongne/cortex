"use client";

import { useEffect } from "react";
import { captureInstallPrompt } from "@/lib/client/pwa";

/** Registers the service worker (needed to install Oratio) and keeps the install prompt. */
export default function PwaRegister() {
  useEffect(() => {
    captureInstallPrompt();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // installing is optional; the site works without it
      });
    }
  }, []);
  return null;
}
