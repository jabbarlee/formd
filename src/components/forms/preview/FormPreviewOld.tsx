/**
 * Form Preview Component
 * Shows how the form will look to respondents
 */

"use client";

import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { questionTypeMetadata } from "@/lib/types/forms";
import type { Question } from "@/lib/types/forms";
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
import { FileText, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionPreviewProps {
  question: Question;
  index: number;
  totalQuestions: number;
}

function QuestionPreview({
  question,
  index,
  totalQuestions,
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
            disabled
          />
        );

      case "email":
        return (
          <Input
            placeholder={question.placeholder || "email@example.com"}
            type="email"
            disabled
          />
        );

      case "phone":
        return (
          <Input
            placeholder={question.placeholder || "+1 (555) 000-0000"}
            type="tel"
            disabled
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
            disabled
          />
        );

      case "long_text":
        return (
          <Textarea
            placeholder={question.placeholder || metadata.defaultTitle}
            rows={4}
            disabled
          />
        );

      case "multiple_choice":
        return (
          <RadioGroup disabled>
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
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox id={option.id} disabled />
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
          <Select disabled>
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
        return (
          <div className="flex gap-2">
            {Array.from({ length: maxRating }).map((_, idx) => (
              <button
                key={idx}
                className="text-3xl text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer disabled:cursor-default"
                disabled
              >
                <Star className="h-8 w-8 fill-gray-200" />
              </button>
            ))}
          </div>
        );

      case "linear_scale":
        const scaleMin = question.settings?.scaleMin || 1;
        const scaleMax = question.settings?.scaleMax || 5;
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{question.settings?.minLabel || "Not likely"}</span>
              <span>{question.settings?.maxLabel || "Very likely"}</span>
            </div>
            <div className="flex gap-2 justify-between">
              {Array.from({ length: scaleMax - scaleMin + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  className="h-12 w-12 flex items-center justify-center border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:cursor-default"
                  disabled
                >
                  <span className="text-sm font-medium">{scaleMin + idx}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "nps":
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
                  className={cn(
                    "h-12 flex-1 flex items-center justify-center border-2 rounded-lg transition-colors disabled:cursor-default",
                    idx <= 6 && "hover:border-red-400 hover:bg-red-50",
                    idx >= 7 &&
                      idx <= 8 &&
                      "hover:border-yellow-400 hover:bg-yellow-50",
                    idx >= 9 && "hover:border-green-400 hover:bg-green-50"
                  )}
                  disabled
                >
                  <span className="text-sm font-medium">{idx}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "emoji_rating":
        const emojis = ["😡", "😞", "😐", "😊", "😍"];
        return (
          <div className="flex gap-3 justify-center">
            {emojis.map((emoji, idx) => (
              <button
                key={idx}
                className="text-5xl hover:scale-110 transition-transform disabled:cursor-default"
                disabled
              >
                {emoji}
              </button>
            ))}
          </div>
        );

      case "date":
        return <Input type="date" disabled />;

      case "time":
        return <Input type="time" disabled />;

      case "datetime":
        return <Input type="datetime-local" disabled />;

      case "file_upload":
        return (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
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

      case "signature":
        return (
          <div className="border-2 rounded-lg p-4 bg-white">
            <div className="border-b-2 border-muted h-32 flex items-end justify-center pb-2">
              <p className="text-sm text-muted-foreground italic">Sign here</p>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Draw your signature above
              </p>
              <Button variant="ghost" size="sm" disabled>
                Clear
              </Button>
            </div>
          </div>
        );

      case "matrix":
        const matrixRows = question.settings?.rows || [];
        const matrixColumns = question.settings?.columns || [];
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3 bg-muted/50"></th>
                  {matrixColumns.map((col) => (
                    <th
                      key={col.id}
                      className="border p-3 bg-muted/50 text-sm font-medium"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixRows.map((row) => (
                  <tr key={row.id}>
                    <td className="border p-3 font-medium text-sm">
                      {row.label}
                    </td>
                    {matrixColumns.map((col) => (
                      <td key={col.id} className="border p-3 text-center">
                        <RadioGroupItem
                          value={`${row.id}-${col.id}`}
                          disabled
                          className="mx-auto"
                        />
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
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <div
                key={option.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded bg-muted text-sm font-medium">
                  {idx + 1}
                </div>
                <div className="flex-1">{option.label}</div>
                <div className="text-muted-foreground">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              Drag to reorder by preference
            </p>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount:</span>
              <span className="text-2xl font-bold">
                {question.settings?.currency || "$"}
                {question.settings?.amount || "0.00"}
              </span>
            </div>
            <div className="space-y-2">
              <Input placeholder="Card number" disabled />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="MM/YY" disabled />
                <Input placeholder="CVC" disabled />
              </div>
              <Input placeholder="Cardholder name" disabled />
            </div>
            <p className="text-xs text-muted-foreground">
              🔒 Secure payment processing
            </p>
          </div>
        );

      case "location":
        return (
          <div className="space-y-2">
            <Input
              placeholder="Search for a location..."
              disabled
              className="mb-2"
            />
            <div className="border rounded-lg h-48 bg-muted/30 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Map view</p>
            </div>
          </div>
        );

      case "image_choice":
        const imageSize = question.settings?.imageSize || "medium";
        const gridCols =
          imageSize === "large"
            ? "grid-cols-2"
            : imageSize === "small"
            ? "grid-cols-4"
            : "grid-cols-3";
        return (
          <div className={`grid ${gridCols} gap-3`}>
            {question.options?.map((option) => (
              <div
                key={option.id}
                className="relative border-2 rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer"
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {option.image ? (
                    <img
                      src={option.image}
                      alt={option.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="p-2 text-center text-sm">{option.label}</div>
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full border-2 bg-white"></div>
                </div>
              </div>
            ))}
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

  const visibleQuestions = questions.filter(
    (q) => !["divider", "text_content", "section_heading"].includes(q.type)
  );
  const progress = 0; // Would be calculated based on answered questions

  if (questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Preview Your Form</h3>
            <p className="text-sm text-muted-foreground">
              Add questions to see how your form will look to respondents
            </p>
          </div>
        </div>
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
                  <p className="text-muted-foreground">{form.description}</p>
                )}
              </div>

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
                  />
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-8 bg-card rounded-lg shadow-sm border p-6">
            <Button className="w-full" size="lg" disabled>
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
