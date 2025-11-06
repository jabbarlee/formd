'use client';

import { useRequireGuest } from '@/lib/auth';
import { SignUpForm } from '@/components/auth';

export default function SignUpPage() {
  // Redirect to dashboard if already authenticated
  const { isLoading } = useRequireGuest();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignUpForm />
    </div>
  );
}

