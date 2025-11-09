/**
 * Example: How to integrate password protection in form preview
 *
 * This example shows how to check if a form requires a password
 * and conditionally show the password gate before displaying the form.
 */

"use client";

import { useState, useEffect } from "react";
import { FormPasswordGate } from "@/components/forms/preview";
import { Form } from "@/lib/types/forms";

interface SecureFormPreviewProps {
  form: Form;
  children: React.ReactNode; // The actual form preview component
}

/**
 * Wrapper component that adds password protection to any form preview
 */
export function SecureFormPreview({ form, children }: SecureFormPreviewProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    // Check if form requires password
    if (!form.requiresPassword || !form.passwordHash) {
      setHasAccess(true);
      setIsCheckingAccess(false);
      return;
    }

    // Check if user already has access in this session
    const accessToken = sessionStorage.getItem(
      `form_access_${form.passwordHash}`
    );
    if (accessToken === "granted") {
      setHasAccess(true);
    }

    setIsCheckingAccess(false);
  }, [form]);

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show password gate if form requires password and user doesn't have access
  if (form.requiresPassword && form.passwordHash && !hasAccess) {
    return (
      <FormPasswordGate
        formTitle={form.title}
        passwordHash={form.passwordHash}
        onSuccess={() => setHasAccess(true)}
        onCancel={() => {
          // Redirect to forms page or home
          window.location.href = "/forms";
        }}
      />
    );
  }

  // Show the actual form if user has access
  return <>{children}</>;
}

// Example usage with FormBuilder's preview:
/*
import { FormPreview } from "@/components/forms/preview";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";

function MyFormPreviewPage() {
  const form = useFormBuilderStore((state) => state.form);

  return (
    <SecureFormPreview form={form}>
      <FormPreview />
    </SecureFormPreview>
  );
}
*/

// Alternative: Server-side check (for Next.js app router)
// This would be in your page.tsx file

/*
export default async function FormPage({ params }: { params: { id: string } }) {
  // Fetch form from database
  const form = await getFormById(params.id);

  if (!form) {
    notFound();
  }

  // If form requires password, you might want to handle this on client side
  // because bcrypt verification should be done securely
  
  return <SecureFormPreview form={form} />;
}
*/

// Usage in API route for password verification (recommended approach)
/*
// app/api/forms/[id]/verify-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/utils/password";
import { getFormById } from "@/lib/database/services/form.service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { password } = await request.json();
    const form = await getFormById(params.id);

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    if (!form.requiresPassword || !form.passwordHash) {
      return NextResponse.json({ success: true });
    }

    const isValid = await verifyPassword(password, form.passwordHash);

    if (isValid) {
      // Generate a secure token (JWT or session token)
      // For now, just return success
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
*/
