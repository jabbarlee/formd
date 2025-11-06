'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { ROUTE_PATHS } from '../constants';

/**
 * Options for useRequireGuest hook
 */
interface UseRequireGuestOptions {
  redirectTo?: string;
  onAuthenticated?: () => void;
}

/**
 * Custom hook that redirects authenticated users away from guest-only pages
 * Useful for login, signup, and password reset pages
 */
export const useRequireGuest = (options: UseRequireGuestOptions = {}) => {
  const {
    redirectTo = ROUTE_PATHS.DASHBOARD,
    onAuthenticated,
  } = options;

  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // User is authenticated, redirect to dashboard
    if (isAuthenticated) {
      if (onAuthenticated) {
        onAuthenticated();
      }
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo, onAuthenticated]);

  return { isLoading, isAuthenticated };
};
