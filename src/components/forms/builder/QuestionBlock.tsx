/**
 * Question Block Component
 * Individual question card displayed in the form canvas
 */

"use client"

import { useState } from "react"
import type { Question } from "@/lib/types/forms"
import { useFormBuilderStore } from "@/lib/stores/formBuilderStore"
import { questionTypeMetadata } from "@/lib/types/forms"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  GripVertical,
  Copy,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionBlockProps {
  question: Question
  isSelected: boolean
  index: number
}

export function QuestionBlock({ question, isSelected, index }: QuestionBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { updateQuestion, deleteQuestion, duplicateQuestion, selectQuestion } =
    useFormBuilderStore()

  const metadata = questionTypeMetadata[question.type]

  const handleSelect = () => {
    selectQuestion(question.id)
  }

  const handleTitleChange = (value: string) => {
    updateQuestion(question.id, { title: value })
  }

  const handleDescriptionChange = (value: string) => {
    updateQuestion(question.id, { description: value })
  }

  const handleRequiredToggle = (checked: boolean) => {
    updateQuestion(question.id, { required: checked })
  }

  const handleDuplicate = () => {
    duplicateQuestion(question.id)
  }

  const handleDelete = () => {
    deleteQuestion(question.id)
  }

  // Render question preview based on type
  const renderQuestionPreview = () => {
    switch (question.type) {
      case "short_text":
      case "email":
      case "phone":
      case "number":
        return (
          <Input
            placeholder={question.placeholder || "Your answer"}
            disabled
            className="mt-2"
          />
        )

      case "long_text":
        return (
          <Textarea
            placeholder={question.placeholder || "Your detailed answer"}
            disabled
            rows={3}
            className="mt-2"
          />
        )

      case "multiple_choice":
      case "checkboxes":
        return (
          <div className="mt-3 space-y-2">
            {question.options?.map((option, idx) => (
              <div key={option.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-4 w-4 rounded border-2 border-muted-foreground/40",
                    question.type === "multiple_choice" && "rounded-full"
                  )}
                />
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        )

      case "dropdown":
        return (
          <div className="mt-2 px-3 py-2 border rounded-md text-sm text-muted-foreground bg-background">
            Select an option
          </div>
        )

      case "star_rating":
        return (
          <div className="mt-3 flex gap-1">
            {Array.from({ length: question.settings?.maxRating || 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-8 w-8 rounded text-yellow-400 border border-muted-foreground/20"
              >
                ★
              </div>
            ))}
          </div>
        )

      case "linear_scale":
        return (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{question.settings?.minLabel || "Not likely"}</span>
              <span>{question.settings?.maxLabel || "Very likely"}</span>
            </div>
            <div className="flex gap-2">
              {Array.from({
                length:
                  (question.settings?.scaleMax || 5) - (question.settings?.scaleMin || 1) + 1,
              }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-10 w-10 flex items-center justify-center border rounded-md text-sm"
                >
                  {(question.settings?.scaleMin || 1) + idx}
                </div>
              ))}
            </div>
          </div>
        )

      case "date":
      case "time":
      case "datetime":
        return (
          <Input
            type={question.type === "time" ? "time" : question.type === "datetime" ? "datetime-local" : "date"}
            disabled
            className="mt-2"
          />
        )

      case "file_upload":
        return (
          <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">Click or drag file to upload</p>
          </div>
        )

      case "section_heading":
        return null

      case "divider":
        return <div className="mt-4 border-t" />

      default:
        return (
          <div className="mt-2 px-3 py-2 border rounded-md text-xs text-muted-foreground bg-muted/30">
            {metadata.description}
          </div>
        )
    }
  }

  return (
    <Card
      className={cn(
        "group relative transition-all",
        isSelected && "ring-2 ring-primary shadow-lg",
        !isSelected && "hover:shadow-md"
      )}
      onClick={handleSelect}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Question Content */}
      <div className="pl-10 pr-4 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {index + 1}.
              </span>
              <Badge variant="outline" className="text-xs">
                {metadata.label}
              </Badge>
              {question.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>

            {/* Editable Title */}
            {question.type === "section_heading" ? (
              <Input
                value={question.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-xl font-bold border-0 px-0 focus-visible:ring-0"
                placeholder="Section Title"
              />
            ) : (
              <Input
                value={question.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="font-medium border-0 px-0 focus-visible:ring-0"
                placeholder="Question title"
              />
            )}

            {/* Description */}
            {isExpanded && question.type !== "divider" && (
              <Textarea
                value={question.description || ""}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="text-sm border-0 px-0 focus-visible:ring-0 min-h-[60px]"
                placeholder="Add description (optional)"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDuplicate()
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Question Preview */}
        {isExpanded && question.type !== "section_heading" && renderQuestionPreview()}

        {/* Required Toggle */}
        {isExpanded &&
          question.type !== "section_heading" &&
          question.type !== "text_content" &&
          question.type !== "divider" && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t">
              <Switch
                id={`required-${question.id}`}
                checked={question.required}
                onCheckedChange={handleRequiredToggle}
                onClick={(e) => e.stopPropagation()}
              />
              <Label
                htmlFor={`required-${question.id}`}
                className="text-sm cursor-pointer"
              >
                Required
              </Label>
            </div>
          )}
      </div>
    </Card>
  )
}
