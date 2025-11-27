/**
 * AI Chat Interface Component
 * Handles message display and user input
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/lib/stores/useChatStore";
import { ChatMessage } from "./ChatMessage";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../ui/input";

export function AiChatInterface() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isGenerating, addMessage, updateCurrentForm, setGenerating, setError } =
    useChatStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    addMessage({ role: "user", content: userMessage });
    setGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate form");
      }

      // Add AI response
      addMessage({
        role: "assistant",
        content: `I've ${messages.length > 0 ? "updated" : "created"} your form based on your request. You can see the preview on the right.`,
      });

      // Update form preview
      updateCurrentForm({
        form: data.form,
        questions: data.questions,
      });
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate form";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Start Creating with AI
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Describe the form you want to create, and I'll build it for
                    you. You can refine it by asking for changes.
                  </p>
                </div>
                <div className="text-left space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium">Try asking:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>"Create a customer satisfaction survey"</li>
                    <li>"Build a registration form for a conference"</li>
                    <li>"Make a feedback form with star ratings"</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isGenerating && (
                <div className="flex gap-3 py-4 px-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="font-semibold text-sm">AI Assistant</span>
                    <div className="text-sm text-muted-foreground">
                      Generating your form...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-card">
        {/* Sample Prompts */}
        {messages.length === 0 && (
          <div className="px-4 pt-4 pb-2">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs text-muted-foreground mb-2">Try these:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { text: "Customer feedback survey", color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" },
                  { text: "Event registration form", color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200" },
                  { text: "Contact form with validation", color: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200" },
                  { text: "Employee satisfaction survey", color: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200" },
                  { text: "Product order form", color: "bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200" },
                ].map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => setInput(prompt.text)}
                    disabled={isGenerating}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${prompt.color}`}
                  >
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2 max-w-3xl mx-auto items-end">
            {/* Use Textarea if input has newlines or is long, otherwise use Input */}
            {input.includes('\n') || input.length > 100 ? (
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your form or ask for changes..."
                disabled={isGenerating}
                className="flex-1 min-h-[64px] max-h-[200px] resize-none"
                rows={Math.min(Math.max(2, input.split('\n').length), 8)}
                onKeyDown={(e) => {
                  // Submit on Enter (without Shift)
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
            ) : (
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your form or ask for changes..."
                disabled={isGenerating}
                className="flex-1 py-6"
                onKeyDown={(e) => {
                  // Submit on Enter
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
            )}
            <Button
              type="submit"
              disabled={!input.trim() || isGenerating}
              size="lg"
              className="px-8 py-6"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Send
                  <Send className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
