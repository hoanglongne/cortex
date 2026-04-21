"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Get count of learners currently online (waiting in match queue)
 */
export async function getOnlineLearnersCount(): Promise<{ count: number; error?: string }> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adminClient = createAdminClient() as any;

        // Count users in queue within last 30 seconds (actively waiting)
        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();

        const { count, error } = await adminClient
            .from("match_queue")
            .select("*", { count: "exact", head: true })
            .eq("status", "waiting")
            .gte("created_at", thirtySecondsAgo);

        if (error) {
            console.error("Error fetching online count:", error);
            return { count: 0, error: "Failed to fetch online count" };
        }

        return { count: count || 0 };
    } catch (error) {
        console.error("Online count error:", error);
        return { count: 0, error: "An unexpected error occurred" };
    }
}

/**
 * Get global statistics (total users, sessions, etc.)
 */
export async function getGlobalStats() {
    try {
        const supabase = await createClient();

        // Get total users count
        const { count: totalUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        // Get total sessions count
        const { count: totalSessions } = await supabase
            .from("matches")
            .select("*", { count: "exact", head: true })
            .eq("status", "finished");

        return {
            totalUsers: totalUsers || 0,
            totalSessions: totalSessions || 0,
            error: null,
        };
    } catch (error) {
        console.error("Global stats error:", error);
        return {
            totalUsers: 0,
            totalSessions: 0,
            error: "Failed to fetch global stats",
        };
    }
}
