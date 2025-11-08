"use client";

import { FormResponse } from "@/lib/types/forms";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  MapPin,
  Calendar,
  Trash2,
  Download,
  Flag,
} from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResponseDetailSheetProps {
  response: FormResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (responseId: string) => void;
  onFlag?: (responseId: string) => void;
  formQuestions?: Array<{
    id: string;
    type: string;
    title: string;
  }>;
}

export function ResponseDetailSheet({
  response,
  isOpen,
  onClose,
  onDelete,
  onFlag,
  formQuestions,
}: ResponseDetailSheetProps) {
  if (!response) return null;

  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "partial":
        return "secondary";
      case "flagged":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "AN";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatCompletionTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes} min ${secs} sec`;
    }
    return `${secs} seconds`;
  };

  const formatAnswerValue = (value: any): string => {
    if (value === null || value === undefined) return "No answer";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getQuestionTitle = (questionKey: string): string => {
    if (formQuestions) {
      const question = formQuestions.find(
        (q) => questionKey.includes(q.id) || q.id.includes(questionKey)
      );
      if (question) return question.title;
    }
    // Fallback: convert key to readable format
    return questionKey
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Response Details</SheetTitle>
          <SheetDescription>
            View complete submission details and metadata
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-6">
          <div className="space-y-6">
            {/* Respondent Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-medium">
                  {getInitials(response.respondent.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {response.respondent.name || "Anonymous"}
                  </h3>
                  <Badge variant={getStatusVariant(response.status)}>
                    {response.status}
                  </Badge>
                </div>
                {response.respondent.email && (
                  <p className="text-sm text-muted-foreground">
                    {response.respondent.email}
                  </p>
                )}
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {response.id}
                </p>
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Submission Info</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="font-medium">
                      {format(new Date(response.submittedAt), "PPp")}
                    </p>
                  </div>
                </div>

                {response.completionTime && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {formatCompletionTime(response.completionTime)}
                      </p>
                    </div>
                  </div>
                )}

                {response.device && (
                  <div className="flex items-start gap-2">
                    {getDeviceIcon(response.device)}
                    <div>
                      <p className="text-xs text-muted-foreground">Device</p>
                      <p className="font-medium capitalize">
                        {response.device}
                      </p>
                    </div>
                  </div>
                )}

                {response.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{response.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Answers */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Responses</h4>
              <div className="space-y-4">
                {Object.entries(response.data).map(([key, value]) => (
                  <div key={key} className="space-y-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                      {getQuestionTitle(key)}
                    </p>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">
                        {formatAnswerValue(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2 pb-4">
              <Button variant="outline" className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Response
              </Button>
              {onFlag && response.status !== "flagged" && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => onFlag(response.id)}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Flag for Review
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    onDelete(response.id);
                    onClose();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Response
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
