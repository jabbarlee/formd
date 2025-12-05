"use client";

import { useState, ReactNode } from "react";
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
import { TimeRangeSelector } from "@/components/analytics/TimeRangeSelector";
import { toast } from "sonner";

interface AnalyticsHeaderProps {
  formId?: string;
  timeRange?: TimeRangeFilter;
  onTimeRangeChange?: (timeRange: TimeRangeFilter) => void;
  title?: string;
  description?: string;
}

export function AnalyticsHeader({ 
  formId, 
  timeRange, 
  onTimeRangeChange,
  title = "Analytics",
  description = "Track performance and gain insights from your forms."
}: AnalyticsHeaderProps = {}) {
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

  // Build custom action based on props
  let customAction: ReactNode = undefined;
  
  if (formId && timeRange) {
    // Form-specific analytics - show export button
    customAction = (
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
    );
  } else if (timeRange && onTimeRangeChange) {
    // Workspace analytics - show time range selector in header
    customAction = (
      <TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
    );
  }

  return (
    <PageHeader
      title={title}
      description={description}
      icon={BarChart3}
      iconColor="text-emerald-600"
      iconBgColor="bg-emerald-50 dark:bg-emerald-950"
      customAction={customAction}
    />
  );
}
