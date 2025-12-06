# Question-by-Question Analytics Implementation Summary

## Overview

Comprehensive question-level analytics tracking has been successfully implemented, providing detailed insights into user interactions with individual questions including time spent, drop-off rates, skip patterns, answer quality, and navigation flows.

## What Was Implemented

### 1. Database Schema ✅

**File**: `src/lib/database/migrations/add_question_interactions.sql`

Created `question_interactions` table with the following features:
- Tracks every question interaction (viewed, focused, answered, skipped, edited, validation_error)
- Records time metrics (time_to_answer, time_on_question)
- Captures answer quality data (edit_count, validation_errors)
- Stores navigation patterns (came_from_question_id, navigation_direction)
- Supports session-based tracking before response submission
- Includes comprehensive indexes for performance

**To activate**: Run this SQL script in Supabase SQL Editor to create the table.

### 2. Type Definitions ✅

**File**: `src/lib/types/analytics.ts`

Added new types:
- `QuestionInteractionType`: Enum for interaction types
- `QuestionInteraction`: Interface for interaction records
- `QuestionAnalyticsDetailed`: Extended analytics with detailed metrics
- Supporting interfaces for time distribution, skip reasons, retry patterns, navigation patterns

### 3. Backend Services ✅

**File**: `src/lib/database/services/question-interaction.service.ts`

Question interaction service with methods:
- `trackInteraction()`: Record question interactions
- `getSessionInteractions()`: Retrieve all interactions for a session
- `getQuestionInteractions()`: Get interactions for a specific question
- `linkToResponse()`: Link session interactions to submitted response
- `getInteractionCount()`: Count interactions by type and date range

**File**: `src/lib/database/services/analytics.service.ts`

Added `getQuestionAnalyticsDetailed()` method that calculates:
- **Time Metrics**: Average/median time to answer, time distribution (fast/normal/slow)
- **Drop-off Analysis**: View count, answer count, drop-off count and rate
- **Skip Analysis**: Skip rate and reasons breakdown
- **Answer Quality**: Average edit count, validation error rate, retry distribution
- **Navigation Patterns**: Forward/backward/jump navigation counts
- **Sequence Insights**: Average position and variance

### 4. API Endpoints ✅

**File**: `src/app/api/public/forms/[id]/track-question/route.ts`

Public endpoint for tracking question interactions:
- POST `/api/public/forms/[id]/track-question`
- No authentication required (public forms)
- Validates interaction types and form existence
- Supports CORS for cross-origin requests

**File**: `src/app/api/forms/[id]/analytics/questions/route.ts`

Updated to support detailed analytics:
- GET `/api/forms/[id]/analytics/questions?detailed=true`
- Falls back to basic analytics if detailed parameter not provided
- Includes authentication and form ownership verification

### 5. Frontend Tracking ✅

**File**: `src/hooks/useQuestionTracking.ts`

Comprehensive tracking hook with:
- `onQuestionView()`: Track when questions become visible
- `onQuestionAnswer()`: Track answers with automatic edit counting
- `onQuestionSkip()`: Track skipped questions with reasons
- `onValidationError()`: Track validation failures
- `linkToResponse()`: Associate tracking with response after submission
- Automatic time calculation (time to answer, time on question)
- Navigation direction detection (forward/backward/jump)
- Question sequence tracking

**File**: `src/components/forms/preview/PublicFormPreview.tsx`

Integrated question tracking:
- Tracks all question views automatically
- Tracks answers on every change
- Passes tracking handlers to QuestionPreview components
- Works with both single-page and multi-page forms

### 6. Analytics Hooks ✅

**File**: `src/hooks/useAnalytics.ts`

Added `useQuestionAnalyticsDetailed()` hook:
- Fetches detailed question analytics from API
- Supports all time range filters
- Includes loading states and error handling
- Auto-refetches when parameters change

### 7. UI Components ✅

**File**: `src/components/analytics/DetailedQuestionMetrics.tsx`

Beautiful detailed metrics display showing:
- **Time Metrics**: Average, median, fast/slow distribution
- **Drop-off Analysis**: Visual progress bars and counts
- **Skip Analysis**: Rates and reason breakdowns
- **Answer Quality**: Edit counts, retry distribution, validation errors
- **Navigation Patterns**: Forward/backward/jump visualizations
- **Option Breakdown**: For choice-based questions
- **Sentiment Analysis**: For text questions

## How To Use

### 1. Database Setup

Run the migration script in Supabase SQL Editor:

