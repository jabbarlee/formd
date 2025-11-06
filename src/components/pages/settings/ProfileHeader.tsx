import { PageHeader } from "@/components/layout/PageHeader";
import { User, Save } from "lucide-react";

export function ProfileHeader() {
  return (
    <PageHeader
      title="Profile Settings"
      description="Manage your account settings and preferences."
      icon={User}
      actionButton={{
        label: "Save Changes",
        icon: Save,
        onClick: () => {
          // Handle save changes
          console.log("Save changes clicked");
        },
      }}
    />
  );
}
