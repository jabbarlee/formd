/**
 * Authentication Debugging Utilities
 * Helper functions to diagnose authentication issues
 */

import { auth } from "@/lib/firebase/client";
import { userService } from "@/lib/database/services/user.service";

export const authDebug = {
  /**
   * Check current authentication status
   */
  async checkAuthStatus() {
    console.group("🔐 Auth Status Check");

    // Check Firebase Auth
    const currentUser = auth.currentUser;
    console.log("Firebase Auth:", {
      isSignedIn: !!currentUser,
      uid: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
    });

    if (!currentUser) {
      console.error("❌ Not signed in to Firebase");
      console.groupEnd();
      return {
        authenticated: false,
        reason: "Not signed in to Firebase",
      };
    }

    // Check if user exists in database
    try {
      const dbResult = await userService.getUserByFirebaseUid(currentUser.uid);

      console.log("Database User:", {
        exists: dbResult.success && !!dbResult.data,
        id: dbResult.data?.id,
        email: dbResult.data?.email,
        error: dbResult.error,
      });

      if (!dbResult.success || !dbResult.data) {
        console.error("❌ User not found in database");
        console.groupEnd();
        return {
          authenticated: false,
          reason: "User exists in Firebase but not in database",
          suggestion: "Try signing up again or contact support",
        };
      }

      // Get ID token
      const idToken = await currentUser.getIdToken();
      console.log("ID Token:", {
        exists: !!idToken,
        length: idToken?.length,
      });

      console.log("✅ Fully authenticated");
      console.groupEnd();

      return {
        authenticated: true,
        firebaseUid: currentUser.uid,
        databaseId: dbResult.data.id,
        email: currentUser.email,
      };
    } catch (error) {
      console.error("💥 Error checking database:", error);
      console.groupEnd();
      return {
        authenticated: false,
        reason: "Database connection error",
        error,
      };
    }
  },

  /**
   * Test API authentication headers
   */
  async testApiHeaders() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("❌ Cannot test headers - not signed in");
      return null;
    }

    try {
      const idToken = await currentUser.getIdToken();
      const headers = {
        "Content-Type": "application/json",
        "x-firebase-uid": currentUser.uid,
        "x-user-id": currentUser.uid,
        Authorization: `Bearer ${idToken}`,
      };

      console.group("📤 API Headers");
      console.log(headers);
      console.groupEnd();

      return headers;
    } catch (error) {
      console.error("💥 Error getting headers:", error);
      return null;
    }
  },

  /**
   * Test a simple API call
   */
  async testApiCall() {
    console.group("🧪 Testing API Call");

    const authStatus = await this.checkAuthStatus();
    if (!authStatus.authenticated) {
      console.error("❌ Cannot test API - not authenticated");
      console.groupEnd();
      return;
    }

    try {
      const headers = await this.testApiHeaders();
      if (!headers) {
        console.groupEnd();
        return;
      }

      console.log("Making test request to /api/forms...");
      const response = await fetch("/api/forms", { headers });

      console.log("Response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ API call successful:", data);
      } else {
        const error = await response.json().catch(() => ({}));
        console.error("❌ API call failed:", error);
      }
    } catch (error) {
      console.error("💥 API call error:", error);
    }

    console.groupEnd();
  },

  /**
   * Create a test user in the database (for development)
   */
  async createTestUser() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("❌ Not signed in to Firebase");
      return;
    }

    console.log("🔧 Creating user in database...");

    try {
      const result = await userService.createUser({
        firebaseUid: currentUser.uid,
        email: currentUser.email || "test@example.com",
        name:
          currentUser.displayName ||
          currentUser.email?.split("@")[0] ||
          "Test User",
        avatarUrl: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
      });

      if (result.success) {
        console.log("✅ User created successfully:", result.data);
      } else {
        console.error("❌ Failed to create user:", result.error);
      }

      return result;
    } catch (error) {
      console.error("💥 Error creating user:", error);
      return null;
    }
  },
};

// Make it available globally in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).authDebug = authDebug;
  console.log("💡 Auth debugging tools available via window.authDebug");
  console.log("Available methods:");
  console.log("  - authDebug.checkAuthStatus()");
  console.log("  - authDebug.testApiHeaders()");
  console.log("  - authDebug.testApiCall()");
  console.log("  - authDebug.createTestUser()");
}
