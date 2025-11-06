import { PageHeader } from "@/components/layout/PageHeader";
import { Inbox, Download } from "lucide-react";

export function ResponsesHeader() {
  return (
    <PageHeader
      title="Responses"
      description="View and analyze all form submissions in one place."
      icon={Inbox}
      actionButton={{
        label: "Export Data",
        icon: Download,
        onClick: () => {
          // Handle export data
          console.log("Export data clicked");
        },
      }}
    />
  );
}
