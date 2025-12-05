# Analytics Test Data Seeding Guide

## Quick Start

The easiest way to populate your form with test data:

### Option 1: Complete Automated Script (RECOMMENDED)

Use `seed-analytics-data-with-answers.sql` - it automatically:
- Creates 50 analytics events (views)
- Adds 40 form starts
- Generates 15 completed responses
- Adds 3 in-progress responses  
- **Automatically creates answers for ALL questions** in your form
- Distributes data over the past 7 days
- Includes diverse devices, locations, and browsers

**To Run:**

1. Open Supabase SQL Editor
2. Copy the contents of `seed-analytics-data-with-answers.sql`
3. Paste and click **Run**
4. Done! Check verification output at the bottom

### Option 2: Manual Setup (More Control)

Use `seed-analytics-data.sql` if you want to:
- Manually specify answers for each question
- Have more control over specific responses
- Customize the exact data

## What Data Gets Created

### Analytics Events (50 total)
- **Form Views**: 50 events
- **Form Starts**: ~40 events (80% conversion)
- **Submissions**: 15 events (those who completed)
- **Abandons**: Some partial completions

### Responses (18 total)

#### Completed (15 responses)
- **Devices**: 
  - Desktop: ~60%
  - Mobile: ~30%
  - Tablet: ~10%

- **Countries**: 
  - United States: ~30%
  - United Kingdom: ~20%
  - Canada: ~15%
  - Australia: ~10%
  - Germany: ~10%
  - France: ~8%
  - Japan: ~7%

- **Time Spent**: 2-5 minutes (varied)
- **Dates**: Distributed over past 7 days

#### In Progress (3 responses)
- 25-75% completion
- Recent timestamps (last 2 hours)
- Various devices

### Answers (Automatic)
The script automatically creates answers for:
- ✅ Rating/Number questions → 3-5 star ratings
- ✅ Text questions → Positive feedback samples
- ✅ Multiple choice → Random valid options
- ✅ Checkboxes → 1-3 selected options
- ✅ Yes/No → Random boolean values
- ✅ All other question types → Appropriate defaults

## Expected Analytics Results

After running the script, your analytics page will show:

**Overview Metrics:**
- Total Views: ~50
- Total Responses: 15
- Completion Rate: ~38% (15/40 starts)
- Average Time: ~3-4 minutes

**Completion Funnel:**
- Viewed: 50 (100%)
- Started: 40 (80%)
- 50% Complete: ~18 (45%)
- Completed: 15 (30%)

**Device Breakdown:**
- Desktop: ~60%
- Mobile: ~30%
- Tablet: ~10%

**Top Countries:**
1. United States (~5 responses)
2. United Kingdom (~3 responses)
3. Canada (~2 responses)
4. Others distributed

**Trends:**
- Daily views/starts/completions spread over 7 days
- Should show in the chart

## Troubleshooting

### "No data showing in analytics"

1. **Check form ID is correct**:
   ```sql
   SELECT id, title FROM forms WHERE id = '4bc239f6-8883-405e-8d73-440fe47d60b2';
   ```

2. **Verify data was inserted**:
   ```sql
   SELECT COUNT(*) FROM responses 
   WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2';
   ```

3. **Check analytics events**:
   ```sql
   SELECT event_type, COUNT(*) 
   FROM analytics_events 
   WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
   GROUP BY event_type;
   ```

### "Answers not showing in question analytics"

Make sure you have questions defined:
```sql
SELECT id, title, type 
FROM questions 
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
ORDER BY order_position;
```

If you have questions, check answers were created:
```sql
SELECT COUNT(*) 
FROM answers a
JOIN responses r ON a.response_id = r.id
WHERE r.form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2';
```

## Cleaning Up Test Data

To remove all test data and start fresh:

```sql
-- Remove all test data for this form
DELETE FROM analytics_events 
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2';

DELETE FROM answers 
WHERE response_id IN (
    SELECT id FROM responses 
    WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
);

DELETE FROM responses 
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2';
```

Then run the seeding script again!

## Customizing the Data

### Change the date range
In `seed-analytics-data-with-answers.sql`, modify:
```sql
NOW() - (i || ' days')::INTERVAL
```
Change the number of days to spread data over different periods.

### Add more responses
Change this line:
```sql
FOR i IN 1..15 LOOP  -- Change 15 to desired number
```

### Adjust device distribution
Modify the arrays:
```sql
devices TEXT[] := ARRAY['desktop', 'mobile', 'tablet'];
-- Add more of one type: ARRAY['desktop', 'desktop', 'mobile', 'tablet']
```

## Next Steps

After seeding:
1. Navigate to `/forms/4bc239f6-8883-405e-8d73-440fe47d60b2/analytics`
2. Try different time ranges (7d, 30d, etc.)
3. Check each tab (Overview, Devices, Geography, Questions)
4. Test the export functionality
5. Verify all charts and metrics display correctly

Enjoy testing your analytics! 🎉

