"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { initializeRoles } from "@/actions/questions";
import type {
  FindMatchResult,
  Profile,
  Match,
  MatchQueueEntry,
  SessionScores,
} from "@/lib/types/database";

interface MatchQueueWithProfile extends MatchQueueEntry {
  profile: Profile;
}

/**
 * Get current queue status (for debugging)
 */
export async function getQueueStatus(): Promise<{
  waitingCount: number;
  totalCount: number;
  recentEntries: { userId: string; status: string; bandMin: number; bandMax: number; createdAt: string; profileName: string; profileBand: number }[];
  error?: string;
}> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;

    // Get exact count of waiting
    const { count: waitingCount, error: countError } = await adminClient
      .from("match_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "waiting");

    if (countError) {
      console.error("Queue count error:", countError);
      // Don't throw, just return 0
    }

    // Get total count (all statuses)
    const { count: totalCount, error: totalCountError } = await adminClient
      .from("match_queue")
      .select("*", { count: "exact", head: true });

    if (totalCountError) {
      console.error("Total count error:", totalCountError);
    }

    // Get recent entries regardless of status
    const { data: recentEntries, error: listError } = await adminClient
      .from("match_queue")
      .select(`
          user_id, 
          status, 
          target_band_min, 
          target_band_max, 
          created_at,
          profile:profiles(username, current_band)
        `)
      .order("created_at", { ascending: false })
      .limit(10); // Limit to 10 for better visibility

    if (listError) throw listError;

    return {
      waitingCount: waitingCount || 0,
      totalCount: totalCount || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentEntries: (recentEntries || []).map((e: any) => ({
        userId: e.user_id,
        status: e.status,
        bandMin: e.target_band_min,
        bandMax: e.target_band_max,
        createdAt: e.created_at,
        profileName: e.profile?.username || "Unknown",
        profileBand: e.profile?.current_band
      }))
    };
  } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("getQueueStatus error:", err);
    return { waitingCount: 0, totalCount: 0, recentEntries: [], error: err.message };
  }
}

/**
 * DEBUG: Reset queue and force insert for testing
 */
export async function debugResetAndJoin(): Promise<{ success: boolean; message: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "No user found" };

    // 1. Ensure profile exists
    const { data: profile } = await adminClient.from("profiles").select("id").eq("id", user.id).single();
    if (!profile) {
      await adminClient.from("profiles").insert({
        id: user.id,
        email: user.email,
        username: user.email?.split("@")[0] || "DebugUser"
      });
    }

    // 2. Clear existing
    await adminClient.from("match_queue").delete().eq("user_id", user.id);

    // 3. Force Insert
    const { error: insertError } = await adminClient.from("match_queue").insert({
      user_id: user.id,
      target_band_min: 5.0,
      target_band_max: 7.5,
      status: "waiting"
    });

    if (insertError) return { success: false, message: `Insert failed: ${insertError.message}` };

    return { success: true, message: "Force join successful" };
  } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return { success: false, message: `Exception: ${e.message}` };
  }
}

/**
 * DEBUG: Force a match with the first available user
 */