```sql
-- Copy and paste contents of:
src/lib/database/migrations/add_question_interactions.sql
```

### 2. View Detailed Analytics

The detailed metrics are available through:

```typescript
import { useQuestionAnalyticsDetailed } from '@/hooks/useAnalytics';
import { DetailedQuestionMetrics } from '@/components/analytics/DetailedQuestionMetrics';

// In your component
const { data, loading } = useQuestionAnalyticsDetailed(formId, timeRange);

// Display the metrics
{data && <DetailedQuestionMetrics questions={data} />}
```

### 3. Tracking is Automatic

Question tracking happens automatically when users fill out forms:
- Views tracked when questions appear
- Answers tracked on every change
- Time automatically calculated
- Navigation patterns detected
- No additional setup required

### 4. Access Detailed Analytics

Option 1 - Use the `DetailedQuestionMetrics` component in your analytics page:

```typescript
import { DetailedQuestionMetrics } from '@/components/analytics/DetailedQuestionMetrics';
import { useQuestionAnalyticsDetailed } from '@/hooks/useAnalytics';

const { data } = useQuestionAnalyticsDetailed(formId, timeRange);
return <DetailedQuestionMetrics questions={data || []} />;
```

Option 2 - API directly:

```bash
GET /api/forms/{formId}/analytics/questions?detailed=true&timeRange=30d
```

## Metrics Explained

### Time Metrics
- **Average Time**: Mean time from viewing to answering
- **Median Time**: Middle value (less affected by outliers)
- **Fast**: Answered in < 10 seconds
- **Normal**: Answered in 10-60 seconds
- **Slow**: Answered in > 60 seconds

### Drop-off Rate
Percentage of users who viewed the question but abandoned the form without answering it. High drop-off rates indicate problematic questions.

### Skip Rate
For optional questions, the percentage who chose to skip rather than answer.

### Answer Quality
- **Edit Count**: How many times users modified their answer
- **First Try**: Users who got it right without validation errors
- **Validation Error Rate**: Percentage encountering validation failures

### Navigation Patterns
- **Forward**: Came from the previous question (linear flow)
- **Backward**: Went back to re-answer
- **Jump**: Jumped from a non-adjacent question

## Performance Considerations

- Tracking requests are fire-and-forget (non-blocking)
- Interactions indexed on form_id and question_id for fast queries
- Detailed analytics gracefully fall back to basic if interaction table doesn't exist
- Session-based tracking works before response submission
- All tracking failures are silent (won't interrupt user experience)

## Privacy & Data

- Question interactions tied to anonymous sessions
- No PII stored in interactions table
- Response linking happens only on successful submission
- Session IDs are randomly generated client-side

## Future Enhancements

Potential additions (not implemented):
1. Real-time analytics dashboard with WebSocket updates
2. A/B testing support for question variations
3. Heatmaps showing where users click/focus
4. Video session playback of user interactions
5. AI-powered question optimization suggestions
6. Automated alerts for high drop-off questions
7. Question performance scoring algorithm

## Testing

The system is ready for testing:

1. **Run the migration** to create the `question_interactions` table
2. **Fill out a public form** - tracking happens automatically
3. **View analytics** at `/forms/[id]/analytics` 
4. **Check detailed metrics** using the `DetailedQuestionMetrics` component

All tracking is automatic and requires no additional configuration!

## Files Created/Modified

### New Files
- `src/lib/database/migrations/add_question_interactions.sql`
- `src/lib/database/services/question-interaction.service.ts`
- `src/app/api/public/forms/[id]/track-question/route.ts`
- `src/hooks/useQuestionTracking.ts`
- `src/components/analytics/DetailedQuestionMetrics.tsx`

### Modified Files
- `src/lib/types/analytics.ts` - Added QuestionInteractionType and QuestionAnalyticsDetailed
- `src/lib/database/services/analytics.service.ts` - Added getQuestionAnalyticsDetailed()
- `src/app/api/forms/[id]/analytics/questions/route.ts` - Added detailed parameter support
- `src/hooks/useAnalytics.ts` - Added useQuestionAnalyticsDetailed()
- `src/components/forms/preview/PublicFormPreview.tsx` - Integrated question tracking

## Conclusion

The question-by-question analytics system is now fully implemented and ready to provide deep insights into how users interact with form questions. The system tracks comprehensive metrics while maintaining user privacy and ensuring excellent performance.

To activate, simply run the SQL migration and the tracking will start automatically on all public forms!

