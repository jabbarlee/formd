"use client";

/**
 * TimeRangeSelector Component
 * Dropdown selector for analytics time ranges with custom date picker
 */

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { TimeRangeFilter, TimeRange } from "@/lib/types/analytics";

interface TimeRangeSelectorProps {
  value: TimeRangeFilter;
  onChange: (timeRange: TimeRangeFilter) => void;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const [customStart, setCustomStart] = useState<string>(
    value.customStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customEnd, setCustomEnd] = useState<string>(
    value.customEnd || new Date().toISOString().split('T')[0]
  );

  const handleRangeChange = (range: TimeRange) => {
    if (range === 'custom') {
      onChange({
        range: 'custom',
        customStart,
        customEnd,
      });
    } else {
      onChange({ range });
    }
  };

  const handleCustomDateChange = () => {
    if (value.range === 'custom') {
      onChange({
        range: 'custom',
        customStart,
        customEnd,
      });
    }
  };

  const currentLabel = timeRangeOptions.find(opt => opt.value === value.range)?.label || 'Select Range';

  return (
    <div className="flex items-center gap-2">
      <Select value={value.range} onValueChange={(val) => handleRangeChange(val as TimeRange)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range">
            {currentLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {timeRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.range === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Custom Date Range</h4>
                <p className="text-sm text-muted-foreground">
                  Select start and end dates for your analytics
                </p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start-date">Start Date</Label>
                  <input
                    id="start-date"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end-date">End Date</Label>
                  <input
                    id="end-date"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Button onClick={handleCustomDateChange} className="w-full">
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

