/**
 * Chat Message Component
 * Individual message bubble for user/AI messages
 */

"use client";

import { ChatMessage as ChatMessageType } from "@/lib/stores/useChatStore";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: isUser ? 20 : -20,
        scale: 0.95
      }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: 1
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Bubble */}
      <div 
        className={cn(
          "flex flex-col max-w-[70%] gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Sender & Time */}
        <div className={cn(
          "flex items-center gap-2 px-1",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="font-semibold text-xs">
            {isUser ? "You" : "AI Assistant"}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), "h:mm a")}
          </span>
        </div>

        {/* Content Bubble */}
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}
