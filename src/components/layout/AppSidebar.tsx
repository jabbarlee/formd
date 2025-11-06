"use client";

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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Inbox,
  FolderOpen,
  Calendar,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const workspaceItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Tasks",
    icon: Inbox,
    href: "/tasks",
    badge: 2,
  },
  {
    title: "Projects",
    icon: FolderOpen,
    href: "/projects",
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar",
  },
  {
    title: "Notes",
    icon: FileText,
    href: "/notes",
  },
];

const aiAnalyticsItems = [
  {
    title: "AI Chat",
    icon: MessageSquare,
    href: "/ai-chat",
    badge: "AI",
  },
  {
    title: "Insights",
    icon: BarChart3,
    href: "/insights",
    badge: "Pro",
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Productivity OS</span>
            <span className="text-xs text-muted-foreground">Free Plan</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 py-2">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full justify-start px-3 py-2">
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
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

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 py-2">
            AI & Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiAnalyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full justify-start px-3 py-2">
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
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

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 py-2">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2 px-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full justify-start px-3 py-2">
              <Link href="/settings/profile" className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full justify-start px-3 py-2">
              <Link href="/logout" className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator />

        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-indigo-600 text-white">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm">
            <p className="font-medium">User Name</p>
            <p className="text-muted-foreground text-xs">user@email.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
