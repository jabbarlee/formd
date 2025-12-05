# Analytics Setup Guide

## ✅ Good News: No Database Changes Needed!

The analytics system will work automatically with your existing database. The `analytics_events` table already exists in your schema and has proper indexes.

## 🎯 What Just Happened

I fixed the error you were seeing. The issue was that the analytics page was using a demo form ID (`"demo-form-1"`) instead of a real UUID.

### Two Analytics Pages Now Available:

1. **Workspace Analytics** - `/analytics`
   - Shows aggregated data across ALL your forms
   - Top performing forms
   - Overall metrics
   - Use this for a bird's-eye view

2. **Form-Specific Analytics** - `/forms/[id]/analytics`
   - Shows detailed analytics for a specific form
   - All the charts and breakdowns
   - Export functionality
   - Use this to drill down into individual form performance

## 📊 How Analytics Will Work

### Automatic Event Tracking

Once users interact with your forms, events are automatically tracked:

1. **`form_viewed`** - When someone opens the form
2. **`form_started`** - When they answer the first question
3. **`form_submitted`** - When they successfully submit
4. **`form_abandoned`** - When they leave without completing

These events are tracked in the `analytics_events` table.

### Response Data

Additionally, the system tracks in the `responses` table:
- Device type (desktop, mobile, tablet)
- Time spent on form
- Geographic location (if available)
- Completion percentage
- Browser and OS info

## 🚀 How to Test

### Step 1: Create or Use an Existing Form
```bash
# Navigate to your forms page
http://localhost:3000/forms
```

### Step 2: Get the Form ID
From your forms list, click on a form and note the ID from the URL:
```
http://localhost:3000/forms/[THIS-IS-THE-FORM-ID]/edit
```

### Step 3: View Form-Specific Analytics
```bash
# Go to the form's analytics page
http://localhost:3000/forms/[FORM-ID]/analytics
```

### Step 4: View Workspace Analytics
```bash
# Go to workspace analytics
http://localhost:3000/analytics
```

### Step 5: Generate Test Data (Optional)

To see analytics in action, you can:

**Option A: Fill out your form as a user**
```bash
# Share your form (publish it first)
# Then visit the public URL: http://localhost:3000/f/[FORM-ID]
# Fill it out a few times
```

**Option B: Use existing response data**
If you already have responses in your database from forms, the analytics will automatically display that data.

**Option C: Manually insert test events** (for testing)
```sql
-- Insert test analytics events
INSERT INTO analytics_events (form_id, event_type, session_id, timestamp)
VALUES 
  ('YOUR-FORM-ID', 'form_viewed', 'test-session-1', NOW() - INTERVAL '5 days'),
  ('YOUR-FORM-ID', 'form_started', 'test-session-1', NOW() - INTERVAL '5 days'),
  ('YOUR-FORM-ID', 'form_submitted', 'test-session-1', NOW() - INTERVAL '5 days');
```

## 📁 What Was Fixed

### Before (Error):
```typescript
const DEMO_FORM_ID = "demo-form-1"; // Not a valid UUID!
```

### After (Fixed):
```typescript
const params = useParams();
const formId = params.id as string; // Gets real form ID from URL
```

## 🎨 Features Available

### In Form Analytics (`/forms/[id]/analytics`):
- ✅ Overview metrics (views, responses, completion rate, avg time)
- ✅ Period-over-period comparisons
- ✅ Response trend chart
- ✅ Completion funnel
- ✅ Device breakdown
- ✅ Geographic distribution
- ✅ Question-by-question analytics
- ✅ Time range filtering (7d, 30d, 90d, month, custom)
- ✅ Export to CSV/JSON

### In Workspace Analytics (`/analytics`):
- ✅ Aggregated metrics across all forms
- ✅ Total/active forms count
- ✅ Response trends for all forms
- ✅ Top performing forms list
- ✅ Click-through to individual form analytics

## 🔧 Troubleshooting

### "Form not found" error
- Make sure you're using a valid form ID from your database
- Check that the form exists: `SELECT id, title FROM forms;`

### No analytics data showing
- Analytics will be empty until forms receive views/responses
- Make sure your form is published
- Try visiting the public form URL to generate test events

### Event tracking not working
- Check browser console for errors
- Verify the form ID is correct
- Make sure the API endpoint is accessible

## 📝 Next Steps

1. **Publish a form** if you haven't already
2. **Share the form** and get some responses
3. **Navigate to analytics** using either:
   - `/forms/[your-form-id]/analytics` for specific form
   - `/analytics` for workspace overview
4. **Adjust time ranges** to see different periods
5. **Export data** using the dropdown in the header

## 💡 Tips

- Analytics update in real-time as responses come in
- Use workspace analytics for quick overview
- Drill down into specific forms for detailed insights
- Export data for external analysis or reporting
- Time ranges help you understand trends over different periods

---

That's it! Your analytics system is ready to use. No database migrations or additional setup required. 🎉

