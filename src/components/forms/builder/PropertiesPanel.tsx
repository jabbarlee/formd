/**
 * Properties Panel Component
 * Right sidebar for editing selected question properties
 */

"use client";

import { useFormBuilderStore } from "@/lib/stores/formBuilderStore";
import { questionTypeMetadata } from "@/lib/types/forms";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  Palette,
  Plus,
  GripVertical,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export function PropertiesPanel() {
  const {
    questions,
    selectedQuestionId,
    updateQuestion,
    addQuestionOption,
    updateQuestionOption,
    deleteQuestionOption,
  } = useFormBuilderStore();

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  if (!selectedQuestion) {
    return (
      <div className="h-full flex items-center justify-center border-l bg-muted/20">
        <div className="text-center space-y-2 max-w-xs px-4">
          <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="text-sm font-medium">No Question Selected</h3>
          <p className="text-xs text-muted-foreground">
            Select a question from the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const metadata = questionTypeMetadata[selectedQuestion.type];
  const hasOptions = metadata.supportsOptions && selectedQuestion.options;

  return (
    <div className="h-full flex flex-col border-l bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Question Settings</h2>
          <Badge variant="secondary">{metadata.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{metadata.description}</p>
      </div>

      <Tabs defaultValue="general" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="general" className="flex-1">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          {hasOptions && (
            <TabsTrigger value="options" className="flex-1">
              <Palette className="h-4 w-4 mr-2" />
              Options
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="general" className="px-4 pb-4 space-y-4">
            {/* Question Title */}
            <div className="space-y-2">
              <Label htmlFor="question-title">Question Title</Label>
              <Textarea
                id="question-title"
                value={selectedQuestion.title}
                onChange={(e) =>
                  updateQuestion(selectedQuestion.id, { title: e.target.value })
                }
                placeholder="Enter question title"
                rows={2}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="question-description">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="question-description"
                value={selectedQuestion.description || ""}
                onChange={(e) =>
                  updateQuestion(selectedQuestion.id, {
                    description: e.target.value,
                  })
                }
                placeholder="Add a description or help text"
                rows={3}
              />
            </div>

            {/* Placeholder (for text inputs) */}
            {["short_text", "long_text", "email", "phone", "number"].includes(
              selectedQuestion.type
            ) && (
              <div className="space-y-2">
                <Label htmlFor="question-placeholder">
                  Placeholder{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="question-placeholder"
                  value={selectedQuestion.placeholder || ""}
                  onChange={(e) =>
                    updateQuestion(selectedQuestion.id, {
                      placeholder: e.target.value,
                    })
                  }
                  placeholder="e.g., Enter your answer here"
                />
              </div>
            )}

            <Separator />

            {/* Required Toggle */}
            {selectedQuestion.type !== "section_heading" &&
              selectedQuestion.type !== "text_content" &&
              selectedQuestion.type !== "divider" && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="required-toggle">Required</Label>
                    <p className="text-xs text-muted-foreground">
                      Respondents must answer this question
                    </p>
                  </div>
                  <Switch
                    id="required-toggle"
                    checked={selectedQuestion.required}
                    onCheckedChange={(checked) =>
                      updateQuestion(selectedQuestion.id, { required: checked })
                    }
                  />
                </div>
              )}

            {/* Type-specific settings */}
            {selectedQuestion.type === "star_rating" && (
              <div className="space-y-2">
                <Label htmlFor="max-rating">Maximum Stars</Label>
                <Input
                  id="max-rating"
                  type="number"
                  min="3"
                  max="10"
                  value={selectedQuestion.settings?.maxRating || 5}
                  onChange={(e) =>
                    updateQuestion(selectedQuestion.id, {
                      settings: {
                        ...selectedQuestion.settings,
                        maxRating: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            )}

            {selectedQuestion.type === "linear_scale" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scale-min">Minimum</Label>
                    <Input
                      id="scale-min"
                      type="number"
                      value={selectedQuestion.settings?.scaleMin || 1}
                      onChange={(e) =>
                        updateQuestion(selectedQuestion.id, {
                          settings: {
                            ...selectedQuestion.settings,
                            scaleMin: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scale-max">Maximum</Label>
                    <Input
                      id="scale-max"
                      type="number"
                      value={selectedQuestion.settings?.scaleMax || 5}
                      onChange={(e) =>
                        updateQuestion(selectedQuestion.id, {
                          settings: {
                            ...selectedQuestion.settings,
                            scaleMax: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-label">Min Label</Label>
                  <Input
                    id="min-label"
                    value={selectedQuestion.settings?.minLabel || ""}
                    onChange={(e) =>
                      updateQuestion(selectedQuestion.id, {
                        settings: {
                          ...selectedQuestion.settings,
                          minLabel: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., Not likely"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-label">Max Label</Label>
                  <Input
                    id="max-label"
                    value={selectedQuestion.settings?.maxLabel || ""}
                    onChange={(e) =>
                      updateQuestion(selectedQuestion.id, {
                        settings: {
                          ...selectedQuestion.settings,
                          maxLabel: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., Very likely"
                  />
                </div>
              </>
            )}

            {selectedQuestion.type === "file_upload" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    min="1"
                    max="100"
                    value={selectedQuestion.settings?.maxFileSize || 10}
                    onChange={(e) =>
                      updateQuestion(selectedQuestion.id, {
                        settings: {
                          ...selectedQuestion.settings,
                          maxFileSize: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-files">Maximum Files</Label>
                  <Input
                    id="max-files"
                    type="number"
                    min="1"
                    max="10"
                    value={selectedQuestion.settings?.maxFiles || 1}
                    onChange={(e) =>
                      updateQuestion(selectedQuestion.id, {
                        settings: {
                          ...selectedQuestion.settings,
                          maxFiles: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </>
            )}
          </TabsContent>

          {hasOptions && (
            <TabsContent value="options" className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label>Answer Options</Label>
                <p className="text-xs text-muted-foreground">
                  Add and manage answer choices for this question
                </p>
              </div>

              <div className="space-y-2">
                {selectedQuestion.options?.map((option, index) => (
                  <Card key={option.id} className="p-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <Input
                        value={option.label}
                        onChange={(e) =>
                          updateQuestionOption(selectedQuestion.id, option.id, {
                            label: e.target.value,
                            value: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_"),
                          })
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          deleteQuestionOption(selectedQuestion.id, option.id)
                        }
                        disabled={(selectedQuestion.options?.length || 0) <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  addQuestionOption(selectedQuestion.id, {
                    label: `Option ${
                      (selectedQuestion.options?.length || 0) + 1
                    }`,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>

              {["multiple_choice", "checkboxes"].includes(
                selectedQuestion.type
              ) && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow "Other" option</Label>
                      <p className="text-xs text-muted-foreground">
                        Let users enter a custom answer
                      </p>
                    </div>
                    <Switch
                      checked={selectedQuestion.settings?.allowOther || false}
                      onCheckedChange={(checked) =>
                        updateQuestion(selectedQuestion.id, {
                          settings: {
                            ...selectedQuestion.settings,
                            allowOther: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Randomize options</Label>
                      <p className="text-xs text-muted-foreground">
                        Shuffle options for each respondent
                      </p>
                    </div>
                    <Switch
                      checked={
                        selectedQuestion.settings?.randomizeOptions || false
                      }
                      onCheckedChange={(checked) =>
                        updateQuestion(selectedQuestion.id, {
                          settings: {
                            ...selectedQuestion.settings,
                            randomizeOptions: checked,
                          },
                        })
                      }
                    />
                  </div>
                </>
              )}
            </TabsContent>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
