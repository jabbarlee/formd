/**
 * AI Chat Interface Component
 * Handles message display and user input with optimistic UI
 *
 * Features:
 * - Instant message display (optimistic UI)
 * - Loading state for AI responses
 * - Smooth URL transitions without full page reload
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "./ChatMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { aiSessionsApi } from "@/lib/api/aiSessions";
import type {
  AiSession,
  SessionMessage,
} from "@/lib/database/services/aiSession.service";
import { AnimatePresence, motion } from "framer-motion";

interface AiChatInterfaceProps {
  sessionId?: string;
  session?: AiSession;
  onSessionCreated?: (sessionId: string, session: AiSession) => void;
}

export function AiChatInterface({
  sessionId,
  session: initialSession,
  onSessionCreated,
}: AiChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [session, setSession] = useState<AiSession | undefined>(initialSession);
  const [optimisticUserMessage, setOptimisticUserMessage] =
    useState<SessionMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Update session when prop changes
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages, optimisticUserMessage, isGenerating]);

  const messages = session?.messages || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput("");

    // Create optimistic user message
    const optimisticMsg: SessionMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setOptimisticUserMessage(optimisticMsg);
    setIsGenerating(true);

    try {
      if (!sessionId) {
        // Entry mode: Create new session
        const { session: newSession } = await aiSessionsApi.createSession(
          userMessage
        );

        // Update local state immediately
        setSession(newSession);
        setOptimisticUserMessage(null);

        // Notify parent component (will handle URL update without reload)
        if (onSessionCreated) {
          onSessionCreated(newSession.id, newSession);
        } else {
          // Fallback: Use shallow routing
          router.replace(`/ai/${newSession.id}`, { shallow: true } as any);
        }

        toast.success("Form generated!");
      } else {
        // Active mode: Continue conversation
        const { session: updatedSession } = await aiSessionsApi.sendMessage(
          sessionId,
          userMessage
        );
        setSession(updatedSession);
        setOptimisticUserMessage(null);
        toast.success("Form updated!");
      }
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate form";
      toast.error(errorMessage);
      setOptimisticUserMessage(null);
    } finally {
      setIsGenerating(false);
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

  // Check if we should show empty state
  const showEmptyState =
    messages.length === 0 && !optimisticUserMessage && !isGenerating;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6 rounded-full mb-6">
              <Sparkles className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Describe Your Form</h2>
            <p className="text-muted-foreground max-w-md">
              Tell me what kind of form you need, and I'll create it for you
              with all the questions and fields.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full px-4 pb-4">
            <AnimatePresence initial={false}>
              {/* Existing Messages */}
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Optimistic User Message */}
              {optimisticUserMessage && (
                <ChatMessage
                  key="optimistic-user"
                  message={optimisticUserMessage}
                />
              )}
            </AnimatePresence>

            {/* AI Loading State */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3 mb-6"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-xs">AI Assistant</span>
                  </div>
                  <div className="px-6 py-4 rounded-2xl rounded-tl-sm bg-muted text-foreground shadow-sm inline-flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{
                          scale: [0.5, 1, 0.5],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0,
                        }}
                        className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                      <motion.div
                        animate={{
                          scale: [0.5, 1, 0.5],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.2,
                        }}
                        className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                      <motion.div
                        animate={{
                          scale: [0.5, 1, 0.5],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.4,
                        }}
                        className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4 space-y-3">
        {/* Sample Prompts (only on entry page with no messages) */}
        {!sessionId && showEmptyState && (
          <div className="flex flex-wrap gap-2 pb-4">
            {samplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                disabled={isGenerating}
                className="text-xs px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative pointer-events-auto"
          >
            {/* Gradient Glow Background */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 rounded-xl blur-sm" />

            {/* Main Input Container */}
            <div className="relative flex items-center gap-2 rounded-xl border border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-purple-50/90 via-white/90 to-blue-50/90 dark:from-purple-950/90 dark:via-background/90 dark:to-blue-950/90 backdrop-blur-xl shadow-xl p-2">
              {/* AI Sparkle Icon */}
              <div className="pl-2 flex items-center">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>

              {/* Input Field */}
              <Input
                type="text"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInput(e.target.value)
                }
                placeholder={
                  isGenerating
                    ? "AI is working..."
                    : "Ask AI to create your form..."
                }
                disabled={isGenerating}
                className="flex-1 border-0 shadow-none focus-visible:ring-0 h-10 bg-transparent placeholder:text-purple-400/60 dark:placeholder:text-purple-400/50 disabled:opacity-60"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              {/* Send Button */}
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isGenerating}
                className="h-10 w-10 shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
