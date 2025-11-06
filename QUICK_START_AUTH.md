# 🚀 Quick Start Guide

## Setup (2 minutes)

### 1. Add Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Wrap Your App

```tsx
// app/layout.tsx
import { AuthProvider } from '@/lib/auth';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Use in Components

**Protected Route:**
```tsx
'use client';
import { useRequireAuth } from '@/lib/auth';

export default function Dashboard() {
  const { user } = useRequireAuth(); // Auto-redirects if not logged in
  return <h1>Welcome, {user?.displayName}!</h1>;
}
```

**Login Form:**
```tsx
'use client';
import { useSignIn } from '@/lib/auth';

export default function LoginForm() {
  const { signIn, isLoading, error } = useSignIn();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn({ email, password });
    if (result.success) router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <p>{error.message}</p>}
      <button disabled={isLoading}>Sign In</button>
    </form>
  );
}
```

**Sign Up Form:**
```tsx
'use client';
import { useSignUp } from '@/lib/auth';

export default function SignUpForm() {
  const { signUp, isLoading, error } = useSignUp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signUp({ email, password, displayName });
    if (result.success) router.push('/dashboard');
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## Common Hooks

```tsx
import { 
  useAuth,           // Get auth state and methods
  useRequireAuth,    // Protected routes (redirects if not authenticated)
  useRequireGuest,   // Guest-only routes (redirects if authenticated)
  useSignIn,         // Sign in with loading/error state
  useSignUp,         // Sign up with loading/error state
} from '@/lib/auth';
```

## Available Methods

```tsx
const {
  user,                    // Current user object
  isAuthenticated,         // Boolean
  isLoading,              // Boolean
  error,                  // AuthError | null
  signUp,                 // (credentials) => Promise<AuthResult>
  signIn,                 // (credentials) => Promise<AuthResult>
  signOut,                // () => Promise<AuthResult>
  resetPassword,          // (email) => Promise<AuthResult>
  updateProfile,          // (data) => Promise<AuthResult>
  updateEmail,            // (email, password) => Promise<AuthResult>
  sendEmailVerification,  // () => Promise<AuthResult>
} = useAuth();
```

## File Structure

```
src/lib/auth/
├── index.ts              # 👈 Import everything from here
├── types.ts              # TypeScript types
├── constants.ts          # Config & error messages
├── README.md             # Full documentation
├── context/
│   └── AuthContext.tsx   # React Context
├── services/
│   └── auth.service.ts   # Firebase service layer
├── hooks/
│   ├── useAuth.ts
│   ├── useRequireAuth.ts
│   ├── useRequireGuest.ts
│   ├── useSignIn.ts
│   └── useSignUp.ts
└── utils/
    ├── helpers.ts        # Validation utilities
    └── token-storage.ts  # Token management
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character

Customize in `src/lib/auth/constants.ts`

---

📖 **Full Documentation:** See `src/lib/auth/README.md`
