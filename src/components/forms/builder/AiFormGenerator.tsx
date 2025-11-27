"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { toast } from "sonner";

export function AiFormGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { setFormWithQuestions } = useFormBuilderStore();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate form");
      }

      setFormWithQuestions(data.form, data.questions);
      toast.success("Form generated successfully!");
      setIsOpen(false);
      setPrompt("");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate form"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleGenerate}
            className="w-[500px] bg-background/80 backdrop-blur-xl border shadow-2xl rounded-2xl p-4 flex gap-2 items-center ring-1 ring-black/5 dark:ring-white/10"
          >
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-pulse" />
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your form (e.g., 'Customer satisfaction survey for a coffee shop')..."
                className="pl-9 pr-4 h-12 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20 text-base"
                disabled={isGenerating}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-lg transition-all hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-muted text-muted-foreground hover:bg-muted/80"
            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-primary/25"
        }`}
      >
        {isOpen ? (
          <>
            <X className="h-4 w-4" />
            Close AI Assistant
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </>
        )}
      </motion.button>
    </div>
  );
}
