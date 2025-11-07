/**
 * Form Builder Toolbar Component
 * Top toolbar with form title, actions, and status
 */

"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export function FormBuilderToolbar() {
  const router = useRouter();
  const { form, isDirty, isSaving, updateFormField, saveForm } =
    useFormBuilderStore();
  const [isSavingLocal, setIsSavingLocal] = useState(false);

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

  const handlePreview = () => {
    toast.info("Preview feature coming soon");
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

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Input
              value={form.title || "Untitled Form"}
              onChange={(e) => updateFormField("title", e.target.value)}
              className="font-semibold h-9 w-[300px]"
              placeholder="Form title"
            />
            {isDirty && (
              <Badge variant="outline" className="text-xs">
                Unsaved
              </Badge>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
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

          {/* Preview Button */}
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          {/* Share Button */}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!isDirty || isSavingLocal}
            size="sm"
          >
            {isSavingLocal ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
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
