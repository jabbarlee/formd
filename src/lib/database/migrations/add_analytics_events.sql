-- Migration: Add Analytics Events Table
-- This table tracks all form interaction events for analytics

-- Create analytics_events table
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

-- Add comment for documentation
COMMENT ON TABLE analytics_events IS 'Tracks form interaction events for analytics and insights';
COMMENT ON COLUMN analytics_events.event_type IS 'Type of event: form_viewed, form_started, question_answered, form_submitted, form_abandoned';
COMMENT ON COLUMN analytics_events.session_id IS 'Session identifier string to track user journey across multiple events';

