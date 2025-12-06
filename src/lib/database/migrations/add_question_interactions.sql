-- ============================================
-- Question Interactions Table Migration
-- Tracks detailed user interactions with individual questions for analytics
-- ============================================

-- Question Interactions Table
CREATE TABLE IF NOT EXISTS question_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL, -- Track pre-submission interactions
    
    -- Interaction tracking
    interaction_type VARCHAR(50) NOT NULL, -- 'viewed', 'focused', 'answered', 'skipped', 'edited', 'validation_error'
    question_order INTEGER, -- Position of question when answered (for sequence analysis)
    
    -- Time metrics
    time_to_answer INTEGER, -- Seconds from question view to answer
    time_on_question INTEGER, -- Total time spent (including edits)
    
    -- Answer quality metrics
    edit_count INTEGER DEFAULT 0, -- How many times answer was changed
    validation_errors INTEGER DEFAULT 0, -- Failed validations before success
    is_skipped BOOLEAN DEFAULT false,
    skip_reason VARCHAR(100), -- 'optional', 'abandoned', 'conditional_logic'
    
    -- Answer snapshot (for detecting changes)
    answer_value JSONB, -- Store answer at this interaction
    
    -- Navigation tracking
    came_from_question_id UUID, -- Previous question (for flow analysis)
    navigation_direction VARCHAR(20), -- 'forward', 'backward', 'jump'
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_interactions_form ON question_interactions(form_id);
CREATE INDEX IF NOT EXISTS idx_question_interactions_question ON question_interactions(question_id);
CREATE INDEX IF NOT EXISTS idx_question_interactions_response ON question_interactions(response_id);
CREATE INDEX IF NOT EXISTS idx_question_interactions_session ON question_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_question_interactions_type ON question_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_question_interactions_timestamp ON question_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_question_interactions_form_question ON question_interactions(form_id, question_id);

-- Comments
COMMENT ON TABLE question_interactions IS 'Tracks detailed user interactions with form questions for analytics';
COMMENT ON COLUMN question_interactions.interaction_type IS 'Type of interaction: viewed, focused, answered, skipped, edited, validation_error';
COMMENT ON COLUMN question_interactions.time_to_answer IS 'Seconds from question first view to answer submission';
COMMENT ON COLUMN question_interactions.time_on_question IS 'Total time spent on question including all interactions';
COMMENT ON COLUMN question_interactions.edit_count IS 'Number of times the answer was modified';
COMMENT ON COLUMN question_interactions.validation_errors IS 'Number of validation errors encountered';
COMMENT ON COLUMN question_interactions.navigation_direction IS 'Direction of navigation: forward, backward, or jump';

-- Success message
SELECT 'Question interactions table created successfully!' as status;

