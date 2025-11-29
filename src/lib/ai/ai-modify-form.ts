/**
 * AI Form Modification Logic
 * Builds context-aware prompts for modifying existing forms
 */

import type { Form, Question, QuestionType } from "@/lib/types/forms";
import { questionTypeMetadata } from "@/lib/types/forms";

/**
 * Build system prompt for form modification
 */
export function buildModificationSystemPrompt(): string {
  return `You are an expert form builder AI assistant. Your task is to modify existing forms based on user instructions.

CRITICAL REQUIREMENTS:
1. **Preserve existing questions** unless explicitly asked to remove them
2. **Maintain question IDs** for existing questions to preserve data
3. **Generate new IDs** only for newly added questions (format: "q_" + alphanumeric)
4. **Sequential order**: Ensure all questions have correct sequential order (0, 1, 2, ...)
5. **Return complete form**: Return the full updated questions array, not just changes

MODIFICATION TYPES YOU CAN HANDLE:
- **Add questions**: Insert new questions at appropriate positions
- **Remove questions**: Delete specified questions and reorder remaining
- **Edit titles/descriptions**: Update question text
- **Modify options**: Add, remove, or edit choice options for multiple choice, checkboxes, dropdown
- **Change settings**: Update requirements, placeholders, validation rules
- **Reorder**: Move questions to different positions

QUESTION TYPES REFERENCE:
${Object.entries(questionTypeMetadata)
  .map(([type, meta]) => `- **${type}**: ${meta.description}`)
  .join("\n")}

IMPORTANT RULES:
1. When adding questions, generate proper question IDs starting with "q_"
2. When adding options, generate proper option IDs starting with "opt_"
3. Preserve all existing question data unless user asks to modify it
4. Maintain logical question flow and grouping
5. Use appropriate question types for the user's intent
6. Keep the order field sequential (0, 1, 2, 3, ...)

EXAMPLES:
User: "Add a phone number question"
→ Add new question with type "phone", generate new ID, place at end

User: "Make the email field required"
→ Find email question, set required: true

User: "Change the options for the color question to Red, Green, Blue"
→ Find color question, replace options array with new options

User: "Remove the age question"
→ Filter out age question, reorder remaining questions

Provide a brief summary of your changes in the summary field.`;
}

/**
 * Build context string describing current form state
 */
export function buildFormContext(form: Partial<Form>, questions: Question[]): string {
  const formContext = `
CURRENT FORM STATE:
Title: "${form.title || "Untitled Form"}"
Description: "${form.description || "No description"}"
Number of questions: ${questions.length}

CURRENT QUESTIONS:
${questions.map((q, idx) => {
  const metadata = questionTypeMetadata[q.type as QuestionType];
  let questionInfo = `${idx + 1}. [${q.id}] "${q.title}" (Type: ${metadata.label})`;
  
  if (q.description) {
    questionInfo += `\n   Description: "${q.description}"`;
  }
  
  if (q.placeholder) {
    questionInfo += `\n   Placeholder: "${q.placeholder}"`;
  }
  
  questionInfo += `\n   Required: ${q.required ? "Yes" : "No"}`;
  
  if (q.options && q.options.length > 0) {
    questionInfo += `\n   Options: ${q.options.map(opt => `"${opt.label}"`).join(", ")}`;
  }
  
  if (q.settings) {
    const relevantSettings = Object.entries(q.settings)
      .filter(([_, value]) => value !== undefined && value !== null && value !== 0 && value !== "" && value !== false)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
    
    if (relevantSettings.length > 0) {
      questionInfo += `\n   Settings: ${relevantSettings.join(", ")}`;
    }
  }
  
  return questionInfo;
}).join("\n\n")}
`;

  return formContext.trim();
}

/**
 * Build complete prompt for AI modification
 */
export function buildModificationPrompt(
  userPrompt: string,
  form: Partial<Form>,
  questions: Question[]
): { systemPrompt: string; userMessage: string } {
  const systemPrompt = buildModificationSystemPrompt();
  const formContext = buildFormContext(form, questions);
  
  const userMessage = `${formContext}

USER REQUEST:
${userPrompt}

Please modify the form according to the user's request. Return the complete updated questions array with all changes applied.`;

  return { systemPrompt, userMessage };
}
