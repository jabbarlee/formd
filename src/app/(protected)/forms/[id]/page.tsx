/**
 * Form Builder Page - Dynamic Route
 * Main page for creating and editing forms
 * Route: /forms/[id] where id can be "new" for creation or UUID for editing
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  QuestionPalette,
  FormCanvas,
  PropertiesPanel,
  FormBuilderToolbar,
  AiFormGenerator,
} from "@/components/forms/builder";
import { FormPreview } from "@/components/forms/preview";
import { Loader2, AlertCircle } from "lucide-react";

// Import auth debug utility in development
// Temporarily disabled - causes server-side import issues
// if (process.env.NODE_ENV === "development") {
//   import("@/lib/utils/auth-debug");
// }

import { SAMPLE_FORM_DATA } from "@/data/sample-form";

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const isNewForm = formId === "new";
  const isSampleForm = formId === "sample";

  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const {
    form,
    questions,
    resetForm,
    loadForm,
    createForm,
    updateFormField,
    setFormWithQuestions,
    isPreviewMode,
    isSaving: isLoading,
    error: loadError,
  } = useFormBuilderStore();

  // Auto-save with 2-second debounce (enabled for both new and existing forms)
  const {
    isSaving,
    lastSaved,
    error: saveError,
    hasUnsavedChanges,
  } = useAutoSave(form.id, form, questions, {
    debounceMs: 2000,
    enabled: true, // Always enabled - will create form on first save if needed
    onSaveSuccess: (newFormId) => {
      if (newFormId) {
        // Form was just created, update URL and form state
        console.log("✅ Form created with ID:", newFormId);
        window.history.replaceState(null, "", `/forms/${newFormId}`);
        updateFormField("id", newFormId);
      } else {
        console.log("✅ Auto-saved successfully");
      }
    },
    onSaveError: (error) => {
      console.error("❌ Auto-save failed:", error);
    },
  });

  /**
   * Initialize form based on route
   * - If "new": Reset form (will be created on first save)
   * - If UUID: Load existing form from database
   */
  useEffect(() => {
    const initializeForm = async () => {
      setIsInitializing(true);
      setInitError(null);

      try {
        if (isNewForm) {
          // Reset to default form for new creation
          // The form will be created in database on first save via auto-save
          console.log("🆕 Initializing new form (not saved yet)");
          resetForm();
        } else if (isSampleForm) {
          // Load sample form data
          console.log("📝 Loading sample form");
          setFormWithQuestions(SAMPLE_FORM_DATA.form, SAMPLE_FORM_DATA.questions);
        } else {
          // Load existing form
          console.log("📂 Loading existing form:", formId);
          await loadForm(formId);
          console.log("✅ Form loaded successfully");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to initialize form";
        console.error("❌ Form initialization error:", message);
        setInitError(message);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeForm();
  }, [formId, isNewForm, isSampleForm, resetForm, loadForm, setFormWithQuestions, router]);

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {isNewForm ? "Creating new form..." : "Loading form..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (initError || loadError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">Failed to Load Form</h2>
          <p className="text-muted-foreground">{initError || loadError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/forms")}
              className="px-4 py-2 border rounded-md hover:bg-muted"
            >
              Back to Forms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Toolbar with Auto-save Status */}
      <div className="flex-shrink-0 z-10 relative">
        <FormBuilderToolbar
          isSaving={isSaving}
          lastSaved={lastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>

      {/* Main Content - 3 Column Layout or Preview */}
      {isPreviewMode ? (
        <div className="flex-1 min-h-0">
          <FormPreview />
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar - Question Palette */}
          <div className="w-[280px] flex-shrink-0 h-full overflow-hidden">
            <QuestionPalette />
          </div>

          {/* Center - Form Canvas */}
          <div className="flex-1 min-w-0 h-full overflow-hidden bg-muted/20">
            <FormCanvas />
          </div>

          {/* Right Sidebar - Properties Panel */}
          <div className="w-[320px] flex-shrink-0 h-full overflow-hidden">
            <PropertiesPanel />
          </div>
        </div>
      )}
      
      {/* AI Form Generator - Disabled for now, using dedicated /ai/new page */}
      {/* <AiFormGenerator /> */}
    </div>
  );
}
