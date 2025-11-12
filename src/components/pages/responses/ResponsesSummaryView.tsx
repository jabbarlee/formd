"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Users,
  TrendingUp,
  Calendar,
  Hash,
  Mail,
  Phone,
  CheckSquare,
  List,
} from "lucide-react";
import { Response } from "@/lib/mock-data";
import { QuestionType } from "@/lib/types/forms";

// ============================================================================
// Types
// ============================================================================

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
}

interface ResponsesSummaryViewProps {
  questions: Question[];
  responses: Response[];
}

interface QuestionStats {
  answeredCount: number;
  responseRate: number;
  allAnswers: any[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts all answers for a specific question from responses
 */
const extractQuestionAnswers = (
  question: Question,
  responses: Response[]
): any[] => {
  const questionKey = question.id.startsWith("q")
    ? question.id
    : `q${question.id}`;

  return responses
    .map((response) => {
      // Find matching key in response data (flexible matching)
      const matchingKey = Object.keys(response.data).find(
        (key) =>
          key === questionKey ||
          key.includes(question.id) ||
          key.includes(questionKey)
      );
      return matchingKey ? response.data[matchingKey] : null;
    })
    .filter(
      (answer) => answer !== null && answer !== undefined && answer !== ""
    );
};

/**
 * Calculate statistics for a question
 */
const calculateQuestionStats = (
  question: Question,
  responses: Response[]
): QuestionStats => {
  const allAnswers = extractQuestionAnswers(question, responses);
  const answeredCount = allAnswers.length;
  const responseRate =
    responses.length > 0 ? (answeredCount / responses.length) * 100 : 0;

  return {
    answeredCount,
    responseRate,
    allAnswers,
  };
};

/**
 * Count occurrences of each unique answer
 */
const countAnswerFrequency = (answers: any[]): Array<[string, number]> => {
  const counts: Record<string, number> = {};

  answers.forEach((answer) => {
    const key = String(answer);
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts).sort(([, a], [, b]) => b - a);
};

/**
 * Calculate average of numeric values
 */
const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
};

/**
 * Utility for conditional class names
 */
const cn = (...classes: (string | boolean | undefined)[]): string =>
  classes.filter(Boolean).join(" ");

// ============================================================================
// Visualization Components
// ============================================================================

/**
 * Star Rating Visualization
 */
const StarRatingVisualization = ({ stats }: { stats: QuestionStats }) => {
  const ratings = [1, 2, 3, 4, 5];
  const ratingCounts = ratings.map(
    (rating) => stats.allAnswers.filter((a: number) => a === rating).length
  );
  const average = calculateAverage(stats.allAnswers as number[]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-yellow-500">
            {average.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mt-2 justify-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.round(average)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Average Rating
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {ratings.reverse().map((rating, idx) => {
            const count = ratingCounts[ratings.length - 1 - idx];
            const percentage =
              stats.answeredCount > 0 ? (count / stats.answeredCount) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium w-8">{rating} ★</span>
                <Progress value={percentage} className="h-2.5 flex-1" />
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Linear Scale Visualization (1-10 scale)
 */
const LinearScaleVisualization = ({ stats }: { stats: QuestionStats }) => {
  const scale = Array.from({ length: 10 }, (_, i) => i + 1);
  const scaleCounts = scale.map(
    (value) => stats.allAnswers.filter((a: number) => a === value).length
  );
  const average = calculateAverage(stats.allAnswers as number[]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-500">
            {average.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Average Score
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {scale.reverse().map((value, idx) => {
            const count = scaleCounts[scale.length - 1 - idx];
            const percentage =
              stats.answeredCount > 0 ? (count / stats.answeredCount) * 100 : 0;

            return (
              <div key={value} className="flex items-center gap-3">
                <span className="text-sm font-medium w-8">{value}</span>
                <Progress value={percentage} className="h-2 flex-1" />
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * NPS (Net Promoter Score) Visualization
 */
const NPSVisualization = ({ stats }: { stats: QuestionStats }) => {
  const scores = stats.allAnswers as number[];
  const detractors = scores.filter((s) => s >= 0 && s <= 6).length;
  const passives = scores.filter((s) => s >= 7 && s <= 8).length;
  const promoters = scores.filter((s) => s >= 9 && s <= 10).length;
  const total = scores.length;

  const npsScore =
    total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

  const getScoreColor = (score: number): string => {
    if (score >= 50) return "text-green-600";
    if (score >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className={cn("text-5xl font-bold", getScoreColor(npsScore))}>
          {npsScore}
        </div>
        <div className="text-xs text-muted-foreground mt-2">NPS Score</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{detractors}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Detractors (0-6)
          </div>
          <div className="text-xs text-muted-foreground">
            {total > 0 ? ((detractors / total) * 100).toFixed(0) : 0}%
          </div>
        </div>
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{passives}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Passives (7-8)
          </div>
          <div className="text-xs text-muted-foreground">
            {total > 0 ? ((passives / total) * 100).toFixed(0) : 0}%
          </div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{promoters}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Promoters (9-10)
          </div>
          <div className="text-xs text-muted-foreground">
            {total > 0 ? ((promoters / total) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Multiple Choice / Dropdown Visualization
 */
const ChoiceVisualization = ({ stats }: { stats: QuestionStats }) => {
  const answerFrequency = countAnswerFrequency(stats.allAnswers);

  if (answerFrequency.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No responses yet</div>
    );
  }

  return (
    <div className="space-y-3">
      {answerFrequency.map(([answer, count]) => {
        const percentage = (count / stats.answeredCount) * 100;

        return (
          <div key={answer} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">{answer}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {percentage.toFixed(1)}%
                </span>
                <Badge
                  variant="secondary"
                  className="min-w-[3rem] justify-center"
                >
                  {count}
                </Badge>
              </div>
            </div>
            <Progress value={percentage} className="h-2.5" />
          </div>
        );
      })}
    </div>
  );
};

/**
 * Checkboxes Visualization (multiple selections allowed)
 */
const CheckboxesVisualization = ({ stats }: { stats: QuestionStats }) => {
  // Flatten array answers if they exist
  const flatAnswers = stats.allAnswers.flatMap((answer) =>
    Array.isArray(answer) ? answer : [answer]
  );
  const answerFrequency = countAnswerFrequency(flatAnswers);

  return (
    <div className="space-y-3">
      {answerFrequency.map(([answer, count]) => {
        const percentage = (count / stats.answeredCount) * 100;

        return (
          <div key={answer} className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1 capitalize">
                {answer}
              </span>
              <span className="text-sm text-muted-foreground">
                {percentage.toFixed(1)}%
              </span>
              <Badge variant="secondary">{count}</Badge>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      })}
    </div>
  );
};

/**
 * Text Responses Visualization
 */
const TextResponsesVisualization = ({
  stats,
  maxDisplay = 5,
}: {
  stats: QuestionStats;
  maxDisplay?: number;
}) => {
  const sampleResponses = stats.allAnswers.slice(0, maxDisplay);
  const remaining = stats.allAnswers.length - maxDisplay;

  if (sampleResponses.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No responses yet</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Showing {sampleResponses.length} of {stats.allAnswers.length} responses
      </div>
      <div className="space-y-2">
        {sampleResponses.map((response: string, idx: number) => (
          <div
            key={idx}
            className="p-3 bg-muted/50 rounded-lg text-sm border border-border/50"
          >
            <p className="text-foreground">"{response}"</p>
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <div className="text-center py-2">
          <Badge variant="outline" className="text-xs">
            + {remaining} more {remaining === 1 ? "response" : "responses"}
          </Badge>
        </div>
      )}
    </div>
  );
};

/**
 * Numeric Data Visualization
 */
const NumericVisualization = ({ stats }: { stats: QuestionStats }) => {
  const numbers = stats.allAnswers as number[];
  const average = calculateAverage(numbers);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const median =
    [...numbers].sort((a, b) => a - b)[Math.floor(numbers.length / 2)] || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <div className="text-2xl font-bold">{average.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground mt-1">Average</div>
      </div>
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <div className="text-2xl font-bold">{median.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground mt-1">Median</div>
      </div>
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <div className="text-2xl font-bold">{min.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground mt-1">Minimum</div>
      </div>
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <div className="text-2xl font-bold">{max.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground mt-1">Maximum</div>
      </div>
    </div>
  );
};

/**
 * Date/Time Visualization
 */
const DateTimeVisualization = ({
  stats,
  type,
}: {
  stats: QuestionStats;
  type: "date" | "time" | "datetime";
}) => {
  const sampleDates = stats.allAnswers.slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        {stats.allAnswers.length}{" "}
        {type === "date" ? "dates" : type === "time" ? "times" : "date/times"}{" "}
        collected
      </div>
      <div className="grid grid-cols-2 gap-2">
        {sampleDates.map((dateTime: string, idx: number) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{dateTime}</span>
          </div>
        ))}
      </div>
      {stats.allAnswers.length > 10 && (
        <div className="text-center py-2">
          <Badge variant="outline" className="text-xs">
            + {stats.allAnswers.length - 10} more
          </Badge>
        </div>
      )}
    </div>
  );
};

/**
 * Generic Fallback Visualization
 */
const GenericVisualization = ({ stats }: { stats: QuestionStats }) => {
  return (
    <div className="text-center p-6 bg-muted/30 rounded-lg">
      <div className="text-3xl font-bold">{stats.answeredCount}</div>
      <div className="text-sm text-muted-foreground mt-2">
        responses collected
      </div>
    </div>
  );
};

// ============================================================================
// Main Render Function
// ============================================================================

/**
 * Render appropriate visualization based on question type
 */
const renderQuestionVisualization = (
  question: Question,
  stats: QuestionStats
) => {
  if (stats.answeredCount === 0) {
    return (
      <div className="text-center p-8 bg-muted/20 rounded-lg">
        <div className="text-muted-foreground">No responses yet</div>
      </div>
    );
  }

  switch (question.type) {
    case "star_rating":
      return <StarRatingVisualization stats={stats} />;

    case "linear_scale":
      return <LinearScaleVisualization stats={stats} />;

    case "nps":
      return <NPSVisualization stats={stats} />;

    case "multiple_choice":
    case "dropdown":
      return <ChoiceVisualization stats={stats} />;

    case "checkboxes":
      return <CheckboxesVisualization stats={stats} />;

    case "short_text":
    case "email":
    case "phone":
      return <TextResponsesVisualization stats={stats} maxDisplay={5} />;

    case "long_text":
      return <TextResponsesVisualization stats={stats} maxDisplay={3} />;

    case "number":
      return <NumericVisualization stats={stats} />;

    case "date":
    case "time":
    case "datetime":
      return <DateTimeVisualization stats={stats} type={question.type} />;

    case "file_upload":
    case "signature":
    case "matrix":
    case "ranking":
    case "payment":
    case "location":
    case "image_choice":
    case "emoji_rating":
      return <GenericVisualization stats={stats} />;

    default:
      return <GenericVisualization stats={stats} />;
  }
};

/**
 * Get appropriate icon for question type
 */
const getQuestionIcon = (type: QuestionType) => {
  const iconMap: Record<string, any> = {
    star_rating: Star,
    linear_scale: TrendingUp,
    nps: TrendingUp,
    multiple_choice: List,
    checkboxes: CheckSquare,
    dropdown: List,
    number: Hash,
    email: Mail,
    phone: Phone,
    date: Calendar,
    time: Calendar,
    datetime: Calendar,
  };

  const Icon = iconMap[type];
  return Icon ? <Icon className="h-4 w-4" /> : null;
};

// ============================================================================
// Main Component
// ============================================================================

export function ResponsesSummaryView({
  questions,
  responses,
}: ResponsesSummaryViewProps) {
  const totalResponses = responses.length;

  if (questions.length === 0) {
    return (
      <div className="text-center p-12 bg-muted/20 rounded-lg">
        <div className="text-muted-foreground">No questions in this form</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-6">
        {questions.map((question, index) => {
          const stats = calculateQuestionStats(question, responses);

          return (
            <Card
              key={question.id}
              className="overflow-hidden w-full max-w-[50%]"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        Question {index + 1}
                      </Badge>
                      {question.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="text-xs capitalize flex items-center gap-1"
                      >
                        {getQuestionIcon(question.type)}
                        {question.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {question.title}
                    </CardTitle>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {stats.answeredCount}/{totalResponses}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stats.responseRate.toFixed(1)}% response rate
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {renderQuestionVisualization(question, stats)}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
