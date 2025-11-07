import { User as FirebaseUser } from "firebase/auth";

/**
 * Authentication state enumeration
 */
export enum AuthStatus {
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
  LOADING = "loading",
}

/**
 * User interface - represents the authenticated user
 * Can be extended with additional fields when database integration is added
 */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  providerId: string;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

/**
 * Sign up credentials
 */
export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Password reset credentials
 */
export interface PasswordResetCredentials {
  email: string;
}

/**
 * Password update credentials
 */
export interface PasswordUpdateCredentials {
  currentPassword: string;
  newPassword: string;
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  displayName?: string;
  photoURL?: string;
}

/**
 * Authentication error types
 */
export enum AuthErrorCode {
  // User-related errors
  USER_NOT_FOUND = "auth/user-not-found",
  USER_DISABLED = "auth/user-disabled",
  EMAIL_ALREADY_IN_USE = "auth/email-already-in-use",

  // Credential-related errors
  INVALID_EMAIL = "auth/invalid-email",
  INVALID_PASSWORD = "auth/invalid-password",
  WRONG_PASSWORD = "auth/wrong-password",
  WEAK_PASSWORD = "auth/weak-password",

  // Token-related errors
  INVALID_TOKEN = "auth/invalid-token",
  TOKEN_EXPIRED = "auth/token-expired",

  // Network-related errors
  NETWORK_ERROR = "auth/network-request-failed",

  // Rate limiting
  TOO_MANY_REQUESTS = "auth/too-many-requests",

  // Generic errors
  OPERATION_NOT_ALLOWED = "auth/operation-not-allowed",
  INTERNAL_ERROR = "auth/internal-error",
  UNKNOWN_ERROR = "auth/unknown-error",
}

/**
 * Authentication error interface
 */
export interface AuthError {
  code: AuthErrorCode | string;
  message: string;
  details?: unknown;
}

/**
 * Authentication result interface
 */
export interface AuthResult<T = User> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

/**
 * OAuth provider types
 */
export enum OAuthProvider {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  TWITTER = "twitter",
  GITHUB = "github",
  APPLE = "apple",
}

/**
 * Firebase user mapper type
 */
export type FirebaseUserMapper = (firebaseUser: FirebaseUser) => User;
