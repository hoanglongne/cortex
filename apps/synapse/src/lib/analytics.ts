import { createAppAnalytics } from "@cortex/events";

/** Shared product events (issue #61): same names and rules as Lexica, Oratio and Teach. No-op without NEXT_PUBLIC_POSTHOG_KEY. */
export const analytics = createAppAnalytics({
  app: "synapse",
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});
