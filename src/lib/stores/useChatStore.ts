/**
 * Chat Store for AI Form Creation
 * Manages conversation history and current form state
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Form, Question } from "@/lib/types/forms";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface GeneratedFormData {
  form: Partial<Form>;
  questions: Question[];
}

interface ChatState {
  messages: ChatMessage[];
  currentForm: GeneratedFormData | null;
  isGenerating: boolean;
  error: string | null;
}

interface ChatActions {
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateCurrentForm: (formData: GeneratedFormData) => void;
  setGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

type ChatStore = ChatState & ChatActions;

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useChatStore = create<ChatStore>()(
  devtools(
    (set) => ({
      // Initial state
      messages: [],
      currentForm: null,
      isGenerating: false,
      error: null,

      // Actions
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: generateId(),
              timestamp: new Date(),
            },
          ],
          error: null,
        })),

      updateCurrentForm: (formData) =>
        set({
          currentForm: formData,
          error: null,
        }),

      setGenerating: (isGenerating) =>
        set({
          isGenerating,
        }),

      setError: (error) =>
        set({
          error,
          isGenerating: false,
        }),

      clearChat: () =>
        set({
          messages: [],
          currentForm: null,
          isGenerating: false,
          error: null,
        }),
    }),
    { name: "ChatStore" }
  )
);
