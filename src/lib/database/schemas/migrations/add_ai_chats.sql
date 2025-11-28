-- ============================================
-- AI Chats Table Migration
-- Stores AI chat conversations with JSONB messages
-- ============================================

-- Create ai_chats table
CREATE TABLE ai_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Chat metadata
    title VARCHAR(500) NOT NULL,
    
    -- Messages stored as JSONB array
    -- Format: [{"id": "msg1", "role": "user"|"assistant", "content": "...", "timestamp": "2024-..."}]
    messages JSONB NOT NULL DEFAULT '[]',
    
    -- Generated form reference (nullable - form may not exist yet)
    form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
    
    -- Current form draft (before saving to DB)
    -- Stores the AI-generated form structure
    form_draft JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_ai_chats_user ON ai_chats(created_by);
CREATE INDEX idx_ai_chats_form ON ai_chats(form_id);
CREATE INDEX idx_ai_chats_created ON ai_chats(created_at DESC);
CREATE INDEX idx_ai_chats_messages ON ai_chats USING gin(messages);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_ai_chats_updated_at BEFORE UPDATE ON ai_chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE ai_chats IS 'AI chat conversations for form generation';
COMMENT ON COLUMN ai_chats.title IS 'Chat title, auto-generated from first message or user-defined';
COMMENT ON COLUMN ai_chats.messages IS 'JSONB array of chat messages with role, content, and timestamp';
COMMENT ON COLUMN ai_chats.form_id IS 'Reference to created form (if user clicked "Use This Form")';
COMMENT ON COLUMN ai_chats.form_draft IS 'JSONB storage of AI-generated form before saving to database';
