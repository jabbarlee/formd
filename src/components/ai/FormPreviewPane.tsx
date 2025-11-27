/**
 * Form Preview Pane Component
 * Live preview of AI-generated form
 */

"use client";

import { useState } from "react";
import { useChatStore } from "@/lib/stores/useChatStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { questionTypeMetadata } from "@/lib/types/forms";
import { motion, AnimatePresence } from "framer-motion";
import { formsApi } from "@/lib/api/forms";
import { toast } from "sonner";

export function FormPreviewPane() {
  const { currentForm } = useChatStore();
  const { linkFormToChat } = useChatStore();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleUseForm = async () => {
    if (!currentForm || isSaving) return;

    try {
      setIsSaving(true);

      // Create form in database
      console.log("💾 Creating form in database...");
      const { form: createdForm } = await formsApi.createForm(currentForm.form);
      
      console.log("✅ Form created with ID:", createdForm.id);

      // Update all questions to have the correct formId
      const questionsWithCorrectFormId = currentForm.questions.map(q => ({
        ...q,
        formId: createdForm.id, // Set the actual database form ID
      }));

      // Update form with questions
      await formsApi.updateForm(createdForm.id, currentForm.form, questionsWithCorrectFormId);
      
      console.log("✅ Questions saved");

      // Link chat to created form
      await linkFormToChat(createdForm.id);
      console.log("✅ Chat linked to form");

      // Show success toast
      toast.success("Form created successfully!", {
        description: `${currentForm.questions.length} questions saved`,
      });

      // Navigate to the actual form
      router.push(`/forms/${createdForm.id}`);
    } catch (error) {
      console.error("Failed to save form:", error);
      toast.error("Failed to create form", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentForm) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">No Form Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start a conversation with AI to generate your form. The preview
              will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { form, questions } = currentForm;

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="flex-shrink-0 border-b bg-card p-4 space-y-3">
        <div>
          <h2 className="font-semibold">Live Preview</h2>
          <p className="text-xs text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button 
          onClick={handleUseForm} 
          className="w-full gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Form...
            </>
          ) : (
            <>
              Use This Form
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Form Preview */}
      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          {currentForm && (
            <motion.div
              key="form-preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 space-y-6"
            >
              {/* Form Header */}
              <div className="space-y-2">
            <h1 className="text-2xl font-bold">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
          </div>

          {/* Divider */}
          {questions.length > 0 && <div className="border-t" />}

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((question, index) => {
              const metadata = questionTypeMetadata[question.type];

              return (
                <Card key={question.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{question.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {metadata.label}
                        </Badge>
                        {question.required && (
                          <Badge
                            variant="destructive"
                            className="text-xs bg-red-100 text-red-700"
                          >
                            Required
                          </Badge>
                        )}
                      </div>
                      {question.description && (
                        <p className="text-sm text-muted-foreground">
                          {question.description}
                        </p>
                      )}

                      {/* Question Preview (simplified) */}
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-1.5 text-sm">
                          {question.options.slice(0, 3).map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-2 text-muted-foreground"
                            >
                              <div className="w-4 h-4 rounded-full border-2" />
                              {option.label}
                            </div>
                          ))}
                          {question.options.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{question.options.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </ScrollArea>
    </div>
  );
}
