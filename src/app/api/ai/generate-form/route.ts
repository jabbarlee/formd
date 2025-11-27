/**
 * AI Form Generation API
 * Uses OpenAI Structured Outputs for reliable, type-safe form generation
 * 
 * @see https://platform.openai.com/docs/guides/structured-outputs
 */


import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { aiFormSchema } from "@/lib/validations/ai-form";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate API key on module load
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️  OPENAI_API_KEY is not configured. AI form generation will not work.");
}

/**
 * POST /api/ai/generate-form
 * Generate a form structure from a natural language prompt
 */
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Validate input
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (prompt.length < 10) {
      return NextResponse.json(
        { error: "Prompt must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: "Prompt must be less than 2000 characters" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Use Chat Completions API with Structured Outputs
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: zodResponseFormat(aiFormSchema, "form_structure"),
      temperature: 0.7,
      max_tokens: 4000,
    });

    const message = completion.choices[0]?.message;

    // Check for refusal
    if (message?.refusal) {
      console.warn("AI refused to generate form:", message.refusal);
      return NextResponse.json(
        {
          error: "Unable to generate form",
          details: "The request was declined for safety reasons. Please try rephrasing your prompt.",
          refusal: message.refusal,
        },
        { status: 400 }
      );
    }

    // Check if we have content
    if (!message?.content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(message.content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", message.content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate against schema
    const validatedForm = aiFormSchema.parse(parsedData);

    if (!validatedForm || !validatedForm.form || !validatedForm.questions) {
      throw new Error("Invalid form structure returned from AI");
    }

    if (!validatedForm) {
      return NextResponse.json(
        { error: "Failed to generate valid form structure" },
        { status: 500 }
      );
    }

    // Enrich form with application-specific fields
    const formId = crypto.randomUUID(); // Generate proper UUID for database compatibility
    
    const enrichedForm = {
      ...validatedForm.form,
      id: formId,
      status: "draft" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        allowMultipleResponses: false,
        showProgressBar: true,
        showQuestionNumbers: true,
        oneQuestionPerPage: false,
        shuffleQuestions: false,
        notifyOnSubmission: true,
        showSubmissionMessage: true,
        customSubmissionMessage: "Thank you for your submission!",
        unifiedCardLayout: false,
      },
    };

    // Process questions and clean up settings
    const enrichedQuestions = validatedForm.questions.map((q) => {
      // Clean settings - remove default/empty values
      const cleanedSettings = cleanQuestionSettings(q.settings);
      
      return {
        id: q.id,
        formId: formId,
        type: q.type,
        title: q.title,
        description: q.description || undefined,
        placeholder: q.placeholder || undefined,
        required: q.required,
        order: q.order,
        options: q.options.length > 0 ? q.options : undefined,
        settings: Object.keys(cleanedSettings).length > 0 ? cleanedSettings : undefined,
        createdAt: new Date().toISOString(),
      };
    });

    // Log successful generation
    console.log(`✅ Successfully generated form: "${enrichedForm.title}" with ${enrichedQuestions.length} questions`);

    return NextResponse.json({
      form: enrichedForm,
      questions: enrichedQuestions,
      metadata: {
        model: "gpt-4o-2024-08-06",
        tokensUsed: completion.usage?.total_tokens,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error("❌ AI Form Generation Error:", error);

    // Handle specific error types
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Invalid form structure generated",
          details: "The AI generated an invalid form structure. Please try again.",
          zodErrors: error.errors,
        },
        { status: 500 }
      );
    }

    if (error.code === "insufficient_quota") {
      return NextResponse.json(
        {
          error: "OpenAI quota exceeded",
          details: "Please check your OpenAI API quota and billing settings.",
        },
        { status: 429 }
      );
    }

    if (error.code === "rate_limit_exceeded") {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          details: "Too many requests. Please try again in a moment.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate form",
        details: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * Build comprehensive system prompt for form generation
 */
function buildSystemPrompt(): string {
  return `You are an expert form builder AI assistant. Your task is to generate professional, well-structured forms based on user descriptions.

CRITICAL REQUIREMENTS:
1. **ALL fields must be provided** - No null or undefined values
2. **Question IDs**: Must start with "q_" followed by a unique alphanumeric string (e.g., "q_abc123")
3. **Option IDs**: Must start with "opt_" followed by a unique alphanumeric string (e.g., "opt_xyz789")
4. **Order fields**: Must be sequential integers starting from 0
5. **Empty values**: Use empty strings ("") for optional text fields, empty arrays ([]) for options
6. **Settings**: Always provide the "settings" field with type "none" and empty settings object if not applicable

QUESTION TYPE GUIDELINES:
- **short_text**: Single-line text (name, title, short answers)
- **long_text**: Multi-line text (descriptions, comments, essays)
- **email**: Email address with validation
- **phone**: Phone number with formatting
- **number**: Numeric values (age, quantity, price)
- **multiple_choice**: Single selection from options (radio buttons)
- **checkboxes**: Multiple selections allowed
- **dropdown**: Single selection from dropdown
- **star_rating**: 1-5 star rating
- **linear_scale**: Numerical scale (1-10)
- **nps**: Net Promoter Score (0-10)
- **date/time/datetime**: Date and time pickers
- **signature**: Digital signature capture
- **file_upload**: File attachment

SETTINGS REQUIREMENTS (all fields must be provided):
- For text questions: Set minLength/maxLength (use 0 for no limit), others to defaults
- For number questions: Set min/max/step (use step=1 for whole numbers, step=0.1 for decimals, step=0 for N/A), others to defaults
- For rating questions: Set maxRating (1-10) and icon type, others to defaults
- For scale questions: Set scaleMin/scaleMax/minLabel/maxLabel, others to defaults
- For file upload: Set allowedFileTypes/maxFileSize/maxFiles, others to defaults
- For signature: Set signatureWidth/signatureHeight/signatureLineWidth/colors, others to defaults
- For choice questions: Set allowOther/randomizeOptions/imageSize, others to defaults
- DEFAULTS: Numbers=0, Strings="", Arrays=[], Booleans=false, Enums="none"
- IMPORTANT: Use simple numeric values (0, 1, 0.1, 0.5, etc.) - NO extremely small or large numbers
- Example: For a short_text question, set minLength=0, maxLength=200, min=0, max=0, step=0, all other numeric settings to 0

THEME GUIDELINES:
- Use professional, accessible color combinations
- Hex colors must be 6 characters (e.g., #FF5733)
- Choose readable fonts from the allowed list
- Match theme to form purpose (corporate, casual, creative)

FORM STRUCTURE:
1. Start with a clear, descriptive title
2. Provide helpful description with context and instructions
3. Logical question flow (general → specific)
4. Group related questions together
5. Mix of required and optional fields
6. Realistic, comprehensive options for choice questions
7. Appropriate validation and constraints

Remember: Generate realistic, production-ready forms that users would actually want to use!`;
}

/**
 * Clean question settings by removing default/empty values
 * This converts the complete settings object from AI to only non-default values
 */
function cleanQuestionSettings(settings: any): any {
  if (!settings) return {};

  const cleaned: any = {};

  // Only include non-default values
  if (settings.minLength && settings.minLength > 0) cleaned.minLength = settings.minLength;
  if (settings.maxLength && settings.maxLength > 0) cleaned.maxLength = settings.maxLength;
  if (settings.min && settings.min !== 0) cleaned.min = settings.min;
  if (settings.max && settings.max !== 0) cleaned.max = settings.max;
  if (settings.step && settings.step !== 1) cleaned.step = settings.step;
  if (settings.maxRating && settings.maxRating > 0) cleaned.maxRating = settings.maxRating;
  if (settings.icon && settings.icon !== "none") cleaned.icon = settings.icon;
  if (settings.scaleMin !== 0) cleaned.scaleMin = settings.scaleMin;
  if (settings.scaleMax !== 0) cleaned.scaleMax = settings.scaleMax;
  if (settings.minLabel) cleaned.minLabel = settings.minLabel;
  if (settings.maxLabel) cleaned.maxLabel = settings.maxLabel;
  if (settings.allowedFileTypes && settings.allowedFileTypes.length > 0) {
    cleaned.allowedFileTypes = settings.allowedFileTypes;
  }
  if (settings.maxFileSize && settings.maxFileSize > 0) cleaned.maxFileSize = settings.maxFileSize;
  if (settings.maxFiles && settings.maxFiles > 0) cleaned.maxFiles = settings.maxFiles;
  if (settings.signatureWidth && settings.signatureWidth > 0) {
    cleaned.signatureWidth = settings.signatureWidth;
  }
  if (settings.signatureHeight && settings.signatureHeight > 0) {
    cleaned.signatureHeight = settings.signatureHeight;
  }
  if (settings.signatureLineWidth && settings.signatureLineWidth > 0) {
    cleaned.signatureLineWidth = settings.signatureLineWidth;
  }
  if (settings.signatureLineColor) cleaned.signatureLineColor = settings.signatureLineColor;
  if (settings.signatureBackgroundColor) {
    cleaned.signatureBackgroundColor = settings.signatureBackgroundColor;
  }
  if (settings.allowOther) cleaned.allowOther = settings.allowOther;
  if (settings.randomizeOptions) cleaned.randomizeOptions = settings.randomizeOptions;
  if (settings.imageSize && settings.imageSize !== "none") cleaned.imageSize = settings.imageSize;

  return cleaned;
}
