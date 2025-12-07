"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Question, FormResponse } from "@/lib/types/forms";
import { format } from "date-fns";
import { Calendar, User } from "lucide-react";

interface QuestionResponsesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  responses: FormResponse[];
}

/**
 * Extract answer for a specific question from a response
 */
const getQuestionAnswer = (
  questionId: string,
  responseData: Record<string, any>
): any => {
  const questionKey = questionId.startsWith("q") ? questionId : `q${questionId}`;
  
  // Find matching key in response data
  const matchingKey = Object.keys(responseData).find(
    (key) =>
      key === questionKey ||
      key.includes(questionId) ||
      key.includes(questionKey)
  );
  
  return matchingKey ? responseData[matchingKey] : null;
};

/**
 * Format answer based on type
 */
const formatAnswer = (answer: any): string => {
  if (answer === null || answer === undefined || answer === "") {
    return "No answer";
  }
  
  if (Array.isArray(answer)) {
    return answer.join(", ");
  }
  
  if (typeof answer === "boolean") {
    return answer ? "Yes" : "No";
  }
  
  return String(answer);
};

export function QuestionResponsesSheet({
  isOpen,
  onClose,
  question,
  responses,
}: QuestionResponsesSheetProps) {
  if (!question) return null;

  // Filter responses that have an answer for this question
  const responsesWithAnswer = responses
    .map((response) => ({
      ...response,
      answer: getQuestionAnswer(question.id, response.data),
    }))
    .filter((item) => item.answer !== null && item.answer !== undefined && item.answer !== "");

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl flex flex-col h-full p-0 overflow-hidden">
        {/* Header Section */}
        <div className="flex-shrink-0 px-6 py-6 border-b">
          <SheetHeader>
            <SheetTitle className="text-2xl">All Responses</SheetTitle>
            <SheetDescription className="text-base">
              Viewing all responses for this question
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Question Info Section */}
        <div className="flex-shrink-0 px-6 py-4 bg-muted/30 border-b">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs capitalize">
                {question.type.replace(/_/g, " ")}
              </Badge>
              {question.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-tight">
              {question.title}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="font-semibold">
                {responsesWithAnswer.length}
              </Badge>
              <span className="text-muted-foreground">
                of {responses.length} total responses
              </span>
            </div>
          </div>
        </div>

        {/* Responses List Section */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-6 space-y-4">
            {responsesWithAnswer.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No responses yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  There are no responses for this question at the moment.
                </p>
              </div>
            ) : (
              responsesWithAnswer.map((item, index) => (
                <div
                  key={item.id}
                  className="p-5 bg-card border rounded-xl hover:shadow-md hover:border-primary/30 transition-all duration-200 space-y-4"
                >
                  {/* Response Header */}
                  <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {item.respondent.name ||
                            item.respondent.email ||
                            "Anonymous"}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(
                              new Date(item.submittedAt),
                              "MMM dd, yyyy 'at' HH:mm"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.status === "completed"
                            ? "default"
                            : item.status === "in_progress"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {item.status === "completed"
                          ? "Completed"
                          : item.status === "in_progress"
                          ? "In Progress"
                          : item.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Answer Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Response
                      </div>
                    </div>
                    <div>
                      {Array.isArray(item.answer) ? (
                        <div className="flex flex-wrap gap-2">
                          {item.answer.map((ans: any, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="px-3 py-1.5 text-sm"
                            >
                              {String(ans)}
                            </Badge>
                          ))}
                        </div>
                      ) : question.type === "long_text" ? (
                        <div className="p-4 bg-muted/50 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap">
                          {formatAnswer(item.answer)}
                        </div>
                      ) : (
                        <div className="text-base font-medium">
                          {formatAnswer(item.answer)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  {item.completionTime && (
                    <div className="pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        Completed in {Math.floor(item.completionTime / 60)}m{" "}
                        {item.completionTime % 60}s
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer with count */}
        {responsesWithAnswer.length > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/20">
            <div className="text-center text-sm text-muted-foreground">
              Showing {responsesWithAnswer.length}{" "}
              {responsesWithAnswer.length === 1 ? "response" : "responses"}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

