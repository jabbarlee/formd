"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Loader2,
  BarChart3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnalyticsHeader } from "@/components/layout/headers";
import { ResponseTrendChart } from "@/components/charts/ResponseTrendChart";
import { TimeRangeSelector } from "@/components/analytics/TimeRangeSelector";
import { MetricCard } from "@/components/analytics/MetricCard";
import { DetailedQuestionMetrics } from "@/components/analytics/DetailedQuestionMetrics";
import {
  useFormAnalytics,
  useQuestionAnalyticsDetailed,
} from "@/hooks/useAnalytics";
import { TimeRangeFilter } from "@/lib/types/analytics";

export default function FormAnalyticsPage() {
  const params = useParams();
  const formId = params.id as string;
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>({ range: "30d" });
  const [questionViewMode, setQuestionViewMode] = useState<"all" | "paginated">(
    "all"
  );
  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
  const questionsPerPage = 1;

  const {
    data: analytics,
    loading,
    error,
  } = useFormAnalytics(formId, timeRange);

  // Fetch detailed question analytics separately
  const { data: detailedQuestions, loading: questionsLoading } =
    useQuestionAnalyticsDetailed(formId, timeRange);

  // Helper function to format time in minutes
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")} min`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with integrated time range selector and export */}
      <div className="flex-shrink-0">
        <AnalyticsHeader
          formId={formId}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          title={
            analytics?.formTitle
              ? `${analytics.formTitle} - Analytics`
              : "Form Analytics"
          }
          description="Track performance and gain insights from your form"
        />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 p-6">
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
                change={analytics.overview.completionRateChange}
                changeLabel="from previous period"
                icon={TrendingUp}
                iconColor="text-violet-600"
                iconBgColor="bg-violet-50 dark:bg-violet-950/20"
                borderColor="border-l-violet-500"
                gradientFrom="from-violet-50/50"
              />

              <MetricCard
                title="Avg Time"
                value={formatTime(analytics.overview.averageTime)}
                change={analytics.overview.averageTimeChange}
                changeLabel="from previous period"
                icon={Clock}
                iconColor="text-amber-600"
                iconBgColor="bg-amber-50 dark:bg-amber-950/20"
                borderColor="border-l-amber-500"
                gradientFrom="from-amber-50/50"
              />
            </div>

            {/* Chart Sections */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview" className="pl-4 pr-4">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="devices" className="pl-4 pr-4">
                  <Monitor className="h-4 w-4" />
                  Devices
                </TabsTrigger>
                <TabsTrigger value="geography" className="pl-4 pr-4">
                  <Globe className="h-4 w-4" />
                  Geography
                </TabsTrigger>
                <TabsTrigger value="questions" className="pl-4 pr-4">
                  <HelpCircle className="h-4 w-4" />
                  Questions
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Response Trend Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Response Trend</CardTitle>
                      <CardDescription>Activity over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] w-full">
                        <ResponseTrendChart data={analytics.trends} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Completion Funnel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Completion Funnel</CardTitle>
                      <CardDescription>Drop-off at each stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.funnel.map((stage, index) => (
                          <div key={stage.stage}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                {stage.label}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {stage.count.toLocaleString()} (
                                {stage.percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full shadow-sm ${
                                  index === 0
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                    : index === analytics.funnel.length - 1
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                    : "bg-gradient-to-r from-violet-500 to-violet-600"
                                }`}
                                style={{ width: `${stage.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Devices Tab */}
              <TabsContent value="devices" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                    <CardDescription>Responses by device type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Desktop</span>
                          </div>
                          <span className="text-sm text-blue-600 font-medium">
                            {analytics.devices.desktop.count} responses (
                            {analytics.devices.desktop.percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"
                            style={{
                              width: `${analytics.devices.desktop.percentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-violet-600" />
                            <span className="text-sm font-medium">Mobile</span>
                          </div>
                          <span className="text-sm text-violet-600 font-medium">
                            {analytics.devices.mobile.count} responses (
                            {analytics.devices.mobile.percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-violet-600 shadow-sm"
                            style={{
                              width: `${analytics.devices.mobile.percentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Tablet className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium">Tablet</span>
                          </div>
                          <span className="text-sm text-amber-600 font-medium">
                            {analytics.devices.tablet.count} responses (
                            {analytics.devices.tablet.percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm"
                            style={{
                              width: `${analytics.devices.tablet.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Geography Tab */}
              <TabsContent value="geography" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>Responses by location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.geography.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="font-semibold">Top Countries</h3>
                        {analytics.geography.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium">
                              {item.country}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {item.count} ({item.percentage.toFixed(0)}%)
                              </span>
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600"
                                  style={{
                                    width: `${Math.min(
                                      item.percentage * 2.5,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No geographic data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Questions Tab */}
              <TabsContent value="questions" className="space-y-4 mt-4">
                {questionsLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                ) : detailedQuestions && detailedQuestions.length > 0 ? (
                  <>
                    {/* View Mode Selector */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          View Mode:
                        </span>
                        <Select
                          value={questionViewMode}
                          onValueChange={(value: "all" | "paginated") => {
                            setQuestionViewMode(value);
                            setCurrentQuestionPage(1);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select view mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Questions</SelectItem>
                            <SelectItem value="paginated">
                              One by One
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {questionViewMode === "paginated" && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Question {currentQuestionPage} of{" "}
                            {detailedQuestions.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Questions Display */}
                    <div className="flex flex-col items-center">
                      <DetailedQuestionMetrics
                        questions={
                          questionViewMode === "all"
                            ? detailedQuestions
                            : detailedQuestions.slice(
                                (currentQuestionPage - 1) * questionsPerPage,
                                currentQuestionPage * questionsPerPage
                              )
                        }
                      />
                    </div>

                    {/* Pagination Controls */}
                    {questionViewMode === "paginated" &&
                      detailedQuestions.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentQuestionPage(
                                Math.max(1, currentQuestionPage - 1)
                              )
                            }
                            disabled={currentQuestionPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>

                          {/* Breadcrumb Navigation */}
                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: detailedQuestions.length },
                              (_, i) => i + 1
                            ).map((page) => {
                              // Show first, last, current, and nearby pages
                              const shouldShow =
                                page === 1 ||
                                page === detailedQuestions.length ||
                                Math.abs(page - currentQuestionPage) <= 1;

                              const shouldShowEllipsis =
                                (page === 2 && currentQuestionPage > 3) ||
                                (page === detailedQuestions.length - 1 &&
                                  currentQuestionPage <
                                    detailedQuestions.length - 2);

                              if (shouldShowEllipsis) {
                                return (
                                  <span
                                    key={page}
                                    className="px-2 text-muted-foreground"
                                  >
                                    ...
                                  </span>
                                );
                              }

                              if (!shouldShow) {
                                return null;
                              }

                              return (
                                <Button
                                  key={page}
                                  variant={
                                    page === currentQuestionPage
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => setCurrentQuestionPage(page)}
                                >
                                  {page}
                                </Button>
                              );
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentQuestionPage(
                                Math.min(
                                  detailedQuestions.length,
                                  currentQuestionPage + 1
                                )
                              )
                            }
                            disabled={
                              currentQuestionPage === detailedQuestions.length
                            }
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      )}
                  </>
                ) : analytics?.questions && analytics.questions.length > 0 ? (
                  <>
                    {/* View Mode Selector */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          View Mode:
                        </span>
                        <Select
                          value={questionViewMode}
                          onValueChange={(value: "all" | "paginated") => {
                            setQuestionViewMode(value);
                            setCurrentQuestionPage(1);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select view mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Questions</SelectItem>
                            <SelectItem value="paginated">
                              One by One
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {questionViewMode === "paginated" && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Question {currentQuestionPage} of{" "}
                            {analytics.questions.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Fallback to basic question analytics if detailed not available */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Question-by-Question Analytics</CardTitle>
                        <CardDescription>
                          Detailed breakdown for each question
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {(questionViewMode === "all"
                            ? analytics.questions
                            : analytics.questions.slice(
                                (currentQuestionPage - 1) * questionsPerPage,
                                currentQuestionPage * questionsPerPage
                              )
                          ).map((question, index) => {
                            const actualIndex =
                              questionViewMode === "all"
                                ? index
                                : (currentQuestionPage - 1) * questionsPerPage +
                                  index;
                            return (
                              <AccordionItem
                                key={question.questionId}
                                value={question.questionId}
                              >
                                <AccordionTrigger>
                                  <div className="flex items-center justify-between w-full pr-4">
                                    <span className="font-medium">
                                      Q{actualIndex + 1}:{" "}
                                      {question.questionTitle}
                                    </span>
                                    <Badge variant="secondary">
                                      {question.responseCount} responses
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3 pt-2">
                                    {question.optionBreakdown &&
                                      question.optionBreakdown.length > 0 && (
                                        <>
                                          {question.optionBreakdown.map(
                                            (option, i) => (
                                              <div key={i}>
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="text-sm">
                                                    {option.option}
                                                  </span>
                                                  <span className="text-sm text-muted-foreground">
                                                    {option.count} (
                                                    {option.percentage.toFixed(
                                                      0
                                                    )}
                                                    %)
                                                  </span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                  <div
                                                    className="h-full bg-indigo-600"
                                                    style={{
                                                      width: `${option.percentage}%`,
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </>
                                      )}

                                    {question.sentimentBreakdown && (
                                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm font-medium mb-2">
                                          Sentiment Analysis
                                        </p>
                                        <div className="flex gap-4 text-sm">
                                          <span className="text-emerald-600">
                                            Positive:{" "}
                                            {
                                              question.sentimentBreakdown
                                                .positive
                                            }
                                          </span>
                                          <span className="text-muted-foreground">
                                            Neutral:{" "}
                                            {
                                              question.sentimentBreakdown
                                                .neutral
                                            }
                                          </span>
                                          <span className="text-red-600">
                                            Negative:{" "}
                                            {
                                              question.sentimentBreakdown
                                                .negative
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {question.skipCount > 0 && (
                                      <p className="text-sm text-muted-foreground mt-2">
                                        Skipped by {question.skipCount}{" "}
                                        respondents
                                      </p>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </CardContent>
                    </Card>

                    {/* Pagination Controls */}
                    {questionViewMode === "paginated" &&
                      analytics.questions.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentQuestionPage(
                                Math.max(1, currentQuestionPage - 1)
                              )
                            }
                            disabled={currentQuestionPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>

                          {/* Breadcrumb Navigation */}
                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: analytics.questions.length },
                              (_, i) => i + 1
                            ).map((page) => {
                              // Show first, last, current, and nearby pages
                              const shouldShow =
                                page === 1 ||
                                page === analytics.questions.length ||
                                Math.abs(page - currentQuestionPage) <= 1;

                              const shouldShowEllipsis =
                                (page === 2 && currentQuestionPage > 3) ||
                                (page === analytics.questions.length - 1 &&
                                  currentQuestionPage <
                                    analytics.questions.length - 2);

                              if (shouldShowEllipsis) {
                                return (
                                  <span
                                    key={page}
                                    className="px-2 text-muted-foreground"
                                  >
                                    ...
                                  </span>
                                );
                              }

                              if (!shouldShow) {
                                return null;
                              }

                              return (
                                <Button
                                  key={page}
                                  variant={
                                    page === currentQuestionPage
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => setCurrentQuestionPage(page)}
                                >
                                  {page}
                                </Button>
                              );
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentQuestionPage(
                                Math.min(
                                  analytics.questions.length,
                                  currentQuestionPage + 1
                                )
                              )
                            }
                            disabled={
                              currentQuestionPage === analytics.questions.length
                            }
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Question Data Yet
                      </h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        Question analytics will appear here once your form
                        starts receiving responses.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Empty State */}
        {analytics && !loading && analytics.overview.totalViews === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Analytics Data Yet
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Analytics will appear here once your form starts receiving views
                and responses. Share your form to start collecting data!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      {/* End Content */}
    </div>
  );
}
