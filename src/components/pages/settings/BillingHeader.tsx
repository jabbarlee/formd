"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { CreditCard, Sparkles } from "lucide-react";

export function BillingHeader() {
  return (
    <PageHeader
      title="Billing & Subscription"
      description="Manage your subscription plan and billing information."
      icon={CreditCard}
      iconColor="text-rose-600"
      iconBgColor="bg-rose-50 dark:bg-rose-950"
      actionButton={{
        label: "Upgrade Plan",
        icon: Sparkles,
        variant: "default",
        onClick: () => {
          // Handle upgrade plan
          console.log("Upgrade plan clicked");
        },
      }}
    />
  );
}
