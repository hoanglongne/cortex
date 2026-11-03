/**
 * One set of product events for Lexica, Oratio, Teach and Synapse (issue #61),
 * so a single funnel can be read across them: open Lexica → join a class →
 * play the Arena → practise speaking in Oratio.
 *
 * What the apps agree on:
 *  - the same event names for the same step (see EVENTS and docs/EVENTS.md);
 *  - every event carries `app` and, where it applies, `track` and `class` (a
 *    hash of the class id, never the id itself);
 *  - after sign-in the PostHog `distinct_id` is the Cortex user id, the same in
 *    every app because they share one Supabase project, so one person is one
 *    row in the funnel;
 *  - numbers, flags and short labels only. Free text a learner wrote or said
 *    never leaves the device (sanitizeProps drops it).
 *
 * Sends to PostHog's public capture API without the SDK and does nothing unless
 * a key is set. Analytics must never break an app: every failure is swallowed.
 */

export type CortexApp = 'lexica' | 'oratio' | 'teach' | 'synapse';
export type CortexTrack = 'vocab' | 'speaking' | 'story' | 'class' | 'teaching';

/** Steps of the shared funnel. Apps may add their own events beside these. */
export const EVENTS = {
  appOpen: 'app_open',
  signUp: 'sign_up',
  signIn: 'sign_in',
  classJoined: 'class_joined',
  classCreated: 'class_created',
  practiceStarted: 'practice_started',
  practiceCompleted: 'practice_completed',
  arenaJoined: 'arena_joined',
  arenaFinished: 'arena_finished',
  /** A link from one Cortex app to another: props `from`, `to` */
  crossAppClick: 'cross_app_click',
} as const;
export type SharedEvent = (typeof EVENTS)[keyof typeof EVENTS];

export type Props = Record<string, string | number | boolean | null | undefined>;

/** Longest text value an event may carry: enough for a label or an id, too short for something a learner wrote. */
export const MAX_TEXT = 80;
const FREE_TEXT_KEYS = /(^|_)(text|transcript|answer|note|message|email|name|sentence|audio|content)(_|$)/i;

/** Keeps numbers, flags and short labels; drops anything that looks like free text. */
export function sanitizeProps(props: Record<string, unknown> | undefined): Props {
  const out: Props = {};
  if (!props) return out;
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    if (FREE_TEXT_KEYS.test(key.replace(/([a-z])([A-Z])/g, '$1_$2'))) continue;
    if (typeof value === 'string') {
      if (value.length <= MAX_TEXT) out[key] = value;
    } else if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      out[key] = value;
    }
  }
  return out;
}

