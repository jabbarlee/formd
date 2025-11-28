/**
 * Chat History Sidebar Component
 * Shows previous AI chat sessions from database
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Plus, Clock, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { aiSessionsApi } from "@/lib/api/aiSessions";
import type { AiSession } from "@/lib/database/services/aiSession.service";
import { toast } from "sonner";

interface ChatHistorySidebarProps {
  onNewChat: () => void;
  currentSessionId?: string;
}

export function ChatHistorySidebar({ onNewChat, currentSessionId }: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const { sessions: loadedSessions } = await aiSessionsApi.getUserSessions();
      setSessions(loadedSessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/ai/${sessionId}`);
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    
    try {
      setDeletingId(sessionId);
      await aiSessionsApi.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success("Session deleted");

      // If deleting current session, redirect to create page
      if (sessionId === currentSessionId) {
        router.push("/ai/create-form");
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col border-r bg-muted/20">
      {/* Header */}
      <div className="p-4 border-b">
        <Button
          onClick={onNewChat}
          className="w-full"
          variant="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No chat history yet
              </p>
            </div>
          ) : (
            sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`p-3 cursor-pointer transition-all hover:bg-accent group ${
                    session.id === currentSessionId
                      ? "bg-accent border-primary"
                      : ""
                  }`}
                  onClick={() => handleSessionClick(session.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(session.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      {session.messages.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {session.messages[session.messages.length - 1].content}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(session.id, e)}
                      disabled={deletingId === session.id}
                    >
                      {deletingId === session.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
