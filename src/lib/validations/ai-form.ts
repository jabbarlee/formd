import { z } from "zod";

// Helper schemas
const questionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  order: z.number(),
});

const questionSettingsSchema = z.object({
  minLength: z.number().nullable(),
  maxLength: z.number().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  step: z.number().nullable(),
  maxRating: z.number().nullable(),
  icon: z.enum(["star", "heart", "thumbs"]).nullable(),
  minLabel: z.string().nullable(),
  maxLabel: z.string().nullable(),
  scaleMin: z.number().nullable(),
  scaleMax: z.number().nullable(),
  currency: z.string().nullable(),
  amount: z.number().nullable(),
  allowOther: z.boolean().nullable(),
  randomizeOptions: z.boolean().nullable(),
  multipleSelection: z.boolean().nullable(),
  imageSize: z.enum(["small", "medium", "large"]).nullable(),
  allowedFileTypes: z.array(z.string()).nullable(),
  maxFileSize: z.number().nullable(),
  maxFiles: z.number().nullable(),
});

// Question schema
const questionSchema = z.object({
  id: z.string(),
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
  ]),
  title: z.string(),
  description: z.string().nullable(),
  placeholder: z.string().nullable(),
  required: z.boolean(),
  order: z.number(),
  options: z.array(questionOptionSchema).nullable(),
  settings: questionSettingsSchema.nullable(),
});

// Form schema
export const aiFormSchema = z.object({
  form: z.object({
    title: z.string(),
    description: z.string(),
    theme: z.object({
      primaryColor: z.string(),
      backgroundColor: z.string(),
      textColor: z.string(),
      fontFamily: z.string(),
      borderRadius: z.enum(["none", "small", "medium", "large"]),
      buttonStyle: z.enum(["filled", "outlined", "ghost"]),
    }),
  }),
  questions: z.array(questionSchema),
});

export type AiGeneratedForm = z.infer<typeof aiFormSchema>;
