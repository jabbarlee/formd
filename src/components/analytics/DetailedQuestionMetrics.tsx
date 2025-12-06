/**
 * Detailed Question Metrics Component
 * Displays comprehensive question-level analytics including time, drop-offs, and navigation patterns
 */

"use client";

import { useState } from "react";
import { QuestionAnalyticsDetailed } from "@/lib/types/analytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  TrendingDown,
  Edit,
  AlertTriangle,
  Navigation,
  ArrowRight,
  ArrowLeft,
  Move,
  BarChart3,
} from "lucide-react";

interface DetailedQuestionMetricsProps {
  questions: QuestionAnalyticsDetailed[];
}

export function DetailedQuestionMetrics({
  questions,
}: DetailedQuestionMetricsProps) {
  const formatTime = (seconds: number): string => {
    if (!seconds || seconds === 0) return "0s";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  };

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">
            No Question Data Available
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Question analytics will appear here once you have responses with
            interaction tracking data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex-col space-y-4">
      {questions.map((question, index) => {
        // Check if this is detailed data or basic data
        const hasDetailedMetrics = question.averageTimeToAnswer !== undefined;

        // Determine available tabs
        const availableTabs = [];
        if (hasDetailedMetrics) availableTabs.push("time");
        if (hasDetailedMetrics && question.dropOffCount > 0)
          availableTabs.push("dropoff");
        if (hasDetailedMetrics && question.skipCount > 0)
          availableTabs.push("skip");
        if (hasDetailedMetrics) availableTabs.push("quality");
        if (
          hasDetailedMetrics &&
          question.navigationPatterns &&
          (question.navigationPatterns.forward > 0 ||
            question.navigationPatterns.backward > 0 ||
            question.navigationPatterns.jump > 0)
        ) {
          availableTabs.push("navigation");
        }
        if (question.optionBreakdown && question.optionBreakdown.length > 0)
          availableTabs.push("distribution");
        if (question.sentimentBreakdown) availableTabs.push("sentiment");

        return (
          <Card
            key={question.questionId}
            className="bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-950"
          >
            <CardHeader className="pb-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-bold leading-tight flex-1">
                    Q{index + 1}: {question.questionTitle}
                  </CardTitle>
                  {hasDetailedMetrics && (
                    <Badge
                      variant="default"
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs h-5 flex-shrink-0"
                    >
                      Detailed
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <Badge variant="secondary" className="text-xs h-5">
                    {question.questionType}
                  </Badge>
                  <span className="text-muted-foreground">
                    {question.responseCount} responses
                  </span>
                  {question.skipCount > 0 && (
                    <span className="text-muted-foreground">
                      • {question.skipCount} skipped
                    </span>
                  )}
                  {question.viewCount > 0 && (
                    <span className="text-muted-foreground">
                      • {question.viewCount} views
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {availableTabs.length > 0 && (
                <Tabs defaultValue={availableTabs[0]} className="w-full">
                  <TabsList
                    className="grid w-full"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(
                        availableTabs.length,
                        4
                      )}, 1fr)`,
                    }}
                  >
                    {availableTabs.includes("time") && (
                      <TabsTrigger value="time" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Time
                      </TabsTrigger>
                    )}
                    {availableTabs.includes("dropoff") && (
                      <TabsTrigger value="dropoff" className="text-xs">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Drop-off
                      </TabsTrigger>
                    )}
                    {availableTabs.includes("skip") && (
                      <TabsTrigger value="skip" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Skip
                      </TabsTrigger>
                    )}
                    {availableTabs.includes("quality") && (
                      <TabsTrigger value="quality" className="text-xs">
                        <Edit className="h-3 w-3 mr-1" />
                        QualityAns
                      </TabsTrigger>
                    )}
                    {availableTabs.includes("navigation") && (
                      <TabsTrigger value="navigation" className="text-xs">
                        <Navigation className="h-3 w-3 mr-1" />
                        Nav
                      </TabsTrigger>
                    )}
                    {availableTabs.includes("distribution") && (
                      <TabsTrigger value="distribution" className="text-xs">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Answers
                      </TabsTrigger>
                    )}
                    {availableTabs.includes("sentiment") && (
                      <TabsTrigger value="sentiment" className="text-xs">
                        Sentiment
                      </TabsTrigger>
                    )}
                  </TabsList>
                  {/* Time Metrics Tab */}
                  {availableTabs.includes("time") && (
                    <TabsContent value="time" className="mt-3">
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Avg Time
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {formatTime(question.averageTimeToAnswer || 0)}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Median
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {formatTime(question.medianTimeToAnswer || 0)}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Fast (&lt;10s)
                            </p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {question.timeDistribution?.fast || 0}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Slow (&gt;60s)
                            </p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                              {question.timeDistribution?.slow || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Drop-off Analysis Tab */}
                  {availableTabs.includes("dropoff") && (
                    <TabsContent value="dropoff" className="mt-3">
                      <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-900">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Drop-off Rate
                            </span>
                            <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                              {question.dropOffRate?.toFixed(1) || 0}%
                            </span>
                          </div>
                          <Progress
                            value={question.dropOffRate || 0}
                            className="h-3 bg-red-100 dark:bg-red-900/50"
                          />
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {question.dropOffCount} users abandoned the form at
                            this question
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Skip Analysis Tab */}
                  {availableTabs.includes("skip") && (
                    <TabsContent value="skip" className="mt-3">
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-900">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Skip Rate
                            </span>
                            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                              {question.skipRate?.toFixed(1) || 0}%
                            </span>
                          </div>
                          <Progress
                            value={question.skipRate || 0}
                            className="h-3 bg-amber-100 dark:bg-amber-900/50"
                          />
                          {question.skipReasons &&
                            question.skipReasons.length > 0 && (
                              <div className="mt-3 space-y-2 bg-white dark:bg-gray-950 rounded-md p-3">
                                <p className="text-xs font-semibold">
                                  Skip Reasons:
                                </p>
                                {question.skipReasons.map((reason) => (
                                  <div
                                    key={reason.reason}
                                    className="flex items-center justify-between text-sm py-1"
                                  >
                                    <span className="text-muted-foreground capitalize">
                                      {reason.reason}
                                    </span>
                                    <span className="font-bold">
                                      {reason.count} (
                                      {reason.percentage.toFixed(0)}%)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Answer Quality Tab */}
                  {availableTabs.includes("quality") && (
                    <TabsContent value="quality" className="mt-3">
                      <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-4 border border-violet-200 dark:border-violet-900">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Avg Edits
                            </p>
                            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                              {question.averageEditCount?.toFixed(1) || "0.0"}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              First Try
                            </p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {question.retryDistribution?.firstTry || 0}
                            </p>
                          </div>
                          {question.validationErrorRate > 0 && (
                            <div className="bg-white dark:bg-gray-950 rounded-md p-3 col-span-2">
                              <p className="text-xs text-muted-foreground flex items-center mb-1">
                                <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                                Error Rate
                              </p>
                              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {question.validationErrorRate.toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Navigation Patterns Tab */}
                  {availableTabs.includes("navigation") && (
                    <TabsContent value="navigation" className="mt-3">
                      <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-900">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white dark:bg-gray-950 rounded-md p-3 text-center">
                            <ArrowRight className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground mb-1">
                              Forward
                            </p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {question.navigationPatterns.forward}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-950 rounded-md p-3 text-center">
                            <ArrowLeft className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground mb-1">
                              Backward
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {question.navigationPatterns.backward}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-950 rounded-md p-3 text-center">
                            <Move className="h-6 w-6 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground mb-1">
                              Jump
                            </p>
                            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                              {question.navigationPatterns.jump}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Answer Distribution Tab */}
                  {availableTabs.includes("distribution") && (
                    <TabsContent value="distribution" className="mt-3">
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-900">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {question.optionBreakdown?.map((option, idx) => (
                            <div
                              key={`${question.questionId}-option-${idx}`}
                              className="bg-white dark:bg-gray-950 rounded-md p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium truncate flex-1 mr-2">
                                  {option.option}
                                </span>
                                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                  {option.count} ({option.percentage.toFixed(1)}
                                  %)
                                </span>
                              </div>
                              <Progress
                                value={option.percentage}
                                className="h-2 bg-emerald-100 dark:bg-emerald-900/50"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Sentiment Analysis Tab */}
                  {availableTabs.includes("sentiment") &&
                    question.sentimentBreakdown && (
                      <TabsContent value="sentiment" className="mt-3">
                        <div className="bg-slate-50 dark:bg-slate-950/20 rounded-lg p-4 border border-slate-200 dark:border-slate-900">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-emerald-100 dark:bg-emerald-950 rounded-md p-3 border border-emerald-200 dark:border-emerald-900 text-center">
                              <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1">
                                Positive
                              </p>
                              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {question.sentimentBreakdown?.positive || 0}
                              </p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-3 border border-slate-200 dark:border-slate-800 text-center">
                              <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
                                Neutral
                              </p>
                              <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                                {question.sentimentBreakdown?.neutral || 0}
                              </p>
                            </div>
                            <div className="bg-red-100 dark:bg-red-950 rounded-md p-3 border border-red-200 dark:border-red-900 text-center">
                              <p className="text-xs text-red-700 dark:text-red-300 mb-1">
                                Negative
                              </p>
                              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {question.sentimentBreakdown?.negative || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    )}
                </Tabs>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
