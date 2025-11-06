"use client";

import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  BarChart3,
  FolderOpen,
  StickyNote,
  MessageSquare,
  Users,
  Plus,
  LogOut,
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Menu items based on documentation
const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: Inbox,
    badge: "2",
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderOpen,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: StickyNote,
  },
];

const secondaryItems = [
  {
    title: "AI Chat",
    url: "/chat",
    icon: MessageSquare,
    badge: "AI",
  },
  {
    title: "Insights",
    url: "/insights",
    icon: BarChart3,
    badge: "Pro",
  },
];

const settingsItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground flex-shrink-0">
            <span className="text-sm font-bold">P</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold truncate">
              Productivity OS
            </span>
            <span className="text-xs text-muted-foreground truncate">
              Free Plan
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
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-xs flex-shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI & Analytics */}
        <SidebarGroup className="border-t">
          <SidebarGroupLabel>AI & Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center min-w-0">
                      <item.icon className="flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-xs flex-shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
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
                variant="outline"
                size="sm"
                className="w-full justify-start min-w-0"
              >
                <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">New Task</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start min-w-0"
              >
                <FolderOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">New Project</span>
              </Button>
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
                <SidebarMenuButton className="flex items-center min-w-0">
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
              U
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium truncate">User Name</span>
              <span className="text-xs text-muted-foreground truncate">
                user@email.com
              </span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
