"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Home, Plus } from "lucide-react";

export function DashboardHeader() {
  return (
    <PageHeader
      title="Dashboard"
      description="Welcome back! Here's your productivity overview."
      icon={Home}
      iconColor="text-blue-600"
      iconBgColor="bg-blue-50 dark:bg-blue-950"
      actionButton={{
        label: "Quick Add",
        icon: Plus,
        variant: "default",
        onClick: () => {
          // Handle quick add action
          console.log("Quick add clicked");
        },
      }}
    />
  );
}
