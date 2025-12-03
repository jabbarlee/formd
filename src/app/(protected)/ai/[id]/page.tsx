/**
 * AI Form Creator - Active Session Page
 * Route: /ai/[id]
 * Shows active AI session with message history and form preview
 * 
 * Architecture:
 * - Loads session from database by ID
 * - 3-column layout: History | Chat | Preview
 * - Allows continuing conversation with smooth updates
 * - No full page reloads
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AiChatInterface } from "@/components/ai/AiChatInterface";
import { FormPreviewPane } from "@/components/ai/FormPreviewPane";
import { ChatHistorySidebar } from "@/components/ai/ChatHistorySidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Sparkles, Loader2 } from "lucide-react";
import { aiSessionsApi } from "@/lib/api/aiSessions";
import type { AiSession } from "@/lib/database/services/aiSession.service";
import { toast } from "sonner";

export default function AiSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<AiSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount or when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      const { session: loadedSession } = await aiSessionsApi.getSession(sessionId);
      setSession(loadedSession);
    } catch (error) {
      console.error("Failed to load session:", error);
      toast.error("Failed to load session");
      router.push("/ai/new");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = useCallback(() => {
    router.push("/ai/new");
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <PageHeader
        title="AI Form Creator"
        description={session.title}
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
            currentSessionId={sessionId}
          />
        </div>

        {/* Center: Chat Interface */}
        <div className="flex-1 min-w-0 border-r">
          <AiChatInterface sessionId={sessionId} session={session} />
        </div>

        {/* Right: Form Preview */}
        <div className="w-[500px] flex-shrink-0 bg-muted/20">
          <FormPreviewPane sessionId={sessionId} session={session} />
        </div>
      </div>
    </div>
  );
}
