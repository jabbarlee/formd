"use client";

import { AuthProvider, useRequireGuest } from "@/lib/auth";
import { SignUpForm } from "@/components/auth";
import { Navbar } from "@/components/layout/Navbar";

function SignUpContent() {
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
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <SignUpForm />
      </div>
    </>
  );
}

export default function SignUpPage() {
  return (
    <AuthProvider>
      <SignUpContent />
    </AuthProvider>
  );
}
