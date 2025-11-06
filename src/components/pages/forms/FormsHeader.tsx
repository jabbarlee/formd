"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { FileText, Plus } from "lucide-react";

export function FormsHeader() {
  return (
    <PageHeader
      title="Forms"
      description="Create, manage, and organize all your forms."
      icon={FileText}
      actionButton={{
        label: "Create Form",
        icon: Plus,
        onClick: () => {
          // Navigate to form builder or open create modal
          window.location.href = "/forms/new";
        },
      }}
    />
  );
}
