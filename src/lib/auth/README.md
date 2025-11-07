# Authentication System Documentation

## Overview

A clean, scalable, and secure authentication system built with Firebase Authentication. This system follows clean code principles with proper separation of concerns, type safety, and comprehensive error handling.

## Architecture

```
src/lib/auth/
├── index.ts                    # Barrel export for clean imports
├── types.ts                    # TypeScript types and interfaces
├── constants.ts                # Configuration and constants
├── context/
│   ├── index.ts
│   └── AuthContext.tsx        # React Context for auth state
├── services/
│   ├── index.ts
│   └── auth.service.ts        # Firebase authentication service
├── hooks/
│   ├── index.ts
│   ├── useAuth.ts             # Core auth hook
│   ├── useRequireAuth.ts      # Protected route hook
│   ├── useRequireGuest.ts     # Guest-only route hook
│   ├── useSignIn.ts           # Sign in form hook
│   └── useSignUp.ts           # Sign up form hook
└── utils/
    ├── index.ts
    ├── helpers.ts             # Validation and utility functions
    └── token-storage.ts       # Token management
```

## Features

### ✅ Core Authentication

- Sign up with email and password
- Sign in with email and password
- Sign out
- Password reset via email
- Email verification
- Profile updates (display name, photo URL)
- Email updates
- Password updates

### ✅ Security

- Input sanitization
- Password strength validation
- Email format validation
- Secure token storage
- Re-authentication for sensitive operations
- Environment variable configuration

### ✅ Developer Experience

- Full TypeScript support
- Clean API with custom hooks
- Comprehensive error handling
- Loading states
- User-friendly error messages
- Protected route helpers

## Installation & Setup

### 1. Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Wrap Your App with AuthProvider

```tsx
// app/layout.tsx
import { AuthProvider } from "@/lib/auth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

## Usage Examples

### Basic Authentication Hook

```tsx
"use client";

import { useAuth } from "@/lib/auth";

export default function Profile() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.displayName || user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

```tsx
"use client";

import { useRequireAuth } from "@/lib/auth";

export default function Dashboard() {
  // Automatically redirects to login if not authenticated
  const { user, isLoading } = useRequireAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.displayName}</p>
    </div>
  );
}
```

### Guest-Only Routes (Login/Signup)

```tsx
"use client";

import { useRequireGuest } from "@/lib/auth";

export default function LoginPage() {
  // Automatically redirects to dashboard if already authenticated
  const { isLoading } = useRequireGuest();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <LoginForm />;
}
```

### Sign In Form

```tsx
"use client";

import { useSignIn } from "@/lib/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const { signIn, isLoading, error } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn({ email, password });

    if (result.success) {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error.message}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

### Sign Up Form

```tsx
"use client";

import { useSignUp } from "@/lib/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoading, error } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signUp({ email, password, displayName });

    if (result.success) {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Full Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error.message}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
```

### Password Reset

```tsx
"use client";

import { useAuth } from "@/lib/auth";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    const result = await resetPassword({ email });

    setIsLoading(false);

    if (result.success) {
      setMessage("Password reset email sent! Check your inbox.");
    } else if (result.error) {
      setError(result.error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Reset Password"}
      </button>
    </form>
  );
}
```

### Update Profile

```tsx
"use client";

import { useAuth } from "@/lib/auth";
import { useState } from "react";

export default function ProfileUpdateForm() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const result = await updateProfile({ displayName });

    setIsLoading(false);

    if (result.success) {
      setMessage("Profile updated successfully!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Display Name"
      />
      {message && <p className="success">{message}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
}
```

## Advanced Usage

### Direct Service Access

For advanced use cases, you can use the service directly:

```tsx
import { authService } from "@/lib/auth";

// Get current user without using hooks
const currentUser = authService.getCurrentUser();

// Access Firebase user object directly
const firebaseUser = authService.getCurrentFirebaseUser();
```

### Custom Validation

```tsx
import { validateEmail, validatePassword } from "@/lib/auth";

const emailValidation = validateEmail("user@example.com");
if (!emailValidation.valid) {
  console.error(emailValidation.error);
}

const passwordValidation = validatePassword("MyPassword123!");
if (!passwordValidation.valid) {
  console.error(passwordValidation.error);
}
```

### Token Storage

```tsx
import { tokenStorage } from "@/lib/auth";

// Store auth token
tokenStorage.setAuthToken("token");

// Get auth token
const token = tokenStorage.getAuthToken();

// Clear all auth data
tokenStorage.clearAll();
```

## Type Definitions

### User

```typescript
interface User {
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
```

### AuthResult

```typescript
interface AuthResult<T = User> {
  success: boolean;
  data?: T;
  error?: AuthError;
}
```

### AuthError

```typescript
interface AuthError {
  code: AuthErrorCode | string;
  message: string;
  details?: unknown;
}
```

## Password Requirements

By default, passwords must:

- Be at least 8 characters long
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one number
- Contain at least one special character

You can customize these in `src/lib/auth/constants.ts`.

## Future Enhancements

- OAuth providers (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- Session management
- Rate limiting
- Security event logging
- Database integration for user profiles
- Role-based access control (RBAC)

## Best Practices

1. **Always wrap your app with AuthProvider** at the root level
2. **Use hooks for component-level auth logic** instead of accessing the service directly
3. **Handle loading states** to prevent flash of unauthenticated content
4. **Show user-friendly error messages** from the error object
5. **Store redirect URLs** for post-authentication navigation
6. **Validate inputs** on both client and server side
7. **Use protected routes** for authenticated-only pages
8. **Clear sensitive data** on sign out

## License

This authentication system is part of the FormD project.
