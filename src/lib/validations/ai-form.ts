import { z } from "zod";

// Helper schemas
const questionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  order: z.number(),
});

const questionSettingsSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  maxRating: z.number().optional(),
  icon: z.enum(["star", "heart", "thumbs"]).optional(),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
  scaleMin: z.number().optional(),
  scaleMax: z.number().optional(),
  currency: z.string().optional(),
  amount: z.number().optional(),
  allowOther: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  multipleSelection: z.boolean().optional(),
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
    "section_heading",
    "divider",
  ]),
  title: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  order: z.number(),
  options: z.array(questionOptionSchema).optional(),
  settings: questionSettingsSchema.optional(),
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
