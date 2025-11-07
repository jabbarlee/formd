/**
 * Form Builder Type Definitions
 * Comprehensive types for the FormD form builder
 */

// ============================================================================
// Question Types
// ============================================================================

export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "phone"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "star_rating"
  | "linear_scale"
  | "nps"
  | "emoji_rating"
  | "date"
  | "time"
  | "datetime"
  | "file_upload"
  | "signature"
  | "matrix"
  | "ranking"
  | "payment"
  | "location"
  | "image_choice"
  | "section_heading"
  | "text_content"
  | "divider";

// ============================================================================
// Question Validation Types
// ============================================================================

export interface ValidationRule {
  type:
    | "min_length"
    | "max_length"
    | "pattern"
    | "min"
    | "max"
    | "required"
    | "email"
    | "url"
    | "custom";
  value?: string | number;
  message?: string;
}

export interface QuestionValidation {
  rules: ValidationRule[];
}

// ============================================================================
// Question Logic (Conditional Logic / Skip Logic)
// ============================================================================

export type LogicCondition =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty";

export interface LogicRule {
  id: string;
  questionId: string;
  condition: LogicCondition;
  value: any;
  action: "show" | "hide" | "skip_to";
  targetQuestionId?: string;
}

export interface QuestionLogic {
  rules: LogicRule[];
}

// ============================================================================
// Question Options (for choice-based questions)
// ============================================================================

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  image?: string;
  order: number;
}

// ============================================================================
// Question Settings (type-specific settings)
// ============================================================================

export interface QuestionSettings {
  // Text questions
  minLength?: number;
  maxLength?: number;

  // Number questions
  min?: number;
  max?: number;
  step?: number;

  // Rating questions
  maxRating?: number;
  icon?: "star" | "heart" | "thumbs";

  // Scale questions
  minLabel?: string;
  maxLabel?: string;
  scaleMin?: number;
  scaleMax?: number;

  // File upload
  maxFileSize?: number;
  allowedFileTypes?: string[];
  maxFiles?: number;

  // Matrix
  rows?: QuestionOption[];
  columns?: QuestionOption[];

  // Payment
  currency?: string;
  amount?: number;

  // Other settings
  allowOther?: boolean;
  randomizeOptions?: boolean;
  multipleSelection?: boolean;
  imageSize?: "small" | "medium" | "large";
}

// ============================================================================
// Question Interface
// ============================================================================

export interface Question {
  id: string;
  formId: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  logic?: QuestionLogic;
  settings?: QuestionSettings;
  createdAt?: string;
}

// ============================================================================
// Form Status
// ============================================================================

export type FormStatus = "draft" | "published" | "closed" | "archived";

// ============================================================================
// Form Theme
// ============================================================================

export interface FormTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: "small" | "medium" | "large";
  borderRadius?: "none" | "small" | "medium" | "large";
  spacing?: "compact" | "normal" | "relaxed";
  buttonStyle?: "filled" | "outlined" | "ghost";
}

// ============================================================================
// Form Settings
// ============================================================================

export interface FormSettings {
  // Response settings
  allowMultipleResponses?: boolean;
  requirePassword?: boolean;
  password?: string;
  responseLimit?: number;
  closeDate?: string;

  // Display settings
  showProgressBar?: boolean;
  showQuestionNumbers?: boolean;
  oneQuestionPerPage?: boolean;
  shuffleQuestions?: boolean;

  // Notification settings
  notifyOnSubmission?: boolean;
  notificationEmail?: string;

  // Submission settings
  showSubmissionMessage?: boolean;
  customSubmissionMessage?: string;
  redirectUrl?: string;

  // Advanced settings
  collectIpAddress?: boolean;
  collectLocation?: boolean;
  allowSaveDraft?: boolean;
  requireEmailVerification?: boolean;
}

// ============================================================================
// Form Interface
// ============================================================================

