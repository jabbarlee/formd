/**
 * Form Builder Store
 * Zustand store for managing form builder state
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Form,
  Question,
  QuestionType,
  FormBuilderState,
  QuestionOption,
} from "@/lib/types/forms";
import { questionTypeMetadata } from "@/lib/types/forms";
import { hashPassword } from "@/lib/utils/password";
import { formsApi } from "@/lib/api/forms";

interface FormBuilderActions {
  // Form actions
  setForm: (form: Partial<Form>) => void;
  updateFormField: <K extends keyof Form>(field: K, value: Form[K]) => void;
  resetForm: () => void;
  loadForm: (formId: string) => Promise<void>;

  // Question actions
  addQuestion: (type: QuestionType, position?: number) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  duplicateQuestion: (questionId: string) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;
  moveQuestionUp: (questionId: string) => void;
  moveQuestionDown: (questionId: string) => void;
  selectQuestion: (questionId: string | null) => void;
  selectFormHeader: () => void;

  // Question option actions
  addQuestionOption: (
    questionId: string,
    option: Partial<QuestionOption>
  ) => void;
  updateQuestionOption: (
    questionId: string,
    optionId: string,
    updates: Partial<QuestionOption>
  ) => void;
  deleteQuestionOption: (questionId: string, optionId: string) => void;
  reorderQuestionOptions: (
    questionId: string,
    startIndex: number,
    endIndex: number
  ) => void;

  // State management
  setDirty: (isDirty: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
  setPreviewMode: (isPreview: boolean) => void;

  // API actions
  saveForm: () => Promise<void>;
  createForm: () => Promise<Form>;
}

type FormBuilderStore = FormBuilderState & FormBuilderActions;

const generateId = () => Math.random().toString(36).substring(2, 11);

const createDefaultForm = (): Partial<Form> => ({
  title: "Untitled Form",
  description: "",
  status: "draft",
  slug: "",
  requiresPassword: false,
  formPassword: undefined,
  passwordHash: undefined,
  unifiedCardLayout: false, // Default to separate cards
  allowMultipleResponses: false,
  showProgressBar: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  theme: {
    primaryColor: "#6366f1",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: "Inter",
    fontSize: "medium",
    borderRadius: "medium",
    spacing: "normal",
    buttonStyle: "filled",
  },
  settings: {
    allowMultipleResponses: false,
    showProgressBar: true,
    showQuestionNumbers: true,
    oneQuestionPerPage: false,
    shuffleQuestions: false,
    notifyOnSubmission: false,
    showSubmissionMessage: true,
    customSubmissionMessage: "Thank you for your submission!",
    collectIpAddress: false,
    collectLocation: false,
    allowSaveDraft: false,
    requireEmailVerification: false,
  },
});

const createDefaultQuestion = (
  type: QuestionType,
  formId: string,
  order: number
): Question => {
  const metadata = questionTypeMetadata[type];
  const id = generateId();

  const baseQuestion: Question = {
    id,
    formId,
    type,
    title: metadata.defaultTitle,
    description: "",
    placeholder: "",
    required: false,
    order,
    createdAt: new Date().toISOString(),
  };

  // Add default options for choice-based questions
  if (
    metadata.supportsOptions &&
    [
      "multiple_choice",
      "checkboxes",
      "dropdown",
      "image_choice",
      "ranking",
    ].includes(type)
  ) {
    baseQuestion.options = [
      { id: generateId(), label: "Option 1", value: "option_1", order: 0 },
      { id: generateId(), label: "Option 2", value: "option_2", order: 1 },
      { id: generateId(), label: "Option 3", value: "option_3", order: 2 },
    ];
  }

  // Add default settings based on type
  if (type === "star_rating") {
    baseQuestion.settings = { maxRating: 5, icon: "star" };
  } else if (type === "linear_scale") {
    baseQuestion.settings = {
      scaleMin: 1,
      scaleMax: 5,
      minLabel: "Not likely",
      maxLabel: "Very likely",
    };
  } else if (type === "nps") {
    baseQuestion.settings = { scaleMin: 0, scaleMax: 10 };
  } else if (type === "file_upload") {
    baseQuestion.settings = {
      maxFileSize: 10,
      maxFiles: 1,
      allowedFileTypes: ["pdf", "doc", "docx", "jpg", "png"],
    };
  } else if (type === "matrix") {
    baseQuestion.settings = {
      rows: [
        { id: generateId(), label: "Row 1", value: "row_1", order: 0 },
        { id: generateId(), label: "Row 2", value: "row_2", order: 1 },
        { id: generateId(), label: "Row 3", value: "row_3", order: 2 },
      ],
      columns: [
        { id: generateId(), label: "Column 1", value: "col_1", order: 0 },
        { id: generateId(), label: "Column 2", value: "col_2", order: 1 },
        { id: generateId(), label: "Column 3", value: "col_3", order: 2 },
      ],
    };
  } else if (type === "payment") {
    baseQuestion.settings = {
      currency: "$",
      amount: 0,
    };
  } else if (type === "image_choice") {
    baseQuestion.settings = {
      imageSize: "medium",
    };
  } else if (type === "number") {
    baseQuestion.settings = {
      min: 0,
      max: 100,
      step: 1,
    };
  }

  return baseQuestion;
};

export const useFormBuilderStore = create<FormBuilderStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      form: createDefaultForm(),
      questions: [],
      selectedQuestionId: null,
      isDirty: false,
      isSaving: false,
      error: null,
      isPreviewMode: false,

      // Form actions
      setForm: (form) => {
        set({ form, isDirty: true });
      },

      updateFormField: (field, value) => {
        set((state) => ({
          form: {
            ...state.form,
            [field]: value,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }));
      },

      resetForm: () => {
        set({
          form: createDefaultForm(),
          questions: [],
          selectedQuestionId: null,
          isDirty: false,
          error: null,
        });
      },

      // Question actions
      addQuestion: (type, position) => {
        const state = get();
        const formId = state.form.id || "temp-form-id";
        const order =
          position !== undefined ? position : state.questions.length;

        const newQuestion = createDefaultQuestion(type, formId, order);

        // If position is specified, reorder existing questions
        let updatedQuestions = [...state.questions];
        if (position !== undefined && position < state.questions.length) {
          updatedQuestions = updatedQuestions.map((q) =>
            q.order >= position ? { ...q, order: q.order + 1 } : q
          );
        }

        updatedQuestions.push(newQuestion);
        updatedQuestions.sort((a, b) => a.order - b.order);

        set({
          questions: updatedQuestions,
          selectedQuestionId: newQuestion.id,
          isDirty: true,
        });
      },

      updateQuestion: (questionId, updates) => {
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
          isDirty: true,
        }));
      },

      deleteQuestion: (questionId) => {
        set((state) => {
          const filteredQuestions = state.questions
            .filter((q) => q.id !== questionId)
            .map((q, index) => ({ ...q, order: index }));

          return {
            questions: filteredQuestions,
            selectedQuestionId:
              state.selectedQuestionId === questionId
                ? null
                : state.selectedQuestionId,
            isDirty: true,
          };
        });
      },

      duplicateQuestion: (questionId) => {
        const state = get();
        const questionToDuplicate = state.questions.find(
          (q) => q.id === questionId
        );

        if (!questionToDuplicate) return;

        const newQuestion: Question = {
          ...questionToDuplicate,
          id: generateId(),
          order: questionToDuplicate.order + 1,
          title: `${questionToDuplicate.title} (Copy)`,
          createdAt: new Date().toISOString(),
          options: questionToDuplicate.options?.map((opt) => ({
            ...opt,
            id: generateId(),
          })),
        };

        const updatedQuestions = state.questions.map((q) =>
          q.order > questionToDuplicate.order ? { ...q, order: q.order + 1 } : q
        );

        updatedQuestions.push(newQuestion);
        updatedQuestions.sort((a, b) => a.order - b.order);

        set({
          questions: updatedQuestions,
          selectedQuestionId: newQuestion.id,
          isDirty: true,
        });
      },

      reorderQuestions: (startIndex, endIndex) => {
        const state = get();
        const questions = [...state.questions];
        const [movedQuestion] = questions.splice(startIndex, 1);
        questions.splice(endIndex, 0, movedQuestion);

        const reorderedQuestions = questions.map((q, index) => ({
          ...q,
          order: index,
        }));

        set({ questions: reorderedQuestions, isDirty: true });
      },

      moveQuestionUp: (questionId) => {
        const state = get();
        const currentIndex = state.questions.findIndex(
          (q) => q.id === questionId
        );

        if (currentIndex > 0) {
          const questions = [...state.questions];
          const [movedQuestion] = questions.splice(currentIndex, 1);
          questions.splice(currentIndex - 1, 0, movedQuestion);

          const reorderedQuestions = questions.map((q, index) => ({
            ...q,
            order: index,
          }));

          set({ questions: reorderedQuestions, isDirty: true });
        }
      },

      moveQuestionDown: (questionId) => {
        const state = get();
        const currentIndex = state.questions.findIndex(
          (q) => q.id === questionId
        );

        if (currentIndex < state.questions.length - 1) {
          const questions = [...state.questions];
          const [movedQuestion] = questions.splice(currentIndex, 1);
          questions.splice(currentIndex + 1, 0, movedQuestion);

          const reorderedQuestions = questions.map((q, index) => ({
            ...q,
            order: index,
          }));

          set({ questions: reorderedQuestions, isDirty: true });
        }
      },

      selectQuestion: (questionId) => {
        set({ selectedQuestionId: questionId });
      },

      selectFormHeader: () => {
        set({ selectedQuestionId: "form-header" });
      },

      // Question option actions
      addQuestionOption: (questionId, option) => {
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === questionId) {
              const currentOptions = q.options || [];
              const newOption: QuestionOption = {
                id: generateId(),
                label: option.label || `Option ${currentOptions.length + 1}`,
                value: option.value || `option_${currentOptions.length + 1}`,
                order: currentOptions.length,
                image: option.image,
              };
              return { ...q, options: [...currentOptions, newOption] };
            }
            return q;
          }),
          isDirty: true,
        }));
      },

      updateQuestionOption: (questionId, optionId, updates) => {
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === questionId && q.options) {
              return {
                ...q,
                options: q.options.map((opt) =>
                  opt.id === optionId ? { ...opt, ...updates } : opt
                ),
              };
            }
            return q;
          }),
          isDirty: true,
        }));
      },

      deleteQuestionOption: (questionId, optionId) => {
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === questionId && q.options) {
              return {
                ...q,
                options: q.options
                  .filter((opt) => opt.id !== optionId)
                  .map((opt, index) => ({ ...opt, order: index })),
              };
            }
            return q;
          }),
          isDirty: true,
        }));
      },

      reorderQuestionOptions: (questionId, startIndex, endIndex) => {
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === questionId && q.options) {
              const options = [...q.options];
              const [movedOption] = options.splice(startIndex, 1);
              options.splice(endIndex, 0, movedOption);
              return {
                ...q,
                options: options.map((opt, index) => ({
                  ...opt,
                  order: index,
                })),
              };
            }
            return q;
          }),
          isDirty: true,
        }));
      },

      // State management
      setDirty: (isDirty) => set({ isDirty }),
      setSaving: (isSaving) => set({ isSaving }),
      setError: (error) => set({ error }),
      setPreviewMode: (isPreviewMode) => set({ isPreviewMode }),

      // Save action (mock implementation)
      // API actions
      loadForm: async (formId: string) => {
        set({ isSaving: true, error: null });

        try {
          const { form, questions } = await formsApi.getForm(formId);

          set({
            form,
            questions,
            isDirty: false,
            isSaving: false,
            selectedQuestionId: null,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to load form";
          set({ isSaving: false, error: message });
          throw error;
        }
      },

      createForm: async () => {
        const state = get();
        set({ isSaving: true, error: null });

        try {
          // Hash password if required
          let passwordHash: string | undefined = undefined;
          if (state.form.requiresPassword && state.form.formPassword) {
            passwordHash = await hashPassword(state.form.formPassword);
          }

          // Prepare form data
          const formData = {
            ...state.form,
            passwordHash,
            formPassword: undefined,
          };

          // Create form via API
          const { form } = await formsApi.createForm(formData);

          // Update store with created form (now has ID)
          set({
            form,
            isDirty: false,
            isSaving: false,
          });

          return form as Form;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to create form";
          set({ isSaving: false, error: message });
          throw error;
        }
      },

      saveForm: async () => {
        const state = get();

        // If form doesn't have an ID yet, create it first
        if (!state.form.id) {
          await get().createForm();
          return;
        }

        set({ isSaving: true, error: null });

        try {
          // Hash password if required and changed
          let passwordHash = state.form.passwordHash;
          if (state.form.requiresPassword && state.form.formPassword) {
            passwordHash = await hashPassword(state.form.formPassword);
          }

          // Prepare form data
          const formData = {
            ...state.form,
            passwordHash,
            formPassword: undefined,
          };

          // Update form via API
          const { form, questions } = await formsApi.updateForm(
            state.form.id!,
            formData,
            state.questions
          );

          // Update store with latest data from server
          set({
            form,
            questions,
            isDirty: false,
            isSaving: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to save form";
          set({ isSaving: false, error: message });
          throw error;
        }
      },
    }),
    { name: "FormBuilder" }
  )
);
