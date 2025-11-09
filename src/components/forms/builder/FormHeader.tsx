/**
 * Form Header Component
 * Displays and allows editing of form title, description, and metadata
 */

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface FormHeaderProps {
  isSelected: boolean;
}

export function FormHeader({ isSelected }: FormHeaderProps) {
  const { form, selectFormHeader } = useFormBuilderStore();

  const handleSelect = () => {
    selectFormHeader();
  };

  const formatDueDate = () => {
    if (!form.dueDate) return null;

    try {
      const date = new Date(form.dueDate);
      let formatted = format(date, "MMM dd, yyyy");

      if (form.includeTime && form.dueTime) {
        formatted += ` at ${form.dueTime}`;
      }

      return formatted;
    } catch (error) {
      return null;
    }
  };

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-200 overflow-hidden",
        isSelected
          ? "shadow-lg bg-primary/5 ring-2 ring-primary"
          : "hover:shadow-md bg-white"
      )}
      onClick={handleSelect}
    >
      {/* Header Badge */}
      <div className="absolute right-4 top-4">
        <Badge variant="secondary" className="text-xs">
          Form Header
        </Badge>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {form.title || "Untitled Form"}
            </h1>
          </div>

          {/* Description */}
          {form.description && (
            <div>
              <p className="text-base text-muted-foreground whitespace-pre-wrap">
                {form.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          {(form.hasDueDate || form.hasLocation) && (
            <div className="flex flex-wrap gap-4 pt-2">
              {/* Due Date */}
              {form.hasDueDate && formatDueDate() && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDueDate()}</span>
                </div>
              )}

              {/* Location */}
              {form.hasLocation && form.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{form.location}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Empty State Hint */}
      {!form.description && !form.hasDueDate && !form.hasLocation && (
        <div className="px-8 pb-6">
          <p className="text-xs text-muted-foreground italic">
            Click to add description, due date, or location
          </p>
        </div>
      )}
    </Card>
  );
}
