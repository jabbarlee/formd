/**
 * Form Builder Page
 * Main page for creating and editing forms
 * Route: /forms/new
 */

"use client";

import { useEffect } from "react";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import {
  QuestionPalette,
  FormCanvas,
  PropertiesPanel,
  FormBuilderToolbar,
} from "@/components/forms/builder";
import { FormPreview } from "@/components/forms/preview";

export default function FormBuilderPage() {
  const resetForm = useFormBuilderStore((state) => state.resetForm);
  const isPreviewMode = useFormBuilderStore((state) => state.isPreviewMode);

  // Reset form state when component mounts (new form)
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex-shrink-0 z-10">
        <FormBuilderToolbar />
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
