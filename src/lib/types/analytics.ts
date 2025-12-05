/**
 * Analytics Type Definitions
 * Comprehensive types for form and workspace analytics
 */

// ============================================================================
// Event Tracking Types
// ============================================================================

export type AnalyticsEventType = 
  | 'form_viewed' 
  | 'form_started' 
  | 'question_answered' 
  | 'form_submitted' 
  | 'form_abandoned';

export interface AnalyticsEvent {
  id: string;
  formId: string;
  responseId?: string;
  eventType: AnalyticsEventType;
  eventData?: Record<string, any>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface TrackEventRequest {
  eventType: AnalyticsEventType;
  responseId?: string;
  sessionId?: string;
  eventData?: Record<string, any>;
}

// ============================================================================
// Time Range Filters
// ============================================================================

export type TimeRange = '7d' | '30d' | '90d' | 'month' | 'last_month' | 'all' | 'custom';

export interface TimeRangeFilter {
  range: TimeRange;
  customStart?: string;
  customEnd?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================================================
// Overview Metrics
// ============================================================================

export interface OverviewMetrics {
  totalViews: number;
  totalResponses: number;
  completionRate: number; // percentage
  averageTime: number; // in seconds
  viewsChange: number; // percentage change from previous period
  responsesChange: number; // percentage change
  completionRateChange: number; // percentage point change
  averageTimeChange: number; // percentage change
}

// ============================================================================
// Trend Data
// ============================================================================

export interface TrendDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  views: number;
  starts: number;
  completions: number;
}

// ============================================================================
// Funnel Data
// ============================================================================

export type FunnelStageType = 'viewed' | 'started' | 'halfway' | 'completed';

export interface FunnelStage {
  stage: FunnelStageType;
  label: string;
  count: number;
  percentage: number;
}

// ============================================================================
// Device Analytics
// ============================================================================

export interface DeviceStats {
  count: number;
  percentage: number;
}

export interface DeviceBreakdown {
  desktop: DeviceStats;
  mobile: DeviceStats;
  tablet: DeviceStats;
}

// ============================================================================
// Geographic Analytics
// ============================================================================

export interface GeographicData {
  country: string;
  countryCode: string;
  count: number;
  percentage: number;
}

// ============================================================================
// Question Analytics
// ============================================================================

export interface OptionBreakdown {
  option: string;
  count: number;
  percentage: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: string;
  responseCount: number;
  skipCount: number;
  averageTime?: number;
  // For choice questions (multiple choice, radio, dropdown, etc.)
  optionBreakdown?: OptionBreakdown[];
  // For text questions
  commonThemes?: string[];
  sentimentBreakdown?: SentimentBreakdown;
}

// ============================================================================
// Complete Analytics Response
// ============================================================================

export interface FormAnalytics {
  formId: string;
  formTitle: string;
  timeRange: TimeRangeFilter;
  overview: OverviewMetrics;
  trends: TrendDataPoint[];
  funnel: FunnelStage[];
  devices: DeviceBreakdown;
  geography: GeographicData[];
  questions: QuestionAnalytics[];
}

// ============================================================================
// Workspace Analytics
// ============================================================================

export interface FormPerformance {
  formId: string;
  formTitle: string;
  views: number;
  responses: number;
  completionRate: number;
  averageTime: number;
}

export interface WorkspaceAnalytics {
  timeRange: TimeRangeFilter;
  overview: OverviewMetrics;
  trends: TrendDataPoint[];
  topForms: FormPerformance[];
  totalForms: number;
  activeForms: number;
}

// ============================================================================
// Export Types
// ============================================================================

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  timeRange: TimeRangeFilter;
  includeCharts?: boolean;
}

