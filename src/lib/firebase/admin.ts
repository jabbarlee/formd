/**
 * Firebase Admin SDK
 * Server-side Firebase initialization for API routes
 * Used for token verification and admin operations
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

let app: App;
let auth: Auth;

// Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    // In production, use service account JSON from environment
    // For development, you can use application default credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined;

    app = initializeApp({
      credential: serviceAccount
        ? cert(serviceAccount)
        : undefined, // Uses application default credentials if not provided
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    auth = getAuth(app);
    console.log("✅ Firebase Admin initialized");
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin:", error);
    throw error;
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

export { app, auth };
