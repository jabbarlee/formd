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
import {
  Clock,
  TrendingDown,
  Edit,
  AlertTriangle,
  Navigation,
  ArrowRight,
  ArrowLeft,
  Move,
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
    <div className="space-y-6">
      {questions.map((question, index) => {
        // Check if this is detailed data or basic data
        const hasDetailedMetrics = question.averageTimeToAnswer !== undefined;

        return (
          <Card key={question.questionId}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      Q{index + 1}: {question.questionTitle}
                    </CardTitle>
                    {hasDetailedMetrics && (
                      <Badge
                        variant="default"
                        className="bg-emerald-600 text-xs"
                      >
                        Detailed
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    <Badge variant="outline" className="mr-2">
                      {question.questionType}
                    </Badge>
                    {question.responseCount} responses
                    {question.skipCount > 0 &&
                      ` • ${question.skipCount} skipped`}
                    {question.viewCount > 0 && ` • ${question.viewCount} views`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Metrics */}
              {hasDetailedMetrics && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Time Metrics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                      <p className="text-lg font-semibold">
                        {formatTime(question.averageTimeToAnswer || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Median</p>
                      <p className="text-lg font-semibold">
                        {formatTime(question.medianTimeToAnswer || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Fast (&lt;10s)
                      </p>
                      <p className="text-lg font-semibold">
                        {question.timeDistribution?.fast || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Slow (&gt;60s)
                      </p>
                      <p className="text-lg font-semibold">
                        {question.timeDistribution?.slow || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Drop-off Analysis */}
              {hasDetailedMetrics && question.dropOffCount > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <TrendingDown className="mr-2 h-4 w-4 text-destructive" />
                    Drop-off Analysis
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Drop-off Rate</span>
                      <span className="text-sm font-semibold text-destructive">
                        {question.dropOffRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <Progress
                      value={question.dropOffRate || 0}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {question.dropOffCount} users abandoned the form at this
                      question
                    </p>
                  </div>
                </div>
              )}

              {/* Skip Analysis */}
              {hasDetailedMetrics && question.skipCount > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Skip Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Skip Rate</span>
                      <span className="text-sm font-semibold">
                        {question.skipRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <Progress value={question.skipRate || 0} className="h-2" />
                    {question.skipReasons &&
                      question.skipReasons.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-medium">Reasons:</p>
                          {question.skipReasons.map((reason) => (
                            <div
                              key={reason.reason}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="text-muted-foreground capitalize">
                                {reason.reason}
                              </span>
                              <span>
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
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Answer Quality
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Edits</p>
                      <p className="text-lg font-semibold">
                        {question.averageEditCount?.toFixed(1) || "0.0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">First Try</p>
                      <p className="text-lg font-semibold">
                        {question.retryDistribution?.firstTry || 0}
                      </p>
                    </div>
                    {question.validationErrorRate > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                          Error Rate
                        </p>
                        <p className="text-lg font-semibold text-amber-600">
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
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <Navigation className="mr-2 h-4 w-4" />
                      Navigation Patterns
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="h-4 w-4 text-emerald-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Forward
                          </p>
                          <p className="text-sm font-semibold">
                            {question.navigationPatterns.forward}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ArrowLeft className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Backward
                          </p>
                          <p className="text-sm font-semibold">
                            {question.navigationPatterns.backward}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Move className="h-4 w-4 text-violet-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Jump</p>
                          <p className="text-sm font-semibold">
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
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Answer Distribution
                    </h4>
                    <div className="space-y-3">
                      {question.optionBreakdown.map((option, idx) => (
                        <div key={`${question.questionId}-option-${idx}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">{option.option}</span>
                            <span className="text-sm text-muted-foreground">
                              {option.count} ({option.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={option.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Sentiment Breakdown (for text questions) */}
              {question.sentimentBreakdown && (
                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Sentiment Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Positive</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        {question.sentimentBreakdown.positive}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Neutral</p>
                      <p className="text-lg font-semibold text-muted-foreground">
                        {question.sentimentBreakdown.neutral}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Negative</p>
                      <p className="text-lg font-semibold text-red-600">
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
