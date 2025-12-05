-- ============================================
-- Analytics Test Data for Product Review Form
-- Form ID: 4bc239f6-8883-405e-8d73-440fe47d60b2
-- ============================================

-- First, let's check what questions exist for this form
-- Run this to see the questions:
-- SELECT id, title, type, order_position FROM questions WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' ORDER BY order_position;

-- ============================================
-- PART 1: Analytics Events (Form Interactions)
-- ============================================

-- Generate events over the last 30 days
-- This creates a realistic pattern of views, starts, and submissions

-- Week 1 (7 days ago) - 15 views, 12 starts, 8 completions
INSERT INTO analytics_events (form_id, event_type, session_id, timestamp) VALUES
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_viewed', 'session_week1_001', NOW() - INTERVAL '7 days'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_started', 'session_week1_001', NOW() - INTERVAL '7 days' + INTERVAL '30 seconds'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_submitted', 'session_week1_001', NOW() - INTERVAL '7 days' + INTERVAL '3 minutes'),

('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_viewed', 'session_week1_002', NOW() - INTERVAL '7 days' + INTERVAL '1 hour'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_started', 'session_week1_002', NOW() - INTERVAL '7 days' + INTERVAL '1 hour' + INTERVAL '15 seconds'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_submitted', 'session_week1_002', NOW() - INTERVAL '7 days' + INTERVAL '1 hour' + INTERVAL '5 minutes'),

('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_viewed', 'session_week1_003', NOW() - INTERVAL '7 days' + INTERVAL '2 hours'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_started', 'session_week1_003', NOW() - INTERVAL '7 days' + INTERVAL '2 hours' + INTERVAL '20 seconds'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_submitted', 'session_week1_003', NOW() - INTERVAL '7 days' + INTERVAL '2 hours' + INTERVAL '4 minutes'),

-- Views that didn't start
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_viewed', 'session_week1_004', NOW() - INTERVAL '7 days' + INTERVAL '3 hours'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_viewed', 'session_week1_005', NOW() - INTERVAL '7 days' + INTERVAL '4 hours'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_viewed', 'session_week1_006', NOW() - INTERVAL '7 days' + INTERVAL '5 hours'),

-- Started but abandoned
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_viewed', 'session_week1_007', NOW() - INTERVAL '7 days' + INTERVAL '6 hours'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_started', 'session_week1_007', NOW() - INTERVAL '7 days' + INTERVAL '6 hours' + INTERVAL '10 seconds'),
('4bc239f6-8883-405e-8d73-440fe47d60b2', 'form_abandoned', 'session_week1_007', NOW() - INTERVAL '7 days' + INTERVAL '6 hours' + INTERVAL '1 minute');

-- Week 2 (5 days ago) - 20 views, 16 starts, 12 completions
INSERT INTO analytics_events (form_id, event_type, session_id, timestamp)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'form_viewed',
    'session_week2_' || LPAD(i::text, 3, '0'),
    NOW() - INTERVAL '5 days' + (i || ' hours')::INTERVAL
FROM generate_series(1, 20) AS i;

-- Week 3 (3 days ago) - 25 views, 20 starts, 15 completions
INSERT INTO analytics_events (form_id, event_type, session_id, timestamp)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'form_viewed',
    'session_week3_' || LPAD(i::text, 3, '0'),
    NOW() - INTERVAL '3 days' + (i || ' hours')::INTERVAL
FROM generate_series(1, 25) AS i;

-- Recent (today) - 10 views, 8 starts, 5 completions
INSERT INTO analytics_events (form_id, event_type, session_id, timestamp)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'form_viewed',
    'session_today_' || LPAD(i::text, 3, '0'),
    NOW() - (i || ' hours')::INTERVAL
FROM generate_series(1, 10) AS i;

-- ============================================
-- PART 2: Responses with Various Statuses
-- ============================================

-- NOTE: Before running this section, you need to get the question IDs for your form
-- Run this query first:
-- SELECT id, title, type FROM questions WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' ORDER BY order_position;
-- Then replace the question_id placeholders below with actual IDs

-- Response 1: Completed - Desktop - USA
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    submitted_at,
    device_type,
    browser,
    os,
    location
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed',
    100,
    180, -- 3 minutes
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '3 minutes',
    'desktop',
    'Chrome',
    'Windows',
    '{"country": "United States", "countryCode": "US", "city": "New York"}'::jsonb
);

-- Response 2: Completed - Mobile - UK
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    submitted_at,
    device_type,
    browser,
    os,
    location
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed',
    100,
    240, -- 4 minutes
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days' + INTERVAL '4 minutes',
    'mobile',
    'Safari',
    'iOS',
    '{"country": "United Kingdom", "countryCode": "GB", "city": "London"}'::jsonb
);

-- Response 3: Completed - Desktop - Canada
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    submitted_at,
    device_type,
    browser,
    os,
    location
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed',
    100,
    195, -- 3.25 minutes
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days' + INTERVAL '3 minutes 15 seconds',
    'desktop',
    'Firefox',
    'macOS',
    '{"country": "Canada", "countryCode": "CA", "city": "Toronto"}'::jsonb
);

