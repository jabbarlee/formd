"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Download, Inbox, ArrowLeft, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";

interface FormResponsesHeaderProps {
  formTitle: string;
  formId: string;
  totalResponses: number;
  onExport: () => void;
}

export function FormResponsesHeader({
  formTitle,
  formId,
  totalResponses,
  onExport,
}: FormResponsesHeaderProps) {
  const router = useRouter();

  const handleAnalytics = () => {
    router.push(`/forms/${formId}/analytics`);
  };

  return (
    <div className="border-b bg-gradient-to-r from-background via-cyan-500/5 to-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="lg:hidden" />

        {/* Back button */}
        <Link href="/forms">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>

        {/* Form info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-600 flex-shrink-0 shadow-sm">
            <Inbox className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold truncate">{formTitle}</h1>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Responses
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {totalResponses} total{" "}
              {totalResponses === 1 ? "response" : "responses"}
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={handleAnalytics}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>

        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
