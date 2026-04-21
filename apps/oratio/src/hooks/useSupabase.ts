"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";

interface UseSupabaseAuthReturn {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Custom hook for Supabase authentication and profile management
 */
export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseClient();

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile;
  }, [supabase]);

  /**
   * Refresh the current user's profile
   */
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profile = await fetchProfile(user.id);
      setProfile(profile);
    }
  }, [user, fetchProfile]);

  /**
   * Initialize auth state on mount using onAuthStateChange as the single source of truth.
   * The INITIAL_SESSION event handles session recovery from cookies,
   * avoiding race conditions between getSession() and the listener.
   */
  useEffect(() => {
    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id)
            .then(profileData => { if (!cancelled) setProfile(profileData); })
            .catch(err => console.error("Error fetching profile:", err));
        } else {
          setProfile(null);
        }

        // Mark loading complete after the initial session is resolved
        if (event === "INITIAL_SESSION") {
          setIsLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }, [supabase]);

  /**
   * Sign up with email, password, and username
   */
  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }, [supabase]);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, [supabase]);

  return {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { user, isLoading } = useSupabaseAuth();
  return !isLoading && user !== null;
}

