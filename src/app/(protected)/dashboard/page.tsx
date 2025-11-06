import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, TrendingUp, Clock } from "lucide-react";
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
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Responses
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,429</div>
            <p className="text-xs text-muted-foreground">
              +180 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Completion Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 min</div>
            <p className="text-xs text-muted-foreground">
              -0.5 min from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>Your most recent form projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Customer Feedback Survey",
                  responses: 234,
                  status: "published",
                },
                {
                  name: "Employee Satisfaction",
                  responses: 89,
                  status: "published",
                },
                {
                  name: "Product Research",
                  responses: 156,
                  status: "published",
                },
                { name: "Event Registration", responses: 0, status: "draft" },
              ].map((form, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{form.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {form.responses} responses
                    </p>
                  </div>
                  <Badge
                    variant={
                      form.status === "published" ? "default" : "secondary"
                    }
                  >
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
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>
              Recommended actions to improve your forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Optimize question order",
                  description:
                    "Reorder questions in Customer Feedback Survey for better flow",
                },
                {
                  title: "Add logic branching",
                  description:
                    "Consider adding conditional logic to Product Research",
                },
                {
                  title: "Improve completion rate",
                  description:
                    "Employee Satisfaction has 45% drop-off at question 5",
                },
              ].map((suggestion, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-medium text-sm">{suggestion.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Responses</CardTitle>
          <CardDescription>
            Latest form submissions across all your forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                form: "Customer Feedback Survey",
                respondent: "Sarah Johnson",
                time: "2 minutes ago",
              },
              {
                form: "Product Research",
                respondent: "Michael Chen",
                time: "15 minutes ago",
              },
              {
                form: "Employee Satisfaction",
                respondent: "Emily Rodriguez",
                time: "1 hour ago",
              },
              {
                form: "Customer Feedback Survey",
                respondent: "David Park",
                time: "2 hours ago",
              },
            ].map((response, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{response.respondent}</p>
                  <p className="text-xs text-muted-foreground">
                    {response.form}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{response.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
