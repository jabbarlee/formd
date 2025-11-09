"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function FormsHeader() {
  const router = useRouter();

  const handleCreateForm = () => {
    // Generate a temporary ID for the new form
    // The form will be created in the database on first save
    const tempId = "new";
    router.push(`/forms/${tempId}`);
  };

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
        onClick: handleCreateForm,
      }}
    />
  );
}
