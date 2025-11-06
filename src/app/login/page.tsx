'use client';

import { useRequireGuest } from '@/lib/auth';
import { LoginForm } from '@/components/auth';

export default function LoginPage() {
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
      <LoginForm />
    </div>
  );
}

