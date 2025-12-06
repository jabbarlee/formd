-- ============================================
-- FINAL ANALYTICS SEED SCRIPT (CORRECTED)
-- Form ID: 4bc239f6-8883-405e-8d73-440fe47d60b2
-- ============================================
-- This script:
-- 1. Deletes ALL existing test data for the form
-- 2. Creates new responses with proper enum types
-- 3. Generates answers matching all question types
-- 4. Creates question interactions for detailed analytics
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🧹 Cleaning up existing data...';
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- STEP 1: COMPLETE CLEANUP
-- ============================================

DELETE FROM question_interactions 
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2';

DELETE FROM analytics_events 
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2';

DELETE FROM answers 
WHERE response_id IN (
    SELECT id FROM responses 
    WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
);

DELETE FROM responses 
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2';

DO $$
BEGIN
    RAISE NOTICE '✅ Cleanup completed!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Creating analytics data...';
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- STEP 2: ANALYTICS EVENTS
-- ============================================

-- 50 form views over past 7 days
INSERT INTO analytics_events (form_id, event_type, session_id, timestamp)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'form_viewed',
    'session_' || i,
    NOW() - (random() * INTERVAL '7 days')
FROM generate_series(1, 50) AS i;

-- Form starts (80% conversion)
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
-- STEP 3: RESPONSES
-- ============================================

-- 15 completed responses
INSERT INTO responses (
    form_id, status, completion_percentage, time_spent,
    started_at, submitted_at, device_type, browser, os, location
)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'completed'::response_status,
    100,
    120 + (random() * 180)::INTEGER,
    NOW() - (i || ' days')::INTERVAL - (random() * INTERVAL '12 hours'),
    NOW() - (i || ' days')::INTERVAL - (random() * INTERVAL '12 hours') + ((120 + random() * 180) || ' seconds')::INTERVAL,
    (CASE (random() * 3)::INTEGER WHEN 0 THEN 'desktop' WHEN 1 THEN 'mobile' ELSE 'tablet' END)::device_type,
    CASE (random() * 4)::INTEGER WHEN 0 THEN 'Chrome' WHEN 1 THEN 'Safari' WHEN 2 THEN 'Firefox' ELSE 'Edge' END,
    CASE (random() * 5)::INTEGER WHEN 0 THEN 'Windows' WHEN 1 THEN 'macOS' WHEN 2 THEN 'iOS' WHEN 3 THEN 'Android' ELSE 'Linux' END,
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

-- 3 in-progress responses
INSERT INTO responses (
    form_id, status, completion_percentage, time_spent,
    started_at, device_type, browser, os
)
SELECT 
    '4bc239f6-8883-405e-8d73-440fe47d60b2',
    'in_progress'::response_status,
    25 + (random() * 50)::INTEGER,
    30 + (random() * 90)::INTEGER,
    NOW() - (random() * INTERVAL '2 hours'),
    (CASE (random() * 3)::INTEGER WHEN 0 THEN 'desktop' WHEN 1 THEN 'mobile' ELSE 'tablet' END)::device_type,
    CASE (random() * 4)::INTEGER WHEN 0 THEN 'Chrome' WHEN 1 THEN 'Safari' WHEN 2 THEN 'Firefox' ELSE 'Edge' END,
    CASE (random() * 5)::INTEGER WHEN 0 THEN 'Windows' WHEN 1 THEN 'macOS' WHEN 2 THEN 'iOS' WHEN 3 THEN 'Android' ELSE 'Linux' END
FROM generate_series(1, 3) AS i;

-- ============================================
-- STEP 4: ANSWERS (Smart Type Matching)
-- ============================================

