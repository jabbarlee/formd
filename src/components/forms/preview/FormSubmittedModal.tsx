/**
 * Form Submitted Modal Component
 * Shows success message after form submission
 */

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSubmittedModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  redirectUrl?: string;
  autoRedirectSeconds?: number;
}

export function FormSubmittedModal({
  isOpen,
  onClose,
  message = "Thank you for your submission!",
  redirectUrl,
  autoRedirectSeconds = 5,
}: FormSubmittedModalProps) {
  const [countdown, setCountdown] = useState(autoRedirectSeconds);

  useEffect(() => {
    if (!isOpen || !redirectUrl) return;

    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, redirectUrl]);

  const handleRedirectNow = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Submission Successful!
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          {redirectUrl && (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Redirecting in{" "}
                  <span className="font-semibold text-foreground">
                    {countdown}
                  </span>{" "}
                  {countdown === 1 ? "second" : "seconds"}...
                </p>
              </div>
              <Button onClick={handleRedirectNow} className="w-full" size="lg">
                Continue Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {!redirectUrl && (
            <Button onClick={onClose} className="w-full" size="lg">
              Close
            </Button>
          )}

          {redirectUrl && (
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              Stay on this page
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
