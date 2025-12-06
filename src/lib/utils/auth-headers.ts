/**
 * Client-side utility for getting authentication headers
 */

import { auth } from '@/lib/firebase/client';

/**
 * Get authentication headers for API requests
 * @returns Headers with Authorization token and user metadata
 */
export async function getClientAuthHeaders(): Promise<HeadersInit> {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('Not authenticated - Please sign in first');
  }

  const idToken = await currentUser.getIdToken();
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
    'x-firebase-uid': currentUser.uid,
    'x-user-id': currentUser.uid,
    'x-user-email': currentUser.email || '',
  };
}

