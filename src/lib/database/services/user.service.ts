/**
 * User Database Service
 * Handles all database operations related to users
 * Implements clean separation of concerns and error handling
 */

import { supabase } from "@/lib/supabase/client";

// User types matching database schema
export interface UserRow {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  plan: "free" | "pro" | "business" | "enterprise";
  email_verified: boolean;
  stripe_customer_id: string | null;
  preferences: Record<string, any>;
  metadata: Record<string, any>;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateUserData {
  firebaseUid: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
}

export interface UpdateUserData {
  name?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  company?: string | null;
  emailVerified?: boolean;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * User Database Service
 */
class UserService {
  /**
   * Creates a new user in the database
   * This is typically called after Firebase Auth user creation
   */
  async createUser(data: CreateUserData): Promise<DatabaseResult<UserRow>> {
    try {
      const userInsert = {
        firebase_uid: data.firebaseUid,
        email: data.email,
        name: data.name,
        avatar_url: data.avatarUrl || null,
        email_verified: data.emailVerified || false,
        plan: "free" as const, // Default plan
        preferences: {},
        metadata: {},
      };

      const { data: user, error } = await supabase
        .from("users")
        .insert(userInsert)
        .select()
        .single();

      if (error) {
        console.error("Error creating user in database:", error);
        return {
          success: false,
          error: {
            code: error.code || "database/create-user-failed",
            message: error.message || "Failed to create user in database",
            details: error,
          },
        };
      }

      return {
        success: true,
        data: user as UserRow,
      };
    } catch (error) {
      console.error("Unexpected error creating user:", error);
      return {
        success: false,
        error: {
          code: "database/unexpected-error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Gets a user by Firebase UID
   */
  async getUserByFirebaseUid(
    firebaseUid: string
  ): Promise<DatabaseResult<UserRow>> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .single();

      if (error) {
        // If user not found, it's not necessarily an error
        if (error.code === "PGRST116") {
          return {
            success: false,
            error: {
              code: "database/user-not-found",
              message: "User not found",
              details: error,
            },
          };
        }

        return {
          success: false,
          error: {
            code: error.code || "database/get-user-failed",
            message: error.message || "Failed to get user",
            details: error,
          },
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error("Unexpected error getting user:", error);
      return {
        success: false,
        error: {
          code: "database/unexpected-error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Gets a user by email
   */
  async getUserByEmail(email: string): Promise<DatabaseResult<UserRow>> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return {
            success: false,
            error: {
              code: "database/user-not-found",
              message: "User not found",
              details: error,
            },
          };
        }

        return {
          success: false,
          error: {
            code: error.code || "database/get-user-failed",
            message: error.message || "Failed to get user",
            details: error,
          },
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error("Unexpected error getting user by email:", error);
      return {
        success: false,
        error: {
          code: "database/unexpected-error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Updates a user by Firebase UID
   */
  async updateUser(
    firebaseUid: string,
    data: UpdateUserData
  ): Promise<DatabaseResult<UserRow>> {
    try {
      const userUpdate: any = {
        ...(data.name && { name: data.name }),
        ...(data.avatarUrl !== undefined && { avatar_url: data.avatarUrl }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.emailVerified !== undefined && {
          email_verified: data.emailVerified,
        }),
        ...(data.preferences && { preferences: data.preferences }),
        ...(data.metadata && { metadata: data.metadata }),
      };

      const { data: user, error } = await supabase
        .from("users")
        .update(userUpdate)
        .eq("firebase_uid", firebaseUid)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: error.code || "database/update-user-failed",
            message: error.message || "Failed to update user",
            details: error,
          },
        };
      }

      return {
        success: true,
        data: user as UserRow,
      };
    } catch (error) {
      console.error("Unexpected error updating user:", error);
      return {
        success: false,
        error: {
          code: "database/unexpected-error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Updates user's last login timestamp
   */
  async updateLastLogin(firebaseUid: string): Promise<DatabaseResult<void>> {
    try {
      const { error } = await supabase
        .from("users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("firebase_uid", firebaseUid);

      if (error) {
        return {
          success: false,
          error: {
            code: error.code || "database/update-login-failed",
            message: error.message || "Failed to update last login",
            details: error,
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Unexpected error updating last login:", error);
      return {
        success: false,
        error: {
          code: "database/unexpected-error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Deletes a user (soft delete)
   */
  async deleteUser(firebaseUid: string): Promise<DatabaseResult<void>> {
    try {
      const { error } = await supabase
        .from("users")
        .update({ deleted_at: new Date().toISOString() })
        .eq("firebase_uid", firebaseUid);

      if (error) {
        return {
          success: false,
          error: {
            code: error.code || "database/delete-user-failed",
            message: error.message || "Failed to delete user",
            details: error,
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Unexpected error deleting user:", error);
      return {
        success: false,
        error: {
          code: "database/unexpected-error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Checks if a user exists by Firebase UID
   */
  async userExists(firebaseUid: string): Promise<DatabaseResult<boolean>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebaseUid)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { success: true, data: false };
        }

        return {
          success: false,
          error: {
            code: error.code || "database/check-user-failed",
            message: error.message || "Failed to check user existence",
            details: error,
          },
        };
      }

      return {
        success: true,
        data: !!data,
      };
    } catch (error) {
      console.error("Unexpected error checking user existence:", error);
      return {
        success: false,
        error: {
          code: "database/unexpected-error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          details: error,
        },
      };
    }
  }
}

// Export singleton instance
export const userService = new UserService();
