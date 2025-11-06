"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Layout, Plus } from "lucide-react";

export function TemplatesHeader() {
  return (
    <PageHeader
      title="Templates"
      description="Browse and use pre-built form templates to get started quickly."
      icon={Layout}
      iconColor="text-amber-600"
      iconBgColor="bg-amber-50 dark:bg-amber-950"
      actionButton={{
        label: "Create Template",
        icon: Plus,
        variant: "default",
        onClick: () => {
          // Handle create template
          console.log("Create template clicked");
        },
      }}
    />
  );
}
