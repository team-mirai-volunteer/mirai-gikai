"use client";

import { createBrowserClient } from "@mirai-gikai/supabase";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

// Create a singleton Supabase client with persistent session
const supabase = createBrowserClient();

/**
 * Hook to ensure an anonymous Supabase user exists and return the user
 * This will automatically create an anonymous user if none exists
 */
export function useAnonymousSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const ensureAnonUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user already exists
        const {
          data: { user: existingUser },
          error: getUserError,
        } = await supabase.auth.getUser();

        if (getUserError && getUserError.message !== "Auth session missing!") {
          throw getUserError;
        }

        if (existingUser) {
          setUser(existingUser);
          return;
        }

        // No valid session -> sign in anonymously
        const { data, error: signInError } = await supabase.auth.signInAnonymously();

        if (signInError) {
          throw signInError;
        }

        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error ensuring anonymous user:", err);
        setError(err instanceof Error ? err : new Error("Failed to create anonymous user"));
      } finally {
        setIsLoading(false);
      }
    };

    ensureAnonUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, error, supabase };
}