'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Whoami } from '@cortex/lexica-classes';
import { api, getSupabase } from './supabase';

interface SessionState {
    loading: boolean;
    session: Session | null;
    /** Roles in the teacher app; null before signing in. */
    me: Whoami | null;
    refresh: () => Promise<void>;
    signOut: () => Promise<void>;
}

const Ctx = createContext<SessionState>({ loading: true, session: null, me: null, refresh: async () => {}, signOut: async () => {} });

/** Who is signed in and what they may do here (lexica_whoami). */
export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [me, setMe] = useState<Whoami | null>(null);

    const load = useCallback(async (s: Session | null) => {
        setSession(s);
        setMe(s ? await api.whoami().catch(() => null) : null);
        setLoading(false);
    }, []);

    useEffect(() => {
        const supabase = getSupabase();
        if (!supabase) {
            const t = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(t);
        }
        void supabase.auth.getSession().then(({ data }) => load(data.session));
        const { data } = supabase.auth.onAuthStateChange((_event, s) => {
            void load(s);
        });
        return () => data.subscription.unsubscribe();
    }, [load]);

    const value: SessionState = {
        loading,
        session,
        me,
        refresh: async () => setMe(await api.whoami().catch(() => null)),
        signOut: async () => {
            await getSupabase()?.auth.signOut();
        },
    };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);

/** May use the teacher app at all: a center member, an independent teacher, or the system admin. */
export const hasAccess = (me: Whoami | null) => Boolean(me && (me.admin || me.indie || me.orgs.length > 0));
