/**
 * AI Form Creation Page - Entry Point
 * Route: /ai/new
 * Landing page for AI form creation (no session created yet)
 * 
 * Flow:
 * - User lands here with empty chat
 * - NO database session created yet
 * - When user sends first message → creates session → smoothly transitions to /ai/[id]
 * - No full page reload - state managed locally
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AiChatInterface } from "@/components/ai/AiChatInterface";
import { FormPreviewPane } from "@/components/ai/FormPreviewPane";
import { ChatHistorySidebar } from "@/components/ai/ChatHistorySidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Sparkles } from "lucide-react";
import type { AiSession } from "@/lib/database/services/aiSession.service";

export default function AiCreateFormPage() {
  const router = useRouter();
  const [currentSession, setCurrentSession] = useState<AiSession | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleNewChat = useCallback(() => {
    // Reset state to start fresh
    setCurrentSession(null);
    setCurrentSessionId(null);
    // Update URL without reload
    router.replace("/ai/new");
  }, [router]);

  const handleSessionCreated = useCallback((sessionId: string, session: AiSession) => {
    // Update local state immediately
    setCurrentSession(session);
    setCurrentSessionId(sessionId);
    
    // Update URL without full page reload
    window.history.replaceState(
      { sessionId },
      "",
      `/ai/${sessionId}`
    );
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <PageHeader
        title="AI Form Creator"
        description={currentSession?.title || "Describe your form and let AI build it for you"}
        icon={Sparkles}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-50 dark:bg-purple-950"
      />

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Chat History Sidebar */}
        <div className="w-[280px] flex-shrink-0">
          <ChatHistorySidebar 
            onNewChat={handleNewChat}
            currentSessionId={currentSessionId || undefined}
          />
        </div>

        {/* Center: Chat Interface */}
        <div className="flex-1 min-w-0 border-r">
          <AiChatInterface 
            sessionId={currentSessionId || undefined}
            session={currentSession || undefined}
            onSessionCreated={handleSessionCreated}
          />
        </div>

        {/* Right: Form Preview */}
        <div className="w-[500px] flex-shrink-0 bg-muted/20">
          <FormPreviewPane 
            sessionId={currentSessionId || undefined}
            session={currentSession || undefined}
          />
        </div>
      </div>
    </div>
  );
}
