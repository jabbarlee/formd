/**
 * Form Canvas Component
 * Central area for displaying and editing form questions
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { FormHeader } from "./FormHeader";
import { QuestionBlock } from "./QuestionBlock";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Send, Sparkles } from "lucide-react";

export function FormCanvas() {
  const { questions, selectedQuestionId, addQuestion } = useFormBuilderStore();
  const [prompt, setPrompt] = useState("");

  const handleAddQuestion = () => {
    addQuestion("short_text");
  };

  const handleSendPrompt = () => {
    // Logic will be implemented later
    console.log("Prompt:", prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-3xl mx-auto p-8 pb-32 space-y-4">
          {/* Form Header Section */}
          <FormHeader isSelected={selectedQuestionId === "form-header"} />

          {/* Divider */}
          {questions.length > 0 && (
            <div className="my-8 border-t border-border" />
          )}

          {/* Questions Section */}
          {questions.length === 0 ? (
            <div className="text-center space-y-4 py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Add Your First Question
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click on question types from the left sidebar to add them to
                  your form.
                </p>
              </div>
              <Button onClick={handleAddQuestion} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add First Question
              </Button>
            </div>
          ) : (
            <>
              {/* Questions List with Animation */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {questions.map((question, index) => (
                    <QuestionBlock
                      key={question.id}
                      question={question}
                      isSelected={selectedQuestionId === question.id}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Add Question Button */}
              <Button
                variant="outline"
                className="w-full border-dashed border-2 h-16"
                onClick={handleAddQuestion}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Floating AI Input Bar */}
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
                className="flex-1 border-0 shadow-none focus-visible:ring-0 h-10 bg-transparent placeholder:text-purple-400/60 dark:placeholder:text-purple-400/50"
              />
              
              {/* Send Button */}
              <Button
                onClick={handleSendPrompt}
                size="icon"
                disabled={!prompt.trim()}
                className="h-10 w-10 shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
