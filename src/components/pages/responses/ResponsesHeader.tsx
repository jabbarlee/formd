"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Inbox, Download } from "lucide-react";

export function ResponsesHeader() {
  return (
    <PageHeader
      title="Responses"
      description="View and analyze all form submissions in one place."
      icon={Inbox}
      iconColor="text-cyan-600"
      iconBgColor="bg-cyan-50 dark:bg-cyan-950"
      actionButton={{
        label: "Export Data",
        icon: Download,
        variant: "outline",
        onClick: () => {
          // Handle export data
          console.log("Export data clicked");
        },
      }}
    />
  );
}
