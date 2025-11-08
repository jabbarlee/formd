/**
 * Form Canvas Component
 * Central area for displaying and editing form questions
 */

"use client";

import { AnimatePresence } from "framer-motion";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { FormHeader } from "./FormHeader";
import { QuestionBlock } from "./QuestionBlock";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

export function FormCanvas() {
  const { questions, selectedQuestionId, addQuestion } = useFormBuilderStore();

  const handleAddQuestion = () => {
    addQuestion("short_text");
  };

  return (
    <ScrollArea className="h-full">
      <div className="max-w-3xl mx-auto p-8 pb-16 space-y-4">
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
  );
}
