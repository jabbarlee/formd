'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { ROUTE_PATHS } from '../constants';
import { tokenStorage } from '../utils/token-storage';

/**
 * Options for useRequireAuth hook
 */
interface UseRequireAuthOptions {
  redirectTo?: string;
  requireEmailVerification?: boolean;
  onUnauthenticated?: () => void;
  onUnverified?: () => void;
}

/**
 * Custom hook that redirects to login if user is not authenticated
 * Useful for protecting routes that require authentication
 */
export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const {
    redirectTo = ROUTE_PATHS.LOGIN,
    requireEmailVerification = false,
    onUnauthenticated,
    onUnverified,
  } = options;

  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // User is not authenticated
    if (!isAuthenticated || !user) {
      // Store current URL for redirect after login
      if (typeof window !== 'undefined') {
        tokenStorage.setRedirectUrl(window.location.pathname + window.location.search);
      }

      // Call custom handler if provided
      if (onUnauthenticated) {
        onUnauthenticated();
      }

      // Redirect to login
      router.replace(redirectTo);
      return;
    }

    // User is authenticated but email is not verified (if required)
    if (requireEmailVerification && !user.emailVerified) {
      if (onUnverified) {
        onUnverified();
      }
      // Could redirect to email verification page or show a banner
      // For now, we just call the callback
    }
  }, [
    user,
    isLoading,
    isAuthenticated,
    router,
    redirectTo,
    requireEmailVerification,
    onUnauthenticated,
    onUnverified,
  ]);

  return { user, isLoading, isAuthenticated };
};
