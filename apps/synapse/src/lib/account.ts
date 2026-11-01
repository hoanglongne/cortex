/**
 * Synapse progress on the Cortex account (docs/SYNAPSE_PLAN.md S2): the
 * calls, and the pure merge of what a device holds with what the account holds.
 * The device keeps working from its own storage (lib/level.ts); this layer
 * loads the account's progress at sign-in and pushes changes back.
 */
import { emptyProgress, LEVELS, type PhraseRecord, type Progress } from "./level";
import { getSupabaseClient } from "./supabase";
import type { EndingTier } from "./endings";

/** What `synapse_load` returns. */
export interface RemoteProgress {
  profile: { setting: string; auto: string; recent: boolean[]; seenScenes: string[]; cleared: string[]; endings: string[] } | null;
  phrases: Record<string, PhraseRecord>;
}

const union = (a: readonly string[], b: readonly string[], max: number): string[] => [...new Set([...a, ...b])].slice(-max);

/** The more experienced of two records of one phrase (more times seen wins; its recent answers go with it). */
function mergePhrase(a: PhraseRecord | undefined, b: PhraseRecord | undefined): PhraseRecord | undefined {
  if (!a) return b;
  if (!b) return a;
  return a.seen >= b.seen ? a : b;
}

/**
 * Local and remote progress as one. Phrases keep the record with more answers;
 * scenes, missions and endings are unions; the level setting follows the account
 * once it has one (a device that was signed out has nothing better to say).
 */
export function mergeProgress(local: Progress, remote: RemoteProgress): Progress {
  const phrases: Record<string, PhraseRecord> = {};
  for (const k of new Set([...Object.keys(local.phrases), ...Object.keys(remote.phrases ?? {})])) {
    const m = mergePhrase(local.phrases[k], remote.phrases?.[k]);
    if (m) phrases[k] = m;
  }
  const r = remote.profile;
  const level = (x: string | undefined) => (LEVELS.includes(x as never) ? (x as Progress["auto"]) : undefined);
  const setting = r && (r.setting === "auto" || level(r.setting)) ? (r.setting as Progress["setting"]) : local.setting;
  return {
    setting,
    auto: level(r?.auto) ?? local.auto,
    recent: r?.recent?.length ? r.recent.slice(-10) : local.recent,
    phrases,
    seenScenes: union(r?.seenScenes ?? [], local.seenScenes, 200),
    cleared: union(r?.cleared ?? [], local.cleared, 60),
    endings: union(r?.endings ?? [], local.endings, 400),
  };
}

/** True when two progress values say the same (so an unchanged merge is not pushed). */
export const sameProgress = (a: Progress, b: Progress): boolean => JSON.stringify(a) === JSON.stringify(b);

export async function loadRemote(): Promise<RemoteProgress | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("synapse_load");
  if (error) throw new Error(error.message);
  return data as RemoteProgress;
}

export async function saveRemote(p: Progress): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.rpc("synapse_save", {
    p_profile: { setting: p.setting, auto: p.auto, recent: p.recent, seenScenes: p.seenScenes, cleared: p.cleared, endings: p.endings },
    p_phrases: p.phrases,
  });
  if (error) throw new Error(error.message);
}

export async function addRun(missionId: string, tier: EndingTier, score: number, lives: number): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.rpc("synapse_run_add", { p_mission: missionId, p_tier: tier, p_score: score, p_lives: lives });
}

// ── The device ──────────────────────────────────────────────────────────

const OWNER_KEY = "synapse-progress-owner";

/** Progress saved on this device, belonging to nobody yet (before sign-in existed) or to `owner`. */
export function readOwner(): string | null {
  try {
    return localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}
export function writeOwner(id: string): void {
  try {
    localStorage.setItem(OWNER_KEY, id);
  } catch {
    // Private mode.
  }
}

/**
 * What this device starts from for a signed-in player: its own progress when it
 * is theirs (or from before accounts, so it is kept), else a clean start.
 */
export function localFor(userId: string, local: Progress, owner: string | null): Progress {
  return owner === null || owner === userId ? local : emptyProgress();
}

// ── Pushing changes ─────────────────────────────────────────────────────

let timer: ReturnType<typeof setTimeout> | null = null;
let latest: Progress | null = null;

/** Sends the latest progress a moment after the last change (once, not on every answer). */
export function pushLater(p: Progress, delayMs = 1500): void {
  latest = p;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    if (latest) void saveRemote(latest).catch(() => undefined);
  }, delayMs);
}
