"use client";

import { AuthProvider } from "@/lib/auth";
import { ForgotPasswordForm } from "@/components/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <ForgotPasswordForm />
      </div>
    </AuthProvider>
  );
}