export interface Form {
  id: string;
  workspaceId?: string;
  createdBy?: string;
  title: string;
  description?: string;
  slug: string;
  status: FormStatus;
  theme?: FormTheme;
  settings?: FormSettings;
  coverImage?: string;
  logo?: string;
  publishedAt?: string;
  closedAt?: string;
  responseLimit?: number;
  closeDate?: string;
  requiresPassword: boolean;
  passwordHash?: string;
  allowMultipleResponses: boolean;
  showProgressBar: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Form Builder State
// ============================================================================

export interface FormBuilderState {
  form: Partial<Form>;
  questions: Question[];
  selectedQuestionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
}

// ============================================================================
// Question Categories (for Question Palette)
// ============================================================================

export interface QuestionCategory {
  id: string;
  name: string;
  icon: string;
  questions: QuestionType[];
}

export const questionCategories: QuestionCategory[] = [
  {
    id: "text",
    name: "Text",
    icon: "Type",
    questions: ["short_text", "long_text", "email", "phone", "number"],
  },
  {
    id: "choice",
    name: "Choice",
    icon: "CheckSquare",
    questions: ["multiple_choice", "checkboxes", "dropdown", "image_choice"],
  },
  {
    id: "rating",
    name: "Rating",
    icon: "Star",
    questions: ["star_rating", "linear_scale", "nps", "emoji_rating"],
  },
  {
    id: "datetime",
    name: "Date & Time",
    icon: "Calendar",
    questions: ["date", "time", "datetime"],
  },
  {
    id: "advanced",
    name: "Advanced",
    icon: "Sparkles",
    questions: [
      "file_upload",
      "signature",
      "matrix",
      "ranking",
      "payment",
      "location",
    ],
  },
  {
    id: "layout",
    name: "Layout",
    icon: "Layout",
    questions: ["section_heading", "text_content", "divider"],
  },
];

// ============================================================================
// Question Type Metadata
// ============================================================================

export interface QuestionTypeMetadata {
  type: QuestionType;
  label: string;
  description: string;
  icon: string;
  defaultTitle: string;
  supportsOptions: boolean;
  supportsValidation: boolean;
  supportsLogic: boolean;
}

export const questionTypeMetadata: Record<QuestionType, QuestionTypeMetadata> =
  {
    short_text: {
      type: "short_text",
      label: "Short Text",
      description: "Single line text input",
      icon: "Type",
      defaultTitle: "Your answer",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    long_text: {
      type: "long_text",
      label: "Long Text",
      description: "Multi-line text area",
      icon: "AlignLeft",
      defaultTitle: "Your detailed answer",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    email: {
      type: "email",
      label: "Email",
      description: "Email address input",
      icon: "Mail",
      defaultTitle: "Email address",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    number: {
      type: "number",
      label: "Number",
      description: "Numeric input",
      icon: "Hash",
      defaultTitle: "Enter a number",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    phone: {
      type: "phone",
      label: "Phone",
      description: "Phone number input",
      icon: "Phone",
      defaultTitle: "Phone number",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    multiple_choice: {
      type: "multiple_choice",
      label: "Multiple Choice",
      description: "Single selection from options",
      icon: "CircleDot",
      defaultTitle: "Choose one option",
      supportsOptions: true,
      supportsValidation: true,
      supportsLogic: true,
    },
    checkboxes: {
      type: "checkboxes",
      label: "Checkboxes",
      description: "Multiple selections allowed",
      icon: "CheckSquare",
      defaultTitle: "Select all that apply",
      supportsOptions: true,
      supportsValidation: true,
      supportsLogic: true,
    },
    dropdown: {
      type: "dropdown",
      label: "Dropdown",
      description: "Dropdown menu selection",
      icon: "ChevronDown",
      defaultTitle: "Select from dropdown",
      supportsOptions: true,
      supportsValidation: true,
      supportsLogic: true,
    },
    star_rating: {
      type: "star_rating",
      label: "Star Rating",
      description: "Star-based rating",
      icon: "Star",
      defaultTitle: "Rate your experience",
      supportsOptions: false,
      supportsValidation: false,
      supportsLogic: true,
    },
    linear_scale: {
      type: "linear_scale",
      label: "Linear Scale",
      description: "Numeric scale rating",
      icon: "SlidersHorizontal",
      defaultTitle: "Rate on a scale",
      supportsOptions: false,
      supportsValidation: false,
      supportsLogic: true,
    },
    nps: {
      type: "nps",
      label: "NPS",
      description: "Net Promoter Score (0-10)",
      icon: "TrendingUp",
      defaultTitle: "How likely are you to recommend us?",
      supportsOptions: false,
      supportsValidation: false,
      supportsLogic: true,
    },
    emoji_rating: {
      type: "emoji_rating",
      label: "Emoji Rating",
      description: "Emoji-based feedback",
      icon: "Smile",
      defaultTitle: "How do you feel?",
      supportsOptions: false,
      supportsValidation: false,
      supportsLogic: true,
    },
    date: {
      type: "date",
      label: "Date",
      description: "Date picker",
      icon: "Calendar",
      defaultTitle: "Select a date",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    time: {
      type: "time",
      label: "Time",
      description: "Time picker",
      icon: "Clock",
      defaultTitle: "Select a time",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    datetime: {
      type: "datetime",
      label: "Date & Time",
      description: "Date and time picker",
      icon: "CalendarClock",
      defaultTitle: "Select date and time",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    file_upload: {
      type: "file_upload",
      label: "File Upload",
      description: "File upload field",
      icon: "Upload",
      defaultTitle: "Upload your file",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    signature: {
      type: "signature",
      label: "Signature",
      description: "Digital signature pad",
      icon: "PenTool",
      defaultTitle: "Your signature",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    matrix: {
      type: "matrix",
      label: "Matrix",
      description: "Grid of questions",
      icon: "Grid3x3",
      defaultTitle: "Rate the following",
      supportsOptions: true,
      supportsValidation: false,
      supportsLogic: false,
    },
    ranking: {
      type: "ranking",
      label: "Ranking",
      description: "Drag to rank options",
      icon: "ArrowUpDown",
      defaultTitle: "Rank these items",
      supportsOptions: true,
      supportsValidation: false,
      supportsLogic: true,
    },
    payment: {
      type: "payment",
      label: "Payment",
      description: "Payment collection",
      icon: "CreditCard",
      defaultTitle: "Payment",
      supportsOptions: false,
      supportsValidation: false,
      supportsLogic: false,
    },
    location: {
      type: "location",
      label: "Location",
      description: "Address or location input",
      icon: "MapPin",
      defaultTitle: "Enter location",
      supportsOptions: false,
      supportsValidation: true,
      supportsLogic: true,
    },
    image_choice: {
      type: "image_choice",
      label: "Image Choice",
      description: "Choose from images",
      icon: "Image",
      defaultTitle: "Select an image",
      supportsOptions: true,
      supportsValidation: true,
      supportsLogic: true,
    },
    section_heading: {
      type: "section_heading",
      label: "Section Heading",
      description: "Section title",
      icon: "Heading",
      defaultTitle: "Section Title",
      supportsOptions: false,
      supportsValidation: false,
      supportsLogic: false,
    },
    text_content: {
      type: "text_content",
      label: "Text Content",
      description: "Descriptive text block",
      icon: "FileText",
      defaultTitle: "Information",
      supportsOptions: false,
      supportsValidation: false,
      supportsLogic: false,
    },
    divider: {
      type: "divider",
      label: "Divider",
      description: "Visual separator",
      icon: "Minus",
      defaultTitle: "",
      supportsOptions: false,
      supportsValidation: false,
      supportsLogic: false,
    },
  };