DO $$
DECLARE
    question_rec RECORD;
    response_rec RECORD;
    response_num INTEGER := 0;
    sample_numbers INTEGER[] := ARRAY[5, 5, 4, 5, 4, 5, 3, 4, 5, 4, 5, 5, 4, 3, 5];
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
BEGIN
    FOR response_rec IN 
        SELECT id FROM responses 
        WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
        AND status = 'completed'
        ORDER BY submitted_at
    LOOP
        response_num := response_num + 1;
        
        FOR question_rec IN 
            SELECT id, type, options 
            FROM questions 
            WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
            ORDER BY order_position
        LOOP
            -- Number-based questions
            IF question_rec.type IN ('number', 'star_rating', 'linear_scale', 'nps', 'emoji_rating') THEN
                INSERT INTO answers (response_id, question_id, answer_number)
                VALUES (response_rec.id, question_rec.id, sample_numbers[response_num]);
            
            -- Text questions
            ELSIF question_rec.type IN ('short_text', 'long_text', 'email', 'phone') THEN
                INSERT INTO answers (response_id, question_id, answer_text)
                VALUES (response_rec.id, question_rec.id, sample_texts[response_num]);
            
            -- Single choice
            ELSIF question_rec.type IN ('multiple_choice', 'dropdown') THEN
                IF question_rec.options IS NOT NULL AND jsonb_array_length(question_rec.options) > 0 THEN
                    INSERT INTO answers (response_id, question_id, answer_text)
                    SELECT response_rec.id, question_rec.id, 
                           question_rec.options->((random() * (jsonb_array_length(question_rec.options) - 1))::INTEGER)->>'label';
                ELSE
                    INSERT INTO answers (response_id, question_id, answer_text)
                    VALUES (response_rec.id, question_rec.id, sample_texts[response_num]);
                END IF;
            
            -- Multiple choice (checkboxes)
            ELSIF question_rec.type = 'checkboxes' THEN
                IF question_rec.options IS NOT NULL AND jsonb_array_length(question_rec.options) > 0 THEN
                    DECLARE
                        selected_opts jsonb := '[]'::jsonb;
                        num_select INTEGER := 1 + (random() * 2)::INTEGER;
                    BEGIN
                        FOR i IN 1..LEAST(num_select, jsonb_array_length(question_rec.options)) LOOP
                            selected_opts := selected_opts || jsonb_build_array(
                                question_rec.options->((random() * (jsonb_array_length(question_rec.options) - 1))::INTEGER)->>'label'
                            );
                        END LOOP;
                        INSERT INTO answers (response_id, question_id, answer_json)
                        VALUES (response_rec.id, question_rec.id, selected_opts);
                    END;
                END IF;
            
            -- Date/Time questions
            ELSIF question_rec.type = 'date' THEN
                INSERT INTO answers (response_id, question_id, answer_date)
                VALUES (response_rec.id, question_rec.id, CURRENT_DATE);
            
            ELSIF question_rec.type = 'time' THEN
                INSERT INTO answers (response_id, question_id, answer_time)
                VALUES (response_rec.id, question_rec.id, CURRENT_TIME);
            
            ELSIF question_rec.type = 'datetime' THEN
                INSERT INTO answers (response_id, question_id, answer_datetime)
                VALUES (response_rec.id, question_rec.id, NOW());
            
            -- Skip layout elements
            ELSIF question_rec.type IN ('section_heading', 'text_content', 'divider') THEN
                NULL;
            
            -- Default: text answer
            ELSE
                INSERT INTO answers (response_id, question_id, answer_text)
                VALUES (response_rec.id, question_rec.id, sample_texts[response_num]);
            END IF;
        END LOOP;
    END LOOP;
END $$;

    RAISE NOTICE '✅ Answers created for % responses!', response_num;
END $$;

DO $$
BEGIN
    RAISE NOTICE '📍 Creating question interactions...';
END $$;

-- ============================================
-- STEP 5: QUESTION INTERACTIONS
-- ============================================

DO $$
DECLARE
    response_rec RECORD;
    question_rec RECORD;
    session_num INTEGER := 0;
    session_id_var VARCHAR(255);
    prev_q_id UUID;
    q_position INTEGER;
    base_time TIMESTAMPTZ;
    cumul_time INTEGER;
    time_on_q INTEGER;
    edit_cnt INTEGER;
    has_error BOOLEAN;
