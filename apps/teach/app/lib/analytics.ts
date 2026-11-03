import { createAppAnalytics } from '@cortex/events';

/** Shared product events (issue #61): same names and rules as Lexica, Oratio and Synapse. No-op without NEXT_PUBLIC_POSTHOG_KEY. */
export const analytics = createAppAnalytics({
    app: 'teach',
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});
