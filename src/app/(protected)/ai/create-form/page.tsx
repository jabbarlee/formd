/**
 * AI Form Creation Page
 * Chat interface for creating forms with AI assistance
 */

"use client";

import { useEffect } from "react";
import { AiChatInterface } from "@/components/ai/AiChatInterface";
import { FormPreviewPane } from "@/components/ai/FormPreviewPane";
import { ChatHistorySidebar} from "@/components/ai/ChatHistorySidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Sparkles } from "lucide-react";
import { useChatStore } from "@/lib/stores/useChatStore";
import { toast } from "sonner";

export default function AiCreateFormPage() {
  const { currentChatId, createNewChat, clearChat } = useChatStore();

  // Initialize with a new chat if none exists
  useEffect(() => {
    if (!currentChatId) {
      initializeNewChat();
    }
  }, []);

  const initializeNewChat = async () => {
    try {
      await createNewChat("New Form");
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to initialize chat");
    }
  };

  const handleNewChat = async () => {
    try {
      clearChat();
      await createNewChat("New Form");
      toast.success("New chat started");
    } catch (error) {
      console.error("Failed to create new chat:", error);
      toast.error("Failed to start new chat");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header using PageHeader component */}
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

        {/* Center: Chat Interface */}
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
