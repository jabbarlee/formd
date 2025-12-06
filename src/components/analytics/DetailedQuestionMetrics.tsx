/**
 * Detailed Question Metrics Component
 * Displays comprehensive question-level analytics including time, drop-offs, and navigation patterns
 */

"use client";

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
import { Separator } from "@/components/ui/separator";
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
    <div className="space-y-4">
      {questions.map((question, index) => {
        // Check if this is detailed data or basic data
        const hasDetailedMetrics = question.averageTimeToAnswer !== undefined;

        return (
          <Card
            key={question.questionId}
            className="border-l-4 border-l-indigo-500 w-auto"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-base font-semibold">
                      Q{index + 1}: {question.questionTitle}
                    </CardTitle>
                    {hasDetailedMetrics && (
                      <Badge
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs h-5"
                      >
                        Detailed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {question.questionType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {question.responseCount} responses
                    </span>
                    {question.skipCount > 0 && (
                      <span className="text-sm text-muted-foreground">
                        • {question.skipCount} skipped
                      </span>
                    )}
                    {question.viewCount > 0 && (
                      <span className="text-sm text-muted-foreground">
                        • {question.viewCount} views
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Quick Stats Summary */}
              {hasDetailedMetrics && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Avg Time
                        </p>
                        <p className="text-sm font-bold">
                          {formatTime(question.averageTimeToAnswer || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-xs text-muted-foreground">Answers</p>
                        <p className="text-sm font-bold">
                          {question.answerCount || question.responseCount}
                        </p>
                      </div>
                    </div>
                    {question.dropOffRate > 0 && (
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Drop-off
                          </p>
                          <p className="text-sm font-bold">
                            {question.dropOffRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                    {question.validationErrorRate > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Errors
                          </p>
                          <p className="text-sm font-bold">
                            {question.validationErrorRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Time Metrics */}
              {hasDetailedMetrics && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
                  <h4 className="text-sm font-semibold mb-3 flex items-center text-blue-900 dark:text-blue-100">
                    <Clock className="mr-2 h-4 w-4" />
                    Time Metrics
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Avg Time
                      </p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatTime(question.averageTimeToAnswer || 0)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Median
                      </p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatTime(question.medianTimeToAnswer || 0)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Fast (&lt;10s)
                      </p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {question.timeDistribution?.fast || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Slow (&gt;60s)
                      </p>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                        {question.timeDistribution?.slow || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Drop-off Analysis */}
              {hasDetailedMetrics && question.dropOffCount > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-100 dark:border-red-900">
                  <h4 className="text-sm font-semibold mb-3 flex items-center text-red-900 dark:text-red-100">
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Drop-off Analysis
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Drop-off Rate</span>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">
                        {question.dropOffRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <Progress
                      value={question.dropOffRate || 0}
                      className="h-2 bg-red-100 dark:bg-red-900/50"
                    />
                    <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                      {question.dropOffCount} users abandoned the form at this
                      question
                    </p>
                  </div>
                </div>
              )}

              {/* Skip Analysis */}
              {hasDetailedMetrics && question.skipCount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-100 dark:border-amber-900">
                  <h4 className="text-sm font-semibold mb-3 text-amber-900 dark:text-amber-100">
                    Skip Analysis
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Skip Rate</span>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {question.skipRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <Progress
                      value={question.skipRate || 0}
                      className="h-2 bg-amber-100 dark:bg-amber-900/50"
                    />
                    {question.skipReasons &&
                      question.skipReasons.length > 0 && (
                        <div className="mt-3 space-y-1 bg-white dark:bg-gray-950 rounded-md p-2">
                          <p className="text-xs font-semibold mb-2">
                            Skip Reasons:
                          </p>
                          {question.skipReasons.map((reason) => (
                            <div
                              key={reason.reason}
                              className="flex items-center justify-between text-xs py-1"
                            >
                              <span className="text-muted-foreground capitalize font-medium">
                                {reason.reason}
                              </span>
                              <span className="font-semibold">
                                {reason.count} ({reason.percentage.toFixed(0)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Answer Quality */}
              {hasDetailedMetrics && (
                <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-4 border border-violet-100 dark:border-violet-900">
                  <h4 className="text-sm font-semibold mb-3 flex items-center text-violet-900 dark:text-violet-100">
                    <Edit className="mr-2 h-4 w-4" />
                    Answer Quality
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Avg Edits
                      </p>
                      <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                        {question.averageEditCount?.toFixed(1) || "0.0"}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        First Try
                      </p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {question.retryDistribution?.firstTry || 0}
                      </p>
                    </div>
                    {question.validationErrorRate > 0 && (
                      <div className="bg-white dark:bg-gray-950 rounded-md p-3">
                        <p className="text-xs text-muted-foreground flex items-center mb-1">
                          <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                          Error Rate
                        </p>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          {question.validationErrorRate.toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Patterns */}
              {hasDetailedMetrics &&
                question.navigationPatterns &&
                (question.navigationPatterns.forward > 0 ||
                  question.navigationPatterns.backward > 0 ||
                  question.navigationPatterns.jump > 0) && (
                  <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-4 border border-cyan-100 dark:border-cyan-900">
                    <h4 className="text-sm font-semibold mb-3 flex items-center text-cyan-900 dark:text-cyan-100">
                      <Navigation className="mr-2 h-4 w-4" />
                      Navigation Patterns
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white dark:bg-gray-950 rounded-md p-3 flex items-center space-x-2">
                        <ArrowRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Forward
                          </p>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {question.navigationPatterns.forward}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-950 rounded-md p-3 flex items-center space-x-2">
                        <ArrowLeft className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Backward
                          </p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {question.navigationPatterns.backward}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-950 rounded-md p-3 flex items-center space-x-2">
                        <Move className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Jump</p>
                          <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                            {question.navigationPatterns.jump}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Option Breakdown (for choice questions) */}
              {question.optionBreakdown &&
                question.optionBreakdown.length > 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900">
                    <h4 className="text-sm font-semibold mb-3 text-emerald-900 dark:text-emerald-100">
                      Answer Distribution
                    </h4>
                    <div className="space-y-2">
                      {question.optionBreakdown.map((option, idx) => (
                        <div
                          key={`${question.questionId}-option-${idx}`}
                          className="bg-white dark:bg-gray-950 rounded-md p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium truncate flex-1 mr-2">
                              {option.option}
                            </span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {option.count} ({option.percentage.toFixed(1)}%)
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
                )}

              {/* Sentiment Breakdown (for text questions) */}
              {question.sentimentBreakdown && (
                <div className="bg-slate-50 dark:bg-slate-950/20 rounded-lg p-4 border border-slate-100 dark:border-slate-900">
                  <h4 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">
                    Sentiment Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-950 rounded-md p-3 border border-emerald-200 dark:border-emerald-900">
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1">
                        Positive
                      </p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {question.sentimentBreakdown.positive}
                      </p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-3 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
                        Neutral
                      </p>
                      <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                        {question.sentimentBreakdown.neutral}
                      </p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-950 rounded-md p-3 border border-red-200 dark:border-red-900">
                      <p className="text-xs text-red-700 dark:text-red-300 mb-1">
                        Negative
                      </p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {question.sentimentBreakdown.negative}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
