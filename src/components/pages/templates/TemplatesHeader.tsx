import { PageHeader } from "@/components/layout/PageHeader";
import { Layout, Plus } from "lucide-react";

export function TemplatesHeader() {
  return (
    <PageHeader
      title="Templates"
      description="Browse and use pre-built form templates to get started quickly."
      icon={Layout}
      actionButton={{
        label: "Create Template",
        icon: Plus,
        onClick: () => {
          // Handle create template
          console.log("Create template clicked");
        },
      }}
    />
  );
}
