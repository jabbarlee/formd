-- Fix Analytics Events Table
-- This fixes the session_id column type from UUID to VARCHAR

-- Option 1: If you already created the table, run this to fix it
-- ================================================================

-- First, check if the table exists and what the column type is
-- Run this to see current setup:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'analytics_events';

-- If session_id is UUID, alter it to VARCHAR:
ALTER TABLE IF EXISTS analytics_events 
    ALTER COLUMN session_id TYPE VARCHAR(255);

-- Option 2: If you haven't created the table yet, or want to start fresh
-- ========================================================================

-- Drop the table if you want to recreate from scratch (ONLY if no important data)
-- DROP TABLE IF EXISTS analytics_events;

-- Then create the table with correct types:
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    response_id UUID REFERENCES responses(id) ON DELETE SET NULL,
    
    event_type VARCHAR(100) NOT NULL, 
    -- Possible values: 'form_viewed', 'form_started', 'question_answered', 'form_submitted', 'form_abandoned'
    
    event_data JSONB, -- Additional event-specific data
    
    session_id VARCHAR(255), -- Session identifier string (not UUID)
    ip_address INET,
    user_agent TEXT,
    
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_form_timestamp 
    ON analytics_events(form_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type 
    ON analytics_events(event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session 
    ON analytics_events(session_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_analytics_events_response 
    ON analytics_events(response_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp 
    ON analytics_events(timestamp DESC);

-- Add comments for documentation
COMMENT ON TABLE analytics_events IS 'Tracks form interaction events for analytics and insights';
COMMENT ON COLUMN analytics_events.event_type IS 'Type of event: form_viewed, form_started, question_answered, form_submitted, form_abandoned';
COMMENT ON COLUMN analytics_events.session_id IS 'Session identifier string to track user journey across multiple events';

