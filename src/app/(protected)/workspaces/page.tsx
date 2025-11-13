import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Users,
  Settings,
  MoreHorizontal,
  Crown,
  UserPlus,
  Edit3,
  Eye,
  Calendar,
  FileText,
  Zap,
} from "lucide-react";
import { ComingSoonOverlay } from "@/components/ui/coming-soon-overlay";

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar?: string;
  lastActive: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  formsCount: number;
  role: "owner" | "admin" | "editor" | "viewer";
  createdAt: string;
  lastActivity: string;
  members: WorkspaceMember[];
}

interface WorkspaceForm {
  id: string;
  name: string;
  description: string;
  status: "draft" | "published" | "archived";
  responses: number;
  lastEdited: string;
  collaborators: string[];
}

export default function WorkspacesPage() {
  // Mock data following the app's patterns
  const workspaces: Workspace[] = [
    {
      id: "1",
      name: "Marketing Team",
      description: "Forms for marketing campaigns and lead generation",
      memberCount: 8,
      formsCount: 12,
      role: "owner",
      createdAt: "2024-01-15",
      lastActivity: "2 hours ago",
      members: [
        {
          id: "1",
          name: "Sarah Chen",
          email: "sarah@company.com",
          role: "owner",
          lastActive: "2 hours ago",
        },
        {
          id: "2",
          name: "Mike Johnson",
          email: "mike@company.com",
          role: "admin",
          lastActive: "1 day ago",
        },
        {
          id: "3",
          name: "Emily Davis",
          email: "emily@company.com",
          role: "editor",
          lastActive: "3 hours ago",
        },
      ],
    },
    {
      id: "2",
      name: "Product Research",
      description: "User feedback and product validation forms",
      memberCount: 5,
      formsCount: 8,
      role: "admin",
      createdAt: "2024-02-01",
      lastActivity: "1 day ago",
      members: [
        {
          id: "4",
          name: "Alex Rodriguez",
          email: "alex@company.com",
          role: "owner",
          lastActive: "1 day ago",
        },
        {
          id: "5",
          name: "Lisa Thompson",
          email: "lisa@company.com",
          role: "editor",
          lastActive: "4 hours ago",
        },
      ],
    },
    {
      id: "3",
      name: "Customer Support",
      description: "Support forms and customer feedback collection",
      memberCount: 12,
      formsCount: 15,
      role: "editor",
      createdAt: "2024-01-10",
      lastActivity: "5 minutes ago",
      members: [],
    },
  ];

  const workspaceForms: WorkspaceForm[] = [
    {
      id: "1",
      name: "Campaign Feedback Survey",
      description: "Collect feedback on our latest marketing campaign",
      status: "published",
      responses: 234,
      lastEdited: "2 hours ago",
      collaborators: ["sarah@company.com", "mike@company.com"],
    },
    {
      id: "2",
      name: "Lead Generation Form",
      description: "Capture leads from our website visitors",
      status: "published",
      responses: 89,
      lastEdited: "1 day ago",
      collaborators: ["sarah@company.com", "emily@company.com"],
    },
    {
      id: "3",
      name: "Event Registration",
      description: "Registration form for upcoming product launch",
      status: "draft",
      responses: 0,
      lastEdited: "3 hours ago",
      collaborators: ["mike@company.com"],
    },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3 text-amber-600" />;
      case "admin":
        return <Settings className="h-3 w-3 text-blue-600" />;
      case "editor":
        return <Edit3 className="h-3 w-3 text-emerald-600" />;
      case "viewer":
        return <Eye className="h-3 w-3 text-gray-600" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      owner:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      admin: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      editor:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
      viewer: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400",
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      published:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
      draft:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      archived: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400",
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold">Workspaces</h1>
            <p className="text-sm text-muted-foreground">
              Collaborate on forms with your team
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        </div>
      </div>

      <ComingSoonOverlay
        message="Team Collaboration Coming Soon!"
        description="We're building powerful workspace features for seamless team collaboration on forms."
        blurIntensity="blur-sm"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <Tabs defaultValue="workspaces" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="workspaces" className="gap-2">
                <Users className="h-4 w-4" />
                My Workspaces
              </TabsTrigger>
              <TabsTrigger value="shared-forms" className="gap-2">
                <FileText className="h-4 w-4" />
                Shared Forms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workspaces" className="flex-1 overflow-hidden">
              <div className="space-y-6 h-full">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search workspaces..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Workspaces Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto">
                  {workspaces.map((workspace) => (
                    <Card
                      key={workspace.id}
                      className="hover:shadow-lg transition-all hover:scale-[1.02] duration-200 cursor-pointer"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {workspace.name}
                              <Badge
                                className={getRoleBadgeColor(workspace.role)}
                              >
                                {getRoleIcon(workspace.role)}
                                {workspace.role}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {workspace.description}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Members
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Leave Workspace
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">
                                {workspace.memberCount}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Members
                              </div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-emerald-600">
                                {workspace.formsCount}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Forms
                              </div>
                            </div>
                          </div>

                          {/* Members Preview */}
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              Recent Members
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {workspace.members.slice(0, 3).map((member) => (
                                  <Avatar
                                    key={member.id}
                                    className="h-8 w-8 border-2 border-background"
                                  >
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              {workspace.memberCount > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{workspace.memberCount - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created {workspace.createdAt}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Active {workspace.lastActivity}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="shared-forms"
              className="flex-1 overflow-hidden"
            >
              <div className="space-y-6 h-full">
                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search shared forms..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Forms Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                  {workspaceForms.map((form) => (
                    <Card
                      key={form.id}
                      className="hover:shadow-lg transition-all hover:scale-[1.02] duration-200 cursor-pointer"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {form.name}
                              <Badge
                                className={getStatusBadgeColor(form.status)}
                              >
                                {form.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {form.description}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Form
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Responses
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-emerald-600">
                                {form.responses}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Responses
                              </div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">
                                {form.collaborators.length}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Collaborators
                              </div>
                            </div>
                          </div>

                          {/* Collaborators */}
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              Collaborators
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {form.collaborators
                                  .slice(0, 3)
                                  .map((email, index) => (
                                    <Avatar
                                      key={index}
                                      className="h-8 w-8 border-2 border-background"
                                    >
                                      <AvatarFallback className="text-xs">
                                        {email
                                          .split("@")[0]
                                          .slice(0, 2)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                              </div>
                              {form.collaborators.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{form.collaborators.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div>Last edited {form.lastEdited}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
