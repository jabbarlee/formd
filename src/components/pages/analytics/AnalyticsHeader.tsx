"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { BarChart3, Download } from "lucide-react";

export function AnalyticsHeader() {
  return (
    <PageHeader
      title="Analytics"
      description="Track performance and gain insights from your forms."
      icon={BarChart3}
      iconColor="text-emerald-600"
      iconBgColor="bg-emerald-50 dark:bg-emerald-950"
      actionButton={{
        label: "Export Report",
        icon: Download,
        variant: "outline",
        onClick: () => {
          // Handle export report
          console.log("Export report clicked");
        },
      }}
    />
  );
}
