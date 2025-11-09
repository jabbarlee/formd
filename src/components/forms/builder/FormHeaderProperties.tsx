/**
 * Form Header Properties Component
 * Properties panel for editing form header (title, description, due date, time, location)
 */

"use client";

import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FormHeaderProperties() {
  const { form, updateFormField } = useFormBuilderStore();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Form Header</h3>
        <p className="text-sm text-muted-foreground">
          Configure your form&apos;s title, description, and metadata
        </p>
      </div>

      <Separator />

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="form-title">Form Title *</Label>
        <Input
          id="form-title"
          value={form.title}
          onChange={(e) => updateFormField("title", e.target.value)}
          placeholder="Enter form title..."
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          This will be displayed at the top of your form
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="form-description">Description</Label>
        <Textarea
          id="form-description"
          value={form.description || ""}
          onChange={(e) => updateFormField("description", e.target.value)}
          placeholder="Add a description for your form..."
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Provide additional context about what this form is for
        </p>
      </div>

      <Separator />

      {/* Due Date Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="has-due-date" className="cursor-pointer">
              Due Date
            </Label>
          </div>
          <Switch
            id="has-due-date"
            checked={form.hasDueDate || false}
            onCheckedChange={(checked) => {
              updateFormField("hasDueDate", checked);
              if (!checked) {
                updateFormField("dueDate", undefined);
                updateFormField("includeTime", false);
                updateFormField("dueTime", undefined);
              }
            }}
          />
        </div>

        {form.hasDueDate && (
          <div className="ml-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="due-date">Date</Label>
              <Input
                id="due-date"
                type="date"
                value={form.dueDate || ""}
                onChange={(e) => updateFormField("dueDate", e.target.value)}
              />
            </div>

            {/* Include Time Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="include-time" className="cursor-pointer">
                  Include Time
                </Label>
              </div>
              <Switch
                id="include-time"
                checked={form.includeTime || false}
                onCheckedChange={(checked) => {
                  updateFormField("includeTime", checked);
                  if (!checked) {
                    updateFormField("dueTime", undefined);
                  }
                }}
              />
            </div>

            {form.includeTime && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="due-time">Time</Label>
                <Input
                  id="due-time"
                  type="time"
                  value={form.dueTime || ""}
                  onChange={(e) => updateFormField("dueTime", e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="has-location" className="cursor-pointer">
              Location
            </Label>
          </div>
          <Switch
            id="has-location"
            checked={form.hasLocation || false}
            onCheckedChange={(checked) => {
              updateFormField("hasLocation", checked);
              if (!checked) {
                updateFormField("location", undefined);
              }
            }}
          />
        </div>

        {form.hasLocation && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="location">Location Details</Label>
            <Input
              id="location"
              value={form.location || ""}
              onChange={(e) => updateFormField("location", e.target.value)}
              placeholder="e.g., Main Conference Room, Building A"
            />
            <p className="text-xs text-muted-foreground">
              Specify where this form or event takes place
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Layout Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="unified-card-layout" className="cursor-pointer">
              Unified Card Layout
            </Label>
          </div>
          <Switch
            id="unified-card-layout"
            checked={form.unifiedCardLayout || false}
            onCheckedChange={(checked) =>
              updateFormField("unifiedCardLayout", checked)
            }
          />
        </div>
        <p className="text-xs text-muted-foreground ml-6">
          When enabled, all questions will appear in a single card. When
          disabled, each question will have its own separate card.
        </p>
      </div>

      <Separator />

      {/* Security Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="requires-password" className="cursor-pointer">
              Password Protection
            </Label>
          </div>
          <Switch
            id="requires-password"
            checked={form.requiresPassword || false}
            onCheckedChange={(checked) => {
              updateFormField("requiresPassword", checked);
              if (!checked) {
                updateFormField("formPassword", undefined);
                updateFormField("passwordHash", undefined);
              }
            }}
          />
        </div>

        {form.requiresPassword && (
          <div className="ml-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-password">Form Password</Label>
              <div className="relative">
                <Input
                  id="form-password"
                  type={showPassword ? "text" : "password"}
                  value={form.formPassword || ""}
                  onChange={(e) =>
                    updateFormField("formPassword", e.target.value)
                  }
                  placeholder="Enter password for form access..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Respondents will need to enter this password to access the form
              </p>
              {form.formPassword && form.formPassword.length < 6 && (
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  ⚠️ Password should be at least 6 characters for better
                  security
                </p>
              )}
              {form.formPassword && form.formPassword.length >= 6 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                  ✓ Password meets minimum security requirements
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
