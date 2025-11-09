/**
 * Share Form Modal Component
 * Beautiful modal with QR code and shareable link
 */

"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formTitle: string;
  formSlug?: string;
}

export function ShareFormModal({
  isOpen,
  onClose,
  formId,
  formTitle,
  formSlug,
}: ShareFormModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate the public URL - prefer slug over UUID
  const publicUrl =
    typeof window !== "undefined"
      ? `${process.env.NEXT_PUBLIC_PUBLIC_DOMAIN}/f/${formSlug || formId}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenInNewTab = () => {
    window.open(publicUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Share2 className="h-6 w-6 text-primary" />
            Share Your Form
          </DialogTitle>
          <DialogDescription>
            Share this form with anyone using the link or QR code below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-slate-50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-slate-900 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-10 space-y-6">
              {/* QR Code */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-xl rounded-xl" />
                <div className="relative p-4 bg-white dark:bg-white rounded-xl shadow-xl ring-1 ring-black/5">
                  <QRCodeSVG
                    value={publicUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              {/* Form Title */}
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg text-foreground">
                  {formTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Scan QR code to open form
                </p>
              </div>
            </CardContent>
          </Card>

          {/* URL Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Form Link</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={publicUrl}
                  readOnly
                  className="pr-10 font-mono text-sm"
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className={cn(
                  "transition-colors",
                  copied && "bg-green-50 text-green-600 border-green-200"
                )}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              className="flex-1"
              variant="default"
              size="lg"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Form
            </Button>
          </div>

          {/* Additional Info */}
          <div className="pt-2 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Anyone with this link can view and submit responses to your form
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
