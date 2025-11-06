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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Grid3x3,
  List,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { FormsHeader } from "@/components/layout/headers";

export default function FormsPage() {
  const forms = [
    {
      id: 1,
      name: "Customer Feedback Survey",
      description: "Collect customer satisfaction feedback",
      responses: 234,
      status: "published",
      lastModified: "2 hours ago",
    },
    {
      id: 2,
      name: "Employee Satisfaction",
      description: "Annual employee engagement survey",
      responses: 89,
      status: "published",
      lastModified: "1 day ago",
    },
    {
      id: 3,
      name: "Product Research",
      description: "New product feature feedback",
      responses: 156,
      status: "published",
      lastModified: "3 days ago",
    },
    {
      id: 4,
      name: "Event Registration",
      description: "Q1 company event registration form",
      responses: 0,
      status: "draft",
      lastModified: "1 week ago",
    },
    {
      id: 5,
      name: "Contact Form",
      description: "Website contact inquiry form",
      responses: 67,
      status: "published",
      lastModified: "2 weeks ago",
    },
    {
      id: 6,
      name: "Newsletter Signup",
      description: "Email newsletter subscription",
      responses: 423,
      status: "published",
      lastModified: "1 month ago",
    },
  ];

  return (
    <div>
      <FormsHeader />

      <div className="space-y-6 p-6">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search forms..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="modified">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modified">Last Modified</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="responses">Responses</SelectItem>
              <SelectItem value="created">Created Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList>
            <TabsTrigger value="grid">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="grid" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <Card
                  key={form.id}
                  className="hover:shadow-lg transition-all hover:border-primary/50 hover:scale-[1.02] duration-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">
                          {form.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {form.description}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Responses</span>
                        <span className="font-semibold text-violet-600">
                          {form.responses}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          className={
                            form.status === "published"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400"
                          }
                        >
                          {form.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Modified</span>
                        <span className="text-muted-foreground">
                          {form.lastModified}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/forms/${form.id}/edit`}>Edit</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/forms/${form.id}/responses`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {forms.map((form) => (
                    <div
                      key={form.id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{form.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {form.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{form.responses} responses</span>
                            <span>•</span>
                            <span>Modified {form.lastModified}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={
                              form.status === "published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {form.status}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/forms/${form.id}/edit`}>Edit</Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/forms/${form.id}/responses`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
