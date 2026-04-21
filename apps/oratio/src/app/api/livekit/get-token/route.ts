import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Match } from "@/lib/types/database";

/**
 * POST /api/livekit/get-token
 *
 * Generates a LiveKit access token for a participant to join a room.
 * Requires authentication.
 *
 * Request body:
 * {
 *   roomName: string;      // The room to join
 *   participantName: string; // Display name in the room
 * }
 *
 * Response:
 * {
 *   token: string;         // JWT token for LiveKit
 *   roomName: string;      // Confirmed room name
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate environment variables
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      console.error("Missing LiveKit environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 2. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { roomName, participantName } = body;

    if (!roomName || typeof roomName !== "string") {
      return NextResponse.json(
        { error: "roomName is required and must be a string" },
        { status: 400 }
      );
    }

    if (!participantName || typeof participantName !== "string") {
      return NextResponse.json(
        { error: "participantName is required and must be a string" },
        { status: 400 }
      );
    }

    // 4. Verify user is part of this room's match using admin client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;

    const { data: matchData, error: matchError } = await adminClient
      .from("matches")
      .select("*")
      .eq("room_id", roomName)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single();

    const match = matchData as Match | null;

    if (matchError || !match) {
      return NextResponse.json(
        { error: "You are not authorized to join this room" },
        { status: 403 }
      );
    }

    // Check if match is still valid (not cancelled/finished)
    if (match.status === "cancelled" || match.status === "finished") {
      return NextResponse.json(
        { error: "This match has been cancelled or already finished" },
        { status: 410 } // 410 Gone
      );
    }

    // 5. Generate LiveKit token
    const token = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: participantName,
      // Token expires in 2 hours
      ttl: 60 * 60 * 2,
    });

    // Add room-specific grants
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    // 6. Update match status to active if pending
    if (match.status === "pending") {
      await adminClient
        .from("matches")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("id", match.id);
    }

    return NextResponse.json({
      token: jwt,
      roomName,
      livekitUrl,
    });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/livekit/get-token
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "LiveKit token endpoint. Use POST to generate tokens.",
  });
}