BEGIN
    -- For completed responses
    FOR response_rec IN 
        SELECT id, started_at FROM responses 
        WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2' 
        AND status = 'completed'
        ORDER BY started_at
    LOOP
        session_num := session_num + 1;
        session_id_var := 'session_' || session_num;
        prev_q_id := NULL;
        q_position := 0;
        base_time := response_rec.started_at;
        cumul_time := 0;
        
        FOR question_rec IN 
            SELECT id, type, required
            FROM questions 
            WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
            AND type NOT IN ('section_heading', 'text_content', 'divider')
            ORDER BY order_position
        LOOP
            q_position := q_position + 1;
            time_on_q := 5 + (random() * 55)::INTEGER;
            cumul_time := cumul_time + time_on_q;
            edit_cnt := CASE WHEN random() < 0.8 THEN 0 WHEN random() < 0.95 THEN 1 ELSE 2 END;
            has_error := random() < 0.1;
            
            -- View
            INSERT INTO question_interactions (
                form_id, question_id, response_id, session_id,
                interaction_type, question_order, time_on_question, timestamp,
                came_from_question_id, navigation_direction
            ) VALUES (
                '4bc239f6-8883-405e-8d73-440fe47d60b2', question_rec.id, response_rec.id, session_id_var,
                'viewed', q_position, time_on_q, base_time + (cumul_time || ' seconds')::INTERVAL,
                prev_q_id, CASE WHEN prev_q_id IS NULL THEN NULL ELSE 'forward' END
            );
            
            -- Validation error (10% chance)
            IF has_error THEN
                INSERT INTO question_interactions (
                    form_id, question_id, response_id, session_id,
                    interaction_type, question_order, validation_errors, timestamp
                ) VALUES (
                    '4bc239f6-8883-405e-8d73-440fe47d60b2', question_rec.id, response_rec.id, session_id_var,
                    'validation_error', q_position, 1, base_time + ((cumul_time + 2) || ' seconds')::INTERVAL
                );
                cumul_time := cumul_time + 3;
            END IF;
            
            -- Answer
            INSERT INTO question_interactions (
                form_id, question_id, response_id, session_id,
                interaction_type, question_order, time_to_answer, time_on_question,
                edit_count, validation_errors, is_skipped, timestamp
            ) VALUES (
                '4bc239f6-8883-405e-8d73-440fe47d60b2', question_rec.id, response_rec.id, session_id_var,
                'answered', q_position, time_on_q, time_on_q,
                edit_cnt, CASE WHEN has_error THEN 1 ELSE 0 END, false,
                base_time + (cumul_time || ' seconds')::INTERVAL
            );
            
            prev_q_id := question_rec.id;
        END LOOP;
        
        -- Backward navigation (15% of responses)
        IF random() < 0.15 THEN
            FOR question_rec IN 
                SELECT id FROM questions 
                WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
                AND type NOT IN ('section_heading', 'text_content', 'divider')
                ORDER BY random() LIMIT 1
            LOOP
                cumul_time := cumul_time + 10;
                INSERT INTO question_interactions (
                    form_id, question_id, response_id, session_id,
                    interaction_type, question_order, time_on_question, edit_count,
                    timestamp, navigation_direction
                ) VALUES (
                    '4bc239f6-8883-405e-8d73-440fe47d60b2', question_rec.id, response_rec.id, session_id_var,
                    'answered', q_position + 1, 10, 1,
                    base_time + (cumul_time || ' seconds')::INTERVAL, 'backward'
                );
            END LOOP;
        END IF;
    END LOOP;
    
    -- Abandoned sessions (10)
    FOR session_num IN 51..60 LOOP
        session_id_var := 'session_' || session_num;
        base_time := NOW() - (random() * INTERVAL '7 days');
        cumul_time := 0;
        prev_q_id := NULL;
        q_position := 0;
        
        FOR question_rec IN 
            SELECT id FROM questions 
            WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
            AND type NOT IN ('section_heading', 'text_content', 'divider')
            ORDER BY order_position
            LIMIT 1 + (random() * 2)::INTEGER
        LOOP
            q_position := q_position + 1;
            time_on_q := 5 + (random() * 30)::INTEGER;
            cumul_time := cumul_time + time_on_q;
            
            INSERT INTO question_interactions (
                form_id, question_id, session_id, interaction_type, question_order,
                time_on_question, timestamp, came_from_question_id, navigation_direction
            ) VALUES (
                '4bc239f6-8883-405e-8d73-440fe47d60b2', question_rec.id, session_id_var,
                'viewed', q_position, time_on_q, base_time + (cumul_time || ' seconds')::INTERVAL,
                prev_q_id, CASE WHEN prev_q_id IS NULL THEN NULL ELSE 'forward' END
            );
            
            prev_q_id := question_rec.id;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '✅ Question interactions created!';
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '   ✅ DATA SEEDED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
END $$;

-- Summary counts
SELECT 'Analytics Events' as category, event_type as type, COUNT(*) as count
FROM analytics_events 
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
GROUP BY event_type

UNION ALL

SELECT 'Responses' as category, status::text as type, COUNT(*) as count
FROM responses
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
GROUP BY status

UNION ALL

SELECT 'Answers' as category, 'total' as type, COUNT(*) as count
FROM answers a
JOIN responses r ON a.response_id = r.id
WHERE r.form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'

UNION ALL

SELECT 'Question Interactions' as category, interaction_type as type, COUNT(*) as count
FROM question_interactions
WHERE form_id = '4bc239f6-8883-405e-8d73-440fe47d60b2'
GROUP BY interaction_type

ORDER BY category, type;

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '   📊 Ready for testing!';
    RAISE NOTICE '   Navigate to /forms/4bc239f6.../analytics';
    RAISE NOTICE '========================================';
END $$;

