// Mock data for forms, responses, templates, and analytics

export interface Form {
  id: string
  title: string
  status: "draft" | "published" | "archived"
  responses: number
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  title: string
  category: string
  description: string
  questions: number
}

export interface Response {
  id: string
  formId: string
  submittedAt: string
  status: "completed" | "partial"
  data: Record<string, any>
}

export const mockForms: Form[] = [
  {
    id: "1",
    title: "Customer Satisfaction Survey Q4 2024",
    status: "published",
    responses: 847,
    createdAt: "2024-10-15T10:00:00Z",
    updatedAt: "2024-11-20T14:30:00Z",
  },
  {
    id: "2",
    title: "Employee Feedback Form",
    status: "published",
    responses: 234,
    createdAt: "2024-11-01T09:00:00Z",
    updatedAt: "2024-11-18T11:20:00Z",
  },
  {
    id: "3",
    title: "Product Launch Survey",
    status: "draft",
    responses: 0,
    createdAt: "2024-11-15T16:00:00Z",
    updatedAt: "2024-11-22T10:45:00Z",
  },
  {
    id: "4",
    title: "Event Registration Form",
    status: "published",
    responses: 156,
    createdAt: "2024-09-20T12:00:00Z",
    updatedAt: "2024-11-10T08:30:00Z",
  },
  {
    id: "5",
    title: "Market Research - Demographics",
    status: "archived",
    responses: 1203,
    createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2024-10-30T15:00:00Z",
  },
]

export const mockTemplates: Template[] = [
  {
    id: "1",
    title: "Customer Satisfaction Survey",
    category: "Customer Feedback",
    description: "Comprehensive survey to measure customer satisfaction",
    questions: 12,
  },
  {
    id: "2",
    title: "Employee Engagement Survey",
    category: "HR",
    description: "Measure employee satisfaction and engagement",
    questions: 15,
  },
  {
    id: "3",
    title: "Event Registration",
    category: "Events",
    description: "Collect attendee information and preferences",
    questions: 8,
  },
  {
    id: "4",
    title: "Product Feedback Form",
    category: "Product",
    description: "Gather detailed product feedback from users",
    questions: 10,
  },
  {
    id: "5",
    title: "Job Application Form",
    category: "HR",
    description: "Comprehensive job application form",
    questions: 20,
  },
]

export const mockResponses: Response[] = [
  {
    id: "1",
    formId: "1",
    submittedAt: "2024-11-22T10:30:00Z",
    status: "completed",
    data: {
      rating: 5,
      feedback: "Great experience overall",
    },
  },
  {
    id: "2",
    formId: "1",
    submittedAt: "2024-11-22T09:15:00Z",
    status: "completed",
    data: {
      rating: 4,
      feedback: "Could be improved",
    },
  },
  {
    id: "3",
    formId: "1",
    submittedAt: "2024-11-22T08:45:00Z",
    status: "partial",
    data: {
      rating: 3,
    },
  },
]
