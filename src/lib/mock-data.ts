// Mock data for forms, responses, templates, and analytics

import { QuestionType } from "./types/forms";

export interface Form {
  id: string;
  title: string;
  status: "draft" | "published" | "archived";
  responses: number;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  questions: number;
}

export interface Response {
  id: string;
  formId: string;
  submittedAt: string;
  status: "completed" | "partial" | "flagged";
  respondent: {
    name?: string;
    email?: string;
    userId?: string;
  };
  completionTime?: number;
  device?: "desktop" | "mobile" | "tablet";
  location?: string;
  data: Record<string, any>;
}

export interface FormWithQuestions extends Form {
  questions: {
    id: string;
    type: QuestionType;
    title: string;
    required: boolean;
  }[];
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
];

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
];

export const mockResponses: Response[] = [
  {
    id: "R001",
    formId: "1",
    submittedAt: "2024-11-08T08:30:00Z",
    status: "completed",
    respondent: {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
    },
    completionTime: 180,
    device: "desktop",
    location: "San Francisco, CA",
    data: {
      q1_satisfaction: 5,
      q2_feedback:
        "Excellent service! The team was very responsive and helpful.",
      q3_recommend: "yes",
      q4_improvements: "Maybe add more payment options",
    },
  },
  {
    id: "R002",
    formId: "1",
    submittedAt: "2024-11-08T06:15:00Z",
    status: "completed",
    respondent: {
      name: "Michael Chen",
      email: "michael.chen@example.com",
    },
    completionTime: 145,
    device: "mobile",
    location: "New York, NY",
    data: {
      q1_satisfaction: 4,
      q2_feedback: "Good overall, but could improve response time.",
      q3_recommend: "yes",
      q4_improvements: "Faster customer support",
    },
  },
  {
    id: "R003",
    formId: "1",
    submittedAt: "2024-11-07T14:45:00Z",
    status: "flagged",
    respondent: {
      name: "David Park",
      email: "david.park@example.com",
    },
    completionTime: 95,
    device: "desktop",
    location: "Seattle, WA",
    data: {
      q1_satisfaction: 2,
      q2_feedback: "Had several issues with the checkout process.",
      q3_recommend: "no",
      q4_improvements: "Fix the bugs in checkout",
    },
  },
  {
    id: "R004",
    formId: "1",
    submittedAt: "2024-11-07T10:20:00Z",
    status: "completed",
    respondent: {
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
    },
    completionTime: 210,
    device: "tablet",
    location: "Austin, TX",
    data: {
      q1_satisfaction: 5,
      q2_feedback: "Love the new features! Very intuitive and easy to use.",
      q3_recommend: "yes",
      q4_improvements: "None, it's perfect!",
    },
  },
  {
    id: "R005",
    formId: "1",
    submittedAt: "2024-11-06T15:30:00Z",
    status: "completed",
    respondent: {
      name: "Lisa Thompson",
      email: "lisa.t@example.com",
    },
    completionTime: 160,
    device: "desktop",
    location: "Boston, MA",
    data: {
      q1_satisfaction: 4,
      q2_feedback: "Pretty good, met my expectations.",
      q3_recommend: "yes",
      q4_improvements: "Better mobile experience",
    },
  },
  {
    id: "R006",
    formId: "1",
    submittedAt: "2024-11-05T16:45:00Z",
    status: "completed",
    respondent: {
      name: "James Wilson",
      email: "james.wilson@example.com",
    },
    completionTime: 220,
    device: "mobile",
    location: "Chicago, IL",
    data: {
      q1_satisfaction: 5,
      q2_feedback: "Outstanding! Best service I've used in years.",
      q3_recommend: "yes",
      q4_improvements: "Keep up the great work",
    },
  },
  {
    id: "R007",
    formId: "1",
    submittedAt: "2024-11-05T09:00:00Z",
    status: "partial",
    respondent: {
      name: "Anonymous User",
      email: "anon_45821@temp.mail",
    },
    completionTime: 45,
    device: "mobile",
    data: {
      q1_satisfaction: 3,
    },
  },
  {
    id: "R008",
    formId: "1",
    submittedAt: "2024-11-04T13:30:00Z",
    status: "completed",
    respondent: {
      name: "Amanda Foster",
      email: "a.foster@example.com",
    },
    completionTime: 175,
    device: "desktop",
    location: "Denver, CO",
    data: {
      q1_satisfaction: 4,
      q2_feedback: "Very satisfied with the product quality and delivery time.",
      q3_recommend: "yes",
      q4_improvements: "More color options would be nice",
    },
  },
  {
    id: "R009",
    formId: "1",
    submittedAt: "2024-11-04T08:15:00Z",
    status: "completed",
    respondent: {
      name: "Robert Martinez",
      email: "r.martinez@example.com",
    },
    completionTime: 190,
    device: "desktop",
    location: "Phoenix, AZ",
    data: {
      q1_satisfaction: 5,
      q2_feedback: "Exceptional customer service and quick turnaround time.",
      q3_recommend: "yes",
      q4_improvements: "Perhaps extend business hours",
    },
  },
  {
    id: "R010",
    formId: "1",
    submittedAt: "2024-11-03T14:20:00Z",
    status: "completed",
    respondent: {
      name: "Jennifer Lee",
      email: "jen.lee@example.com",
    },
    completionTime: 155,
    device: "mobile",
    location: "Portland, OR",
    data: {
      q1_satisfaction: 4,
      q2_feedback: "Great experience overall. Minor hiccups but nothing major.",
      q3_recommend: "yes",
      q4_improvements: "Improve the search functionality",
    },
  },
  {
    id: "R011",
    formId: "1",
    submittedAt: "2024-11-03T11:45:00Z",
    status: "partial",
    respondent: {
      name: "Kevin Brown",
      email: "k.brown@example.com",
    },
    completionTime: 60,
    device: "tablet",
    data: {
      q1_satisfaction: 3,
      q2_feedback: "It's okay, but I've seen better.",
    },
  },
  {
    id: "R012",
    formId: "1",
    submittedAt: "2024-11-02T16:30:00Z",
    status: "completed",
    respondent: {
      name: "Nicole Davis",
      email: "nicole.d@example.com",
    },
    completionTime: 200,
    device: "desktop",
    location: "Miami, FL",
    data: {
      q1_satisfaction: 5,
      q2_feedback: "Absolutely fantastic! Will definitely use again.",
      q3_recommend: "yes",
      q4_improvements: "Everything is great!",
    },
  },
  {
    id: "R013",
    formId: "1",
    submittedAt: "2024-11-02T09:15:00Z",
    status: "completed",
    respondent: {
      name: "Daniel Kim",
      email: "d.kim@example.com",
    },
    completionTime: 140,
    device: "mobile",
    location: "San Diego, CA",
    data: {
      q1_satisfaction: 4,
      q2_feedback: "Solid service, would recommend to friends.",
      q3_recommend: "yes",
      q4_improvements: "Add more features",
    },
  },
  {
    id: "R014",
    formId: "1",
    submittedAt: "2024-11-01T15:00:00Z",
    status: "flagged",
    respondent: {
      name: "Thomas Anderson",
      email: "t.anderson@example.com",
    },
    completionTime: 85,
    device: "desktop",
    location: "Dallas, TX",
    data: {
      q1_satisfaction: 1,
      q2_feedback: "Terrible experience. Nothing worked as expected.",
      q3_recommend: "no",
      q4_improvements: "Complete overhaul needed",
    },
  },
  {
    id: "R015",
    formId: "1",
    submittedAt: "2024-11-01T10:30:00Z",
    status: "completed",
    respondent: {
      name: "Maria Garcia",
      email: "m.garcia@example.com",
    },
    completionTime: 195,
    device: "tablet",
    location: "Houston, TX",
    data: {
      q1_satisfaction: 5,
      q2_feedback: "Wonderful experience from start to finish!",
      q3_recommend: "yes",
      q4_improvements: "Nothing to add",
    },
  },
];

export const mockFormWithQuestions: FormWithQuestions = {
  id: "1",
  title: "Customer Satisfaction Survey Q4 2024",
  status: "published",
  responses: 234,
  createdAt: "2024-10-15T10:00:00Z",
  updatedAt: "2024-11-20T14:30:00Z",
  questions: [
    {
      id: "q1",
      type: "star_rating",
      title: "How satisfied are you with our service?",
      required: true,
    },
    {
      id: "q2",
      type: "long_text",
      title: "Please share your feedback",
      required: true,
    },
    {
      id: "q3",
      type: "multiple_choice",
      title: "Would you recommend us to others?",
      required: true,
    },
    {
      id: "q4",
      type: "short_text",
      title: "What can we improve?",
      required: false,
    },
  ],
};