export async function debugForceMatch(): Promise<{ success: boolean; message: string; logs: string[]; matchId?: string; roomId?: string }> {
  const logs: string[] = [];
  const log = (msg: string) => logs.push(`${new Date().toISOString().split('T')[1]} - ${msg}`);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "No user found", logs };

    log(`Starting force match for ${user.id}`);

    // 1. Get anyone else in queue (without join)
    const { data: others, error: queueError } = await adminClient
      .from("match_queue")
      .select("*")
      .neq("user_id", user.id)
      .eq("status", "waiting")
      .limit(1);

    if (queueError) {
      log(`Queue error: ${queueError.message}`);
      return { success: false, message: "Queue error", logs };
    }

    if (!others || others.length === 0) {
      log("No other users found in queue");
      return { success: false, message: "No candidates", logs };
    }

    const partnerEntry = others[0];

    // Get partner profile separately
    const { data: partnerProfile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", partnerEntry.user_id)
      .single();

    const partner = { ...partnerEntry, profile: partnerProfile };

    log(`Found candidate: ${partner.user_id} (Profile: ${partner.profile?.username || 'Unknown'})`);

    // 2. Force Create Match (with roles assigned directly)
    const roomId = `room_${uuidv4()}`;
    log(`Creating match room: ${roomId}`);

    // Randomly assign roles at creation time
    const isUser1Interviewer = Math.random() > 0.5;
    log(`Role assignment: user1 is ${isUser1Interviewer ? 'interviewer' : 'candidate'}`);

    const { data: newMatch, error: matchError } = await adminClient
      .from("matches")
      .insert({
        user1_id: user.id,
        user2_id: partner.user_id,
        room_id: roomId,
        status: "pending",
        interviewer_id: isUser1Interviewer ? user.id : partner.user_id,
        candidate_id: isUser1Interviewer ? partner.user_id : user.id,
      })
      .select()
      .single();

    if (matchError) {
      log(`Match insert error: ${matchError.message} (Code: ${matchError.code})`);
      return { success: false, message: `Insert failed: ${matchError.message}`, logs };
    }

    log(`Match created: ${newMatch.id} with roles: interviewer=${newMatch.interviewer_id}, candidate=${newMatch.candidate_id}`);

    // 3. Cleanup Queue
    await adminClient
      .from("match_queue")
      .delete()
      .in("user_id", [user.id, partner.user_id]);

    log("Queue entries deleted");

    revalidatePath("/");
    return {
      success: true,
      message: "Match forced successfully!",
      logs,
      matchId: newMatch.id,
      roomId: newMatch.room_id
    };

  } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    log(`Exception: ${e.message}`);
    return { success: false, message: `Exception: ${e.message}`, logs };
  }
}

/**
 * DEBUG: Analyze why matching isn't happening
 */
export async function debugAnalyzeMatchmaking(): Promise<{
  logs: string[];
  candidates: {
    userId: string;
    hasProfile: boolean;
    theirBand: number | null;
    theyWant: [number, number];
    weWant: [number, number];
    compatible: boolean;
    reason: string;
  }[];
}> {
  const logs: string[] = [];
  const candidates: {
    userId: string;
    hasProfile: boolean;
    theirBand: number | null;
    theyWant: [number, number];
    weWant: [number, number];
    compatible: boolean;
    reason: string;
  }[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logs.push("No authenticated user found");
      return { logs, candidates };
    }

    logs.push(`Analyzing for User: ${user.id}`);

    // 1. Get current user's profile and queue entry
    const { data: myProfile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: myEntry } = await adminClient
      .from("match_queue")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!myProfile) logs.push("❌ CRITICAL: Current user has NO PROFILE");
    else logs.push(`✅ My Band: ${myProfile.current_band}`);

    if (!myEntry) logs.push("❌ CRITICAL: Current user NOT IN QUEUE");
    else logs.push(`✅ My Requirements: ${myEntry.target_band_min}-${myEntry.target_band_max}`);

    if (!myProfile || !myEntry) return { logs, candidates };

    const myBand = myProfile.current_band;
    const myMin = myEntry.target_band_min;
    const myMax = myEntry.target_band_max;

    // 2. Get all other waiting users
    const { data: others } = await adminClient
      .from("match_queue")
      .select("*, profile:profiles(*)")
      .neq("user_id", user.id)
      .eq("status", "waiting");

    logs.push(`Found ${others?.length || 0} other waiting users`);

    if (others) {
      for (const other of others) {
        const entry = {
          userId: other.user_id,
          hasProfile: !!other.profile,
          theirBand: other.profile?.current_band ?? null,
          theyWant: [other.target_band_min, other.target_band_max] as [number, number],
          weWant: [myMin, myMax] as [number, number],
          compatible: false,
          reason: ""
        };

        if (!other.profile) {
          entry.reason = "Missing Profile";
          candidates.push(entry);
          continue;
        }

        const theirBand = other.profile.current_band;
        const theirMin = other.target_band_min;
        const theirMax = other.target_band_max;

        const weWantThem = theirBand >= myMin && theirBand <= myMax;
        const theyWantUs = myBand >= theirMin && myBand <= theirMax;
        const looseMatch = Math.abs(theirBand - myBand) <= 2.0;

        if (weWantThem && theyWantUs) {
          entry.compatible = true;
          entry.reason = "Perfect Match";
        } else if (looseMatch) {
          entry.compatible = true;
          entry.reason = "Loose Match (within 2.0 band)";
        } else {
          entry.reason = `Band Mismatch. Me(${myBand}) vs Them(${theirBand})`;
        }

        candidates.push(entry);
      }
    }

    return { logs, candidates };
  } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    logs.push(`Exception: ${e.message}`);
    return { logs, candidates };
  }
}

