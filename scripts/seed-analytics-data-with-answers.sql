-- ============================================
-- Complete Analytics Test Data Script
-- Form ID: 4bc239f6-8883-405e-8d73-440fe47d60b2
-- ============================================

-- ============================================
-- ANALYTICS EVENTS (Views, Starts, Submissions)
-- ============================================

-- Generate 50 form view events over the past 7 days
INSERT INTO analytics_events (form_id, event_type, session_id, timestamp)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'form_viewed',
    'session_' || i,
    NOW() - (random() * INTERVAL '7 days')
FROM generate_series(1, 50) AS i;

-- Add form_started events (80% of views)
INSERT INTO analytics_events (form_id, event_type, session_id, timestamp)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'form_started',
    ae.session_id,
    ae.timestamp + INTERVAL '15 seconds'
FROM analytics_events ae
WHERE ae.form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
AND ae.event_type = 'form_viewed'
AND random() < 0.8;

-- ============================================
-- RESPONSES WITH DIVERSITY
-- ============================================

-- Create 15 completed responses with varied data
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
)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed',
    100,
    120 + (random() * 180)::INTEGER,
    NOW() - (i || ' days')::INTERVAL - (random() * INTERVAL '12 hours'),
    NOW() - (i || ' days')::INTERVAL - (random() * INTERVAL '12 hours') + ((120 + random() * 180) || ' seconds')::INTERVAL,
    CASE (random() * 3)::INTEGER
        WHEN 0 THEN 'desktop'
        WHEN 1 THEN 'mobile'
        ELSE 'tablet'
    END,
    CASE (random() * 4)::INTEGER
        WHEN 0 THEN 'Chrome'
        WHEN 1 THEN 'Safari'
        WHEN 2 THEN 'Firefox'
        ELSE 'Edge'
    END,
    CASE (random() * 5)::INTEGER
        WHEN 0 THEN 'Windows'
        WHEN 1 THEN 'macOS'
        WHEN 2 THEN 'iOS'
        WHEN 3 THEN 'Android'
        ELSE 'Linux'
    END,
    CASE (random() * 7)::INTEGER
        WHEN 0 THEN '{"country": "United States", "countryCode": "US", "city": "New York"}'::jsonb
        WHEN 1 THEN '{"country": "United Kingdom", "countryCode": "GB", "city": "London"}'::jsonb
        WHEN 2 THEN '{"country": "Canada", "countryCode": "CA", "city": "Toronto"}'::jsonb
        WHEN 3 THEN '{"country": "Australia", "countryCode": "AU", "city": "Sydney"}'::jsonb
        WHEN 4 THEN '{"country": "Germany", "countryCode": "DE", "city": "Berlin"}'::jsonb
        WHEN 5 THEN '{"country": "France", "countryCode": "FR", "city": "Paris"}'::jsonb
        ELSE '{"country": "Japan", "countryCode": "JP", "city": "Tokyo"}'::jsonb
    END
FROM generate_series(1, 15) AS i;

-- Create 3 in-progress responses
INSERT INTO responses (
    form_id,
    status,
    completion_percentage,
    time_spent,
    started_at,
    device_type,
    browser,
    os
)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'in_progress',
    25 + (random() * 50)::INTEGER,
    30 + (random() * 90)::INTEGER,
    NOW() - (random() * INTERVAL '2 hours'),
    CASE (random() * 3)::INTEGER
        WHEN 0 THEN 'desktop'
        WHEN 1 THEN 'mobile'
        ELSE 'tablet'
    END,
    CASE (random() * 4)::INTEGER
        WHEN 0 THEN 'Chrome'
        WHEN 1 THEN 'Safari'
        WHEN 2 THEN 'Firefox'
        ELSE 'Edge'
    END,
    CASE (random() * 5)::INTEGER
        WHEN 0 THEN 'Windows'
        WHEN 1 THEN 'macOS'
        WHEN 2 THEN 'iOS'
        WHEN 3 THEN 'Android'
        ELSE 'Linux'
    END
FROM generate_series(1, 3) AS i;

-- ============================================
-- ANSWERS (Automatically matched to questions)
-- ============================================

