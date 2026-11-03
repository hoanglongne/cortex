'use client';

import { useEffect } from 'react';
import { analytics } from '../lib/analytics';
import { getSupabase } from '../lib/supabase';

/** Starts the shared analytics once per page load: who is signed in, app_open, sign_in. */
export default function AnalyticsBoot() {
    useEffect(() => analytics.boot(getSupabase()), []);
    return null;
}
