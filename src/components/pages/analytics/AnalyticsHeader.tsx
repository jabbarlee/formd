import { PageHeader } from "@/components/layout/PageHeader";
import { BarChart3, Download } from "lucide-react";

export function AnalyticsHeader() {
  return (
    <PageHeader
      title="Analytics"
      description="Track performance and gain insights from your forms."
      icon={BarChart3}
      actionButton={{
        label: "Export Report",
        icon: Download,
        onClick: () => {
          // Handle export report
          console.log("Export report clicked");
        },
      }}
    />
  );
}