DO $$
DECLARE
    question_record RECORD;
    response_record RECORD;
    response_counter INTEGER := 0;
    sample_ratings INTEGER[] := ARRAY[5, 5, 4, 5, 4, 5, 3, 4, 5, 4, 5, 5, 4, 3, 5];
    sample_texts TEXT[] := ARRAY[
        'Excellent product! Very satisfied.',
        'Good quality, fast delivery.',
        'Meets expectations perfectly.',
        'Would definitely recommend.',
        'Great experience overall.',
        'Pretty good, minor issues.',
        'Solid product, no complaints.',
        'Exactly what I needed.',
        'Very happy with this purchase.',
        'Outstanding quality and service.',
        'Really impressed with the features.',
        'Works great, highly recommend.',
        'Good value for money.',
        'Nice product, does the job.',
        'Fantastic, exceeded expectations.'
    ];
    sample_recommend TEXT[] := ARRAY['Definitely', 'Definitely', 'Probably', 'Definitely', 'Probably', 'Definitely', 'Maybe', 'Probably', 'Definitely', 'Definitely', 'Definitely', 'Definitely', 'Probably', 'Maybe', 'Definitely'];
BEGIN
    -- Loop through all completed responses
    FOR response_record IN 
        SELECT id FROM responses 
        WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
        AND status = 'completed'
        ORDER BY submitted_at
    LOOP
        response_counter := response_counter + 1;
        
        -- Loop through all questions for this form
        FOR question_record IN 
            SELECT id, type, options 
            FROM questions 
            WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
            ORDER BY order_position
        LOOP
            -- Create appropriate answer based on question type
            IF question_record.type IN ('number', 'rating') THEN
                INSERT INTO answers (response_id, question_id, answer_number)
                VALUES (response_record.id, question_record.id, sample_ratings[response_counter]);
                
            ELSIF question_record.type IN ('short_text', 'long_text', 'text', 'textarea', 'email', 'phone') THEN
                INSERT INTO answers (response_id, question_id, answer_text)
                VALUES (response_record.id, question_record.id, sample_texts[response_counter]);
                
            ELSIF question_record.type IN ('radio', 'multiple_choice', 'dropdown') THEN
                IF question_record.options IS NOT NULL AND jsonb_array_length(question_record.options) > 0 THEN
                    INSERT INTO answers (response_id, question_id, answer_text)
                    SELECT response_record.id, question_record.id, 
                           question_record.options->((random() * (jsonb_array_length(question_record.options) - 1))::INTEGER)->>'label';
                ELSE
                    INSERT INTO answers (response_id, question_id, answer_text)
                    VALUES (response_record.id, question_record.id, sample_recommend[response_counter]);
                END IF;
                
            ELSIF question_record.type = 'checkboxes' THEN
                IF question_record.options IS NOT NULL AND jsonb_array_length(question_record.options) > 0 THEN
                    DECLARE
                        selected_options jsonb;
                        num_selections INTEGER;
                        idx INTEGER;
                    BEGIN
                        num_selections := 1 + (random() * 2)::INTEGER;
                        selected_options := '[]'::jsonb;
                        
                        FOR i IN 1..LEAST(num_selections, jsonb_array_length(question_record.options)) LOOP
                            idx := (random() * (jsonb_array_length(question_record.options) - 1))::INTEGER;
                            selected_options := selected_options || jsonb_build_array(question_record.options->idx->>'label');
                        END LOOP;
                        
                        INSERT INTO answers (response_id, question_id, answer_json)
                        VALUES (response_record.id, question_record.id, selected_options);
                    END;
                END IF;
                
            ELSIF question_record.type IN ('yes_no', 'boolean') THEN
                INSERT INTO answers (response_id, question_id, answer_boolean)
                VALUES (response_record.id, question_record.id, random() > 0.3);
                
            ELSE
                INSERT INTO answers (response_id, question_id, answer_text)
                VALUES (response_record.id, question_record.id, sample_texts[response_counter]);
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check analytics events
SELECT 
    'Analytics Events' as data_type,
    event_type,
    COUNT(*) as count
FROM analytics_events 
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
GROUP BY event_type

UNION ALL

-- Check responses
SELECT 
    'Responses' as data_type,
    status::text,
    COUNT(*) as count
FROM responses
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
GROUP BY status

UNION ALL

-- Check answers
SELECT 
    'Answers' as data_type,
    'total' as status,
    COUNT(*) as count
FROM answers a
JOIN responses r ON a.response_id = r.id
WHERE r.form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2';

-- Device breakdown
SELECT '--- Device Breakdown ---' as info;
SELECT device_type, COUNT(*) as count
FROM responses
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
GROUP BY device_type
ORDER BY count DESC;

-- Geographic distribution
SELECT '--- Geographic Distribution ---' as info;
SELECT 
    location->>'country' as country,
    COUNT(*) as count
FROM responses
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
AND location IS NOT NULL
GROUP BY location->>'country'
ORDER BY count DESC;

-- Success message
SELECT '✅ Test data creation completed successfully!' as status;
