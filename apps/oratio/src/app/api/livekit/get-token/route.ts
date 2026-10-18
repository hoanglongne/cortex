import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Match } from "@/lib/types/database";

/**
 * POST /api/livekit/get-token  { roomName: string }
 *
 * A LiveKit token for the signed-in user to join their match's room. The
 * display name is the user's profile name (not taken from the client). The
 * first request marks the match active; started_at is set once both people
 * have asked to join, so a call only counts when both were there.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (!apiKey || !apiSecret || !livekitUrl) {
      console.error("Missing LiveKit environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    let body: { roomName?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }
    const roomName = body?.roomName;
    if (typeof roomName !== "string" || !/^room_[0-9a-f-]{36}$/i.test(roomName)) {
      return NextResponse.json({ error: "roomName is required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data: matchData } = await admin.from("matches").select("*").eq("room_id", roomName).maybeSingle();
    const match = matchData as Match | null;

    if (!match || (match.user1_id !== user.id && match.user2_id !== user.id)) {
      return NextResponse.json({ error: "You are not authorized to join this room" }, { status: 403 });
    }
    if (match.status === "cancelled" || match.status === "finished") {
      return NextResponse.json({ error: "This match has been cancelled or already finished" }, { status: 410 });
    }

    const { data: profile } = await admin.from("profiles").select("username").eq("id", user.id).maybeSingle();

    const token = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: (profile?.username as string | undefined) ?? "Oratio user",
      // Only needed to join; LiveKit keeps a connected session alive
      ttl: 15 * 60,
    });
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    const jwt = await token.toJwt();

    // Record this person's join, then start the clock if both have joined
    const now = new Date().toISOString();
    const joinedColumn = match.user1_id === user.id ? "user1_joined_at" : "user2_joined_at";
    await admin
      .from("matches")
      .update({ status: "active", [joinedColumn]: now, last_activity_at: now })
      .eq("id", match.id)
      .in("status", ["pending", "active"]);
    await admin
      .from("matches")
      .update({ started_at: now })
      .eq("id", match.id)
      .is("started_at", null)
      .not("user1_joined_at", "is", null)
      .not("user2_joined_at", "is", null);

    return NextResponse.json({ token: jwt, roomName, livekitUrl });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
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
