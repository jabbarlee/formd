import { z } from "zod";

/**
 * AI Form Modification Schema
 * For modifying existing forms based on natural language prompts
 * 
 * IMPORTANT: OpenAI structured outputs don't support .optional() without .nullable()
 * Instead, we use empty strings/arrays as "no change" indicators
 */

// Reuse option schema
const questionOptionSchema = z.object({
  id: z.string().describe("Unique identifier for the option (e.g., 'opt_xyz123')"),
  label: z.string().describe("Display text for the option"),
  value: z.string().describe("Value to be stored when selected"),
  order: z.number().int().min(0).describe("Display order (0-indexed)"),
});

// Simplified settings schema - using defaults for "not changed"
const questionSettingsSchema = z.object({
  minLength: z.number().int().min(0).max(10000).describe("Min character length, 0 = not set"),
  maxLength: z.number().int().min(0).max(10000).describe("Max character length, 0 = not set"),
  min: z.number().min(-999999).max(999999).describe("Minimum value, 0 = not set"),
  max: z.number().min(-999999).max(999999).describe("Maximum value, 0 = not set"),
  step: z.number().min(0).max(1000).describe("Step increment, 0 = not set"),
  maxRating: z.number().int().min(0).max(10).describe("Max rating, 0 = not applicable"),
  icon: z.enum(["star", "heart", "thumbs", "none"]).describe("Rating icon type"),
  scaleMin: z.number().int().min(-100).max(100).describe("Scale minimum"),
  scaleMax: z.number().int().min(-100).max(100).describe("Scale maximum"),
  minLabel: z.string().max(100).describe("Min scale label, empty = not set"),
  maxLabel: z.string().max(100).describe("Max scale label, empty = not set"),
  allowedFileTypes: z.array(z.string()).describe("Allowed file types, empty = not set"),
  maxFileSize: z.number().int().min(0).max(100).describe("Max file size MB, 0 = not set"),
  maxFiles: z.number().int().min(0).max(10).describe("Max files, 0 = not set"),
  allowOther: z.boolean().describe("Allow other option"),
  randomizeOptions: z.boolean().describe("Randomize options"),
  imageSize: z.enum(["small", "medium", "large", "none"]).describe("Image size"),
  currency: z.string().describe("Currency symbol, empty = not set"),
  amount: z.number().describe("Payment amount, 0 = not set"),
}).describe("Question settings - use defaults (0, empty string, empty array, false, 'none') for unchanged fields");

// Question schema for modifications
const modifiedQuestionSchema = z.object({
  id: z.string()
    .min(3)
    .regex(/^q_[a-zA-Z0-9]+$/)
    .describe("Unique question ID with 'q_' prefix"),
  
  type: z.enum([
    "short_text",
    "long_text",
    "email",
    "number",
    "phone",
    "multiple_choice",
    "checkboxes",
    "dropdown",
    "star_rating",
    "linear_scale",
    "nps",
    "emoji_rating",
    "date",
    "time",
    "datetime",
    "file_upload",
    "signature",
    "matrix",
    "ranking",
    "payment",
    "location",
    "image_choice",
    "section_heading",
    "text_content",
    "divider",
  ]).describe("Type of question field"),
  
  title: z.string()
    .min(1)
    .max(500)
    .describe("Question text displayed to user"),
  
  description: z.string()
    .max(1000)
    .describe("Additional help text, empty string if none"),
  
  placeholder: z.string()
    .max(200)
    .describe("Placeholder text, empty string if none"),
  
  required: z.boolean()
    .describe("Whether the question must be answered"),
  
  order: z.number()
    .int()
    .min(0)
    .describe("Display order in form (0-indexed, sequential)"),
  
  options: z.array(questionOptionSchema)
    .describe("Options for choice-based questions, empty array if none"),
  
  settings: questionSettingsSchema
    .describe("Question-type specific settings, use defaults for unchanged"),
});

// Form modification schema - returns complete updated form
export const aiFormModificationSchema = z.object({
  form: z.object({
    title: z.string()
      .max(200)
      .describe("Updated form title, empty string if unchanged"),
    
    description: z.string()
      .max(2000)
      .describe("Updated form description, empty string if unchanged"),
  }).describe("Form metadata updates - use empty strings for unchanged fields"),
  
  questions: z.array(modifiedQuestionSchema)
    .min(0)
    .max(100)
    .describe("Complete updated questions array in display order"),
  
  summary: z.string()
    .max(500)
    .describe("Brief summary of changes made (e.g., 'Added phone number question, updated email to be required')"),
});

export type AiFormModification = z.infer<typeof aiFormModificationSchema>;

