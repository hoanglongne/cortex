import { createAppAnalytics } from "@cortex/events";

/** Shared product events (issue #61): same names and rules as Lexica, Teach and Synapse. No-op without NEXT_PUBLIC_POSTHOG_KEY. */
export const analytics = createAppAnalytics({
  app: "oratio",
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});
