import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  FileText,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/headers";

export default function DashboardPage() {
  return (
    <div>
      <DashboardHeader />

      <div className="space-y-6 p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950">
                <FileText className="h-4 w-4 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-emerald-600 font-medium">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Responses
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,429</div>
              <p className="text-xs text-emerald-600 font-medium">
                +180 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Response Rate
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-emerald-600 font-medium">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Completion Time
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2 min</div>
              <p className="text-xs text-emerald-600 font-medium">
                -0.5 min from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Forms */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950">
                      <FileText className="h-5 w-5 text-violet-600" />
                    </div>
                    Recent Forms
                  </CardTitle>
                  <CardDescription>
                    Your most recent form projects
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-violet-600 hover:text-violet-700 hover:bg-violet-100 dark:hover:bg-violet-950"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Customer Feedback Survey",
                    responses: 234,
                    status: "published",
                    color: "emerald",
                    views: 456,
                  },
                  {
                    name: "Employee Satisfaction",
                    responses: 89,
                    status: "published",
                    color: "blue",
                    views: 123,
                  },
                  {
                    name: "Product Research",
                    responses: 156,
                    status: "published",
                    color: "violet",
                    views: 289,
                  },
                  {
                    name: "Event Registration",
                    responses: 0,
                    status: "draft",
                    color: "amber",
                    views: 12,
                  },
                ].map((form, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1">
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {form.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {form.responses} responses
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {form.views} views
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        form.status === "published"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }
                    >
                      {form.status === "published" && (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      {form.status === "draft" && (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {form.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950">
                      <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                    AI Suggestions
                  </CardTitle>
                  <CardDescription>
                    Recommended actions to improve your forms
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Optimize question order",
                    description:
                      "Reorder questions in Customer Feedback Survey for better flow",
                    icon: TrendingUp,
                    color: "blue",
                  },
                  {
                    title: "Add logic branching",
                    description:
                      "Consider adding conditional logic to Product Research",
                    icon: Lightbulb,
                    color: "amber",
                  },
                  {
                    title: "Improve completion rate",
                    description:
                      "Employee Satisfaction has 45% drop-off at question 5",
                    icon: AlertCircle,
                    color: "rose",
                  },
                ].map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
                    <div
                      className={`p-2 rounded-lg h-fit ${
                        suggestion.color === "blue"
                          ? "bg-blue-100 dark:bg-blue-950"
                          : suggestion.color === "amber"
                          ? "bg-amber-100 dark:bg-amber-950"
                          : "bg-rose-100 dark:bg-rose-950"
                      }`}
                    >
                      <suggestion.icon
                        className={`h-4 w-4 ${
                          suggestion.color === "blue"
                            ? "text-blue-600"
                            : suggestion.color === "amber"
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Responses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950">
                    <Users className="h-5 w-5 text-cyan-600" />
                  </div>
                  Recent Responses
                </CardTitle>
                <CardDescription>
                  Latest form submissions across all your forms
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-100 dark:hover:bg-cyan-950"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  form: "Customer Feedback Survey",
                  respondent: "Sarah Johnson",
                  time: "2 minutes ago",
                  avatar: "SJ",
                  color: "violet",
                },
                {
                  form: "Product Research",
                  respondent: "Michael Chen",
                  time: "15 minutes ago",
                  avatar: "MC",
                  color: "blue",
                },
                {
                  form: "Employee Satisfaction",
                  respondent: "Emily Rodriguez",
                  time: "1 hour ago",
                  avatar: "ER",
                  color: "emerald",
                },
                {
                  form: "Customer Feedback Survey",
                  respondent: "David Park",
                  time: "2 hours ago",
                  avatar: "DP",
                  color: "amber",
                },
              ].map((response, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      className={`h-10 w-10 ${
                        response.color === "violet"
                          ? "bg-violet-100 dark:bg-violet-950"
                          : response.color === "blue"
                          ? "bg-blue-100 dark:bg-blue-950"
                          : response.color === "emerald"
                          ? "bg-emerald-100 dark:bg-emerald-950"
                          : "bg-amber-100 dark:bg-amber-950"
                      }`}
                    >
                      <AvatarFallback
                        className={`${
                          response.color === "violet"
                            ? "text-violet-600"
                            : response.color === "blue"
                            ? "text-blue-600"
                            : response.color === "emerald"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        } font-semibold`}
                      >
                        {response.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {response.respondent}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {response.form}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      {response.time}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
