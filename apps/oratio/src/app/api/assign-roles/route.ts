import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * API endpoint to manually assign roles to current match
 * POST /api/assign-roles
 * Body: { matchId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { matchId } = await request.json();

        if (!matchId) {
            return NextResponse.json(
                { error: "matchId is required" },
                { status: 400 }
            );
        }

        console.log("[assign-roles] Assigning roles for match:", matchId);

        const adminClient = createAdminClient();

        // Get match details
        const { data: match, error: fetchError } = await adminClient
            .from("matches")
            .select("*")
            .eq("id", matchId)
            .single();

        if (fetchError || !match) {
            console.error("[assign-roles] Failed to fetch match:", fetchError);
            return NextResponse.json(
                { error: "Match not found" },
                { status: 404 }
            );
        }

        // Check if already has roles
        if (match.interviewer_id && match.candidate_id) {
            console.log("[assign-roles] Match already has roles assigned");
            return NextResponse.json({
                success: true,
                message: "Roles already assigned",
                interviewer_id: match.interviewer_id,
                candidate_id: match.candidate_id,
                match: match,
            });
        }

        // Randomly assign roles
        const isUser1Interviewer = Math.random() > 0.5;
        const interviewer_id = isUser1Interviewer ? match.user1_id : match.user2_id;
        const candidate_id = isUser1Interviewer ? match.user2_id : match.user1_id;

        console.log("[assign-roles] Assigning:", {
            interviewer_id,
            candidate_id,
            isUser1Interviewer,
        });

        // Update match
        const { data: updatedMatch, error: updateError } = await adminClient
            .from("matches")
            .update({
                interviewer_id,
                candidate_id,
            })
            .eq("id", matchId)
            .select()
            .single();

        if (updateError) {
            console.error("[assign-roles] Failed to update match:", updateError);
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        console.log("[assign-roles] ✅ Roles assigned successfully:", updatedMatch);

        return NextResponse.json({
            success: true,
            message: "Roles assigned successfully",
            match: updatedMatch,
        });
    } catch (error) {
        console.error("[assign-roles] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
