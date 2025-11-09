/**
 * Form Password Gate Component
 * Shows a password entry screen for password-protected forms
 */

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { verifyPassword } from "@/lib/utils/password";

interface FormPasswordGateProps {
  formTitle: string;
  passwordHash: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function FormPasswordGate({
  formTitle,
  passwordHash,
  onSuccess,
  onCancel,
}: FormPasswordGateProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const isValid = await verifyPassword(password, passwordHash);

      if (isValid) {
        // Store access token (in real app, you'd want a more secure approach)
        sessionStorage.setItem(`form_access_${passwordHash}`, "granted");
        onSuccess();
      } else {
        setAttempts((prev) => prev + 1);
        setError("Incorrect password. Please try again.");
        setPassword("");

        // Lock out after too many attempts
        if (attempts >= 4) {
          setError(
            "Too many failed attempts. Please try again later or contact the form creator."
          );
        }
      }
    } catch (err) {
      setError("An error occurred while verifying the password.");
      console.error("Password verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="space-y-6">
          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Password Protected</h1>
            <p className="text-muted-foreground">
              This form requires a password to access
            </p>
            <p className="text-sm font-medium text-foreground mt-4">
              {formTitle}
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Enter Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter form password"
                  disabled={isVerifying || attempts >= 5}
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isVerifying || attempts >= 5}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Attempt Counter */}
            {attempts > 0 && attempts < 5 && (
              <p className="text-xs text-muted-foreground text-center">
                {5 - attempts} attempt{5 - attempts !== 1 ? "s" : ""} remaining
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={!password || isVerifying || attempts >= 5}
              >
                {isVerifying ? "Verifying..." : "Access Form"}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={onCancel}
                  disabled={isVerifying}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {/* Help Text */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have the password?{" "}
              <span className="text-foreground">Contact the form creator</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
