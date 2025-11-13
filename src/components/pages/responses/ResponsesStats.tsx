"use client";

import { ResponseStats as ResponseStatsType } from "@/lib/types/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  FileText,
} from "lucide-react";

interface ResponsesStatsProps {
  stats: ResponseStatsType;
}

export function ResponsesStats({ stats }: ResponsesStatsProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value}%`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Responses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          {stats.todayCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.todayCount} today
            </p>
          )}
        </CardContent>
      </Card>

      {/* Completed Responses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatPercentage((stats.completed / stats.total) * 100)} of total
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercentage(stats.completionRate)}
          </div>
          {stats.weekGrowth !== 0 && (
            <p
              className={`text-xs mt-1 ${
                stats.weekGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatGrowth(stats.weekGrowth)} vs last week
            </p>
          )}
        </CardContent>
      </Card>

      {/* Average Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(stats.averageTime)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Per response</p>
        </CardContent>
      </Card>
    </div>
  );
}
