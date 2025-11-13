"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { formsApi } from "@/lib/api/forms";
import { useState } from "react";

export function FormsHeader() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateForm = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);

      // Create a new form in the database first
      const { form } = await formsApi.createForm({
        title: "Untitled Form",
        description: "",
        status: "draft",
      });

      // Navigate to the actual form UUID
      router.push(`/forms/${form.id}`);
    } catch (error) {
      console.error("Failed to create form:", error);
      // Fallback to the old behavior if API call fails
      router.push(`/forms/new`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageHeader
      title="Forms"
      description="Create, manage, and organize all your forms."
      icon={FileText}
      iconColor="text-violet-600"
      iconBgColor="bg-violet-50 dark:bg-violet-950"
      actionButton={{
        label: isCreating ? "Creating..." : "Create Form",
        icon: Plus,
        variant: "default",
        onClick: handleCreateForm,
      }}
    />
  );
}
