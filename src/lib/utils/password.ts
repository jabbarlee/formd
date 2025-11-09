/**
 * Password Utilities
 * Provides secure password hashing and verification using bcrypt
 */

import bcrypt from "bcryptjs";

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 10
): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Bcrypt hash to verify against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with messages
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Minimum length check
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  // Recommended length check
  if (password.length < 8) {
    warnings.push(
      "Password should be at least 8 characters for better security"
    );
  }

  // Check for common patterns
  if (/^[0-9]+$/.test(password)) {
    warnings.push("Password should contain letters, not just numbers");
  }

  if (/^[a-zA-Z]+$/.test(password)) {
    warnings.push("Password should contain numbers or special characters");
  }

  // Check for very common passwords
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "12345678",
    "qwerty",
    "abc123",
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push(
      "This password is too common. Please choose a stronger password"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate a random password
 * @param length - Length of password to generate (default: 12)
 * @returns Random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one of each type
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  password += "0123456789"[Math.floor(Math.random() * 10)];
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
