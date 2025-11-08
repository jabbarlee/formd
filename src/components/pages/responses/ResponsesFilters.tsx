"use client";

import { ResponseFilters as ResponseFiltersType } from "@/lib/types/forms";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResponsesFiltersProps {
  filters: ResponseFiltersType;
  onFiltersChange: (filters: ResponseFiltersType) => void;
  totalCount: number;
  filteredCount: number;
}

export function ResponsesFilters({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: ResponsesFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? undefined : (value as any),
    });
  };

  const handleDeviceChange = (value: string) => {
    onFiltersChange({
      ...filters,
      device: value === "all" ? undefined : (value as any),
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: undefined,
      status: undefined,
      device: undefined,
    });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== "all") ||
    (filters.device && filters.device !== "all");

  const activeFilterCount = [
    filters.search,
    filters.status && filters.status !== "all",
    filters.device && filters.device !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or ID..."
            className="pl-10 pr-10"
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {filters.search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        {/* Device Filter */}
        <Select
          value={filters.device || "all"}
          onValueChange={handleDeviceChange}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Devices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters ? (
            <>
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Showing {filteredCount} of {totalCount} responses
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} active
              </Badge>
            </>
          ) : (
            <span className="text-muted-foreground">
              Showing all {totalCount} responses
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
