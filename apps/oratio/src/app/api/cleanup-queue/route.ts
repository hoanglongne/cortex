import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Cleanup old queue entries for the current user
 * Called when user loads the app to prevent stale matches
 */
export async function POST() {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;

    // 1. Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log(`[Cleanup Queue] Cleaning up for user ${user.id}`);

    // 2. Cancel any old PENDING matches for this user
    // This is critical - old pending matches cause User A to auto-match with User B
    const { error: cancelMatchError } = await adminClient
      .from("matches")
      .update({ status: "cancelled" })
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq("status", "pending");

    if (cancelMatchError) {
      console.error("[Cleanup Queue] Error cancelling old matches:", cancelMatchError);
    } else {
      console.log(`[Cleanup Queue] Cancelled old pending matches for user ${user.id}`);
    }

    // 3. Delete any queue entries for this user
    // This prevents matches with stale entries from previous sessions
    const { error: deleteError } = await adminClient
      .from("match_queue")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[Cleanup Queue] Error deleting queue:", deleteError);
      return NextResponse.json(
        { error: "Failed to cleanup queue" },
        { status: 500 }
      );
    }

    console.log(`[Cleanup Queue] Successfully cleaned up for user ${user.id}`);

    return NextResponse.json({ 
      success: true,
      message: "Old matches and queue entries cleaned up"
    });

  } catch (error) {
    console.error("[Cleanup Queue] Exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
