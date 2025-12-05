"use client";

/**
 * MetricCard Component
 * Displays a metric with trend indicator and icon
 */

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  borderColor?: string;
  gradientFrom?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-50 dark:bg-blue-950/20",
  borderColor = "border-l-blue-500",
  gradientFrom = "from-blue-50/50",
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;

  return (
    <Card className={cn(
      "border-l-4",
      borderColor,
      "bg-gradient-to-br to-background dark:to-background",
      gradientFrom
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("rounded-full p-2", iconBgColor)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={cn(
            "text-xs font-medium flex items-center gap-1 mt-1",
            isPositive && "text-emerald-600",
            isNegative && "text-red-600",
            isNeutral && "text-muted-foreground"
          )}>
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {!isNeutral && (
              <span>
                {isPositive && '+'}
                {change.toFixed(1)}%
              </span>
            )}
            {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

