import { User as FirebaseUser } from "firebase/auth";
import { User, AuthError, AuthErrorCode, FirebaseUserMapper } from "../types";
import {
  AUTH_ERROR_MESSAGES,
  EMAIL_REGEX,
  PASSWORD_REQUIREMENTS,
} from "../constants";

/**
 * Maps Firebase user to application User type
 */
export const mapFirebaseUser: FirebaseUserMapper = (
  firebaseUser: FirebaseUser
): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    phoneNumber: firebaseUser.phoneNumber,
    providerId: firebaseUser.providerId,
    metadata: {
      creationTime: firebaseUser.metadata.creationTime,
      lastSignInTime: firebaseUser.metadata.lastSignInTime,
    },
  };
};

/**
 * Maps Firebase error to AuthError
 */
export const mapFirebaseError = (error: unknown): AuthError => {
  if (error instanceof Error) {
    const code = (error as any).code || AuthErrorCode.UNKNOWN_ERROR;
    const message = AUTH_ERROR_MESSAGES[code] || error.message;

    return {
      code,
      message,
      details: error,
    };
  }

  return {
    code: AuthErrorCode.UNKNOWN_ERROR,
    message: AUTH_ERROR_MESSAGES[AuthErrorCode.UNKNOWN_ERROR],
    details: error,
  };
};

/**
 * Validates email format
 */
export const validateEmail = (
  email: string
): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: "Email is required" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  return { valid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (
  password: string
): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`,
    };
  }

  if (password.length > PASSWORD_REQUIREMENTS.MAX_LENGTH) {
    return {
      valid: false,
      error: `Password must be less than ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`,
    };
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/\d/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }

  if (
    PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHAR &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    return {
      valid: false,
      error: "Password must contain at least one special character",
    };
  }

  return { valid: true };
};

/**
 * Validates sign up credentials
 */
export const validateSignUpCredentials = (
  email: string,
  password: string
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid && emailValidation.error) {
    errors.push(emailValidation.error);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid && passwordValidation.error) {
    errors.push(passwordValidation.error);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Sanitizes user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Checks if user is authenticated (has valid user object)
 */
export const isAuthenticated = (user: User | null): boolean => {
  return user !== null && !!user.uid;
};

/**
 * Checks if email is verified
 */
export const isEmailVerified = (user: User | null): boolean => {
  return user?.emailVerified ?? false;
};

/**
 * Gets user initials from display name or email
 */
export const getUserInitials = (user: User | null): string => {
  if (!user) return "";

  if (user.displayName) {
    const names = user.displayName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.displayName.substring(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }

  return "U";
};

/**
 * Formats timestamp to readable date
 */
export const formatAuthDate = (timestamp?: string): string => {
  if (!timestamp) return "N/A";

  try {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};