/**
 * Check if the user has a match without joining the queue
 */
export async function checkMatchStatus(): Promise<FindMatchResult> {
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
      return {
        status: "error",
        error: "Not authenticated",
      };
    }

    // 2. Check if user already has an active match
    const { data: activeMatchList, error: activeMatchError } = await adminClient
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .in("status", ["pending", "active"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (activeMatchError) {
      console.error("checkMatchStatus: Error checking active matches", activeMatchError);
    }

    const activeMatch = ((activeMatchList ?? []) as Match[])[0] ?? null;

    if (activeMatch) {
      console.log("checkMatchStatus: User has active match", activeMatch.id);
      // Get partner info
      const partnerId =
        activeMatch.user1_id === user.id
          ? activeMatch.user2_id
          : activeMatch.user1_id;

      const { data: partnerData } = await adminClient
        .from("profiles")
        .select("id, username, current_band, avatar_url")
        .eq("id", partnerId)
        .single();

      const partner = partnerData as Pick<
        Profile,
        "id" | "username" | "current_band" | "avatar_url"
      > | null;

      return {
        status: "matched",
        roomId: activeMatch.room_id,
        matchId: activeMatch.id,
        partner: partner
          ? {
            id: partner.id,
            username: partner.username,
            band: partner.current_band,
            avatarUrl: partner.avatar_url,
          }
          : undefined,
      };
    }

    return { status: "waiting" };
  } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return { status: "error", error: e.message };
  }
}

