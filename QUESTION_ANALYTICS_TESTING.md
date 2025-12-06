# Question-by-Question Analytics Testing Guide

## Overview

This guide explains how to test the detailed question-by-question analytics feature that tracks user interactions with form questions.

## Prerequisites

### 1. Database Setup

Ensure the `question_interactions` table exists in your database:

```sql
-- Run this migration if not already done
-- File: src/lib/database/migrations/add_question_interactions.sql
```

Check if the table exists:
```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'question_interactions'
);
```

### 2. Seed Test Data

Run the analytics seed script to populate test data:

```bash
# 1. Open Supabase SQL Editor
# 2. Copy contents of scripts/seed-analytics-final.sql
# 3. Run the script
```

This creates:
- ✅ 50 form views
- ✅ ~40 form starts
- ✅ 15 completed responses
- ✅ 3 in-progress responses
- ✅ ~150 question interactions
- ✅ Navigation patterns
- ✅ Time tracking data

## Testing Steps

### Step 1: Verify Data in Database

```sql
-- Check question interactions
SELECT COUNT(*) as total_interactions,
       interaction_type,
       COUNT(DISTINCT question_id) as questions_tracked
FROM question_interactions
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
GROUP BY interaction_type;

-- Expected output:
-- viewed: ~150
-- answered: ~45
-- validation_error: ~15
-- (may also see skipped, backward navigation)
```

### Step 2: Access Analytics Page

1. **Navigate to form analytics:**
   ```
   /forms/4bc239f6-8883-405e-8d73-440fe47d60b2/analytics
   ```

2. **Check the browser console:**
   - Open DevTools (F12)
   - Look for `[useQuestionAnalyticsDetailed]` logs
   - Should see: "Fetching for form: ..." and "Received X questions"

3. **Click on the "Questions" tab**

### Step 3: Verify Display

You should see cards for each question with:

#### ✅ Question Header
- Question number and title
- **"Detailed" badge** (green) - indicates detailed metrics are available
- Question type badge
- Response/skip/view counts

#### ✅ Time Metrics Section
- **Avg Time**: Average time to answer
- **Median**: Median time to answer  
- **Fast (<10s)**: Count of fast answers
- **Slow (>60s)**: Count of slow answers

#### ✅ Drop-off Analysis (if applicable)
- Drop-off rate percentage
- Progress bar visualization
- Number of users who abandoned

#### ✅ Skip Analysis (if applicable)
- Skip rate percentage
- Reasons for skipping (optional, abandoned, etc.)

#### ✅ Answer Quality Section
- **Avg Edits**: How many times answers were changed
- **First Try**: Count of answers correct on first attempt
- **Error Rate** (if >0): Validation error percentage

#### ✅ Navigation Patterns (if applicable)
- **Forward**: Linear progression
- **Backward**: Users going back to re-answer
- **Jump**: Non-linear navigation

#### ✅ Answer Distribution (for choice questions)
- Options with counts and percentages
- Progress bars showing distribution

#### ✅ Sentiment Analysis (for text questions, if AI enabled)
- Positive/Neutral/Negative counts

## Debugging

### Console Logs

Look for these debug messages in browser console:

```
[useQuestionAnalyticsDetailed] Fetching for form: 4bc239f6-...
[useQuestionAnalyticsDetailed] Received 5 questions
[useQuestionAnalyticsDetailed] Sample question data: { ... }
```

### Common Issues

#### Issue: "No Question Data Available"
**Cause**: No questions returned from API  
**Fix**: 
1. Check if seed script ran successfully
2. Verify form has questions: `SELECT * FROM questions WHERE form_id = '...'`
3. Check browser console for errors

#### Issue: No "Detailed" badge showing
**Cause**: Missing `averageTimeToAnswer` in data  
**Fix**:
1. Verify `question_interactions` table has data
2. Check API is calling `getQuestionAnalyticsDetailed` not `getQuestionAnalytics`
3. Look for `detailed=true` in API request URL

#### Issue: Metrics show zeros
**Cause**: No interaction data for those metrics  
**Fix**: This is normal if:
- No users had validation errors (validation error rate = 0)
- No users navigated backward (backward = 0)
- Form is linear with no skippable questions

#### Issue: "Unauthorized" error
**Cause**: Missing authentication headers  
**Fix**: Already fixed in latest code. API calls use `analyticsApi.getQuestionAnalyticsDetailed()` which includes headers.

### Backend Logs

If data isn't showing, check server logs:

```bash
# In your terminal running the dev server
# Look for:
# - API route hits: /api/forms/[id]/analytics/questions?detailed=true
# - Error messages from getQuestionAnalyticsDetailed
```

### SQL Debugging

Check if detailed analytics query returns data:

```sql
-- Simulate what the backend does
SELECT 
    q.id,
    q.title,
    q.type,
    COUNT(DISTINCT qi.id) FILTER (WHERE qi.interaction_type = 'viewed') as view_count,
    COUNT(DISTINCT qi.id) FILTER (WHERE qi.interaction_type = 'answered') as answer_count,
    AVG(qi.time_to_answer) FILTER (WHERE qi.interaction_type = 'answered') as avg_time
FROM questions q
LEFT JOIN question_interactions qi ON qi.question_id = q.id
WHERE q.form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
GROUP BY q.id, q.title, q.type
ORDER BY q.order_position;
```

## Expected Behavior

### With Detailed Data
- Each question card shows **all sections**
- Time metrics show realistic values (5-60 seconds)
- Navigation patterns show mostly "forward"
- Edit counts are low (0-1 average)
- Drop-off rate increases on later questions

### Without Detailed Data (Fallback)
- Shows basic accordion view
- Only option breakdown and sentiment (if available)
- No time/navigation/quality metrics
- This is normal for older responses before interaction tracking was added

## Testing Frontend Tracking (Optional)

To test that new form submissions create interaction data:

1. **Open public form** in incognito:
   ```
   /forms/4bc239f6-8883-405e-8d73-440fe47d60b2
   ```

2. **Fill out the form**, taking your time on each question

3. **Submit the form**

4. **Check database**:
   ```sql
   SELECT * FROM question_interactions
   WHERE session_id = (
       SELECT session_id FROM question_interactions
       ORDER BY timestamp DESC
       LIMIT 1
   );
   ```

5. **Refresh analytics page** - should see updated metrics

## Success Criteria

✅ Questions tab loads without errors  
✅ Each question shows a "Detailed" badge  
✅ Time metrics display realistic values  
✅ Progress bars render correctly  
✅ Navigation patterns show data  
✅ No console errors  
✅ Loading states work properly  
✅ Time range selector affects data  

## Next Steps

Once verified:
1. Test with other forms
2. Test time range filtering
3. Test with real user submissions
4. Monitor performance with large datasets

## Support

If issues persist:
1. Check all console logs
2. Verify SQL migrations ran
3. Confirm seed script completed
4. Check API authentication
5. Verify Supabase connection

