import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";

/**
 * Firebase configuration object
 * All values are loaded from environment variables for security
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Validates that all required Firebase configuration values are present
 * @throws Error if any required configuration is missing
 */
const validateFirebaseConfig = (): void => {
  const requiredKeys = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ] as const;

  const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missingKeys.join(", ")}`
    );
  }
};

/**
 * Initialize Firebase app (singleton pattern)
 * Prevents multiple instances from being created
 */
const initializeFirebaseApp = (): FirebaseApp => {
  if (getApps().length === 0) {
    validateFirebaseConfig();
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
};

// Initialize Firebase
export const app = initializeFirebaseApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;
