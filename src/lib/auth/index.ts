/**
 * Authentication Module
 *
 * A clean, scalable, and secure authentication system built with Firebase Auth.
 * Provides type-safe authentication services, React context, and custom hooks.
 *
 * @module auth
 *
 * @example
 * ```tsx
 * // 1. Wrap your app with AuthProvider
 * import { AuthProvider } from '@/lib/auth';
 *
 * export default function App({ children }) {
 *   return (
 *     <AuthProvider>
 *       {children}
 *     </AuthProvider>
 *   );
 * }
 *
 * // 2. Use auth hooks in your components
 * import { useAuth, useRequireAuth } from '@/lib/auth';
 *
 * function Dashboard() {
 *   useRequireAuth(); // Redirects if not authenticated
 *   const { user, signOut } = useAuth();
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user?.displayName}</h1>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 *
 * // 3. Use specialized hooks for forms
 * import { useSignIn, useSignUp } from '@/lib/auth';
 *
 * function LoginForm() {
 *   const { signIn, isLoading, error } = useSignIn();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await signIn({ email, password });
 *     if (result.success) {
 *       // Handle success
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */

// Context and Provider
export { AuthProvider, AuthContext } from "./context";

// Hooks
export {
  useAuth,
  useRequireAuth,
  useRequireGuest,
  useSignIn,
  useSignUp,
} from "./hooks";

// Services (for advanced use cases)
export { authService } from "./services";

// Types
export type {
  User,
  AuthState,
  SignUpCredentials,
  SignInCredentials,
  PasswordResetCredentials,
  PasswordUpdateCredentials,
  ProfileUpdateData,
  AuthResult,
  AuthError,
} from "./types";

export { AuthStatus, AuthErrorCode, OAuthProvider } from "./types";

// Constants
export {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
  PASSWORD_REQUIREMENTS,
  EMAIL_REGEX,
  ROUTE_PATHS,
} from "./constants";

// Utilities (for advanced use cases)
export {
  validateEmail,
  validatePassword,
  validateSignUpCredentials,
  sanitizeInput,
  isAuthenticated,
  isEmailVerified,
  getUserInitials,
  formatAuthDate,
  mapFirebaseUser,
  mapFirebaseError,
  tokenStorage,
} from "./utils";
