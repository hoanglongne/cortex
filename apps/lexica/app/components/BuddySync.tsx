'use client';

import { useActivitySync } from '../hooks/useActivitySync';

/** Sends today's progress for buddies to see, from any page (signed-in learners only). */
export default function BuddySync() {
    useActivitySync();
    return null;
}