/** A class id the analytics can group by but cannot trace back: first 12 hex of SHA-256("cortex-class-v1:" + id). */
export async function anonymizeClassId(classId: string): Promise<string | null> {
  try {
    const bytes = new TextEncoder().encode(`cortex-class-v1:${classId}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 12);
  } catch {
    return null;
  }
}

export interface PayloadInput {
  event: string;
  props?: Record<string, unknown>;
  app: CortexApp;
  track?: CortexTrack;
  /** Hash from anonymizeClassId */
  classHash?: string | null;
  /** Cortex user id after sign-in */
  userId: string | null;
  anonId: string;
  apiKey: string;
}

/** The PostHog capture body. Signed in: distinct id is the user id; otherwise the browser's anonymous id. */
export function buildPayload(i: PayloadInput) {
  return {
    api_key: i.apiKey,
    event: i.event,
    distinct_id: i.userId ?? i.anonId,
    timestamp: new Date().toISOString(),
    properties: {
      ...sanitizeProps(i.props),
      app: i.app,
      ...(i.track ? { track: i.track } : {}),
      ...(i.classHash ? { class: i.classHash } : {}),
      ...(i.userId ? { cortex_user_id: i.userId } : {}),
    },
  };
}

/** The body that joins this browser's earlier anonymous events to the signed-in person. */
export function buildIdentify(userId: string, anonId: string, apiKey: string, app: CortexApp) {
  return {
    api_key: apiKey,
    event: '$identify',
    distinct_id: userId,
    timestamp: new Date().toISOString(),
    properties: { $anon_distinct_id: anonId, app },
  };
}

type Store = Pick<Storage, 'getItem' | 'setItem'>;

function safeStore(): Store | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable per-browser id (falls back to a per-page id when storage is blocked). */
let memoryId: string | null = null;
export function anonymousId(key: string, store: Store | null = safeStore()): string {
  try {
    const existing = store?.getItem(key);
    if (existing) return existing;
  } catch {
    // blocked: fall through
  }
  const id = memoryId ?? newId();
  memoryId = id;
  try {
    store?.setItem(key, id);
  } catch {
    // keep the in-memory id
  }
  return id;
}

export interface TrackerOptions {
  app: CortexApp;
  /** PostHog project key; without one the tracker does nothing */
  key?: string;
  host?: string;
  /** Where this app keeps the Cortex user id after sign-in */
  getUserId: () => string | null;
  /** localStorage key for the anonymous id (Lexica keeps its old one) */
  anonKey?: string;
}

export interface Tracker {
  enabled: boolean;
  /** Sends one event. `track` and `classId` are optional context. */
  capture(event: string, props?: Record<string, unknown>, ctx?: { track?: CortexTrack; classId?: string | null }): void;
  /** Call after sign-in: joins earlier anonymous events to the person, once per browser. */
  identify(): void;
}

export function createTracker(opts: TrackerOptions): Tracker {
  const key = opts.key ?? '';
  const host = (opts.host || 'https://us.i.posthog.com').replace(/\/$/, '');
  const anonKey = opts.anonKey ?? 'cortex_anon_id';

  const post = (body: unknown) => {
    fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      // analytics must never break the app
    });
  };

  return {
    enabled: Boolean(key),
    capture(event, props, ctx) {
      if (!key || typeof window === 'undefined') return;
      try {
        const send = (classHash: string | null) =>
          post(buildPayload({ event, props, app: opts.app, track: ctx?.track, classHash, userId: opts.getUserId(), anonId: anonymousId(anonKey), apiKey: key }));
        if (ctx?.classId) void anonymizeClassId(ctx.classId).then(send);
        else send(null);
      } catch {
        // ignore
      }
    },
    identify() {
      if (!key || typeof window === 'undefined') return;
      try {
        const userId = opts.getUserId();
        const store = safeStore();
        if (!userId || !store) return;
        const mark = `cortex_identified:${userId}`;
        if (store.getItem(mark)) return;
        store.setItem(mark, '1');
        post(buildIdentify(userId, anonymousId(anonKey, store), key, opts.app));
      } catch {
        // ignore
      }
    },
  };
}

/** The part of a Supabase client the analytics needs (so this package does not depend on Supabase). */
export interface AuthLike {
  auth: {
    getSession(): Promise<{ data: { session: { user: { id: string } } | null } }>;
    onAuthStateChange(cb: (event: string, session: { user: { id: string } } | null) => void): { data: { subscription: { unsubscribe(): void } } };
  };
}

export interface AppAnalytics extends Tracker {
  /**
   * Call once when the app starts: learns who is signed in from the Supabase
   * session, sends `app_open`, joins earlier anonymous events to the person, and
   * sends `sign_in` when someone signs in while the page is open. Returns a stop function.
   */
  boot(client: AuthLike | null): () => void;
}

/** A tracker for an app that signs in with the shared Supabase account (Oratio, Teach, Synapse). */
export function createAppAnalytics(opts: { app: CortexApp; key?: string; host?: string; anonKey?: string }): AppAnalytics {
  let userId: string | null = null;
  const tracker = createTracker({ ...opts, getUserId: () => userId });
  let booted = false;

  return {
    ...tracker,
    boot(client) {
      if (booted || !tracker.enabled) return () => {};
      booted = true;
      let sub: { unsubscribe(): void } | null = null;
      let live = true;
      void (async () => {
        try {
          const session = client ? (await client.auth.getSession()).data.session : null;
          if (!live) return;
          userId = session?.user.id ?? null;
          tracker.capture(EVENTS.appOpen);
          tracker.identify();
          if (client) {
            sub = client.auth.onAuthStateChange((_event, next) => {
              const id = next?.user.id ?? null;
              if (id === userId) return;
              const signedIn = userId === null && id !== null;
              userId = id;
              if (signedIn) {
                tracker.identify();
                tracker.capture(EVENTS.signIn);
              }
            }).data.subscription;
          }
        } catch {
          // analytics must never break the app
        }
      })();
      return () => {
        live = false;
        sub?.unsubscribe();
      };
    },
  };
}
