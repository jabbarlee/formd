/**
 * AI Form Creation Page
 * Chat interface for creating forms with AI assistance
 */

"use client";

import { AiChatInterface } from "@/components/ai/AiChatInterface";
import { FormPreviewPane } from "@/components/ai/FormPreviewPane";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AiCreateFormPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/forms")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">AI Form Creator</h1>
              <p className="text-sm text-muted-foreground">
                Describe your form and let AI build it for you
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Chat Interface */}
        <div className="flex-1 min-w-0 border-r">
          <AiChatInterface />
        </div>

        {/* Right: Form Preview */}
        <div className="w-[500px] flex-shrink-0 bg-muted/20">
          <FormPreviewPane />
        </div>
      </div>
    </div>
  );
}
