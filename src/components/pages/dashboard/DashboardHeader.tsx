
"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Home, Plus } from "lucide-react";

export function DashboardHeader() {
  return (
    <PageHeader
      title="Dashboard"
      description="Welcome back! Here's your productivity overview."
      icon={Home}
      actionButton={{
        label: "Quick Add",
        icon: Plus,
        onClick: () => {
          // Handle quick add action
          console.log("Quick add clicked");
        },
      }}
    />
  );
}
