/**
 * Chat Store for AI Form Creation
 * Manages conversation history and current form state with database persistence
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Form, Question } from "@/lib/types/forms";
import { aiChatsApi } from "@/lib/api/aiChats";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date | string;
}

export interface GeneratedFormData {
  form: Partial<Form>;
  questions: Question[];
}

interface ChatState {
  // Current chat session
  currentChatId: string | null;
  messages: ChatMessage[];
  currentForm: GeneratedFormData | null;
  
  // Loading states
  isGenerating: boolean;
  isLoadingChat: boolean;
  isSavingMessage: boolean;
  
  // Error state
  error: string | null;
}

interface ChatActions {
  // Message management
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateCurrentForm: (formData: GeneratedFormData) => void;
  
  // Generation state
  setGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  
  // Database operations
  createNewChat: (title: string) => Promise<string>;
  loadChat: (chatId: string) => Promise<void>;
  saveMessage: (message: ChatMessage) => Promise<void>;
  saveFormDraft: () => Promise<void>;
  linkFormToChat: (formId: string) => Promise<void>;
  
  // Reset
  clearChat: () => void;
}

type ChatStore = ChatState & ChatActions;

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentChatId: null,
      messages: [],
      currentForm: null,
      isGenerating: false,
      isLoadingChat: false,
      isSavingMessage: false,
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

      // Create new chat in database
      createNewChat: async (title) => {
        try {
          const chat = await aiChatsApi.createChat(title);
          set({
            currentChatId: chat.id,
            messages: [],
            currentForm: null,
            error: null,
          });
          return chat.id;
        } catch (error) {
          console.error("Failed to create chat:", error);
          set({ error: error instanceof Error ? error.message : "Failed to create chat" });
          throw error;
        }
      },

      // Load existing chat from database
      loadChat: async (chatId) => {
        try {
          set({ isLoadingChat: true, error: null });
          const chat = await aiChatsApi.getChat(chatId);
          
          set({
            currentChatId: chat.id,
            messages: chat.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
            currentForm: chat.form_draft,
            isLoadingChat: false,
          });
        } catch (error) {
          console.error("Failed to load chat:", error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to load chat",
            isLoadingChat: false,
          });
          throw error;
        }
      },

      // Save message to database
      saveMessage: async (message) => {
        const { currentChatId } = get();
        if (!currentChatId) {
          console.warn("No active chat to save message to");
          return;
        }

        try {
          set({ isSavingMessage: true });
          await aiChatsApi.appendMessage(currentChatId, {
            ...message,
            timestamp: typeof message.timestamp === 'string' 
              ? message.timestamp 
              : message.timestamp.toISOString(),
          });
          set({ isSavingMessage: false });
        } catch (error) {
          console.error("Failed to save message:", error);
          set({ isSavingMessage: false });
          // Don't throw - we don't want to block UI
        }
      },

      // Save current form draft
      saveFormDraft: async () => {
        const { currentChatId, currentForm } = get();
        if (!currentChatId || !currentForm) {
          return;
        }

        try {
          await aiChatsApi.updateFormDraft(currentChatId, currentForm);
        } catch (error) {
          console.error("Failed to save form draft:", error);
        }
      },

      // Link chat to created form
      linkFormToChat: async (formId) => {
        const { currentChatId } = get();
        if (!currentChatId) {
          return;
        }

        try {
          await aiChatsApi.linkForm(currentChatId, formId);
        } catch (error) {
          console.error("Failed to link form:", error);
        }
      },

      // Clear current chat (doesn't delete from DB)
      clearChat: () =>
        set({
          currentChatId: null,
          messages: [],
          currentForm: null,
          isGenerating: false,
          error: null,
        }),
    }),
    { name: "ChatStore" }
  )
);
