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
import { FormHeaderProperties } from "./FormHeaderProperties";

export function PropertiesPanel() {
  const {
    questions,
    selectedQuestionId,
    updateQuestion,
    addQuestionOption,
    updateQuestionOption,
    deleteQuestionOption,
  } = useFormBuilderStore();

  // Check if form header is selected
  if (selectedQuestionId === "form-header") {
    return (
      <div className="h-full border-l bg-background">
        <ScrollArea className="h-full">
          <FormHeaderProperties />
        </ScrollArea>
      </div>
    );
  }

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  if (!selectedQuestion) {
    return (
      <div className="h-full flex items-center justify-center border-l bg-muted/20">
        <div className="text-center space-y-2 max-w-xs px-4">
          <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="text-sm font-medium">No Question Selected</h3>
          <p className="text-xs text-muted-foreground">
            Select a question or the form header from the canvas to edit its
            properties
          </p>
        </div>
      </div>
    );
  }

  const metadata = questionTypeMetadata[selectedQuestion.type];
  const hasOptions = metadata.supportsOptions && selectedQuestion.options;

  return (
    <div className="h-full flex flex-col border-l bg-background">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Question Settings</h2>
          <Badge variant="secondary">{metadata.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{metadata.description}</p>
      </div>

      <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-4 flex-shrink-0">
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

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <TabsContent value="general" className="px-4 pb-8 space-y-4">
              {/* Question Title */}
              <div className="space-y-2">
                <Label htmlFor="question-title">Question Title</Label>
                <Textarea
                  id="question-title"
                  value={selectedQuestion.title}
                  onChange={(e) =>
                    updateQuestion(selectedQuestion.id, {
                      title: e.target.value,
                    })
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
                        updateQuestion(selectedQuestion.id, {
                          required: checked,
                        })
                      }
                    />
                  </div>
                )}

              <Separator />

              {/* Type-specific settings */}

              {/* Short Text Settings */}
              {selectedQuestion.type === "short_text" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Text Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-length">Min Length</Label>
                      <Input
                        id="min-length"
                        type="number"
                        min="0"
                        value={selectedQuestion.settings?.minLength ?? ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) || e.target.value === "") {
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                minLength:
                                  e.target.value === "" ? undefined : val,
                              },
                            });
                          }
                        }}
                        placeholder="No limit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-length">Max Length</Label>
                      <Input
                        id="max-length"
                        type="number"
                        min="1"
                        value={selectedQuestion.settings?.maxLength ?? ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) || e.target.value === "") {
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                maxLength:
                                  e.target.value === "" ? undefined : val,
                              },
                            });
                          }
                        }}
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Long Text Settings */}
              {selectedQuestion.type === "long_text" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Textarea Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-length">Min Length</Label>
                      <Input
                        id="min-length"
                        type="number"
                        min="0"
                        value={selectedQuestion.settings?.minLength ?? ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) || e.target.value === "") {
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                minLength:
                                  e.target.value === "" ? undefined : val,
                              },
                            });
                          }
                        }}
                        placeholder="No limit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-length">Max Length</Label>
                      <Input
                        id="max-length"
                        type="number"
                        min="1"
                        value={selectedQuestion.settings?.maxLength ?? ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) || e.target.value === "") {
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                maxLength:
                                  e.target.value === "" ? undefined : val,
                              },
                            });
                          }
                        }}
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedQuestion.type === "star_rating" && (
                <div className="space-y-2">
                  <Label htmlFor="max-rating">Maximum Stars</Label>
                  <Input
                    id="max-rating"
                    type="number"
                    min="3"
                    max="10"
                    value={selectedQuestion.settings?.maxRating || 5}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        updateQuestion(selectedQuestion.id, {
                          settings: {
                            ...selectedQuestion.settings,
                            maxRating: val,
                          },
                        });
                      }
                    }}
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
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                scaleMin: val,
                              },
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scale-max">Maximum</Label>
                      <Input
                        id="scale-max"
                        type="number"
                        value={selectedQuestion.settings?.scaleMax || 5}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                scaleMax: val,
                              },
                            });
                          }
                        }}
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

              {selectedQuestion.type === "number" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number-min">Minimum Value</Label>
                      <Input
                        id="number-min"
                        type="number"
                        value={selectedQuestion.settings?.min ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                min: val,
                              },
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number-max">Maximum Value</Label>
                      <Input
                        id="number-max"
                        type="number"
                        value={selectedQuestion.settings?.max ?? 100}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                max: val,
                              },
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number-step">Step</Label>
                    <Input
                      id="number-step"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={selectedQuestion.settings?.step ?? 1}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateQuestion(selectedQuestion.id, {
                            settings: {
                              ...selectedQuestion.settings,
                              step: val,
                            },
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Multiple Choice & Checkboxes Settings */}
              {(selectedQuestion.type === "multiple_choice" ||
                selectedQuestion.type === "checkboxes") && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    {selectedQuestion.type === "multiple_choice"
                      ? "Radio Button Settings"
                      : "Checkbox Settings"}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Randomize Options</Label>
                      <p className="text-xs text-muted-foreground">
                        Show options in random order
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
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow "Other" Option</Label>
                      <p className="text-xs text-muted-foreground">
                        Let respondents add their own answer
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
                </div>
              )}

              {/* Dropdown Settings */}
              {selectedQuestion.type === "dropdown" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Dropdown Settings</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow "Other" Option</Label>
                      <p className="text-xs text-muted-foreground">
                        Let respondents add custom answer
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
                </div>
              )}

              {/* Email Settings */}
              {selectedQuestion.type === "email" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Email Validation</h3>
                  <p className="text-xs text-muted-foreground">
                    Email format is automatically validated
                  </p>
                </div>
              )}

              {/* Phone Settings */}
              {selectedQuestion.type === "phone" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Phone Settings</h3>
                  <p className="text-xs text-muted-foreground">
                    Basic phone format validation applied
                  </p>
                </div>
              )}

              {/* Date/Time Settings */}
              {(selectedQuestion.type === "date" ||
                selectedQuestion.type === "time" ||
                selectedQuestion.type === "datetime") && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    {selectedQuestion.type === "date"
                      ? "Date Picker"
                      : selectedQuestion.type === "time"
                      ? "Time Picker"
                      : "Date & Time Picker"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Uses browser's native {selectedQuestion.type} picker
                  </p>
                </div>
              )}

              {/* NPS Settings */}
              {selectedQuestion.type === "nps" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">NPS Settings</h3>
                  <p className="text-xs text-muted-foreground">
                    Net Promoter Score scale (0-10) with color coding:
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500" />
                      <span>0-6: Detractors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500" />
                      <span>7-8: Passives</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500" />
                      <span>9-10: Promoters</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Emoji Rating Settings */}
              {selectedQuestion.type === "emoji_rating" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Emoji Rating</h3>
                  <p className="text-xs text-muted-foreground">
                    5-point emoji scale from angry to loving
                  </p>
                  <div className="flex justify-between text-3xl">
                    {["😡", "😞", "😐", "😊", "😍"].map((emoji, idx) => (
                      <span key={idx}>{emoji}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedQuestion.type === "payment" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={selectedQuestion.settings?.currency || "$"}
                      onChange={(e) =>
                        updateQuestion(selectedQuestion.id, {
                          settings: {
                            ...selectedQuestion.settings,
                            currency: e.target.value,
                          },
                        })
                      }
                      placeholder="$"
                      maxLength={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={selectedQuestion.settings?.amount ?? 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateQuestion(selectedQuestion.id, {
                            settings: {
                              ...selectedQuestion.settings,
                              amount: val,
                            },
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Ranking Settings */}
              {selectedQuestion.type === "ranking" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Ranking Settings</h3>
                  <p className="text-xs text-muted-foreground">
                    Respondents will drag items to rank them by preference.
                    Configure options in the "Options" tab.
                  </p>
                </div>
              )}

              {/* Matrix Settings */}
              {selectedQuestion.type === "matrix" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Matrix Settings</h3>
                  <p className="text-xs text-muted-foreground">
                    Configure rows and columns to create a grid of questions
                  </p>
                  <div className="space-y-2">
                    <Label>Current Configuration</Label>
                    <div className="text-xs space-y-1">
                      <div>
                        Rows: {selectedQuestion.settings?.rows?.length || 0}
                      </div>
                      <div>
                        Columns:{" "}
                        {selectedQuestion.settings?.columns?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Signature Settings */}
              {selectedQuestion.type === "signature" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Signature Settings</h3>
                  <p className="text-xs text-muted-foreground">
                    Allows respondents to draw their signature
                  </p>
                </div>
              )}

              {/* Location Settings */}
              {selectedQuestion.type === "location" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Location Settings</h3>
                  <p className="text-xs text-muted-foreground">
                    Respondents can search and select a location
                  </p>
                </div>
              )}

              {/* Section Heading Settings */}
              {selectedQuestion.type === "section_heading" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Section Heading</h3>
                  <p className="text-xs text-muted-foreground">
                    Use this to organize your form into sections
                  </p>
                </div>
              )}

              {/* Text Content Settings */}
              {selectedQuestion.type === "text_content" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Text Content</h3>
                  <p className="text-xs text-muted-foreground">
                    Display informational text without requiring an answer
                  </p>
                </div>
              )}

              {/* Divider Settings */}
              {selectedQuestion.type === "divider" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Divider</h3>
                  <p className="text-xs text-muted-foreground">
                    Visual separator between form sections
                  </p>
                </div>
              )}

              {selectedQuestion.type === "image_choice" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Image Choice Settings</h3>
                  <div className="space-y-2">
                    <Label htmlFor="image-size">Image Size</Label>
                    <select
                      id="image-size"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedQuestion.settings?.imageSize || "medium"}
                      onChange={(e) =>
                        updateQuestion(selectedQuestion.id, {
                          settings: {
                            ...selectedQuestion.settings,
                            imageSize: e.target.value as
                              | "small"
                              | "medium"
                              | "large",
                          },
                        })
                      }
                    >
                      <option value="small">Small (4 columns)</option>
                      <option value="medium">Medium (3 columns)</option>
                      <option value="large">Large (2 columns)</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Configure image options in the "Options" tab
                  </p>
                </div>
              )}

              {selectedQuestion.type === "file_upload" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">File Upload Settings</h3>
                  <div className="space-y-2">
                    <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                    <Input
                      id="max-file-size"
                      type="number"
                      min="1"
                      max="100"
                      value={selectedQuestion.settings?.maxFileSize || 10}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateQuestion(selectedQuestion.id, {
                            settings: {
                              ...selectedQuestion.settings,
                              maxFileSize: val,
                            },
                          });
                        }
                      }}
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
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateQuestion(selectedQuestion.id, {
                            settings: {
                              ...selectedQuestion.settings,
                              maxFiles: val,
                            },
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file-types">Allowed File Types</Label>
                    <Input
                      id="file-types"
                      value={
                        selectedQuestion.settings?.allowedFileTypes?.join(
                          ", "
                        ) || "pdf, doc, docx, jpg, png"
                      }
                      onChange={(e) =>
                        updateQuestion(selectedQuestion.id, {
                          settings: {
                            ...selectedQuestion.settings,
                            allowedFileTypes: e.target.value
                              .split(",")
                              .map((type) => type.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      placeholder="pdf, doc, docx, jpg, png"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated file extensions
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {hasOptions && (
              <TabsContent value="options" className="px-4 pb-8 space-y-4">
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
                            updateQuestionOption(
                              selectedQuestion.id,
                              option.id,
                              {
                                label: e.target.value,
                                value: e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "_"),
                              }
                            )
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
                          disabled={
                            (selectedQuestion.options?.length || 0) <= 1
                          }
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
        </div>
      </Tabs>
    </div>
  );
}
