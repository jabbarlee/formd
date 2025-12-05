"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BarChart3, Download, FileJson } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { analyticsApi } from "@/lib/api/analytics";
import { TimeRangeFilter } from "@/lib/types/analytics";
import { toast } from "sonner";

interface AnalyticsHeaderProps {
  formId?: string;
  timeRange?: TimeRangeFilter;
}

export function AnalyticsHeader({ formId, timeRange }: AnalyticsHeaderProps = {}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    if (!formId || !timeRange) {
      toast.error("Cannot export: Form ID or time range not available");
      return;
    }

    setIsExporting(true);
    try {
      await analyticsApi.exportAnalytics(formId, timeRange, format);
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export analytics");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageHeader
      title="Analytics"
      description="Track performance and gain insights from your forms."
      icon={BarChart3}
      iconColor="text-emerald-600"
      iconBgColor="bg-emerald-50 dark:bg-emerald-950"
      customAction={
        formId && timeRange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Report"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileJson className="mr-2 h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : undefined
      }
    />
  );
}
