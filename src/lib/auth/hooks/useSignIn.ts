"use client";

import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { SignInCredentials, AuthError } from "../types";

/**
 * Hook for handling sign in form state and submission
 */
export const useSignIn = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleSignIn = useCallback(
    async (credentials: SignInCredentials) => {
      setIsLoading(true);
      setError(null);

      const result = await signIn(credentials);

      setIsLoading(false);

      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    },
    [signIn]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signIn: handleSignIn,
    isLoading,
    error,
    clearError,
  };
};
