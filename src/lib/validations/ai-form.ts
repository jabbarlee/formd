import { z } from "zod";

/**
 * AI Form Generation Schemas
 * Following OpenAI Structured Outputs best practices:
 * - All fields are required (no nullable)
 * - Use empty strings/arrays or union types for optional values
 * - Strict type definitions for reliable parsing
 */

// Helper schemas
const questionOptionSchema = z.object({
  id: z.string().describe("Unique identifier for the option (e.g., 'opt_xyz123')"),
  label: z.string().describe("Display text for the option"),
  value: z.string().describe("Value to be stored when selected"),
  order: z.number().int().min(0).describe("Display order (0-indexed)"),
});

/**
 * Unified settings schema - all fields included with defaults
 * Following Structured Outputs requirement: all fields must be present
 * Use 0 for "no limit" and empty strings for "not applicable"
 */
const questionSettingsSchema = z.object({
  // Text settings
  minLength: z.number().int().min(0).max(10000).describe("Minimum character length (0 = no minimum)"),
  maxLength: z.number().int().min(0).max(10000).describe("Maximum character length (0 = no maximum)"),
  
  // Number settings
  min: z.number().min(-999999).max(999999).describe("Minimum numeric value (0 = no minimum)"),
  max: z.number().min(-999999).max(999999).describe("Maximum numeric value (0 = no maximum)"),
  step: z.number().min(0.01).max(1000).describe("Numeric step increment (use 1 for integers, 0.01 for decimals, 0 = not applicable)"),
  
  // Rating settings
  maxRating: z.number().int().min(0).max(10).describe("Max rating value, e.g., 5 for 1-5 stars (0 = not applicable)"),
  icon: z.enum(["star", "heart", "thumbs", "none"]).describe("Rating icon type"),
  
  // Scale settings
  scaleMin: z.number().int().min(-100).max(100).describe("Minimum scale value (e.g., 1)"),
  scaleMax: z.number().int().min(-100).max(100).describe("Maximum scale value (e.g., 10)"),
  minLabel: z.string().max(100).describe("Label for minimum scale value (empty if N/A)"),
  maxLabel: z.string().max(100).describe("Label for maximum scale value (empty if N/A)"),
  
  // File upload settings
  allowedFileTypes: z.array(z.string()).max(20).describe("Allowed file MIME types or extensions (empty array if N/A)"),
  maxFileSize: z.number().int().min(0).max(100).describe("Max file size in MB (0 = not applicable)"),
  maxFiles: z.number().int().min(0).max(10).describe("Max number of files (0 = not applicable)"),
  
  // Signature settings
  signatureWidth: z.number().int().min(0).max(1000).describe("Signature canvas width in pixels (0 = use default)"),
  signatureHeight: z.number().int().min(0).max(500).describe("Signature canvas height in pixels (0 = use default)"),
  signatureLineWidth: z.number().int().min(0).max(10).describe("Signature line width in pixels (0 = use default)"),
  signatureLineColor: z.string().max(50).describe("Signature line color hex code (empty = use default)"),
  signatureBackgroundColor: z.string().max(50).describe("Signature background color hex code (empty = use default)"),
  
  // Choice settings
  allowOther: z.boolean().describe("Allow 'Other' option for choice questions"),
  randomizeOptions: z.boolean().describe("Randomize option order"),
  imageSize: z.enum(["small", "medium", "large", "none"]).describe("Image size for image choice questions"),
}).describe("Question-specific settings - use defaults (0, empty string, empty array, false, 'none') for N/A fields");

// Question schema - all fields required following Structured Outputs best practices
const questionSchema = z.object({
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
    .describe("Additional help text (empty string if not needed)"),
  
  placeholder: z.string()
    .max(200)
    .describe("Placeholder text for input fields (empty string if not needed)"),
  
  required: z.boolean()
    .describe("Whether the question must be answered"),
  
  order: z.number()
    .int()
    .min(0)
    .describe("Display order in form (0-indexed, sequential)"),
  
  options: z.array(questionOptionSchema)
    .describe("Options for choice-based questions (empty array if not applicable)"),
  
  settings: questionSettingsSchema
    .describe("Question-type specific settings"),
});

// Form theme schema
const formThemeSchema = z.object({
  primaryColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .describe("Primary brand color in hex format"),
  
  backgroundColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .describe("Background color in hex format"),
  
  textColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .describe("Text color in hex format"),
  
  fontFamily: z.enum([
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Arial",
    "Helvetica"
  ]).describe("Font family for form text"),
  
  borderRadius: z.enum(["none", "small", "medium", "large"])
    .describe("Border radius style for form elements"),
  
  buttonStyle: z.enum(["filled", "outlined", "ghost"])
    .describe("Submit button style variant"),
});

// Main form schema
export const aiFormSchema = z.object({
  form: z.object({
    title: z.string()
      .min(3)
      .max(200)
      .describe("Form title displayed at the top"),
    
    description: z.string()
      .min(10)
      .max(2000)
      .describe("Form description explaining purpose and instructions"),
    
    theme: formThemeSchema
      .describe("Visual theme settings for the form"),
  }).describe("Form metadata and configuration"),
  
  questions: z.array(questionSchema)
    .min(1)
    .max(100)
    .describe("Array of form questions in display order"),
});

export type AiGeneratedForm = z.infer<typeof aiFormSchema>;
