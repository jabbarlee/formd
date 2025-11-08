"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Download,
  LayoutList,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { mockResponses, mockFormWithQuestions } from "@/lib/mock-data";
import {
  FormResponse,
  ResponseFilters,
  ResponseViewMode,
  ResponseStats,
} from "@/lib/types/forms";
import { ResponsesListView } from "@/components/pages/responses/ResponsesListView";
import { ResponsesTableView } from "@/components/pages/responses/ResponsesTableView";
import { ResponsesGridView } from "@/components/pages/responses/ResponsesGridView";
import { ResponseDetailSheet } from "@/components/pages/responses/ResponseDetailSheet";
import { ResponsesFilters } from "@/components/pages/responses/ResponsesFilters";
import { ResponsesStats } from "@/components/pages/responses/ResponsesStats";

export default function FormResponsesPage({
  params,
}: {
  params: { id: string };
}) {
  const [viewMode, setViewMode] = useState<ResponseViewMode>("list");
  const [filters, setFilters] = useState<ResponseFilters>({
    search: undefined,
    status: undefined,
    device: undefined,
  });
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // In a real app, fetch form and responses based on params.id
  const form = mockFormWithQuestions;
  const allResponses = mockResponses.filter((r) => r.formId === params.id);

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
    <div className="space-y-6 p-6">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/forms">Forms</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/forms/${params.id}/edit`}>
                {form.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Responses</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold">Responses</h1>
            <p className="text-muted-foreground">
              {stats.total} total responses
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <ResponsesStats stats={stats} />

      <ResponsesFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={allResponses.length}
        filteredCount={filteredResponses.length}
      />

      <Tabs
        value={viewMode}
        onValueChange={(v) => setViewMode(v as ResponseViewMode)}
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <TableIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </TabsTrigger>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-0">
          <ResponsesListView
            responses={transformedResponses}
            onView={handleViewResponse}
            onDelete={handleDeleteResponse}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <ResponsesTableView
            responses={transformedResponses}
            onView={handleViewResponse}
            onDelete={handleDeleteResponse}
          />
        </TabsContent>

        <TabsContent value="grid" className="mt-0">
          <ResponsesGridView
            responses={transformedResponses}
            onView={handleViewResponse}
            onDelete={handleDeleteResponse}
          />
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
  );
}
