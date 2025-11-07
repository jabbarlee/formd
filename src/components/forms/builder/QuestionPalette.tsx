/**
 * Question Palette Component
 * Left sidebar with draggable question types organized by category
 */

"use client";

import { questionCategories, questionTypeMetadata } from "@/lib/types/forms";
import type { QuestionType } from "@/lib/types/forms";
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Type,
  CheckSquare,
  Star,
  Calendar,
  Sparkles,
  Layout,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons = {
  Type,
  CheckSquare,
  Star,
  Calendar,
  Sparkles,
  Layout,
};

interface QuestionTypeCardProps {
  type: QuestionType;
  onClick: () => void;
}

function QuestionTypeCard({ type, onClick }: QuestionTypeCardProps) {
  const metadata = questionTypeMetadata[type];

  return (
    <Card
      className={cn(
        "group relative cursor-pointer p-3 transition-all hover:shadow-md hover:border-primary/50",
        "border-2 border-muted hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:bg-primary/20">
          <Plus className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium leading-tight mb-1">
            {metadata.label}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {metadata.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function QuestionPalette() {
  const addQuestion = useFormBuilderStore((state) => state.addQuestion);

  const handleAddQuestion = (type: QuestionType) => {
    addQuestion(type);
  };

  return (
    <div className="h-full flex flex-col border-r bg-background">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold">Add Question</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Click to add to your form
        </p>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-4 grid grid-cols-3 gap-1 flex-shrink-0">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="common" className="text-xs">
            Common
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">
            Advanced
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full px-4">
            <TabsContent value="all" className="mt-4 space-y-4 pb-6">
              {questionCategories.map((category) => {
                const IconComponent =
                  categoryIcons[category.icon as keyof typeof categoryIcons] ||
                  Layout;

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <IconComponent className="h-4 w-4" />
                      <span>{category.name}</span>
                    </div>
                    <div className="space-y-2">
                      {category.questions.map((questionType) => (
                        <QuestionTypeCard
                          key={questionType}
                          type={questionType}
                          onClick={() => handleAddQuestion(questionType)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="common" className="mt-4 space-y-2 pb-6">
              {[
                "short_text",
                "long_text",
                "email",
                "multiple_choice",
                "checkboxes",
                "dropdown",
              ].map((questionType) => (
                <QuestionTypeCard
                  key={questionType}
                  type={questionType as QuestionType}
                  onClick={() =>
                    handleAddQuestion(questionType as QuestionType)
                  }
                />
              ))}
            </TabsContent>

            <TabsContent value="advanced" className="mt-4 space-y-2 pb-6">
              {[
                "star_rating",
                "nps",
                "file_upload",
                "signature",
                "matrix",
                "payment",
                "location",
              ].map((questionType) => (
                <QuestionTypeCard
                  key={questionType}
                  type={questionType as QuestionType}
                  onClick={() =>
                    handleAddQuestion(questionType as QuestionType)
                  }
                />
              ))}
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
