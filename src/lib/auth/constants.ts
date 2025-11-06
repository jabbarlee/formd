import { AuthErrorCode } from './types';

/**
 * Authentication error messages
 * User-friendly messages for different error scenarios
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [AuthErrorCode.USER_NOT_FOUND]: 'No account found with this email address.',
  [AuthErrorCode.USER_DISABLED]: 'This account has been disabled. Please contact support.',
  [AuthErrorCode.EMAIL_ALREADY_IN_USE]: 'An account with this email already exists.',
  [AuthErrorCode.INVALID_EMAIL]: 'Please enter a valid email address.',
  [AuthErrorCode.INVALID_PASSWORD]: 'Invalid password. Please try again.',
  [AuthErrorCode.WRONG_PASSWORD]: 'Incorrect password. Please try again.',
  [AuthErrorCode.WEAK_PASSWORD]: 'Password is too weak. Please use at least 6 characters.',
  [AuthErrorCode.INVALID_TOKEN]: 'Invalid authentication token. Please sign in again.',
  [AuthErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  [AuthErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [AuthErrorCode.TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later.',
  [AuthErrorCode.OPERATION_NOT_ALLOWED]: 'This operation is not allowed. Please contact support.',
  [AuthErrorCode.INTERNAL_ERROR]: 'An internal error occurred. Please try again.',
  [AuthErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Password validation requirements
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true,
} as const;

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Session storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'formd_auth_token',
  REFRESH_TOKEN: 'formd_refresh_token',
  USER_DATA: 'formd_user_data',
  REDIRECT_URL: 'formd_redirect_url',
} as const;

/**
 * Authentication timeouts (in milliseconds)
 */
export const AUTH_TIMEOUTS = {
  SESSION_CHECK: 60000, // 1 minute
  TOKEN_REFRESH: 3600000, // 1 hour
  IDLE_TIMEOUT: 1800000, // 30 minutes
} as const;

/**
 * Protected route redirect paths
 */
export const ROUTE_PATHS = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/',
} as const;

/**
 * Success messages
 */
export const AUTH_SUCCESS_MESSAGES = {
  SIGN_UP: 'Account created successfully! Please check your email to verify your account.',
  SIGN_IN: 'Welcome back!',
  SIGN_OUT: 'You have been signed out successfully.',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent. Please check your inbox.',
  PASSWORD_UPDATED: 'Password updated successfully.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
} as const;
