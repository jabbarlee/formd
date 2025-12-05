"use client";

import { ReactNode } from "react";

interface FormLayoutProps {
  children: ReactNode;
}

/**
 * Layout for Form Pages (/forms/[id])
 * Each page (builder, analytics, responses) includes its own header component
 * This layout just provides a consistent wrapper
 */
export default function FormLayout({ children }: FormLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}
