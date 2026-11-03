"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";

/** Starts the shared analytics once per page load: who is signed in, app_open, sign_in. */
export default function AnalyticsBoot() {
  useEffect(() => {
    let client: ReturnType<typeof createClient> | null = null;
    try {
      client = createClient();
    } catch {
      // Supabase not configured: still counts the visit
    }
    return analytics.boot(client);
  }, []);
  return null;
}
