/**
 * Interactive Form Preview Component
 * Shows how the form will look to respondents with working inputs
 */

"use client";

import { useState } from "react";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { questionTypeMetadata } from "@/lib/types/forms";
import type { Question } from "@/lib/types/forms";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  ArrowRight,
  Star,
  Upload,
  Calendar,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionPreviewProps {
  question: Question;
  index: number;
  totalQuestions: number;
  value: any;
  onChange: (value: any) => void;
}

function QuestionPreview({
  question,
  index,
  totalQuestions,
  value,
  onChange,
}: QuestionPreviewProps) {
  const metadata = questionTypeMetadata[question.type];

  // Layout elements don't need question number
  const isLayout = ["section_heading", "text_content", "divider"].includes(
    question.type
  );

  const renderQuestionInput = () => {
    switch (question.type) {
      case "short_text":
        return (
          <Input
            placeholder={question.placeholder || metadata.defaultTitle}
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            minLength={question.settings?.minLength}
            maxLength={question.settings?.maxLength}
            className={
              value &&
              question.settings?.minLength &&
              value.length < question.settings.minLength
                ? "border-yellow-300"
                : ""
            }
          />
        );

      case "email":
        return (
          <Input
            placeholder={question.placeholder || "email@example.com"}
            type="email"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            className={
              value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? "border-red-300 focus-visible:ring-red-500"
                : ""
            }
          />
        );

      case "phone":
        return (
          <Input
            placeholder={question.placeholder || "+1 (555) 000-0000"}
            type="tel"
            value={value || ""}
            onChange={(e) => {
              // Allow only numbers, spaces, dashes, parentheses, and plus sign
              const val = e.target.value;
              if (/^[0-9\s\-\(\)\+]*$/.test(val)) {
                onChange(val);
              }
            }}
          />
        );

      case "number":
        return (
          <Input
            placeholder={question.placeholder || "Enter a number"}
            type="number"
            min={question.settings?.min}
            max={question.settings?.max}
            step={question.settings?.step || 1}
            value={value || ""}
            onChange={(e) => {
              const val = e.target.value;
              // Allow empty string or valid number
              if (val === "" || !isNaN(Number(val))) {
                onChange(val);
              }
            }}
            onKeyDown={(e) => {
              // Prevent non-numeric characters (except special keys)
              const allowedKeys = [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "Tab",
                ".",
                "-",
              ];
              if (
                !allowedKeys.includes(e.key) &&
                (e.key < "0" || e.key > "9") &&
                !e.ctrlKey &&
                !e.metaKey
              ) {
                e.preventDefault();
              }
            }}
          />
        );

      case "long_text":
        return (
          <Textarea
            placeholder={question.placeholder || metadata.defaultTitle}
            rows={4}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            minLength={question.settings?.minLength}
            maxLength={question.settings?.maxLength}
            className={
              value &&
              question.settings?.minLength &&
              value.length < question.settings.minLength
                ? "border-yellow-300"
                : ""
            }
          />
        );

      case "multiple_choice":
        return (
          <RadioGroup value={value || ""} onValueChange={onChange}>
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkboxes":
        const selectedValues = value || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option.value]);
                    } else {
                      onChange(
                        selectedValues.filter((v: string) => v !== option.value)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={option.id}
                  className="font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "star_rating":
        const maxRating = question.settings?.maxRating || 5;
        const selectedRating = value || 0;
        return (
          <div className="flex gap-2">
            {Array.from({ length: maxRating }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(idx + 1)}
                className="transition-colors cursor-pointer"
              >
                <Star
                  className={cn(
                    "h-8 w-8",
                    idx < selectedRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-300 hover:text-yellow-400"
                  )}
                />
              </button>
            ))}
          </div>
        );

      case "linear_scale":
        const scaleMin = question.settings?.scaleMin || 1;
        const scaleMax = question.settings?.scaleMax || 5;
        const selectedScale = value;
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{question.settings?.minLabel || "Not likely"}</span>
              <span>{question.settings?.maxLabel || "Very likely"}</span>
            </div>
            <div className="flex gap-2 justify-between">
              {Array.from({ length: scaleMax - scaleMin + 1 }).map((_, idx) => {
                const scaleValue = scaleMin + idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(scaleValue)}
                    className={cn(
                      "h-12 w-12 flex items-center justify-center border-2 rounded-lg transition-colors",
                      selectedScale === scaleValue
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    <span className="text-sm font-medium">{scaleValue}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "nps":
        const selectedNPS = value;
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Not at all likely</span>
              <span>Extremely likely</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 11 }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(idx)}
                  className={cn(
                    "h-12 flex-1 flex items-center justify-center border-2 rounded-lg transition-colors",
                    selectedNPS === idx
                      ? idx <= 6
                        ? "border-red-500 bg-red-500 text-white"
                        : idx <= 8
                        ? "border-yellow-500 bg-yellow-500 text-white"
                        : "border-green-500 bg-green-500 text-white"
                      : cn(
                          idx <= 6 && "hover:border-red-400 hover:bg-red-50",
                          idx >= 7 &&
                            idx <= 8 &&
                            "hover:border-yellow-400 hover:bg-yellow-50",
                          idx >= 9 && "hover:border-green-400 hover:bg-green-50"
                        )
                  )}
                >
                  <span className="text-sm font-medium">{idx}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "emoji_rating":
        const emojis = ["😡", "😞", "😐", "😊", "😍"];
        const selectedEmoji = value;
        return (
          <div className="flex gap-3 justify-center">
            {emojis.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(idx)}
                className={cn(
                  "text-5xl transition-transform",
                  selectedEmoji === idx
                    ? "scale-125"
                    : "hover:scale-110 opacity-60 hover:opacity-100"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "time":
        return (
          <Input
            type="time"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "datetime":
        return (
          <Input
            type="datetime-local"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "file_upload":
        return (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {question.settings?.allowedFileTypes?.join(", ") ||
                    "Any file type"}
                  {question.settings?.maxFileSize &&
                    ` (max ${question.settings.maxFileSize}MB)`}
                </p>
              </div>
            </div>
          </div>
        );

      case "section_heading":
        return null;

      case "text_content":
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              {question.description || question.title}
            </p>
          </div>
        );

      case "divider":
        return <Separator className="my-4" />;

      // Complex question types - keep as display only
      case "signature":
      case "matrix":
      case "ranking":
      case "payment":
      case "location":
      case "image_choice":
        return (
          <div className="p-4 border-2 border-dashed rounded-lg bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">
              {metadata.label} - Preview not available in test mode
            </p>
          </div>
        );

      default:
        return (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              {metadata.description}
            </p>
          </div>
        );
    }
  };

  if (question.type === "divider") {
    return <Separator className="my-6" />;
  }

  if (question.type === "section_heading") {
    return (
      <div className="space-y-2 mt-8 mb-4">
        <h2 className="text-2xl font-bold">{question.title}</h2>
        {question.description && (
          <p className="text-muted-foreground">{question.description}</p>
        )}
      </div>
    );
  }

  if (question.type === "text_content") {
    return (
      <div className="my-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">
            {question.description || question.title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-base font-medium">
          {!isLayout && (
            <span className="text-muted-foreground mr-2">{index + 1}.</span>
          )}
          {question.title}
          {question.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
        {question.description && (
          <p className="text-sm text-muted-foreground">
            {question.description}
          </p>
        )}
      </div>
      <div>{renderQuestionInput()}</div>
    </div>
  );
}

export function FormPreview() {
  const { form, questions } = useFormBuilderStore();
  const [formData, setFormData] = useState<Record<string, any>>({});

  const visibleQuestions = questions.filter(
    (q) => !["divider", "text_content", "section_heading"].includes(q.type)
  );

  const answeredCount = Object.keys(formData).length;
  const progress =
    visibleQuestions.length > 0
      ? Math.round((answeredCount / visibleQuestions.length) * 100)
      : 0;

  const handleQuestionChange = (questionId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Form submitted! Check console for data.");
  };

  const formatDueDate = () => {
    if (!form.dueDate) return null;

    try {
      const date = new Date(form.dueDate);
      let formatted = format(date, "MMM dd, yyyy");

      if (form.includeTime && form.dueTime) {
        formatted += ` at ${form.dueTime}`;
      }

      return formatted;
    } catch (error) {
      return null;
    }
  };

  if (questions.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-muted/30 to-muted/10">
        <ScrollArea className="h-full">
          <div className="max-w-2xl mx-auto p-8 pb-16">
            {/* Form Header */}
            <div className="bg-card rounded-lg shadow-sm border p-8 mb-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {form.title || "Untitled Form"}
                  </h1>
                  {form.description && (
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {form.description}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                {(form.hasDueDate || form.hasLocation) && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    {/* Due Date */}
                    {form.hasDueDate && formatDueDate() && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDueDate()}</span>
                      </div>
                    )}

                    {/* Location */}
                    {form.hasLocation && form.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{form.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Empty State */}
            <div className="text-center space-y-4 py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No Questions Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add questions to see how your form will look to respondents
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-muted/30 to-muted/10">
      <ScrollArea className="h-full">
        <div className="max-w-2xl mx-auto p-8 pb-16">
          {/* Form Header */}
          <div className="bg-card rounded-lg shadow-sm border p-8 mb-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {form.title || "Untitled Form"}
                </h1>
                {form.description && (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {form.description}
                  </p>
                )}
              </div>

              {/* Metadata */}
              {(form.hasDueDate || form.hasLocation) && (
                <div className="flex flex-wrap gap-4">
                  {/* Due Date */}
                  {form.hasDueDate && formatDueDate() && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDueDate()}</span>
                    </div>
                  )}

                  {/* Location */}
                  {form.hasLocation && form.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{form.location}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              {form.showProgressBar && visibleQuestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((question, index) => {
              const visibleIndex = visibleQuestions.findIndex(
                (q) => q.id === question.id
              );
              return (
                <div
                  key={question.id}
                  className="bg-card rounded-lg shadow-sm border p-6"
                >
                  <QuestionPreview
                    question={question}
                    index={visibleIndex >= 0 ? visibleIndex : index}
                    totalQuestions={visibleQuestions.length}
                    value={formData[question.id]}
                    onChange={(value) =>
                      handleQuestionChange(question.id, value)
                    }
                  />
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-8 bg-card rounded-lg shadow-sm border p-6">
            <Button className="w-full" size="lg" onClick={handleSubmit}>
              Submit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">Powered by FormD</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
