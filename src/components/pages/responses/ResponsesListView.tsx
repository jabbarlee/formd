/**
 * List View for Responses
 * Card-based list view showing detailed information
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
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

interface ResponsesListViewProps {
  responses: Response[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function ResponsesListView({
  responses,
  onView,
  onDelete,
  onExport,
}: ResponsesListViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            <Clock className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        );
      case "flagged":
        return (
          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
            <AlertCircle className="h-3 w-3 mr-1" />
            Flagged
          </Badge>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 4.5) return "text-emerald-600 font-semibold";
    if (score >= 3.5) return "text-blue-600 font-semibold";
    if (score >= 2.5) return "text-amber-600 font-semibold";
    return "text-rose-600 font-semibold";
  };

  return (
    <div className="space-y-3">
      {responses.map((response) => (
        <Card
          key={response.id}
          className="hover:shadow-md transition-shadow duration-200"
        >
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Left Section - Main Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        {response.id}
                      </span>
                      {getStatusBadge(response.status)}
                    </div>
                    <h3 className="font-semibold text-base">
                      {response.formName}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    <span>{response.respondent}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{response.submittedAt}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{response.duration}</span>
                  </div>
                  {response.score !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Star
                        className={cn(
                          "h-4 w-4",
                          response.score >= 4
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className={getScoreColor(response.score)}>
                        {response.score.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {response.answers !== undefined &&
                    response.totalQuestions !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">
                          {response.answers}/{response.totalQuestions} answered
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-2 md:flex-col md:items-stretch">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 md:flex-initial"
                  onClick={() => onView?.(response.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 md:flex-initial"
                  onClick={() => onExport?.(response.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
