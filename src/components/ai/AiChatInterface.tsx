/**
 * AI Chat Interface Component
 * Handles message display and user input
 * 
 * Two modes:
 * 1. Entry mode (no session): Creates session on first message, redirects to /ai/[id]
 * 2. Active mode (has session): Shows history, continues conversation
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "./ChatMessage";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { aiSessionsApi } from "@/lib/api/aiSessions";
import type { AiSession } from "@/lib/database/services/aiSession.service";
import { AnimatePresence, motion } from "framer-motion";

interface AiChatInterfaceProps {
  sessionId?: string;
  session?: AiSession;
}

export function AiChatInterface({ sessionId, session: initialSession }: AiChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [session, setSession] = useState<AiSession | undefined>(initialSession);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Update session when prop changes
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  const messages = session?.messages || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput("");
    setIsGenerating(true);

    try {
      if (!sessionId) {
        // Entry mode: Create new session and redirect
        const { session: newSession } = await aiSessionsApi.createSession(userMessage);
        toast.success("Form generated!");
        router.push(`/ai/${newSession.id}`);
      } else {
        // Active mode: Continue conversation
        const { session: updatedSession } = await aiSessionsApi.sendMessage(sessionId, userMessage);
        setSession(updatedSession);
        toast.success("Form updated!");
      }
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate form";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Sample prompts (only show on entry page)
  const samplePrompts = [
    "Create a customer feedback survey",
    "Build an event registration form",
    "Make an employee onboarding checklist",
    "Design a product order form",
    "Generate a job application form",
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6 rounded-full mb-6">
              <Sparkles className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              Describe Your Form
            </h2>
            <p className="text-muted-foreground max-w-md">
              Tell me what kind of form you need, and I'll create it for you with all the questions and fields.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full px-4 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-muted-foreground pl-11 mb-4"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4 space-y-3">
        {/* Sample Prompts (only on entry page) */}
        {!sessionId && messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                className="text-xs px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Field */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={sessionId ? "Continue the conversation..." : "Describe the form you want to create..."}
            className="min-h-[10px] max-h-[200px] resize-none py-3"
            rows={1}
            disabled={isGenerating}
          />
          <Button
            type="submit"
            size="lg"
            disabled={!input.trim() || isGenerating}
            className="h-auto px-6"
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Send
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