/**
 * Find a match for the current user

*
* Logic:
* 1. Check if user is authenticated
* 2. Check if user is already in queue or has an active match
* 3. Look for a compatible waiting user in the queue
* 4. If found: create match, remove both from queue, return match details
* 5. If not found: add user to queue, return waiting status
*/
export async function findMatch(
  bandMin: number = 5.0,
  bandMax: number = 7.5
): Promise<FindMatchResult> {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

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
      log(`findMatch: Not authenticated: ${authError?.message}`);
      return {
        status: "error",
        error: "Please log in to find a match",
        logs
      };
    }

    log(`findMatch: Starting for user ${user.id} (Band ${bandMin}-${bandMax})`);

    // 2. Check if user already has an active match
    // Use .limit(1) instead of .single() — .single() throws PGRST116 for
    // BOTH zero rows AND multiple rows, and the old code silently ignored
    // that error. If stale matches accumulated from previous sessions,
    // the query would always fail and the user could never be matched.
    const { data: activeMatchList, error: activeMatchError } = await adminClient
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .in("status", ["pending", "active"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (activeMatchError) {
      log(`findMatch: Error checking active matches: ${activeMatchError.message}`);
    }

    const activeMatch = ((activeMatchList ?? []) as Match[])[0] ?? null;
    log(`findMatch: Active match check → ${activeMatch ? activeMatch.id : 'none found'}`);

    if (activeMatch) {
      // Check if match is stale (pending for > 1 minute)
      const matchCreatedAt = new Date(activeMatch.created_at);
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

      if (activeMatch.status === "pending" && matchCreatedAt < oneMinuteAgo) {
        log(`findMatch: Found stale pending match (created ${matchCreatedAt.toISOString()}). Cancelling it...`);
        await adminClient
          .from("matches")
          .update({ status: "cancelled" })
          .eq("id", activeMatch.id);

        // Continue to search for a new match below
        log(`findMatch: Stale match cancelled, continuing search...`);
      } else {
        log(`findMatch: User already has active match ${activeMatch.id}`);
        // Get partner info
        const partnerId =
          activeMatch.user1_id === user.id
            ? activeMatch.user2_id
            : activeMatch.user1_id;

        const { data: partnerData } = await adminClient
          .from("profiles")
          .select("id, username, current_band, avatar_url")
          .eq("id", partnerId)
          .single();

        const partner = partnerData as Pick<
          Profile,
          "id" | "username" | "current_band" | "avatar_url"
        > | null;

        return {
          status: "matched",
          roomId: activeMatch.room_id,
          matchId: activeMatch.id,
          partner: partner
            ? {
              id: partner.id,
              username: partner.username,
              band: partner.current_band,
              avatarUrl: partner.avatar_url,
            }
            : undefined,
          logs
        };
      }
    }

    // 3. Check if user is already in queue (any status)
    let existingEntryData: MatchQueueEntry | null = null;
    const { data: queryData, error: existingEntryError } = await adminClient
      .from("match_queue")
      .select("*")
      .eq("user_id", user.id)
      .single();

    existingEntryData = queryData;

    if (existingEntryError && existingEntryError.code !== 'PGRST116') {
      log(`findMatch: Error checking existing queue entry: ${existingEntryError.message}`);
    }

    const existingEntry = existingEntryData as MatchQueueEntry | null;

    if (existingEntry) {
      if (existingEntry.status === 'waiting') {
        log(`findMatch: User already in queue (waiting), continuing to search for match... ${existingEntry.id}`);
        // Do NOT return here. We must continue to search for a partner!
      } else {
        // User has a stale entry (e.g. 'matched' or 'cancelled' but trying to search again)
        log(`findMatch: Found stale queue entry with status ${existingEntry.status}. Deleting...`);
        await adminClient
          .from("match_queue")
          .delete()
          .eq("id", existingEntry.id);

        // Reset existingEntry to null so we know to insert later if needed
        existingEntryData = null;
      }
    }

    // Get current user's profile for band matching
    const { data: currentUserProfileData, error: profileError } = await adminClient
      .from("profiles")
      .select("current_band")
      .eq("id", user.id)
      .single();

    if (profileError || !currentUserProfileData) {
      log("findMatch: Profile missing for user, creating one now...");
      // Auto-create profile if missing
      const { error: createError } = await adminClient
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "User",
        });

      if (createError) {
        log(`findMatch: Failed to create missing profile: ${createError.message}`);
        return {
          status: "error",
          error: "Failed to create user profile. Please contact support.",
          logs
        };
      }
      log("findMatch: Profile created successfully.");
    }

    const currentUserProfile = currentUserProfileData as Pick<
      Profile,
      "current_band"
    > | null;
    const currentUserBand = currentUserProfile?.current_band || 6.0;

    // 4. Look for a compatible waiting user
    // Using admin client to bypass RLS for the matching query
    log(`findMatch: Searching for match for user ${user.id} with band ${currentUserBand}`);

    // Step 4a: Get queue entries first (without join to be safe)
    // Filter out stale entries (older than 30 seconds) to prevent matching with offline users
    // Short window ensures users are actively waiting
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const { data: queueData, error: queueError } = await adminClient
      .from("match_queue")
      .select("*")
      .eq("status", "waiting")
      .neq("user_id", user.id)
      .gte("created_at", thirtySecondsAgo)
      .order("created_at", { ascending: true })
      .limit(50);

    log(`findMatch: Filtering queue entries created after ${thirtySecondsAgo} (last 30 seconds only)`);

    if (queueError) {
      log(`findMatch: Error querying match queue: ${queueError.message}`);
      return {
        status: "error",
        error: "Failed to search for matches",
        logs
      };
    }

    const queueEntries = (queueData || []) as MatchQueueEntry[];
    log(`findMatch: Found ${queueEntries.length} waiting users in queue (raw)`);

    // Step 4b: Get profiles for these users
    const userIds = queueEntries.map(e => e.user_id);
    const profilesMap: Record<string, Profile> = {};

    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await adminClient
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (!profilesError && profilesData) {
        profilesData.forEach((p: Profile) => {
          profilesMap[p.id] = p;
        });
      } else {
        log(`findMatch: Error fetching profiles: ${profilesError?.message}`);
      }
    }

    // 5. Find best match based on band compatibility
    let bestMatch: MatchQueueWithProfile | null = null;

    for (const entry of queueEntries) {
      const profile = profilesMap[entry.user_id];

      if (!profile) {
        log(`findMatch: Skipping waiting user ${entry.user_id}: No profile found`);
        continue;
      }

      // Construct the object expected by logic
      const entryWithProfile: MatchQueueWithProfile = { ...entry, profile };

      // Check if bands are compatible
      const theirBand = profile.current_band;
      const theyWantMin = entry.target_band_min;
      const theyWantMax = entry.target_band_max;

      // Check mutual compatibility
      const weWantThem = theirBand >= bandMin && theirBand <= bandMax;
      const theyWantUs =
        currentUserBand >= theyWantMin && currentUserBand <= theyWantMax;

      log(`findMatch: Checking compatibility with ${entry.user_id}: TheirBand=${theirBand}, TheyWant=[${theyWantMin},${theyWantMax}], WeBand=${currentUserBand}, WeWant=[${bandMin},${bandMax}]`);

      // DEBUG: Force compatibility for now if bands are close enough
      // Allow +/- 2.0 band difference as a fallback if exact range fails
      // Using 2.0 to match debug tool logic
      const looseMatch = Math.abs(theirBand - currentUserBand) <= 2.0;

      if ((weWantThem && theyWantUs) || looseMatch) {
        log(`findMatch: Compatible match found! (Perfect: ${weWantThem && theyWantUs}, Loose: ${looseMatch})`);
        bestMatch = entryWithProfile;
        break;
      } else {
        log(`findMatch: Not compatible. Reason: Band mismatch`);
      }
    }

    // 6. If match found, create the match
    if (bestMatch) {
      log(`findMatch: Match found! Creating match with ${bestMatch.user_id}`);
      const roomId = `room_${uuidv4()}`;

      // Randomly assign roles at creation time
      const isUser1Interviewer = Math.random() > 0.5;
      log(`findMatch: Role assignment: current user is ${isUser1Interviewer ? 'interviewer' : 'candidate'}`);

      // Use a transaction-like approach with admin client
      // Create match WITH roles in a single insert
      const { data: newMatchData, error: matchError } = await adminClient
        .from("matches")
        .insert({
          user1_id: user.id,
          user2_id: bestMatch.user_id,
          room_id: roomId,
          status: "pending",
          interviewer_id: isUser1Interviewer ? user.id : bestMatch.user_id,
          candidate_id: isUser1Interviewer ? bestMatch.user_id : user.id,
        })
        .select()
        .single();

      if (matchError) {
        log(`findMatch: Error creating match: ${matchError.message}`);
        return {
          status: "error",
          error: "Failed to create match",
          logs
        };
      }

      const newMatch = newMatchData as Match;
      log(`findMatch: Match created with roles: interviewer=${newMatch.interviewer_id}, candidate=${newMatch.candidate_id}`);

      // Step 2: Update both queue entries to matched
      await adminClient
        .from("match_queue")
        .update({ status: "matched" })
        .eq("id", bestMatch.id);

      // Step 3: Delete the queue entries
      await adminClient
        .from("match_queue")
        .delete()
        .in("user_id", [user.id, bestMatch.user_id]);

      revalidatePath("/");

      return {
        status: "matched",
        roomId: newMatch.room_id,
        matchId: newMatch.id,
        partner: {
          id: bestMatch.profile.id,
          username: bestMatch.profile.username,
          band: bestMatch.profile.current_band,
          avatarUrl: bestMatch.profile.avatar_url,
        },
        logs
      };
    }

    // 7. No match found, add user to queue if not already there
    if (!existingEntryData) {
      log("findMatch: No match found, adding to queue");
      const { error: insertError } = await adminClient
        .from("match_queue")
        .upsert({
          user_id: user.id,
          target_band_min: bandMin,
          target_band_max: bandMax,
          status: "waiting",
          created_at: new Date().toISOString(), // Update timestamp to show activity
        });

      if (insertError) {
        log(`findMatch: Error inserting into queue: ${insertError.message}`);
        return {
          status: "error",
          error: "Failed to join queue",
          logs
        };
      }
      log("findMatch: Successfully added to queue");
    } else {
      log("findMatch: User already in queue, keeping original position");
      // Don't update created_at — it determines queue position (FIFO order).
      // Updating it every poll cycle would constantly push the user to
      // the back of the queue, making stable matching harder.
    }

    return {
      status: "waiting",
      logs
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    log(`Matchmaking error: ${msg}`);
    return {
      status: "error",
      error: "An unexpected error occurred",
      logs
    };
  }
}

