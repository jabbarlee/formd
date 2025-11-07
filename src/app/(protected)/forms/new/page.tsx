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

export default function FormBuilderPage() {
  const resetForm = useFormBuilderStore((state) => state.resetForm);

  // Reset form state when component mounts (new form)
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Toolbar */}
      <FormBuilderToolbar />

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Question Palette */}
        <div className="w-[280px] flex-shrink-0">
          <QuestionPalette />
        </div>

        {/* Center - Form Canvas */}
        <div className="flex-1 overflow-hidden">
          <FormCanvas />
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-[320px] flex-shrink-0">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
