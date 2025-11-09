/**
 * API Authentication Utilities
 * Helper functions for authenticating API requests
 */

import { NextRequest } from "next/server";
import { userService } from "@/lib/database/services/user.service";

export interface AuthContext {
  userId: string;
  firebaseUid: string;
  email: string;
}

/**
 * Get authenticated user from request
 * For now, using a simplified approach with session/cookie
 * In production, integrate with Firebase Admin SDK for token verification
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthContext | null> {
  try {
    // TODO: Implement proper authentication
    // For now, we'll use a temporary approach
    // In production, verify Firebase ID token from Authorization header

    // Get user ID from custom header (temporary - set from client)
    const userId = request.headers.get("x-user-id");
    const firebaseUid = request.headers.get("x-firebase-uid");

    if (!userId || !firebaseUid) {
      return null;
    }

    // Verify user exists in database
    const result = await userService.getUserByFirebaseUid(firebaseUid);
    if (!result.success || !result.data) {
      return null;
    }

    return {
      userId: result.data.id,
      firebaseUid: result.data.firebase_uid,
      email: result.data.email,
    };
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Create error response
 */
export function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Create success response
 */
export function successResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
