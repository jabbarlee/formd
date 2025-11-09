/**
 * useAutoSave Hook
 * Automatically saves form changes with debouncing and background processing
 * Implements optimistic updates for fast user experience
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { Form, Question } from "@/lib/types/forms";
import { formsApi } from "@/lib/api/forms";

export interface AutoSaveOptions {
  debounceMs?: number; // Default: 2000ms (2 seconds)
  onSaveStart?: () => void;
  onSaveSuccess?: (newFormId?: string) => void;
  onSaveError?: (error: Error) => void;
  enabled?: boolean; // Default: true
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  hasUnsavedChanges: boolean;
}

/**
 * Auto-save hook for form builder
 * Debounces changes and saves in the background
 */
export function useAutoSave(
  formId: string | undefined,
  form: Partial<Form>,
  questions: Question[],
  options: AutoSaveOptions = {}
) {
  const {
    debounceMs = 2000,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
    enabled = true,
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    hasUnsavedChanges: false,
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>("");
  const isSavingRef = useRef(false);

  /**
   * Save function
   */
  const save = useCallback(async () => {
    if (!enabled || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setState((prev) => ({ ...prev, isSaving: true, error: null }));
    onSaveStart?.();

    try {
      // If no formId, create a new form first
      if (!formId) {
        console.log("🆕 Creating new form on first save...");
        
        // Ensure slug is set
        const formData = {
          ...form,
          slug: form.slug || `form-${Date.now()}`,
        };
        
        const { form: newForm } = await formsApi.createForm(formData);
        console.log("✅ Form created with ID:", newForm.id);

        // Update the form with questions
        await formsApi.updateForm(newForm.id, formData, questions);

        setState((prev) => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
        }));

        // Notify parent with new form ID
        onSaveSuccess?.(newForm.id);
      } else {
        // Update existing form with questions
        await formsApi.updateForm(formId, form, questions);

        setState((prev) => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
        }));

        onSaveSuccess?.();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Save failed");
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: err,
      }));

      onSaveError?.(err);
    } finally {
      isSavingRef.current = false;
    }
  }, [
    enabled,
    formId,
    form,
    questions,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
  ]);

  /**
   * Trigger save with debounce
   */
  const triggerSave = useCallback(() => {
    if (!enabled) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    // Mark as having unsaved changes
    setState((prev) => ({ ...prev, hasUnsavedChanges: true }));
  }, [enabled, debounceMs, save]);

  /**
   * Watch for changes
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentData = JSON.stringify({ form, questions });

    // Skip first render
    if (previousDataRef.current === "") {
      previousDataRef.current = currentData;
      return;
    }

    // Check if data actually changed
    if (currentData !== previousDataRef.current) {
      previousDataRef.current = currentData;
      triggerSave();
    }
  }, [form, questions, enabled, triggerSave]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Force save immediately (skip debounce)
   */
  const forceSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await save();
  }, [save]);

  return {
    ...state,
    forceSave,
  };
}