/**
 * Cancel matchmaking and remove user from queue
 */
export async function cancelMatch(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Remove from queue
    const { error: deleteError } = await adminClient
      .from("match_queue")
      .delete()
      .eq("user_id", user.id)
      .eq("status", "waiting");

    if (deleteError) {
      console.error("Error cancelling match:", deleteError);
      return { success: false, error: "Failed to cancel" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Cancel match error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * End an active call/match
 */
export async function endCall(
  matchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Update match status using admin client to bypass RLS for update
    const { error: updateError } = await adminClient
      .from("matches")
      .update({
        status: "finished",
        ended_at: new Date().toISOString(),
      })
      .eq("id", matchId)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (updateError) {
      console.error("Error ending call:", updateError);
      return { success: false, error: "Failed to end call" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("End call error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get user's call history with feedback
 */
export async function getCallHistory(limit: number = 20) {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { sessions: [], error: "Not authenticated" };
    }

    // Fetch finished matches with profiles
    const { data: matches, error } = await adminClient
      .from("matches")
      .select(
        `
        *,
        user1:profiles!matches_user1_id_fkey(id, username, current_band, avatar_url),
        user2:profiles!matches_user2_id_fkey(id, username, current_band, avatar_url)
      `
      )
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq("status", "finished")
      .order("ended_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching call history:", error);
      return { sessions: [], error: "Failed to fetch history" };
    }

    if (!matches || matches.length === 0) {
      return { sessions: [], error: null };
    }

    const matchIds = matches.map((m: { id: string }) => m.id);

    // Fetch all feedback for these matches
    const { data: feedbacks } = await adminClient
      .from("session_feedback")
      .select("*")
      .in("match_id", matchIds);

    // Build session list
    const sessions = matches.map((match: {
      id: string;
      user1_id: string;
      user2_id: string;
      user1: { id: string; username: string; current_band: number; avatar_url: string | null };
      user2: { id: string; username: string; current_band: number; avatar_url: string | null };
      started_at: string | null;
      ended_at: string | null;
      created_at: string;
      questions_asked: string[];
      topic: string | null;
    }) => {
      const isUser1 = match.user1_id === user.id;
      const partner = isUser1 ? match.user2 : match.user1;

      // Feedback I gave to partner
      const myFeedback = (feedbacks || []).find(
        (f: { match_id: string; from_user_id: string }) =>
          f.match_id === match.id && f.from_user_id === user.id
      );
      // Feedback partner gave to me
      const peerFeedback = (feedbacks || []).find(
        (f: { match_id: string; to_user_id: string }) =>
          f.match_id === match.id && f.to_user_id === user.id
      );

      // Calculate duration
      let duration = 0;
      if (match.started_at && match.ended_at) {
        duration = Math.floor(
          (new Date(match.ended_at).getTime() - new Date(match.started_at).getTime()) / 1000
        );
      }

      return {
        id: match.id,
        date: match.ended_at || match.created_at,
        duration,
        questionsCount: match.questions_asked?.length || 0,
        topic: match.topic,
        partner: {
          id: partner.id,
          name: partner.username,
          band: partner.current_band?.toFixed(1) || "5.5",
          avatarUrl: partner.avatar_url,
        },
        // What I gave to partner
        myFeedback: myFeedback
          ? {
            overallBand: myFeedback.scores?.overall ?? null,
            scores: myFeedback.scores
              ? {
                fluency: myFeedback.scores.fluency,
                vocabulary: myFeedback.scores.vocabulary,
                grammar: myFeedback.scores.grammar,
                pronunciation: myFeedback.scores.pronunciation,
              }
              : null,
            tags: myFeedback.feedback_tags || [],
            comments: myFeedback.comments || "",
          }
          : null,
        // What partner gave to me
        peerFeedback: peerFeedback
          ? {
            overallBand: peerFeedback.scores?.overall ?? null,
            scores: peerFeedback.scores
              ? {
                fluency: peerFeedback.scores.fluency,
                vocabulary: peerFeedback.scores.vocabulary,
                grammar: peerFeedback.scores.grammar,
                pronunciation: peerFeedback.scores.pronunciation,
              }
              : null,
            tags: peerFeedback.feedback_tags || [],
            comments: peerFeedback.comments || "",
            wouldMatchAgain: peerFeedback.would_match_again,
          }
          : null,
      };
    });

    return { sessions, error: null };
  } catch (error) {
    console.error("Call history error:", error);
    return { sessions: [], error: "An unexpected error occurred" };
  }
}

/**
 * Submit feedback for a match
 */
export async function submitFeedback(
  matchId: string,
  toUserId: string,
  rating: number,
  wouldMatchAgain: boolean | null,
  tags: string[],
  comments: string | null,
  scores: SessionScores | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error: insertError } = await adminClient
      .from("session_feedback")
      .insert({
        match_id: matchId,
        from_user_id: user.id,
        to_user_id: toUserId,
        overall_rating: rating,
        would_match_again: wouldMatchAgain,
        feedback_tags: tags,
        comments,
        scores,
      });

    if (insertError) {
      console.error("Error submitting feedback:", insertError);
      return { 
        success: false, 
        error: `Failed to submit feedback: ${insertError.message || insertError.code || JSON.stringify(insertError)}` 
      };
    }

    // --- CORTEX HUB INTEGRATION ---
    try {
      // Fetch match topic to enrich the log
      const { data: matchData } = await adminClient
        .from("matches")
        .select("topic")
        .eq("id", matchId)
        .single();

      const cortexPayload = {
        userId: user.id,
        appSource: 'oratio',
        actionType: 'COMPLETE_ORATIO_SESSION',
        metadata: {
          matchId,
          topic: matchData?.topic || 'IELTS Speaking Session',
          tags: tags || [],
          comments: comments || '',
          scores: scores || {},
          // We use topic + tags + comments as a proxy for the transcript 
          // to trigger vocabulary activation in the bridge
          transcript: `${matchData?.topic || ''}. ${tags.join(', ')}. ${comments || ''}`
        }
      };

      console.log("[Cortex] Sending Oratio session log for activation...");
      await fetch('http://localhost:3001/actions/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cortexPayload)
      });
    } catch (cortexError) {
      console.error("[Cortex] Failed to sync session with Hub:", cortexError);
    }
    // -------------------------------

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Submit feedback error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
