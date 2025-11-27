import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { aiFormSchema } from "@/lib/validations/ai-form";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert form builder AI. Your task is to generate a professional, well-structured form based on the user's description. " +
            "You must output a JSON object that strictly follows the provided schema. " +
            "Ensure the form has a clear title, helpful description, and a logical flow of questions. " +
            "Use appropriate question types for each field. " +
            "For choice-based questions, provide realistic and comprehensive options. " +
            "Include a mix of required and optional fields where appropriate. " +
            "Generate a unique ID for each question (e.g., 'q_' followed by random string) and option (e.g., 'opt_' followed by random string). " +
            "Ensure the 'order' field is sequential starting from 0.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: zodResponseFormat(aiFormSchema, "form_structure"),
    });

    const formStructure = completion.choices[0].message.parsed;

    if (!formStructure) {
      return NextResponse.json(
        { error: "Failed to generate form structure" },
        { status: 500 }
      );
    }

    // Add required fields that might be missing from AI generation but needed for the app
    const enrichedForm = {
      ...formStructure.form,
      id: "ai-generated-" + Date.now(),
      status: "draft",
      settings: {
        allowMultipleResponses: false,
        showProgressBar: true,
        showQuestionNumbers: true,
        oneQuestionPerPage: false,
        shuffleQuestions: false,
        notifyOnSubmission: true,
        showSubmissionMessage: true,
        customSubmissionMessage: "Thank you for your submission!",
      },
    };

    const enrichedQuestions = formStructure.questions.map((q: any) => ({
      ...q,
      formId: enrichedForm.id,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      form: enrichedForm,
      questions: enrichedQuestions,
    });
  } catch (error) {
    console.error("AI Form Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate form" },
      { status: 500 }
    );
  }
}
