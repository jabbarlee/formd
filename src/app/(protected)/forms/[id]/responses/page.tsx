"use client";

import { use, useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table as TableIcon, Sparkles, BarChart3 } from "lucide-react";
import { responsesApi } from "@/lib/api/responses";
import { formsApi } from "@/lib/api/forms";
import { useAuth } from "@/lib/auth";
import {
  Form,
  Question,
  FormResponse,
  ResponseFilters,
  ResponseStats,
} from "@/lib/types/forms";
import { ResponsesTableView } from "@/components/pages/responses/ResponsesTableView";
import { ResponsesSummaryView } from "@/components/pages/responses/ResponsesSummaryView";
import { ResponseDetailSheet } from "@/components/pages/responses/ResponseDetailSheet";
import { ResponsesFilters } from "@/components/pages/responses/ResponsesFilters";
import { ResponsesStats } from "@/components/pages/responses/ResponsesStats";
import { FormResponsesHeader } from "@/components/pages/responses/FormResponsesHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react";

interface LoadingState {
  form: boolean;
  responses: boolean;
}

interface ErrorState {
  form: string | null;
  responses: string | null;
}

export default function FormResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, status } = useAuth(); // Get auth status

  const [filters, setFilters] = useState<ResponseFilters>({
    search: undefined,
    status: undefined,
    device: undefined,
  });
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState<LoadingState>({
    form: true,
    responses: true,
  });
  const [errors, setErrors] = useState<ErrorState>({
    form: null,
    responses: null,
  });

  // Real data state
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allResponses, setAllResponses] = useState<FormResponse[]>([]);
  const [responseStats, setResponseStats] = useState<ResponseStats>({
    total: 0,
    completed: 0,
    partial: 0,
    flagged: 0,
    completionRate: 0,
    averageTime: 0,
    todayCount: 0,
    weekGrowth: 0,
  });

  // Load form data
  useEffect(() => {
    async function loadForm() {
      try {
        setLoading((prev) => ({ ...prev, form: true }));
        setErrors((prev) => ({ ...prev, form: null }));

        const { form: formData, questions: questionsData } =
          await formsApi.getForm(id);
        setForm(formData);
        setQuestions(questionsData);
      } catch (error: any) {
        console.error("Error loading form:", error);
        setErrors((prev) => ({
          ...prev,
          form: error.message || "Failed to load form",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, form: false }));
      }
    }

    // Only load if user is authenticated
    if (user && status === "authenticated") {
      loadForm();
    }
  }, [id, user, status]);

  // Load responses data whenever filters change
  useEffect(() => {
    async function loadResponses() {
      try {
        setLoading((prev) => ({ ...prev, responses: true }));
        setErrors((prev) => ({ ...prev, responses: null }));

        const { responses: responsesData, stats: statsData } =
          await responsesApi.getResponses(id, filters);
        setAllResponses(responsesData);
        setResponseStats(statsData);
      } catch (error: any) {
        console.error("Error loading responses:", error);
        setErrors((prev) => ({
          ...prev,
          responses: error.message || "Failed to load responses",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, responses: false }));
      }
    }

    // Only load if form exists and user is authenticated
    if (form && user && status === "authenticated") {
      loadResponses();
    }
  }, [id, form, filters, user, status]); // Added user and status dependencies

  console.log("Form ID:", id);
  console.log("All responses:", allResponses.length);

  // Since filtering is now server-side, we don't need client-side filtering
  const filteredResponses = allResponses;

  // Transform responses for view components
  const transformedResponses = useMemo(() => {
    if (!form) return [];

    return filteredResponses.map((r) => ({
      id: r.id,
      formName: form.title,
      respondent: r.respondent.name || r.respondent.email || "Anonymous",
      submittedAt: r.submittedAt,
      status: r.status,
      score: r.data.q1_satisfaction,
      duration: r.completionTime
        ? `${Math.floor(r.completionTime / 60)}m ${r.completionTime % 60}s`
        : "N/A",
      answers: Object.keys(r.data).length,
      totalQuestions: questions.length,
    }));
  }, [filteredResponses, form, questions]);

  const handleViewResponse = (id: string) => {
    const response = filteredResponses.find((r) => r.id === id);
    if (response) {
      setSelectedResponse(response);
      setIsDetailOpen(true);
    }
  };

  const handleDeleteResponse = async (id: string) => {
    try {
      await responsesApi.deleteResponse(id, id);
      // Reload responses after deletion
      const { responses: responsesData, stats: statsData } =
        await responsesApi.getResponses(id, filters);
      setAllResponses(responsesData);
      setResponseStats(statsData);
    } catch (error: any) {
      console.error("Error deleting response:", error);
    }
  };

  const handleFlagResponse = async (id: string) => {
    try {
      await responsesApi.flagResponse(id, id);
      // Reload responses after flagging
      const { responses: responsesData, stats: statsData } =
        await responsesApi.getResponses(id, filters);
      setAllResponses(responsesData);
      setResponseStats(statsData);
    } catch (error: any) {
      console.error("Error flagging response:", error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await responsesApi.exportResponses(id, "csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form?.title || "form"}-responses.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Error exporting responses:", error);
    }
  };

  // Show loading state
  if (loading.form) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show form error
  if (errors.form) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{errors.form}</span>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">Form not found</div>
      </div>
    );
  }

  return (
    <div>
      <FormResponsesHeader
        formTitle={form.title}
        formId={id}
        totalResponses={responseStats.total}
        onExport={handleExport}
      />

      <div className="space-y-6 p-6">
        {loading.responses ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : errors.responses ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{errors.responses}</span>
          </div>
        ) : (
          <>
            <ResponsesStats stats={responseStats} />

            <ResponsesFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={allResponses.length}
              filteredCount={filteredResponses.length}
            />

            <Tabs defaultValue="table" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="table" className="gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Table View</span>
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Summary</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">AI Insights</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="table" className="mt-0">
                <ResponsesTableView
                  responses={transformedResponses}
                  onView={handleViewResponse}
                  onDelete={handleDeleteResponse}
                />
              </TabsContent>

              <TabsContent value="summary" className="mt-0">
                <ResponsesSummaryView
                  questions={questions}
                  responses={filteredResponses}
                />
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sentiment Analysis</CardTitle>
                      <CardDescription>
                        Overall sentiment from text responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Positive
                            </span>
                            <span className="text-sm text-muted-foreground">
                              68%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: "68%" }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Neutral</span>
                            <span className="text-sm text-muted-foreground">
                              22%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-500"
                              style={{ width: "22%" }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Negative
                            </span>
                            <span className="text-sm text-muted-foreground">
                              10%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500"
                              style={{ width: "10%" }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Common Themes</CardTitle>
                      <CardDescription>
                        AI-identified topics from responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { theme: "Customer Service", count: 45 },
                          { theme: "Product Quality", count: 38 },
                          { theme: "Pricing", count: 29 },
                          { theme: "Delivery Speed", count: 22 },
                          { theme: "User Experience", count: 18 },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium">
                              {item.theme}
                            </span>
                            <Badge variant="secondary">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Response Trends</CardTitle>
                      <CardDescription>
                        Daily submission patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Monday</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: "75%" }}
                              />
                            </div>
                            <span className="font-medium">32</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tuesday</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: "85%" }}
                              />
                            </div>
                            <span className="font-medium">38</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Wednesday
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: "90%" }}
                              />
                            </div>
                            <span className="font-medium">42</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Thursday
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: "70%" }}
                              />
                            </div>
                            <span className="font-medium">28</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Friday</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: "55%" }}
                              />
                            </div>
                            <span className="font-medium">24</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                      <CardDescription>AI-generated summary</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-sm">
                        <li className="flex gap-2">
                          <span className="text-green-600 font-bold">+</span>
                          <span>
                            Customers highly appreciate the responsive customer
                            service team
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-green-600 font-bold">+</span>
                          <span>
                            Product quality consistently receives positive
                            feedback
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-yellow-600 font-bold">~</span>
                          <span>
                            Response times could be improved during peak hours
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-red-600 font-bold">-</span>
                          <span>
                            Checkout process has reported bugs that need
                            attention
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-600 font-bold">→</span>
                          <span>
                            Mobile experience improvements requested by multiple
                            users
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <ResponseDetailSheet
              response={selectedResponse}
              isOpen={isDetailOpen}
              onClose={() => setIsDetailOpen(false)}
              onDelete={handleDeleteResponse}
              onFlag={handleFlagResponse}
              formQuestions={questions}
            />
          </>
        )}
      </div>
    </div>
  );
}
