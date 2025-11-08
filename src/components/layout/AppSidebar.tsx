"use client";

import {
  Home,
  FileText,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  User,
  CreditCard,
  LineChart,
  Inbox,
  FolderOpen,
  Layout,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useAuth, getUserInitials } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Menu items based on actual protected routes
const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Forms",
    url: "/forms",
    icon: FileText,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: Layout,
  },
];

const settingsItems = [
  {
    title: "Profile",
    url: "/settings/profile",
    icon: User,
  },
  {
    title: "Billing",
    url: "/settings/billing",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      toast.success("Signed out successfully");
      router.push("/login");
    } else if (result.error) {
      toast.error(result.error.message);
    }
  };

  const userInitials = getUserInitials(user);
  const displayName = user?.displayName || "User";
  const displayEmail = user?.email || "user@email.com";

  return (
    <Sidebar>
      <SidebarHeader className="h-16 px-6 justify-center border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                Form<span className="italic text-indigo-600">D</span>
              </span>
            </Link>
            <span className="text-xs text-muted-foreground">
              AI Form Builder
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center min-w-0">
                      <item.icon className="flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup className="border-t">
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 space-y-2">
              <Link href="/forms/new">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-start min-w-0 "
                >
                  <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">New Form</span>
                </Button>
              </Link>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        {/* User Profile Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center min-w-0">
                      <item.icon className="flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="flex items-center min-w-0 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="flex-shrink-0" />
                  <span className="truncate">Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium truncate">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {displayEmail}
              </span>
            </div>
            <SidebarTrigger className="flex-shrink-0 z-50" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
