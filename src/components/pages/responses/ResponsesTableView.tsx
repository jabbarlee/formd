/**
 * Table View for Responses
 * Compact table view with sortable columns
 */

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  Trash2,
  Download,
  Mail,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Response {
  id: string;
  respondent: string;
  submittedAt: string;
  status: "completed" | "partial" | "flagged";
  score?: number;
  duration: string;
  data?: Record<string, any>; // Form response data
}

interface ResponsesTableViewProps {
  responses: Response[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
  onBulkAction?: (ids: string[], action: string) => void;
}

export function ResponsesTableView({
  responses,
  onView,
  onDelete,
  onExport,
  onBulkAction,
}: ResponsesTableViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({ field: "submittedAt", direction: "desc" });

  // Helper function to format response ID as R001, R002, etc.
  const formatResponseId = (id: string, index: number) => {
    const responseNumber = (index + 1).toString().padStart(3, "0");
    return `R${responseNumber}`;
  };

  // Helper function to extract email from response data
  const getRespondentEmail = (response: Response) => {
    if (!response.data) return response.respondent;

    // Debug: Log the response data structure to understand the format
    if (process.env.NODE_ENV === "development") {
      console.log("Response data keys:", Object.keys(response.data));
      console.log("Response data:", response.data);
    }

    // First, try to find email fields by common patterns
    const emailPatterns = [
      "email",
      "e-mail",
      "e_mail",
      "user_email",
      "respondent_email",
      "contact_email",
      "email_address",
    ];

    // Check for exact matches first (case insensitive)
    for (const pattern of emailPatterns) {
      const emailKey = Object.keys(response.data).find(
        (key) => key.toLowerCase() === pattern.toLowerCase()
      );
      if (emailKey && response.data[emailKey]) {
        return response.data[emailKey];
      }
    }

    // Check for partial matches
    const emailKeys = Object.keys(response.data).filter(
      (key) =>
        key.toLowerCase().includes("email") ||
        key.toLowerCase().includes("e-mail") ||
        key.toLowerCase().includes("e_mail")
    );

    if (emailKeys.length > 0) {
      const email = response.data[emailKeys[0]];
      if (email) return email;
    }

    // Look for any field that contains a valid email format
    for (const [key, value] of Object.entries(response.data)) {
      if (
        typeof value === "string" &&
        value.includes("@") &&
        value.includes(".")
      ) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          return value;
        }
      }
    }

    // If no email field found, return original respondent
    return response.respondent;
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timestamp; // Return original if invalid
      }

      // Format as: "Dec 12, 2024 at 2:30 PM"
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };

      const formattedDate = date.toLocaleDateString("en-US", dateOptions);
      const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

      return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
      // Return original timestamp if formatting fails
      return timestamp;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "partial":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
          >
            <Clock className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        );
      case "flagged":
        return (
          <Badge
            variant="secondary"
            className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Flagged
          </Badge>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 4.5) return "text-emerald-600 font-semibold";
    if (score >= 3.5) return "text-blue-600 font-semibold";
    if (score >= 2.5) return "text-amber-600 font-semibold";
    return "text-rose-600 font-semibold";
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === responses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(responses.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSort = (field: string) => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction?.(Array.from(selectedIds), "export")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-rose-100 hover:text-rose-600"
              onClick={() => onBulkAction?.(Array.from(selectedIds), "delete")}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === responses.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 hover:bg-transparent"
                  onClick={() => handleSort("id")}
                >
                  ID
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>

              <TableHead>Respondent</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 hover:bg-transparent"
                  onClick={() => handleSort("submittedAt")}
                >
                  Submitted
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response, index) => (
              <TableRow
                key={response.id}
                className={cn(
                  "hover:bg-muted/50",
                  selectedIds.has(response.id) && "bg-muted/30"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(response.id)}
                    onCheckedChange={() => toggleSelect(response.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {formatResponseId(response.id, index)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">
                      {getRespondentEmail(response)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatTimestamp(response.submittedAt)}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{response.duration}</TableCell>
                <TableCell>{getStatusBadge(response.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950"
                      onClick={() => onView?.(response.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-950"
                      onClick={() => onExport?.(response.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950"
                      onClick={() => onDelete?.(response.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
