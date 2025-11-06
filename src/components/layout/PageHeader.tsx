import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionButton?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actionButton,
}: PageHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="lg:hidden" />

        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
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

        {actionButton && (
          <Button
            onClick={actionButton.onClick}
            className="flex-shrink-0"
            size="default"
          >
            {actionButton.icon && (
              <actionButton.icon className="h-4 w-4 mr-2" />
            )}
            {actionButton.label}
          </Button>
        )}
      </div>
    </div>
  );
}