-- Response 4: Completed - Tablet - Australia
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    submitted_at,
    device_type,
    browser,
    os,
    location
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed',
    100,
    210, -- 3.5 minutes
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days' + INTERVAL '3 minutes 30 seconds',
    'tablet',
    'Safari',
    'iOS',
    '{"country": "Australia", "countryCode": "AU", "city": "Sydney"}'::jsonb
);

-- Response 5: Completed - Desktop - Germany
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    submitted_at,
    device_type,
    browser,
    os,
    location
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed',
    100,
    165, -- 2.75 minutes
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '2 minutes 45 seconds',
    'desktop',
    'Chrome',
    'Windows',
    '{"country": "Germany", "countryCode": "DE", "city": "Berlin"}'::jsonb
);

-- Response 6: Completed - Mobile - USA
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    submitted_at,
    device_type,
    browser,
    os,
    location
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed',
    100,
    270, -- 4.5 minutes
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '4 minutes 30 seconds',
    'mobile',
    'Chrome',
    'Android',
    '{"country": "United States", "countryCode": "US", "city": "San Francisco"}'::jsonb
);

-- Response 7: Completed - Desktop - UK
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    submitted_at,
    device_type,
    browser,
    os,
    location
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed',
    100,
    190, -- 3.16 minutes
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '3 minutes 10 seconds',
    'desktop',
    'Edge',
    'Windows',
    '{"country": "United Kingdom", "countryCode": "GB", "city": "Manchester"}'::jsonb
);

-- Response 8: Completed - Mobile - Canada
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    submitted_at,
    device_type,
    browser,
    os,
    location
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed',
    100,
    225, -- 3.75 minutes
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours' + INTERVAL '3 minutes 45 seconds',
    'mobile',
    'Safari',
    'iOS',
    '{"country": "Canada", "countryCode": "CA", "city": "Vancouver"}'::jsonb
);

-- Response 9: In Progress (Partial) - Desktop
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    device_type,
    browser,
    os
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'in_progress',
    45,
    120, -- 2 minutes
    NOW() - INTERVAL '2 hours',
    'desktop',
    'Chrome',
    'macOS'
);

-- Response 10: In Progress (Partial) - Mobile
INSERT INTO responses (
    form_id, 
    status, 
    completion_percentage,
    time_spent,
    started_at,
    device_type,
    browser,
    os
) VALUES (
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'in_progress',
    30,
    60, -- 1 minute
    NOW() - INTERVAL '1 hour',
    'mobile',
    'Chrome',
    'Android'
);

-- ============================================
-- PART 3: Sample Answers (for completed responses)
-- ============================================

-- NOTE: YOU MUST UPDATE THESE WITH YOUR ACTUAL QUESTION IDs
-- Get your question IDs by running:
-- SELECT id, title, type FROM questions WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' ORDER BY order_position;

-- Example structure (replace UUIDs with your actual question IDs):

-- For Response 1 (assuming you have questions about rating, feedback, etc.)
/*
-- Rating question (1-5)
INSERT INTO answers (response_id, question_id, answer_number)
SELECT r.id, 'YOUR_QUESTION_ID_HERE', 5
FROM responses r 
WHERE r.form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
AND r.submitted_at = NOW() - INTERVAL '7 days' + INTERVAL '3 minutes';

-- Text feedback
INSERT INTO answers (response_id, question_id, answer_text)
SELECT r.id, 'YOUR_QUESTION_ID_HERE', 'Great product! Really satisfied with the quality and performance.'
FROM responses r 
WHERE r.form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
AND r.submitted_at = NOW() - INTERVAL '7 days' + INTERVAL '3 minutes';

-- Multiple choice (would you recommend?)
INSERT INTO answers (response_id, question_id, answer_text)
SELECT r.id, 'YOUR_QUESTION_ID_HERE', 'Definitely'
FROM responses r 
WHERE r.form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
AND r.submitted_at = NOW() - INTERVAL '7 days' + INTERVAL '3 minutes';
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running the script, use these queries to verify:

-- 1. Check analytics events count
-- SELECT event_type, COUNT(*) 
-- FROM analytics_events 
-- WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
-- GROUP BY event_type;

-- 2. Check responses by status
-- SELECT status, COUNT(*), AVG(time_spent) as avg_time
-- FROM responses 
-- WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
-- GROUP BY status;

-- 3. Check device breakdown
-- SELECT device_type, COUNT(*) 
-- FROM responses 
-- WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
-- GROUP BY device_type;

-- 4. Check geographic distribution
-- SELECT location->>'country' as country, COUNT(*) 
-- FROM responses 
-- WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
-- AND location IS NOT NULL
-- GROUP BY location->>'country';

-- 5. Check trend data (daily)
-- SELECT DATE(timestamp) as date, 
--        COUNT(*) FILTER (WHERE event_type = 'form_viewed') as views,
--        COUNT(*) FILTER (WHERE event_type = 'form_started') as starts,
--        COUNT(*) FILTER (WHERE event_type = 'form_submitted') as completions
-- FROM analytics_events 
-- WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
-- GROUP BY DATE(timestamp)
-- ORDER BY date DESC;

