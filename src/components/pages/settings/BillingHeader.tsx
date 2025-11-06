"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { CreditCard, Sparkles } from "lucide-react";

export function BillingHeader() {
  return (
    <PageHeader
      title="Billing & Subscription"
      description="Manage your subscription plan and billing information."
      icon={CreditCard}
      actionButton={{
        label: "Upgrade Plan",
        icon: Sparkles,
        onClick: () => {
          // Handle upgrade plan
          console.log("Upgrade plan clicked");
        },
      }}
    />
  );
}
