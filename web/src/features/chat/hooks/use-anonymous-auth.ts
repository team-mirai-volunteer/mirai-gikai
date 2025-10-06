"use client";

import { useEffect, useState } from "react";
import { ensureAnonymousUser } from "../actions/anonymous-auth";

export function useAnonymousAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const { userId: id } = await ensureAnonymousUser();
        setUserId(id);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to initialize auth")
        );
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  return { userId, isLoading, error };
}
