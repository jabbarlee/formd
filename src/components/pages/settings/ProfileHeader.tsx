"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { User, Save } from "lucide-react";

export function ProfileHeader() {
  return (
    <PageHeader
      title="Profile Settings"
      description="Manage your account settings and preferences."
      icon={User}
      iconColor="text-indigo-600"
      iconBgColor="bg-indigo-50 dark:bg-indigo-950"
    />
  );
}
