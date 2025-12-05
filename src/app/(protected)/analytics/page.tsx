"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Clock,
  Loader2,
  FileText,
  ArrowRight,
} from "lucide-react";
import { AnalyticsHeader } from "@/components/layout/headers";
import { ResponseTrendChart } from "@/components/charts/ResponseTrendChart";
import { TimeRangeSelector } from "@/components/analytics/TimeRangeSelector";
import { MetricCard } from "@/components/analytics/MetricCard";
import { useWorkspaceAnalytics } from "@/hooks/useAnalytics";
import { TimeRangeFilter } from "@/lib/types/analytics";
import { Button } from "@/components/ui/button";

export default function WorkspaceAnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>({ range: "30d" });
  const { data: analytics, loading, error } = useWorkspaceAnalytics(timeRange);

  // Helper function to format time in minutes
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")} min`;
  };

  return (
    <div>
      <AnalyticsHeader />

      <div className="space-y-6 p-6">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Workspace Analytics
            </h2>
            <p className="text-muted-foreground">
              Aggregated performance across all your forms
            </p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error loading analytics: {error.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analytics Content */}
        {analytics && !loading && (
          <>
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Views"
                value={analytics.overview.totalViews.toLocaleString()}
                change={analytics.overview.viewsChange}
                changeLabel="from previous period"
                icon={Users}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-50 dark:bg-blue-950/20"
                borderColor="border-l-blue-500"
                gradientFrom="from-blue-50/50"
              />

              <MetricCard
                title="Total Responses"
                value={analytics.overview.totalResponses.toLocaleString()}
                change={analytics.overview.responsesChange}
                changeLabel="from previous period"
                icon={TrendingUp}
                iconColor="text-emerald-600"
                iconBgColor="bg-emerald-50 dark:bg-emerald-950/20"
                borderColor="border-l-emerald-500"
                gradientFrom="from-emerald-50/50"
              />

              <MetricCard
                title="Completion Rate"
                value={`${analytics.overview.completionRate}%`}
                changeLabel="across all forms"
                icon={TrendingUp}
                iconColor="text-violet-600"
                iconBgColor="bg-violet-50 dark:bg-violet-950/20"
                borderColor="border-l-violet-500"
                gradientFrom="from-violet-50/50"
              />

              <MetricCard
                title="Avg Time"
                value={formatTime(analytics.overview.averageTime)}
                changeLabel="across all forms"
                icon={Clock}
                iconColor="text-amber-600"
                iconBgColor="bg-amber-50 dark:bg-amber-950/20"
                borderColor="border-l-amber-500"
                gradientFrom="from-amber-50/50"
              />
            </div>

            {/* Forms Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {analytics.totalForms}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">
                    {analytics.activeForms}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inactive Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-muted-foreground">
                    {analytics.totalForms - analytics.activeForms}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Response Trends</CardTitle>
                <CardDescription>
                  Aggregated activity across all forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponseTrendChart data={analytics.trends} />
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Forms */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Forms</CardTitle>
                <CardDescription>Forms with the most responses</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topForms.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topForms.map((form, index) => (
                      <div
                        key={form.formId}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/forms/${form.formId}/analytics`)
                        }
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {form.formTitle}
                            </h4>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span>{form.views.toLocaleString()} views</span>
                              <span>
                                {form.responses.toLocaleString()} responses
                              </span>
                              <span>{form.completionRate}% completion</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No forms found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {analytics && !loading && analytics.totalForms === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Forms Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Create your first form to start collecting responses and viewing
                analytics.
              </p>
              <Button onClick={() => router.push("/forms")}>Go to Forms</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
