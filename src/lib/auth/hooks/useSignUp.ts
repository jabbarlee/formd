'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { SignUpCredentials, AuthError } from '../types';

/**
 * Hook for handling sign up form state and submission
 */
export const useSignUp = () => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleSignUp = useCallback(
    async (credentials: SignUpCredentials) => {
      setIsLoading(true);
      setError(null);

      const result = await signUp(credentials);

      setIsLoading(false);

      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    },
    [signUp]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signUp: handleSignUp,
    isLoading,
    error,
    clearError,
  };
};
