/**
 * Public Form View Page
 * Route: /f/[id]
 *
 * Accessible to anyone (no authentication required)
 * Displays form for filling out by respondents
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Form, Question } from "@/lib/types/forms";
import { PublicFormPreview } from "@/components/forms/preview/PublicFormPreview";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/public/forms/${formId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load form");
      }

      const data = await response.json();
      setForm(data.form);
      setQuestions(data.questions);
    } catch (err: any) {
      console.error("Error loading form:", err);
      setError(err.message || "Failed to load form");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loading form...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we prepare your form
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {error.includes("closed") ? (
                <Lock className="h-12 w-12 text-amber-500 mb-4" />
              ) : (
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              )}
              <h3 className="text-lg font-semibold mb-2">
                {error.includes("not found") && "Form Not Found"}
                {error.includes("not available") && "Form Not Available"}
                {error.includes("closed") && "Form Closed"}
                {!error.includes("not found") &&
                  !error.includes("not available") &&
                  !error.includes("closed") &&
                  "Error"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">{error}</p>
              <Button onClick={loadForm} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form loaded successfully
  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <PublicFormPreview form={form} questions={questions} />
    </div>
  );
}
