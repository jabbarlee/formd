/**
 * Form Builder Toolbar Component
 * Top toolbar with form title, actions, and status
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  MoreVertical,
  Share2,
  Copy,
  Download,
  Trash2,
  Loader2,
  Edit3,
  Check,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FormBuilderToolbarProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
}

export function FormBuilderToolbar({
  isSaving = false,
  lastSaved = null,
  hasUnsavedChanges = false,
}: FormBuilderToolbarProps) {
  const router = useRouter();
  const {
    form,
    isDirty,
    isPreviewMode,
    updateFormField,
    saveForm,
    setPreviewMode,
  } = useFormBuilderStore();
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every 10 seconds to keep "X seconds ago" fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return null;

    const diffMs = currentTime.getTime() - lastSaved.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 10) return "just now";
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;

    return lastSaved.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    setIsSavingLocal(true);
    try {
      await saveForm();
      toast.success("Form saved successfully");
    } catch (error) {
      toast.error("Failed to save form");
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleShare = () => {
    toast.info("Share feature coming soon");
  };

  const handleBack = () => {
    if (isDirty) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirm) return;
    }
    router.push("/forms");
  };

  return (
    <div className="border-b bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Auto-save Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 text-sm">
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-muted-foreground">
                  Saved {getLastSavedText()}
                </span>
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Autosave is on</span>
              </>
            )}
          </div>

          {/* Status Selector */}
          <Select
            value={form.status || "draft"}
            onValueChange={(value: any) => updateFormField("status", value)}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Draft</span>
                </div>
              </SelectItem>
              <SelectItem value="published">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Published</span>
                </div>
              </SelectItem>
              <SelectItem value="closed">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Closed</span>
                </div>
              </SelectItem>
              <SelectItem value="archived">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-500" />
                  <span>Archived</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border" />

          {/* Edit/Preview Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={!isPreviewMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode(false)}
              className={cn(
                "rounded-r-none border-r-0",
                !isPreviewMode && "pointer-events-none"
              )}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant={isPreviewMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode(true)}
              className={cn(
                "rounded-l-none",
                isPreviewMode && "pointer-events-none"
              )}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Share Button */}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => toast.info("Coming soon")}>
                <Settings className="h-4 w-4 mr-2" />
                Form Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Coming soon")}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Form
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Coming soon")}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Coming soon")}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Form
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
