/**
 * Question Block Component
 * Individual question card displayed in the form canvas
 */

"use client";

import { useState } from "react";
import type { Question } from "@/lib/types/forms";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { questionTypeMetadata } from "@/lib/types/forms";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  GripVertical,
  Copy,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionBlockProps {
  question: Question;
  isSelected: boolean;
  index: number;
}

export function QuestionBlock({
  question,
  isSelected,
  index,
}: QuestionBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { updateQuestion, deleteQuestion, duplicateQuestion, selectQuestion } =
    useFormBuilderStore();

  const metadata = questionTypeMetadata[question.type];

  const handleSelect = () => {
    selectQuestion(question.id);
  };

  const handleTitleChange = (value: string) => {
    updateQuestion(question.id, { title: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateQuestion(question.id, { description: value });
  };

  const handleRequiredToggle = (checked: boolean) => {
    updateQuestion(question.id, { required: checked });
  };

  const handleDuplicate = () => {
    duplicateQuestion(question.id);
  };

  const handleDelete = () => {
    deleteQuestion(question.id);
  };

  // Check if question type is under development
  const isUnderDevelopment = [
    "payment",
    "image_choice",
    "location",
    "signature",
    "file_upload",
  ].includes(question.type);

  // Render question preview based on type
  const renderQuestionPreview = () => {
    switch (question.type) {
      case "short_text":
      case "email":
      case "phone":
        return (
          <Input
            placeholder={question.placeholder || "Your answer"}
            disabled
            className="mt-2"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={question.placeholder || "Enter a number"}
            disabled
            className="mt-2"
          />
        );

      case "long_text":
        return (
          <Textarea
            placeholder={question.placeholder || "Your detailed answer"}
            disabled
            rows={3}
            className="mt-2"
          />
        );

      case "multiple_choice":
      case "checkboxes":
        return (
          <div className="mt-3 space-y-2">
            {question.options?.map((option, idx) => (
              <div key={option.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-4 w-4 rounded border-2 border-muted-foreground/40",
                    question.type === "multiple_choice" && "rounded-full"
                  )}
                />
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <div className="mt-2 space-y-1">
            <div className="px-3 py-2 border rounded-md text-sm text-muted-foreground bg-background flex items-center justify-between">
              <span>Select an option</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            {question.options && question.options.length > 0 && (
              <div className="text-xs text-muted-foreground pl-1">
                {question.options.length} option(s)
              </div>
            )}
          </div>
        );

      case "nps":
        return (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 11 }).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-8 flex-1 flex items-center justify-center border rounded text-xs font-medium",
                    idx <= 6 && "border-red-200 bg-red-50 text-red-700",
                    idx >= 7 &&
                      idx <= 8 &&
                      "border-yellow-200 bg-yellow-50 text-yellow-700",
                    idx >= 9 && "border-green-200 bg-green-50 text-green-700"
                  )}
                >
                  {idx}
                </div>
              ))}
            </div>
          </div>
        );

      case "emoji_rating":
        return (
          <div className="mt-3 flex gap-2 justify-center">
            {["😡", "😞", "😐", "😊", "😍"].map((emoji, idx) => (
              <div
                key={idx}
                className="text-3xl hover:scale-110 transition-transform cursor-pointer"
              >
                {emoji}
              </div>
            ))}
          </div>
        );

      case "signature":
        return (
          <div className="mt-2 border-2 rounded-lg p-3 bg-white">
            <div className="border-b-2 border-muted h-24 flex items-end justify-center pb-2">
              <p className="text-xs text-muted-foreground italic">Sign here</p>
            </div>
          </div>
        );

      case "matrix":
        const matrixRows = question.settings?.rows || [];
        const matrixColumns = question.settings?.columns || [];
        return (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted/50"></th>
                  {matrixColumns.slice(0, 3).map((col) => (
                    <th key={col.id} className="border p-2 bg-muted/50">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixRows.slice(0, 2).map((row) => (
                  <tr key={row.id}>
                    <td className="border p-2 font-medium">{row.label}</td>
                    {matrixColumns.slice(0, 3).map((col) => (
                      <td key={col.id} className="border p-2 text-center">
                        <div className="h-3 w-3 rounded-full border mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "ranking":
        return (
          <div className="mt-2 space-y-1">
            {question.options?.slice(0, 3).map((option, idx) => (
              <div
                key={option.id}
                className="flex items-center gap-2 p-2 border rounded-md text-sm bg-white"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="w-5 h-5 rounded bg-muted text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="flex-1 truncate">{option.label}</span>
              </div>
            ))}
          </div>
        );

      case "payment":
        return (
          <div className="mt-2 p-3 border rounded-lg bg-muted/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount:</span>
              <span className="text-lg font-bold">
                {question.settings?.currency || "$"}
                {question.settings?.amount || "0.00"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              🔒 Secure payment
            </div>
          </div>
        );

      case "location":
        return (
          <div className="mt-2 space-y-2">
            <Input
              placeholder="Search location..."
              disabled
              className="text-sm"
            />
            <div className="border rounded h-24 bg-muted/30 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Map view</p>
            </div>
          </div>
        );

      case "image_choice":
        const imageSize = question.settings?.imageSize || "medium";
        const gridCols =
          imageSize === "large" ? 2 : imageSize === "small" ? 4 : 3;
        return (
          <div
            className="mt-2 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
          >
            {question.options?.slice(0, gridCols).map((option) => (
              <div
                key={option.id}
                className="border rounded overflow-hidden hover:border-primary transition-colors"
              >
                <div className="aspect-square bg-muted flex items-center justify-center text-xs">
                  {option.image ? (
                    <img
                      src={option.image}
                      alt={option.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "Image"
                  )}
                </div>
                <div className="p-1 text-xs text-center truncate">
                  {option.label}
                </div>
              </div>
            ))}
          </div>
        );

      case "star_rating":
        return (
          <div className="mt-3 flex gap-1">
            {Array.from({ length: question.settings?.maxRating || 5 }).map(
              (_, idx) => (
                <div
                  key={idx}
                  className="h-8 w-8 rounded text-yellow-400 border border-muted-foreground/20"
                >
                  ★
                </div>
              )
            )}
          </div>
        );

      case "linear_scale":
        return (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{question.settings?.minLabel || "Not likely"}</span>
              <span>{question.settings?.maxLabel || "Very likely"}</span>
            </div>
            <div className="flex gap-2">
              {Array.from({
                length:
                  (question.settings?.scaleMax || 5) -
                  (question.settings?.scaleMin || 1) +
                  1,
              }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-10 w-10 flex items-center justify-center border rounded-md text-sm"
                >
                  {(question.settings?.scaleMin || 1) + idx}
                </div>
              ))}
            </div>
          </div>
        );

      case "date":
      case "time":
      case "datetime":
        return (
          <Input
            type={
              question.type === "time"
                ? "time"
                : question.type === "datetime"
                ? "datetime-local"
                : "date"
            }
            disabled
            className="mt-2"
          />
        );

      case "file_upload":
        return (
          <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Click or drag file to upload
            </p>
          </div>
        );

      case "section_heading":
        return null;

      case "divider":
        return <div className="mt-4 border-t" />;

      default:
        return (
          <div className="mt-2 px-3 py-2 border rounded-md text-xs text-muted-foreground bg-muted/30">
            {metadata.description}
          </div>
        );
    }
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 cursor-pointer overflow-hidden",
        isSelected ? "shadow-lg bg-primary/3" : "hover:shadow-md bg-white"
      )}
      onClick={handleSelect}
    >
      {/* Selection Indicator Bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}

      {/* Drag Handle */}
      <div className="absolute left-3 top-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
        <GripVertical className="h-5 w-5 text-muted-foreground/60 hover:text-muted-foreground" />
      </div>

      {/* Question Content */}
      <div className="pl-12 pr-4 py-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {index + 1}
              </div>
              <Badge
                variant="secondary"
                className="text-xs font-medium bg-muted/50"
              >
                {metadata.label}
              </Badge>
              {question.required && (
                <Badge
                  variant="destructive"
                  className="text-xs bg-red-100 text-red-700 hover:bg-red-100"
                >
                  Required
                </Badge>
              )}
            </div>

            {/* Editable Title */}
            {question.type === "section_heading" ? (
              <div className="relative group/title">
                <Input
                  value={question.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-xl font-bold border-0 px-0 py-1 focus-visible:ring-0 bg-transparent shadow-none hover:bg-muted/30 focus:bg-muted/50 transition-colors rounded-sm"
                  placeholder="Section Title"
                />
              </div>
            ) : (
              <div className="relative group/title">
                <Input
                  value={question.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-base font-semibold border-0 px-0 py-1 focus-visible:ring-0 bg-transparent shadow-none hover:bg-muted/30 focus:bg-muted/50 transition-colors rounded-sm placeholder:text-muted-foreground/40"
                  placeholder="Click to add question title..."
                />
              </div>
            )}

            {/* Description */}
            {isExpanded && question.type !== "divider" && (
              <div className="relative group/desc">
                <Textarea
                  value={question.description || ""}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  className="text-sm text-muted-foreground border-0 px-0 py-1 focus-visible:ring-0 min-h-[50px] bg-transparent shadow-none hover:bg-muted/30 focus:bg-muted/50 transition-colors resize-none rounded-sm placeholder:text-muted-foreground/40"
                  placeholder="Click to add description (optional)..."
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate();
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Preview */}
        {isExpanded &&
          question.type !== "section_heading" &&
          renderQuestionPreview()}

        {/* Under Development Notice */}
        {isExpanded && isUnderDevelopment && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Under Development
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                This question type is still under development. You can preview
                it for now, but it won't be functional in the final form yet!
              </p>
            </div>
          </div>
        )}

        {/* Required Toggle */}
        {isExpanded &&
          question.type !== "section_heading" &&
          question.type !== "text_content" &&
          question.type !== "divider" && (
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-dashed">
              <Switch
                id={`required-${question.id}`}
                checked={question.required}
                onCheckedChange={handleRequiredToggle}
                onClick={(e) => e.stopPropagation()}
              />
              <Label
                htmlFor={`required-${question.id}`}
                className="text-sm cursor-pointer font-medium"
              >
                Required field
              </Label>
            </div>
          )}
      </div>
    </Card>
  );
}
