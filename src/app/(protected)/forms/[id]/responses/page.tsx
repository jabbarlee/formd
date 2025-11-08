"use client";

import { use, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table as TableIcon, Sparkles, BarChart3 } from "lucide-react";
import { mockResponses, mockFormWithQuestions } from "@/lib/mock-data";
import {
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

export default function FormResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [filters, setFilters] = useState<ResponseFilters>({
    search: undefined,
    status: undefined,
    device: undefined,
  });
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // In a real app, fetch form and responses based on id
  const form = mockFormWithQuestions;
  // For now, show all responses for formId "1" regardless of the URL param
  // In production, you'd filter by id
  const allResponses = mockResponses.filter((r) => r.formId === "1");

  console.log("Form ID:", id);
  console.log("All responses:", allResponses.length);
  console.log("Mock responses:", mockResponses.length);

  // Filter responses
  const filteredResponses = useMemo(() => {
    return allResponses.filter((response) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          response.id.toLowerCase().includes(searchLower) ||
          response.respondent.name?.toLowerCase().includes(searchLower) ||
          response.respondent.email?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && filters.status !== "all") {
        if (response.status !== filters.status) return false;
      }

      // Device filter
      if (filters.device && filters.device !== "all") {
        if (response.device !== filters.device) return false;
      }

      return true;
    });
  }, [allResponses, filters]);

  // Transform responses for view components
  const transformedResponses = useMemo(() => {
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
      totalQuestions: form.questions.length,
    }));
  }, [filteredResponses, form]);

  // Calculate stats
  const stats: ResponseStats = useMemo(() => {
    const total = allResponses.length;
    const completed = allResponses.filter(
      (r) => r.status === "completed"
    ).length;
    const partial = allResponses.filter((r) => r.status === "partial").length;
    const flagged = allResponses.filter((r) => r.status === "flagged").length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Calculate average completion time
    const completedWithTime = allResponses.filter(
      (r) => r.status === "completed" && r.completionTime
    );
    const averageTime =
      completedWithTime.length > 0
        ? completedWithTime.reduce(
            (sum, r) => sum + (r.completionTime || 0),
            0
          ) / completedWithTime.length
        : 0;

    // Count today's responses (mock data)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = allResponses.filter((r) => {
      const responseDate = new Date(r.submittedAt);
      responseDate.setHours(0, 0, 0, 0);
      return responseDate.getTime() === today.getTime();
    }).length;

    return {
      total,
      completed,
      partial,
      flagged,
      completionRate,
      averageTime: Math.round(averageTime),
      todayCount,
      weekGrowth: 12,
    };
  }, [allResponses]);

  const handleViewResponse = (id: string) => {
    const response = filteredResponses.find((r) => r.id === id);
    if (response) {
      setSelectedResponse(response);
      setIsDetailOpen(true);
    }
  };

  const handleDeleteResponse = (id: string) => {
    console.log("Delete response:", id);
  };

  const handleFlagResponse = (id: string) => {
    console.log("Flag response:", id);
  };

  const handleExport = () => {
    console.log("Export responses");
  };

  return (
    <div>
      <FormResponsesHeader
        formTitle={form.title}
        formId={id}
        totalResponses={stats.total}
        onExport={handleExport}
      />

      <div className="space-y-6 p-6">
        <ResponsesStats stats={stats} />

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
              questions={form.questions}
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
                        <span className="text-sm font-medium">Positive</span>
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
                        <span className="text-sm font-medium">Negative</span>
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
                  <CardDescription>Daily submission patterns</CardDescription>
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
                      <span className="text-muted-foreground">Wednesday</span>
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
                      <span className="text-muted-foreground">Thursday</span>
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
                        Product quality consistently receives positive feedback
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
                        Checkout process has reported bugs that need attention
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
          formQuestions={form.questions}
        />
      </div>
    </div>
  );
}
