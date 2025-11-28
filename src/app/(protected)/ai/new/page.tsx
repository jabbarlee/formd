/**
 * AI Form Creation Page - Entry Point
 * Route: /ai/new
 * Landing page for AI form creation (no session created yet)
 * 
 * Flow:
 * - User lands here with empty chat
 * - NO database session created yet
 * - When user sends first message → creates session → redirects to /ai/[id]
 */

"use client";

import { AiChatInterface } from "@/components/ai/AiChatInterface";
import { FormPreviewPane } from "@/components/ai/FormPreviewPane";
import { ChatHistorySidebar } from "@/components/ai/ChatHistorySidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Sparkles } from "lucide-react";

export default function AiCreateFormPage() {
  const handleNewChat = () => {
    // Already on create page, just refresh
    window.location.reload();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <PageHeader
        title="AI Form Creator"
        description="Describe your form and let AI build it for you"
        icon={Sparkles}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-50 dark:bg-purple-950"
      />

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Chat History Sidebar */}
        <div className="w-[280px] flex-shrink-0">
          <ChatHistorySidebar onNewChat={handleNewChat} />
        </div>

        {/* Center: Chat Interface (no session yet) */}
        <div className="flex-1 min-w-0 border-r">
          <AiChatInterface />
        </div>

        {/* Right: Form Preview (empty until first message) */}
        <div className="w-[500px] flex-shrink-0 bg-muted/20">
          <FormPreviewPane />
        </div>
      </div>
    </div>
  );
}
