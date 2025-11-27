/**
 * Chat History Sidebar Component
 * Shows previous AI chat sessions
 */

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Boilerplate data for chat history
const MOCK_CHAT_HISTORY = [
  {
    id: "1",
    title: "Customer Feedback Survey",
    preview: "Create a customer feedback survey with rating questions...",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    questionCount: 8,
  },
  {
    id: "2",
    title: "Event Registration Form",
    preview: "I need a registration form for our upcoming conference...",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    questionCount: 12,
  },
  {
    id: "3",
    title: "Employee Onboarding",
    preview: "Help me create an onboarding form for new employees...",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    questionCount: 15,
  },
  {
    id: "4",
    title: "Product Survey",
    preview: "Create a product feedback form with star ratings...",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    questionCount: 6,
  },
];

interface ChatHistorySidebarProps {
  onNewChat: () => void;
}

export function ChatHistorySidebar({ onNewChat }: ChatHistorySidebarProps) {
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
          {MOCK_CHAT_HISTORY.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-3 hover:bg-muted/50 transition-colors cursor-pointer group">
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
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                    {chat.preview}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pl-6">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(chat.createdAt, "MMM d, h:mm a")}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {chat.questionCount} questions
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="flex-shrink-0 p-4 border-t text-xs text-muted-foreground text-center">
        Previous chats are saved for 30 days
      </div>
    </div>
  );
}
