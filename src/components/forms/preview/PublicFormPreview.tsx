/**
 * Public Form Preview Component
 * Displays form for public respondents to fill out
 * Accepts form and questions as props (doesn't use store)
 */

"use client";

import { useState, useEffect, useRef } from "react";
import type { Form, Question } from "@/lib/types/forms";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormPasswordGate } from "./FormPasswordGate";
import { FormSubmittedModal } from "./FormSubmittedModal";
import { questionTypeMetadata } from "@/lib/types/forms";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormTracking } from "@/hooks/useFormTracking";
import { useQuestionTracking } from "@/hooks/useQuestionTracking";

interface PublicFormPreviewProps {
  form: Form;
  questions: Question[];
}

interface QuestionPreviewProps {
  question: Question;
  index: number;
  totalQuestions: number;
  value: any;
  onChange: (value: any) => void;
  showQuestionNumbers?: boolean;
  onQuestionView?: (questionId: string) => void;
  onQuestionAnswer?: (questionId: string, value: any) => void;
}

// Question Preview Component
function QuestionPreview({
  question,
  index,
  totalQuestions,
  value,
  onChange,
  showQuestionNumbers = true,
  onQuestionView,
  onQuestionAnswer,
}: QuestionPreviewProps) {
  const metadata = questionTypeMetadata[question.type];

  const isLayout = ["section_heading", "text_content", "divider"].includes(
    question.type
  );

  // Track when question becomes visible
  useEffect(() => {
    if (onQuestionView && !isLayout) {
      onQuestionView(question.id);
    }
  }, [question.id, onQuestionView, isLayout]);

  // Handle answer change with tracking
  const handleChange = (newValue: any) => {
    onChange(newValue);
    if (onQuestionAnswer && !isLayout) {
      onQuestionAnswer(question.id, newValue);
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case "short_text":
        return (
          <Input
            placeholder={question.placeholder || metadata.defaultTitle}
            type="text"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case "long_text":
        return (
          <Textarea
            placeholder={question.placeholder || "Type your answer..."}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
          />
        );

      case "email":
        return (
          <Input
            placeholder={question.placeholder || "email@example.com"}
            type="email"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case "phone":
        return (
          <Input
            placeholder={question.placeholder || "+1 (555) 000-0000"}
            type="tel"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case "number":
        return (
          <Input
            placeholder={question.placeholder || "Enter a number"}
            type="number"
            value={value || ""}
            onChange={(e) => handleChange(parseFloat(e.target.value) || "")}
          />
        );

      case "multiple_choice":
        return (
          <RadioGroup value={value} onValueChange={handleChange}>
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkboxes":
        const selectedValues = value || [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((v: string) => v !== option.value);
                    handleChange(newValue);
                  }}
                />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <SelectUI value={value} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectUI>
        );

      case "section_heading":
        return (
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{question.title}</h2>
            {question.description && (
              <p className="text-muted-foreground">{question.description}</p>
            )}
          </div>
        );

      case "text_content":
        return (
          <div className="prose prose-sm max-w-none">
            <p>{question.description || question.title}</p>
          </div>
        );

      case "divider":
        return <Separator className="my-4" />;

      default:
        return (
          <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
            {metadata.label} question type (not yet implemented)
          </div>
        );
    }
  };

  // Layout elements have special rendering
  if (isLayout) {
    return <div className="py-2">{renderQuestionInput()}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <Label className="text-base font-medium flex-1">
            {showQuestionNumbers && (
              <span className="text-muted-foreground mr-2">{index + 1}.</span>
            )}
            {question.title}
            {question.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
        </div>
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

export function PublicFormPreview({ form, questions }: PublicFormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isPasswordVerified, setIsPasswordVerified] = useState(
    !form.requiresPassword
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  
  // Analytics tracking
  const { trackEvent, sessionId } = useFormTracking({ formId: form.id });
  const questionTracking = useQuestionTracking({ formId: form.id, sessionId });
  const hasTrackedStart = useRef(false);
  const isSubmittedRef = useRef(false);

  const visibleQuestions = questions.filter(
    (q) => !["divider", "text_content", "section_heading"].includes(q.type)
  );

  const answeredCount = Object.keys(formData).length;
  const progress =
    visibleQuestions.length > 0
      ? Math.round((answeredCount / visibleQuestions.length) * 100)
      : 0;

  // Track form start when first question is answered
  useEffect(() => {
    if (!hasTrackedStart.current && answeredCount > 0) {
      hasTrackedStart.current = true;
      trackEvent("form_started");
    }
  }, [answeredCount, trackEvent]);

  const handleQuestionChange = (questionId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Calculate time spent in seconds
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Validate required questions
      const requiredQuestions = questions.filter((q) => q.required);
      const missingRequired = requiredQuestions.filter(
        (q) => !formData[q.id] || formData[q.id] === ""
      );

      if (missingRequired.length > 0) {
        toast.error(
          `Please answer all required questions (${missingRequired.length} remaining)`
        );
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      const response = await fetch(`/api/public/forms/${form.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: formData,
          timeSpent,
          metadata: {
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      // Track successful submission
      isSubmittedRef.current = true;
      await trackEvent("form_submitted", {
        responseId: data.responseId,
        eventData: { timeSpent },
      });

      // Show success modal
      setSubmissionMessage(data.message);
      setRedirectUrl(data.redirectUrl);
      setIsSubmitted(true);

      toast.success("Form submitted successfully!");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  // If form requires password and not verified yet
  if (!isPasswordVerified) {
    return (
      <FormPasswordGate
        formTitle={form.title}
        passwordHash={form.passwordHash || ""}
        onSuccess={() => setIsPasswordVerified(true)}
      />
    );
  }

  // Calculate pages if oneQuestionPerPage is enabled
  const pagesCount = form.settings?.oneQuestionPerPage ? questions.length : 1;

  const questionsToShow = form.settings?.oneQuestionPerPage
    ? [questions[currentPage]]
    : questions;

  return (
    <div className="min-h-screen w-full flex items-start justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        {form.unifiedCardLayout ? (
          // Unified Card Layout - All questions in one card
          <Card className="shadow-xl">
            <CardHeader className="space-y-4 pb-6">
              {/* Cover Image */}
              {form.coverImage && (
                <div className="relative w-full h-48 -mx-6 -mt-6 mb-4 rounded-t-lg overflow-hidden">
                  <img
                    src={form.coverImage}
                    alt="Form cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Logo */}
              {form.logo && (
                <div className="flex justify-center mb-4">
                  <img
                    src={form.logo}
                    alt="Logo"
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}

              {/* Form Title & Description */}
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="text-muted-foreground">{form.description}</p>
                )}
              </div>

              {/* Due Date */}
              {form.hasDueDate && form.dueDate && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {formatDueDate()}</span>
                </div>
              )}

              {/* Location */}
              {form.hasLocation && form.location && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{form.location}</span>
                </div>
              )}

              {/* Progress Bar */}
              {form.showProgressBar && visibleQuestions.length > 0 && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {answeredCount} of {visibleQuestions.length} answered
                  </p>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Questions */}
              {questions.map((question, index) => (
                <div key={question.id}>
                  <QuestionPreview
                    question={question}
                    index={index}
                    totalQuestions={questions.length}
                    value={formData[question.id]}
                    onChange={(value) =>
                      handleQuestionChange(question.id, value)
                    }
                    showQuestionNumbers={form.settings?.showQuestionNumbers}
                    onQuestionView={questionTracking.onQuestionView}
                    onQuestionAnswer={questionTracking.onQuestionAnswer}
                  />
                  {index < questions.length - 1 && (
                    <Separator className="mt-8" />
                  )}
                </div>
              ))}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Individual Card Layout - Each question in separate card
          <div className="space-y-6">
            {/* Header Card */}
            <Card className="shadow-lg">
              <CardHeader className="space-y-4">
                {/* Cover Image */}
                {form.coverImage && (
                  <div className="relative w-full h-48 -mx-6 -mt-6 mb-4 rounded-t-lg overflow-hidden">
                    <img
                      src={form.coverImage}
                      alt="Form cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Logo */}
                {form.logo && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={form.logo}
                      alt="Logo"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                )}

                {/* Form Title & Description */}
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {form.title}
                  </h1>
                  {form.description && (
                    <p className="text-muted-foreground">{form.description}</p>
                  )}
                </div>

                {/* Due Date */}
                {form.hasDueDate && form.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {formatDueDate()}</span>
                  </div>
                )}

                {/* Location */}
                {form.hasLocation && form.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{form.location}</span>
                  </div>
                )}

                {/* Progress Bar */}
                {form.showProgressBar && visibleQuestions.length > 0 && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {answeredCount} of {visibleQuestions.length} answered
                    </p>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Question Cards */}
            {questions.map((question, index) => (
              <Card key={question.id} className="shadow-lg">
                <CardContent>
                  <QuestionPreview
                    question={question}
                    index={index}
                    totalQuestions={questions.length}
                    value={formData[question.id]}
                    onChange={(value) =>
                      handleQuestionChange(question.id, value)
                    }
                    showQuestionNumbers={form.settings?.showQuestionNumbers}
                    onQuestionView={questionTracking.onQuestionView}
                    onQuestionAnswer={questionTracking.onQuestionAnswer}
                  />
                </CardContent>
              </Card>
            ))}

            {/* Submit Card */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Ready to submit your response?
                  </p>
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <FormSubmittedModal
        isOpen={isSubmitted}
        onClose={() => setIsSubmitted(false)}
        message={submissionMessage}
        redirectUrl={redirectUrl || undefined}
      />
    </div>
  );
}
