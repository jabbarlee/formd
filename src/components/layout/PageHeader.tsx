import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  actionButton?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
  };
  customAction?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  actionButton,
  customAction,
}: PageHeaderProps) {
  return (
    <div className="border-b bg-gradient-to-r from-background via-primary/5 to-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="lg:hidden" />

        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgColor} ${iconColor} flex-shrink-0 shadow-sm`}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="text-xl font-semibold truncate">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        {customAction || (actionButton && (
          <Button
            onClick={actionButton.onClick}
            className="flex-shrink-0 shadow-sm"
            size="default"
            variant={actionButton.variant || "default"}
          >
            {actionButton.icon && (
              <actionButton.icon className="h-4 w-4 mr-2" />
            )}
            {actionButton.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
