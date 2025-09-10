import { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "../lib/auth-client";
import type { LoginFormData } from "../types";

export function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await signIn(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("予期しないエラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
