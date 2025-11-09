/**
 * Form Builder Page
 * Main page for creating and editing forms
 * Route: /forms/new (create) or /forms/[id]/edit (edit)
 */

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  QuestionPalette,
  FormCanvas,
  PropertiesPanel,
  FormBuilderToolbar,
} from "@/components/forms/builder";
import { FormPreview } from "@/components/forms/preview";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function FormBuilderPage() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");

  const {
    form,
    questions,
    resetForm,
    loadForm,
    isPreviewMode,
    isSaving: isLoading,
    error: loadError,
  } = useFormBuilderStore();

  // Auto-save with 2-second debounce
  const {
    isSaving,
    lastSaved,
    error: saveError,
    hasUnsavedChanges,
  } = useAutoSave(form.id, form, questions, {
    debounceMs: 2000,
    enabled: !!form.id, // Only enable auto-save after form is created
    onSaveSuccess: () => {
      console.log("✅ Auto-saved successfully");
    },
    onSaveError: (error) => {
      console.error("❌ Auto-save failed:", error);
    },
  });

  // Load form if editing, or reset for new form
  useEffect(() => {
    if (formId) {
      loadForm(formId).catch((error) => {
        console.error("Failed to load form:", error);
      });
    } else {
      resetForm();
    }
  }, [formId, resetForm, loadForm]);

  // Show loading state
  if (isLoading && !form.id) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">Failed to Load Form</h2>
          <p className="text-muted-foreground">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Toolbar with Save Status */}
      <div className="flex-shrink-0 z-10 relative">
        <FormBuilderToolbar />

        {/* Auto-save status indicator */}
        {form.id && (
          <div className="absolute top-4 right-4 flex items-center gap-2 text-sm">
            {isSaving && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}

            {!isSaving && hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Unsaved changes</span>
              </div>
            )}

            {!isSaving && !hasUnsavedChanges && lastSaved && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                <CheckCircle className="h-4 w-4" />
                <span>
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Save failed</span>
              </div>
            )}
          </div>
        )}
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
    </div>
  );
}
