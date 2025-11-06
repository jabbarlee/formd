"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { FileText, Plus } from "lucide-react";

export function FormsHeader() {
  return (
    <PageHeader
      title="Forms"
      description="Create, manage, and organize all your forms."
      icon={FileText}
      iconColor="text-violet-600"
      iconBgColor="bg-violet-50 dark:bg-violet-950"
      actionButton={{
        label: "Create Form",
        icon: Plus,
        variant: "default",
        onClick: () => {
          // Navigate to form builder or open create modal
          window.location.href = "/forms/new";
        },
      }}
    />
  );
}
