/**
 * Chat History Sidebar Component
 * Shows previous AI chat sessions from database
 */

"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Clock, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { aiChatsApi } from "@/lib/api/aiChats";
import type { AiChat } from "@/lib/database/services/aiChat.service";
import { useChatStore } from "@/lib/stores/useChatStore";
import { toast } from "sonner";

interface ChatHistorySidebarProps {
  onNewChat: () => void;
}

export function ChatHistorySidebar({ onNewChat }: ChatHistorySidebarProps) {
  const [chats, setChats] = useState<AiChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { loadChat, currentChatId } = useChatStore();

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const fetchedChats = await aiChatsApi.getUserChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = async (chatId: string) => {
    try {
      await loadChat(chatId);
      toast.success("Chat loaded");
    } catch (error) {
      console.error("Failed to load chat:", error);
      toast.error("Failed to load chat");
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent chat selection
    
    try {
      setDeletingId(chatId);
      await aiChatsApi.deleteChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      toast.success("Chat deleted");
      
      // If deleted chat was active, clear it
      if (currentChatId === chatId) {
        onNewChat();
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col border-r bg-card">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b space-y-3">
        <h2 className="font-semibold text-lg">Chat History</h2>
        <Button onClick={onNewChat} className="w-full gap-2">
          <Plus className="h-4 w-4" />
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
          ) : chats.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-muted-foreground">
                No chat history yet.
                <br />
                Start a new chat!
              </p>
            </div>
          ) : (
            chats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer group relative ${
                    currentChatId === chat.id ? "bg-muted border-primary" : ""
                  }`}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {chat.title}
                          </h3>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        disabled={deletingId === chat.id}
                      >
                        {deletingId === chat.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    {chat.messages.length > 0 && (
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                        {chat.messages[0]?.content || ""}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pl-6">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(chat.created_at), "MMM d, h:mm a")}
                      </div>
                      {chat.form_draft && (
                        <Badge variant="secondary" className="text-xs">
                          {chat.form_draft.questions?.length || 0} questions
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="flex-shrink-0 p-4 border-t text-xs text-muted-foreground text-center">
        Previous chats are saved for 30 days
      </div>
    </div>
  );
}
