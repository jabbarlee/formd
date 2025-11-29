/**
 * AI Form Modifier Component
 * Floating input bar for AI-powered form modifications
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { formsApi } from "@/lib/api/forms";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { toast } from "sonner";

interface AiFormModifierProps {
  formId?: string;
}

export function AiFormModifier({ formId }: AiFormModifierProps) {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { form, questions, applyAiModifications } = useFormBuilderStore();

  const handleSendPrompt = async () => {
    if (!prompt.trim() || isProcessing) return;
    
    // Check if form has been created
    if (!formId) {
      toast.error("Please save the form first before using AI modifications");
      return;
    }

    const userPrompt = prompt.trim();
    setPrompt("");
    setIsProcessing(true);

    try {
      console.log("🤖 Sending AI modification request...");
      
      const result = await formsApi.modifyFormWithAi(
        formId,
        userPrompt,
        form,
        questions
      );

      // Apply modifications to store
      applyAiModifications(result.form, result.questions);
      
      console.log("✅ AI modifications applied:", result.summary);
      toast.success(result.summary || "Form updated successfully");
    } catch (error) {
      console.error("❌ AI modification error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to modify form";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
      <div className="max-w-3xl mx-auto px-8 pb-6">
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
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI to modify your form..."
              disabled={isProcessing}
              className="flex-1 border-0 shadow-none focus-visible:ring-0 h-10 bg-transparent placeholder:text-purple-400/60 dark:placeholder:text-purple-400/50"
            />

            {/* Send Button */}
            <Button
              onClick={handleSendPrompt}
              size="icon"
              disabled={!prompt.trim() || isProcessing}
              className="h-10 w-auto px-4 shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
            >
              {isProcessing ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cooking...
                </>
              ) : (
                <>
                    <Send className="h-4 w-4" />
                    Send
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
