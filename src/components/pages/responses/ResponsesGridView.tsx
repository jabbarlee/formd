/**
 * Grid/Card View for Responses
 * Visual card-based grid layout
 */

"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Trash2,
  Download,
  Mail,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Response {
  id: string;
  formName: string;
  respondent: string;
  submittedAt: string;
  status: "completed" | "partial" | "flagged";
  score?: number;
  duration: string;
  answers?: number;
  totalQuestions?: number;
}

interface ResponsesGridViewProps {
  responses: Response[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function ResponsesGridView({
  responses,
  onView,
  onDelete,
  onExport,
}: ResponsesGridViewProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          badge: (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ),
          borderColor: "border-l-emerald-500",
          bgGradient:
            "bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/20",
        };
      case "partial":
        return {
          badge: (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="h-3 w-3 mr-1" />
              Partial
            </Badge>
          ),
          borderColor: "border-l-amber-500",
          bgGradient:
            "bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20",
        };
      case "flagged":
        return {
          badge: (
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
              <AlertCircle className="h-3 w-3 mr-1" />
              Flagged
            </Badge>
          ),
          borderColor: "border-l-rose-500",
          bgGradient:
            "bg-gradient-to-br from-rose-50 to-transparent dark:from-rose-950/20",
        };
      default:
        return {
          badge: null,
          borderColor: "border-l-slate-500",
          bgGradient: "bg-gradient-to-br from-slate-50 to-transparent",
        };
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 4.5) return "text-emerald-600";
    if (score >= 3.5) return "text-blue-600";
    if (score >= 2.5) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {responses.map((response) => {
        const statusConfig = getStatusConfig(response.status);
        const completionPercentage =
          response.answers && response.totalQuestions
            ? Math.round((response.answers / response.totalQuestions) * 100)
            : 100;

        return (
          <Card
            key={response.id}
            className={cn(
              "border-l-4 hover:shadow-lg transition-all duration-200",
              statusConfig.borderColor,
              statusConfig.bgGradient
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs text-muted-foreground font-mono">
                  {response.id}
                </span>
                {statusConfig.badge}
              </div>
              <h3 className="font-semibold text-base line-clamp-2">
                {response.formName}
              </h3>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Respondent */}
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{response.respondent}</span>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{response.submittedAt}</span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{response.duration}</span>
              </div>

              {/* Score */}
              {response.score !== undefined && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Star
                      className={cn(
                        "h-5 w-5",
                        response.score >= 4
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-lg font-bold",
                        getScoreColor(response.score)
                      )}
                    >
                      {response.score.toFixed(1)}
                    </span>
                  </div>
                  {completionPercentage < 100 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BarChart3 className="h-3 w-3" />
                      <span>{completionPercentage}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Bar for Partial */}
              {response.status === "partial" &&
                response.answers !== undefined &&
                response.totalQuestions !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {response.answers}/{response.totalQuestions}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onView?.(response.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport?.(response.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950"
                  onClick={() => onDelete?.(response.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
