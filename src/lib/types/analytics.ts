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
// Question Interaction Types (Detailed Tracking)
// ============================================================================

export type QuestionInteractionType = 
  | 'viewed'
  | 'focused'
  | 'answered'
  | 'skipped'
  | 'edited'
  | 'validation_error';

export interface QuestionInteraction {
  id: string;
  formId: string;
  questionId: string;
  responseId?: string;
  sessionId: string;
  interactionType: QuestionInteractionType;
  questionOrder?: number;
  timeToAnswer?: number;
  timeOnQuestion?: number;
  editCount: number;
  validationErrors: number;
  isSkipped: boolean;
  skipReason?: string;
  answerValue?: any;
  cameFromQuestionId?: string;
  navigationDirection?: 'forward' | 'backward' | 'jump';
  timestamp: string;
}

// ============================================================================
// Detailed Question Analytics
// ============================================================================

export interface TimeDistribution {
  fast: number; // < 10s
  normal: number; // 10-60s
  slow: number; // > 60s
}

export interface SkipReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface RetryDistribution {
  firstTry: number; // Got it right first time
  fewRetries: number; // 2-3 attempts
  manyRetries: number; // 4+ attempts
}

export interface NavigationPatterns {
  forward: number; // Came from previous question
  backward: number; // Went back and re-answered
  jump: number; // Jumped from elsewhere
}

export interface QuestionAnalyticsDetailed extends QuestionAnalytics {
  // Time metrics
  averageTimeToAnswer: number; // seconds
  medianTimeToAnswer: number;
  timeDistribution: TimeDistribution;
  
  // Drop-off metrics
  viewCount: number; // How many times question was viewed
  answerCount: number; // How many times answered
  dropOffCount: number; // Viewed but form abandoned after
  dropOffRate: number; // Percentage who abandoned at this question
  
  // Skip analysis
  skipRate: number; // Percentage who skipped (for optional questions)
  skipReasons: SkipReason[];
  
  // Answer quality
  averageEditCount: number; // How many times users edit their answer
  validationErrorRate: number; // Percentage who had validation errors
  retryDistribution: RetryDistribution;
  
  // Navigation patterns
  navigationPatterns: NavigationPatterns;
  
  // Sequence insights
  averagePosition: number; // Average order this question was answered in
  positionVariance: number; // How much order varies (for non-linear forms)
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

