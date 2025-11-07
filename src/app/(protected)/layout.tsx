"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AuthProvider, useRequireAuth } from "@/lib/auth";

function FloatingToggle() {
  const { open } = useSidebar();

  // Only show when sidebar is closed
  if (open) return null;

  return <SidebarTrigger className="fixed bottom-4 left-4 z-50 shadow-lg" />;
}

function ProtectedContent({ children }: { children: React.ReactNode }) {
  // Protect all routes under (protected) - redirects to /login if not authenticated
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 relative">
          <FloatingToggle />
          <div className="">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedContent>{children}</ProtectedContent>
    </AuthProvider>
  );
}
