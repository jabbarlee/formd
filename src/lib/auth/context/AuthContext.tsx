"use client";

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  User,
  AuthState,
  AuthStatus,
  SignUpCredentials,
  SignInCredentials,
  PasswordResetCredentials,
  PasswordUpdateCredentials,
  ProfileUpdateData,
  AuthResult,
} from "../types";
import { authService } from "../services";
import { mapFirebaseUser } from "../utils";
import { tokenStorage } from "../utils/token-storage";

/**
 * Authentication Context Value Interface
 */
interface AuthContextValue extends AuthState {
  signUp: (credentials: SignUpCredentials) => Promise<AuthResult>;
  signIn: (credentials: SignInCredentials) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult<void>>;
  resetPassword: (
    credentials: PasswordResetCredentials
  ) => Promise<AuthResult<void>>;
  updatePassword: (
    credentials: PasswordUpdateCredentials
  ) => Promise<AuthResult<void>>;
  updateProfile: (data: ProfileUpdateData) => Promise<AuthResult<User>>;
  updateEmail: (
    newEmail: string,
    currentPassword: string
  ) => Promise<AuthResult<User>>;
  sendEmailVerification: () => Promise<AuthResult<void>>;
  reloadUser: () => Promise<AuthResult<User>>;
}

/**
 * Authentication Context
 */
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods to the application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.LOADING);
  const [error, setError] = useState<AuthState["error"]>(null);

  // Derived state
  const isLoading = status === AuthStatus.LOADING;
  const isAuthenticated = status === AuthStatus.AUTHENTICATED;

  /**
   * Handle authentication state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            // User is signed in
            const mappedUser = mapFirebaseUser(firebaseUser);
            setUser(mappedUser);
            setStatus(AuthStatus.AUTHENTICATED);
            setError(null);

            // Store auth token
            const token = await firebaseUser.getIdToken();
            tokenStorage.setAuthToken(token);
          } else {
            // User is signed out
            setUser(null);
            setStatus(AuthStatus.UNAUTHENTICATED);
            setError(null);

            // Clear stored tokens
            tokenStorage.clearAll();
          }
        } catch (err) {
          console.error("Auth state change error:", err);
          setUser(null);
          setStatus(AuthStatus.UNAUTHENTICATED);
          setError({
            code: "auth/state-change-error",
            message: "Failed to process authentication state change",
            details: err,
          });
        }
      },
      (err) => {
        console.error("Auth state observer error:", err);
        setUser(null);
        setStatus(AuthStatus.UNAUTHENTICATED);
        setError({
          code: "auth/observer-error",
          message: "Authentication observer encountered an error",
          details: err,
        });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign up handler
   */
  const signUp = useCallback(
    async (credentials: SignUpCredentials): Promise<AuthResult> => {
      setError(null);
      const result = await authService.signUp(credentials);

      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    },
    []
  );

  /**
   * Sign in handler
   */
  const signIn = useCallback(
    async (credentials: SignInCredentials): Promise<AuthResult> => {
      setError(null);
      const result = await authService.signIn(credentials);

      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    },
    []
  );

  /**
   * Sign out handler
   */
  const signOut = useCallback(async (): Promise<AuthResult<void>> => {
    setError(null);
    const result = await authService.signOut();

    if (!result.success && result.error) {
      setError(result.error);
    }

    return result;
  }, []);

  /**
   * Password reset handler
   */
  const resetPassword = useCallback(
    async (
      credentials: PasswordResetCredentials
    ): Promise<AuthResult<void>> => {
      setError(null);
      const result = await authService.resetPassword(credentials);

      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    },
    []
  );

  /**
   * Update password handler
   */
  const updatePassword = useCallback(
    async (
      credentials: PasswordUpdateCredentials
    ): Promise<AuthResult<void>> => {
      setError(null);
      const result = await authService.updatePassword(credentials);

      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    },
    []
  );

  /**
   * Update profile handler
   */
  const updateProfile = useCallback(
    async (data: ProfileUpdateData): Promise<AuthResult<User>> => {
      setError(null);
      const result = await authService.updateProfile(data);

      if (result.success && result.data) {
        setUser(result.data);
      } else if (result.error) {
        setError(result.error);
      }

      return result;
    },
    []
  );

  /**
   * Update email handler
   */
  const updateEmail = useCallback(
    async (
      newEmail: string,
      currentPassword: string
    ): Promise<AuthResult<User>> => {
      setError(null);
      const result = await authService.updateEmail(newEmail, currentPassword);

      if (result.success && result.data) {
        setUser(result.data);
      } else if (result.error) {
        setError(result.error);
      }

      return result;
    },
    []
  );

  /**
   * Send email verification handler
   */
  const sendEmailVerification = useCallback(async (): Promise<
    AuthResult<void>
  > => {
    setError(null);
    const result = await authService.sendEmailVerification();

    if (!result.success && result.error) {
      setError(result.error);
    }

    return result;
  }, []);

  /**
   * Reload user handler
   */
  const reloadUser = useCallback(async (): Promise<AuthResult<User>> => {
    setError(null);
    const result = await authService.reloadUser();

    if (result.success && result.data) {
      setUser(result.data);
    } else if (result.error) {
      setError(result.error);
    }

    return result;
  }, []);

  /**
   * Memoized context value
   */
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isLoading,
      isAuthenticated,
      error,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      updateEmail,
      sendEmailVerification,
      reloadUser,
    }),
    [
      user,
      status,
      isLoading,
      isAuthenticated,
      error,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      updateEmail,
      sendEmailVerification,
      reloadUser,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
