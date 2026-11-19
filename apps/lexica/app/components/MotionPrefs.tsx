'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/** Honour the system "reduce motion" setting for every framer-motion animation in the app. */
export default function MotionPrefs({ children }: { children: ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
