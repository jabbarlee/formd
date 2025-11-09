import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
  UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  SignUpCredentials,
  SignInCredentials,
  PasswordResetCredentials,
  PasswordUpdateCredentials,
  ProfileUpdateData,
  AuthResult,
  User,
  AuthError,
} from "../types";
import {
  mapFirebaseUser,
  mapFirebaseError,
  validateSignUpCredentials,
  sanitizeInput,
} from "../utils";
import { AUTH_SUCCESS_MESSAGES } from "../constants";
import { userService } from "@/lib/database/services";

/**
 * Authentication Service
 * Handles all authentication operations with Firebase
 * Implements clean separation of concerns and error handling
 */
class AuthService {
  /**
   * Signs up a new user with email and password
   * Creates user in Firebase Auth and syncs to Supabase database
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResult> {
    try {
      // Validate credentials
      const validation = validateSignUpCredentials(
        credentials.email,
        credentials.password
      );

      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: "auth/invalid-credentials",
            message: validation.errors.join(". "),
          },
        };
      }

      // Sanitize inputs
      const email = sanitizeInput(credentials.email);
      const displayName = credentials.displayName
        ? sanitizeInput(credentials.displayName)
        : null;

      // Step 1: Create user in Firebase Auth
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(auth, email, credentials.password);

      // Step 2: Update profile with display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Step 3: Send email verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }

      // Step 4: Create user in Supabase database
      const dbResult = await userService.createUser({
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email || email,
        name: displayName || email.split("@")[0], // Fallback to email username if no display name
        avatarUrl: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
      });

      if (!dbResult.success) {
        console.error("Failed to create user in database:", dbResult.error);
        // Note: Firebase user is already created, but database sync failed
        // In production, you might want to implement a retry mechanism or background job
        // For now, we'll continue but log the error
      }

      const user = mapFirebaseUser(userCredential.user);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseError(error),
      };
    }
  }

  /**
   * Signs in an existing user with email and password
   * Updates last login timestamp in database
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    try {
      const email = sanitizeInput(credentials.email);

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        credentials.password
      );

      // Update last login timestamp in database
      await userService.updateLastLogin(userCredential.user.uid);

      const user = mapFirebaseUser(userCredential.user);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseError(error),
      };
    }
  }

  /**
   * Signs out the current user
   */
  async signOut(): Promise<AuthResult<void>> {
    try {
      await firebaseSignOut(auth);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseError(error),
      };
    }
  }

  /**
   * Sends a password reset email
   */
  async resetPassword(
    credentials: PasswordResetCredentials
  ): Promise<AuthResult<void>> {
    try {
      const email = sanitizeInput(credentials.email);

      await sendPasswordResetEmail(auth, email);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseError(error),
      };
    }
  }

  /**
   * Updates the current user's password
   */
  async updatePassword(
    credentials: PasswordUpdateCredentials
  ): Promise<AuthResult<void>> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        return {
          success: false,
          error: {
            code: "auth/no-current-user",
            message: "No user is currently signed in",
          },
        };
      }

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        credentials.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, credentials.newPassword);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseError(error),
      };
    }
  }

  /**
   * Updates the current user's profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<AuthResult<User>> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return {
          success: false,
          error: {
            code: "auth/no-current-user",
            message: "No user is currently signed in",
          },
        };
      }

      // Sanitize inputs
      const updates: ProfileUpdateData = {};
      if (data.displayName) {
        updates.displayName = sanitizeInput(data.displayName);
      }
      if (data.photoURL) {
        updates.photoURL = sanitizeInput(data.photoURL);
      }

      await updateProfile(currentUser, updates);

      // Reload user to get updated data
      await currentUser.reload();
      const updatedUser = auth.currentUser;

      if (!updatedUser) {
        return {
          success: false,
          error: {
            code: "auth/user-reload-failed",
            message: "Failed to reload user data",
          },
        };
      }

      const user = mapFirebaseUser(updatedUser);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseError(error),
      };
    }
  }

  /**
   * Updates the current user's email
   */
  async updateEmail(
    newEmail: string,
    currentPassword: string
  ): Promise<AuthResult<User>> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        return {
          success: false,
          error: {
            code: "auth/no-current-user",
            message: "No user is currently signed in",
          },
        };
      }

      // Re-authenticate user before email change
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update email
      const sanitizedEmail = sanitizeInput(newEmail);
      await updateEmail(currentUser, sanitizedEmail);

      // Send verification email to new address
      await sendEmailVerification(currentUser);

      // Reload user to get updated data
      await currentUser.reload();
      const updatedUser = auth.currentUser;

      if (!updatedUser) {
        return {
          success: false,
          error: {
            code: "auth/user-reload-failed",
            message: "Failed to reload user data",
          },
        };
      }

      const user = mapFirebaseUser(updatedUser);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseError(error),
      };
    }
  }

  /**
   * Sends email verification to current user
   */
  async sendEmailVerification(): Promise<AuthResult<void>> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return {
          success: false,
          error: {
            code: "auth/no-current-user",
            message: "No user is currently signed in",
          },
        };
      }

      await sendEmailVerification(currentUser);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseError(error),
      };
    }
  }

  /**
   * Gets the current user
   */
  getCurrentUser(): User | null {
    const currentUser = auth.currentUser;
    return currentUser ? mapFirebaseUser(currentUser) : null;
  }

  /**
   * Gets the current Firebase user (for advanced use cases)
   */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Reloads the current user's data from Firebase
   */
  async reloadUser(): Promise<AuthResult<User>> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return {
          success: false,
          error: {
            code: "auth/no-current-user",
            message: "No user is currently signed in",
          },
        };
      }

      await currentUser.reload();
      const reloadedUser = auth.currentUser;

      if (!reloadedUser) {
        return {
          success: false,
          error: {
            code: "auth/user-reload-failed",
            message: "Failed to reload user data",
          },
        };
      }

      const user = mapFirebaseUser(reloadedUser);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseError(error),
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
