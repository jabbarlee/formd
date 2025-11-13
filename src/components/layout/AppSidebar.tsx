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
  BarChart,
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
import { formsApi } from "@/lib/api/forms";
import { useEffect, useState } from "react";
import { Form } from "@/lib/types/forms";

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
  const [lastPublishedForm, setLastPublishedForm] = useState<Form | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  // Fetch the most recent published form
  const fetchLastPublishedForm = async () => {
    if (!user) return;

    try {
      setIsLoadingForm(true);
      const { forms } = await formsApi.getForms({
        status: "published",
        limit: 1,
      });

      if (forms.length > 0) {
        setLastPublishedForm(forms[0]);
      } else {
        setLastPublishedForm(null);
      }
    } catch (error) {
      console.error("Error fetching last published form:", error);
    } finally {
      setIsLoadingForm(false);
    }
  };

  useEffect(() => {
    fetchLastPublishedForm();
  }, [user]);

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

  const handleCreateForm = async () => {
    try {
      // Create a new form in the database first
      const { form } = await formsApi.createForm({
        title: "Untitled Form",
        description: "",
        status: "draft",
      });

      // Navigate to the actual form UUID
      router.push(`/forms/${form.id}`);
    } catch (error) {
      console.error("Failed to create form:", error);
      // Fallback to the old behavior if API call fails
      router.push(`/forms/new`);
    }
  };

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
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start min-w-0"
                onClick={handleCreateForm}
              >
                <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">New Form</span>
              </Button>

              {lastPublishedForm && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full h-auto py-3 px-3 justify-start min-w-0"
                >
                  <Link
                    href={`/forms/${lastPublishedForm.id}/responses`}
                    className="flex items-center min-w-0 gap-2"
                  >
                    <BarChart className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-xs text-foreground truncate w-full">
                        {lastPublishedForm.title.length > 15
                          ? `${lastPublishedForm.title.substring(0, 15)}...`
                          : lastPublishedForm.title}
                      </span>
                    </div>
                    {lastPublishedForm.responseCount &&
                      lastPublishedForm.responseCount > 0 && (
                        <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 flex-shrink-0">
                          {lastPublishedForm.responseCount}
                        </span>
                      )}
                  </Link>
                </Button>
              )}
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
