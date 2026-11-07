'use client';

import { useEffect } from 'react';
import { installErrorReporting } from '../lib/errorReport';

/** Sends errors nobody caught to the team (only when a Sentry address is set). */
export default function ErrorReporter() {
    useEffect(() => installErrorReporting(), []);
    return null;
}
