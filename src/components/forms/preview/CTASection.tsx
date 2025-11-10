/**
 * CTA Section Component
 * Call-to-action to encourage users to create their own forms
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  const handleGetStarted = () => {
    // Navigate to sign up or main app
    window.open("/signup", "_blank");
  };

  return (
    <Card className={cn("shadow-lg border-primary/20", className)}>
      <CardContent className="py-8">
        <div className="text-center space-y-6">
          {/* Heading */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Want to create beautiful forms?
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join thousands of users who trust FormD to create stunning,
              professional forms that convert better and look amazing.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-medium text-foreground">✨ Beautiful</div>
              <div>Professional designs</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">⚡ Fast</div>
              <div>Setup in minutes</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">📊 Analytics</div>
              <div>Detailed insights</div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg min-w-[160px]"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* Small print */}
          <p className="text-xs text-muted-foreground">
            Free forever • No credit card required
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
