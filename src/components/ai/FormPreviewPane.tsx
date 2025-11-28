/**
 * Form Preview Pane Component
 * Live preview of AI-generated form
 * 
 * Two modes:
 * 1. Entry mode (no session): Shows empty state
 * 2. Active mode (has session): Shows formDraft from session
 */

"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { questionTypeMetadata } from "@/lib/types/forms";
import { motion, AnimatePresence } from "framer-motion";
import { formsApi } from "@/lib/api/forms";
import { aiSessionsApi } from "@/lib/api/aiSessions";
import { toast } from "sonner";
import type { AiSession } from "@/lib/database/services/aiSession.service";

interface FormPreviewPaneProps {
  sessionId?: string;
  session?: AiSession;
}

export function FormPreviewPane({ sessionId, session }: FormPreviewPaneProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const formDraft = session?.formDraft;

  const handleUseForm = async () => {
    if (!formDraft || !sessionId || isSaving) return;

    try {
      setIsSaving(true);

      // Create form in database
      const { form: createdForm } = await formsApi.createForm({
        title: formDraft.form.title,
        description: formDraft.form.description,
        theme: formDraft.form.theme,
        questions: formDraft.questions,
      });

      // Link session to created form
      await aiSessionsApi.linkForm(sessionId, createdForm.id);

      toast.success("Form created successfully!");
      router.push(`/forms/${createdForm.id}/edit`);
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error("Failed to create form");
    } finally {
      setIsSaving(false);
    }
  };

  if (!formDraft) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-muted/50 p-6 rounded-full mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Form Preview</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your AI-generated form will appear here once you describe what you need.
        </p>
      </div>
    );
  }

  const { form, questions } = formDraft;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground">
            Preview
          </h3>
          <p className="text-lg font-semibold">{form.title}</p>
          {form.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {form.description}
            </p>
          )}
        </div>

        <Button
          onClick={handleUseForm}
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Form...
            </>
          ) : (
            <>
              Use This Form
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Questions Preview */}
      <ScrollArea className="flex-1 p-4">
        <AnimatePresence>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <motion.div
                key={question.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {questionTypeMetadata[question.type]?.label}
                        </Badge>
                        {question.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm">{question.title}</p>
                      {question.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {question.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Show options for multiple choice/dropdown/checkboxes */}
                  {question.options && question.options.length > 0 && (
                    <div className="space-y-1 pl-4 border-l-2">
                      {question.options.map((option, optIndex) => (
                        <div key={option.id || optIndex} className="text-xs text-muted-foreground">
                          • {typeof option === 'string' ? option : option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
