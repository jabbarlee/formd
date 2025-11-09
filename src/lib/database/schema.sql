-- ============================================
-- FormD Database Schema (PostgreSQL)
-- ============================================
-- Designed for scalability, security, and performance
-- Supports all question types, conditional logic, AI analysis
-- Integrates with Firebase Authentication
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_plan AS ENUM ('free', 'pro', 'business', 'enterprise');
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE form_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE response_status AS ENUM ('in_progress', 'completed', 'flagged');
CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet');
CREATE TYPE sentiment_type AS ENUM ('positive', 'neutral', 'negative', 'mixed');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE integration_service AS ENUM (
    'slack', 'discord', 'notion', 'airtable', 'hubspot', 
    'salesforce', 'zapier', 'make', 'webhook'
);

CREATE TYPE question_type AS ENUM (
    'short_text', 'long_text', 'email', 'number', 'phone',
    'multiple_choice', 'checkboxes', 'dropdown', 'star_rating',
    'linear_scale', 'nps', 'emoji_rating', 'date', 'time', 'datetime',
    'file_upload', 'signature', 'matrix', 'ranking', 'payment',
    'location', 'image_choice', 'section_heading', 'text_content', 'divider'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- Users Table (Synced with Firebase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    company VARCHAR(255),
    plan user_plan DEFAULT 'free' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Stripe integration
    stripe_customer_id VARCHAR(255) UNIQUE,
    
    -- Preferences and metadata stored as JSONB for flexibility
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Workspaces (Multi-tenant support)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan user_plan DEFAULT 'free' NOT NULL,
    
    -- Custom domain for white-labeling
    custom_domain VARCHAR(255) UNIQUE,
    logo_url TEXT,
    
    -- Branding customization (colors, fonts, etc.)
    branding JSONB DEFAULT '{}',
    
    -- Workspace settings
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Workspace Members (Team collaboration)
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role workspace_role DEFAULT 'viewer' NOT NULL,
    
    -- Fine-grained permissions
    permissions JSONB DEFAULT '{}',
    
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(workspace_id, user_id)
);

-- Forms Table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    -- Basic info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL,
    status form_status DEFAULT 'draft' NOT NULL,
    
    -- Appearance
    theme JSONB DEFAULT '{}', -- primaryColor, backgroundColor, textColor, fontFamily, fontSize, borderRadius, spacing, buttonStyle
    cover_image TEXT,
    logo TEXT,
    
    -- Form header metadata
    has_due_date BOOLEAN DEFAULT FALSE,
    due_date DATE,
    include_time BOOLEAN DEFAULT FALSE,
    due_time TIME,
    has_location BOOLEAN DEFAULT FALSE,
    location VARCHAR(500),
    
    -- Settings (stored as JSONB for flexibility)
    -- Includes: allowMultipleResponses, requirePassword, responseLimit, closeDate,
    -- showProgressBar, showQuestionNumbers, oneQuestionPerPage, shuffleQuestions,
    -- notifyOnSubmission, notificationEmail, showSubmissionMessage, 
    -- customSubmissionMessage, redirectUrl, collectIpAddress, collectLocation,
    -- allowSaveDraft, requireEmailVerification
    settings JSONB DEFAULT '{}',
    
    -- Security
    requires_password BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255), -- bcrypt hash
    
    -- Limits and restrictions
    response_limit INTEGER,
    close_date TIMESTAMPTZ,
    allow_multiple_responses BOOLEAN DEFAULT FALSE,
    
    -- Display preferences
    show_progress_bar BOOLEAN DEFAULT TRUE,
    
    -- AI features
    enable_ai_analysis BOOLEAN DEFAULT TRUE,
    
    -- Data collection
    collect_email BOOLEAN DEFAULT TRUE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    UNIQUE(workspace_id, slug)
);

-- Questions Table (Normalized structure)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    
    -- Question properties
    type question_type NOT NULL,
    title VARCHAR(1000) NOT NULL,
    description TEXT,
    placeholder VARCHAR(500),
    required BOOLEAN DEFAULT FALSE,
    order_position INTEGER NOT NULL,
    
    -- Options for choice-based questions (multiple_choice, checkboxes, dropdown, image_choice, ranking)
    -- Stored as JSONB array: [{"id": "opt1", "label": "Option 1", "value": "option_1", "order": 0, "image": "url"}]
    options JSONB,
    
    -- Validation rules
    -- Stored as JSONB: {"rules": [{"type": "min_length", "value": 3, "message": "Too short"}]}
    validation JSONB,
    
    -- Conditional logic / Skip logic
    -- Stored as JSONB: {"rules": [{"id": "rule1", "questionId": "q2", "condition": "equals", "value": "yes", "action": "show", "targetQuestionId": "q5"}]}
    logic JSONB,
    
    -- Type-specific settings
    -- For text: minLength, maxLength
    -- For number: min, max, step
    -- For rating: maxRating, icon (star/heart/thumbs)
    -- For scale: minLabel, maxLabel, scaleMin, scaleMax
    -- For file: maxFileSize, allowedFileTypes, maxFiles
    -- For matrix: rows, columns (as JSONB arrays)
    -- For payment: currency, amount
    -- For image_choice: imageSize
    settings JSONB DEFAULT '{}',
    
    -- AI features
    ai_suggestions_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses Table (Individual form submissions)
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    
    -- Respondent information
    respondent_email VARCHAR(255),
    respondent_name VARCHAR(255),
    respondent_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Response status and quality
    status response_status DEFAULT 'in_progress' NOT NULL,
    quality_score DECIMAL(5, 2), -- 0.00 to 100.00
    completion_percentage INTEGER DEFAULT 0,
    time_spent INTEGER, -- in seconds
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    
    -- Device and location tracking (if enabled in form settings)
    device_type device_type,
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address INET,
    location JSONB, -- {city, region, country, lat, lon}
    referrer TEXT,
    user_agent TEXT,
    
    -- AI-powered sentiment analysis (for text responses)
    ai_sentiment sentiment_type,
    ai_sentiment_score DECIMAL(5, 2), -- 0.00 to 100.00
    ai_summary TEXT,
    ai_insights JSONB, -- Additional AI-generated insights
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers Table (Individual question responses)
-- Polymorphic storage for different answer types
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    -- Polymorphic answer storage (only one will be populated based on question type)
    answer_text TEXT, -- For short_text, long_text, email, phone
    answer_number DECIMAL(20, 4), -- For number, star_rating, linear_scale, nps, emoji_rating
    answer_boolean BOOLEAN, -- For yes/no type questions
    answer_date DATE, -- For date questions
    answer_time TIME, -- For time questions
    answer_datetime TIMESTAMPTZ, -- For datetime questions
    answer_json JSONB, -- For complex answers: multiple_choice, checkboxes, dropdown, matrix, ranking, location, image_choice
    answer_file_url TEXT, -- For file_upload, signature
    
    -- AI analysis for individual text answers
    ai_sentiment sentiment_type,
    ai_sentiment_score DECIMAL(5, 2),
    ai_themes TEXT[], -- Array of detected themes/topics
    ai_categories TEXT[], -- Array of detected categories
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(response_id, question_id)
);

-- ============================================
-- TEMPLATES
-- ============================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    thumbnail TEXT,
    preview_images TEXT[],
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE,
    is_official BOOLEAN DEFAULT FALSE, -- Created by FormD team
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Template structure (complete form + questions as JSON)
    form_structure JSONB NOT NULL,
    
    -- SEO and discovery
    tags TEXT[],
    
    -- Usage tracking
    use_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE template_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(template_id, user_id)
);

-- ============================================
-- AI FEATURES
-- ============================================

-- AI Chat Logs (AI Assistant interactions)
CREATE TABLE ai_chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
    session_id UUID NOT NULL,
    
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    context_data JSONB, -- Additional context for the AI
    
    -- Token tracking for billing
    tokens_used INTEGER,
    model VARCHAR(100), -- e.g., 'gpt-4', 'gpt-3.5-turbo'
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INTEGRATIONS & WEBHOOKS
-- ============================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    
    service integration_service NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Integration configuration (API keys, tokens, etc.)
    -- Encrypted sensitive data
    config JSONB NOT NULL,
    
    enabled BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    
    url TEXT NOT NULL,
    secret VARCHAR(255), -- For webhook signature verification
    
    -- Events to trigger on: ['form.published', 'response.submitted', 'response.completed']
    events TEXT[] NOT NULL,
    
    enabled BOOLEAN DEFAULT TRUE,
    retry_count INTEGER DEFAULT 3,
    
    -- Status tracking
    last_triggered_at TIMESTAMPTZ,
    last_status INTEGER, -- HTTP status code
    last_error TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS
-- ============================================

-- Analytics Events (Form interactions, page views, etc.)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    response_id UUID REFERENCES responses(id) ON DELETE SET NULL,
    
    event_type VARCHAR(100) NOT NULL, -- 'form_viewed', 'question_answered', 'form_submitted', 'form_abandoned'
    event_data JSONB, -- Additional event-specific data
    
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BILLING & SUBSCRIPTIONS
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Stripe integration
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),
    
    plan user_plan NOT NULL,
    status subscription_status NOT NULL,
    
    -- Subscription period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    
    -- Usage limits
    forms_limit INTEGER,
    responses_limit INTEGER,
    storage_limit_mb INTEGER,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'succeeded', 'pending', 'failed'
    
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOLDERS & ORGANIZATION
-- ============================================

CREATE TABLE form_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    parent_folder_id UUID REFERENCES form_folders(id) ON DELETE CASCADE,
    
    -- Customization
    color VARCHAR(7), -- Hex color
    icon VARCHAR(50),
    
    order_position INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE form_folder_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID NOT NULL REFERENCES form_folders(id) ON DELETE CASCADE,
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(folder_id, form_id)
);

-- ============================================
-- NOTIFICATIONS & ACTIVITY
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(100) NOT NULL, -- 'new_response', 'form_published', 'collaboration_invite'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    
    read BOOLEAN DEFAULT FALSE,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    action VARCHAR(100) NOT NULL, -- 'form_created', 'form_published', 'response_received'
    resource_type VARCHAR(100) NOT NULL, -- 'form', 'response', 'workspace'
    resource_id UUID,
    
    details JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FILE UPLOADS
-- ============================================

CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    
    -- Storage path (S3, GCS, etc.)
    storage_path TEXT NOT NULL,
    public_url TEXT,
    
    -- Image/video metadata
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- For videos
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Workspaces indexes
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspaces_domain ON workspaces(custom_domain);
CREATE INDEX idx_workspaces_plan ON workspaces(plan);

-- Workspace members indexes
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_role ON workspace_members(role);

-- Forms indexes
CREATE INDEX idx_forms_workspace ON forms(workspace_id);
CREATE INDEX idx_forms_creator ON forms(created_by);
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_published ON forms(published_at DESC);
CREATE INDEX idx_forms_created ON forms(created_at DESC);
CREATE INDEX idx_forms_workspace_status ON forms(workspace_id, status, deleted_at);

-- Questions indexes
CREATE INDEX idx_questions_form ON questions(form_id);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_form_order ON questions(form_id, order_position);

-- Responses indexes
CREATE INDEX idx_responses_form ON responses(form_id);
CREATE INDEX idx_responses_status ON responses(status);
CREATE INDEX idx_responses_submitted ON responses(submitted_at DESC);
CREATE INDEX idx_responses_quality ON responses(quality_score DESC);
CREATE INDEX idx_responses_email ON responses(respondent_email);
CREATE INDEX idx_responses_form_status ON responses(form_id, status, submitted_at DESC);
CREATE INDEX idx_responses_device ON responses(device_type);

-- Answers indexes
CREATE INDEX idx_answers_response ON answers(response_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_sentiment ON answers(ai_sentiment);
CREATE INDEX idx_answers_themes ON answers USING gin(ai_themes);
CREATE INDEX idx_answers_question_response ON answers(question_id, response_id);

-- Full-text search on text answers
CREATE INDEX idx_answers_text_search ON answers USING gin(to_tsvector('english', answer_text));

-- Templates indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_public ON templates(is_public);
CREATE INDEX idx_templates_featured ON templates(is_featured);
CREATE INDEX idx_templates_use_count ON templates(use_count DESC);
CREATE INDEX idx_templates_rating ON templates(rating_average DESC);
CREATE INDEX idx_templates_tags ON templates USING gin(tags);
CREATE INDEX idx_templates_created ON templates(created_at DESC);

-- Template ratings indexes
CREATE INDEX idx_template_ratings_template ON template_ratings(template_id);
CREATE INDEX idx_template_ratings_user ON template_ratings(user_id);
CREATE INDEX idx_template_ratings_rating ON template_ratings(rating);

-- AI chat logs indexes
CREATE INDEX idx_ai_chat_logs_user ON ai_chat_logs(user_id);
CREATE INDEX idx_ai_chat_logs_form ON ai_chat_logs(form_id);
CREATE INDEX idx_ai_chat_logs_session ON ai_chat_logs(session_id, created_at);
CREATE INDEX idx_ai_chat_logs_created ON ai_chat_logs(created_at DESC);

-- Integrations indexes
CREATE INDEX idx_integrations_workspace ON integrations(workspace_id);
CREATE INDEX idx_integrations_form ON integrations(form_id);
CREATE INDEX idx_integrations_service ON integrations(service);
CREATE INDEX idx_integrations_enabled ON integrations(enabled);

-- Webhooks indexes
CREATE INDEX idx_webhooks_workspace ON webhooks(workspace_id);
CREATE INDEX idx_webhooks_form ON webhooks(form_id);
CREATE INDEX idx_webhooks_enabled ON webhooks(enabled);
CREATE INDEX idx_webhooks_events ON webhooks USING gin(events);

-- Analytics events indexes
CREATE INDEX idx_analytics_form_time ON analytics_events(form_id, timestamp DESC);
CREATE INDEX idx_analytics_response ON analytics_events(response_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_session ON analytics_events(session_id, timestamp);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);

-- Payment transactions indexes
CREATE INDEX idx_payments_user ON payment_transactions(user_id);
CREATE INDEX idx_payments_stripe ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payment_transactions(status);
CREATE INDEX idx_payments_created ON payment_transactions(created_at DESC);

-- Form folders indexes
CREATE INDEX idx_folders_workspace ON form_folders(workspace_id);
CREATE INDEX idx_folders_parent ON form_folders(parent_folder_id);
CREATE INDEX idx_folders_order ON form_folders(workspace_id, order_position);

-- Form folder items indexes
CREATE INDEX idx_folder_items_folder ON form_folder_items(folder_id);
CREATE INDEX idx_folder_items_form ON form_folder_items(form_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_time ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Activity logs indexes
CREATE INDEX idx_activity_user_time ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_workspace_time ON activity_logs(workspace_id, created_at DESC);
CREATE INDEX idx_activity_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

-- File uploads indexes
CREATE INDEX idx_files_user ON file_uploads(user_id);
CREATE INDEX idx_files_form ON file_uploads(form_id);
CREATE INDEX idx_files_response ON file_uploads(response_id);
CREATE INDEX idx_files_answer ON file_uploads(answer_id);
CREATE INDEX idx_files_created ON file_uploads(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_ratings_updated_at BEFORE UPDATE ON template_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_folders_updated_at BEFORE UPDATE ON form_folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on sensitive tables
-- Note: Implement specific policies based on your access control requirements

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy: Users can only see their own data
CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (firebase_uid = current_setting('app.current_user_id', true));

-- Example RLS Policy: Workspace members can access workspace data
CREATE POLICY workspace_access ON forms
    FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = (SELECT id FROM users WHERE firebase_uid = current_setting('app.current_user_id', true))
        )
    );

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Form statistics with response counts
CREATE OR REPLACE VIEW form_stats AS
SELECT 
    f.id,
    f.workspace_id,
    f.title,
    f.status,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'completed') as completed_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'in_progress') as partial_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'flagged') as flagged_responses,
    COUNT(DISTINCT r.id) as total_responses,
    AVG(r.completion_percentage) as avg_completion_rate,
    AVG(r.time_spent) as avg_completion_time,
    f.created_at,
    f.published_at,
    f.updated_at
FROM forms f
LEFT JOIN responses r ON r.form_id = f.id
GROUP BY f.id;

-- View: User workspace access
CREATE OR REPLACE VIEW user_workspace_access AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    w.id as workspace_id,
    w.name as workspace_name,
    w.slug as workspace_slug,
    COALESCE(wm.role, 'owner') as role,
    CASE 
        WHEN w.owner_id = u.id THEN TRUE
        ELSE FALSE
    END as is_owner
FROM users u
LEFT JOIN workspaces w ON w.owner_id = u.id
LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = u.id;

-- View: Response analytics summary
CREATE OR REPLACE VIEW response_analytics AS
SELECT 
    r.id as response_id,
    r.form_id,
    r.status,
    r.respondent_email,
    r.submitted_at,
    r.time_spent,
    r.device_type,
    r.ai_sentiment,
    COUNT(a.id) as total_answers,
    COUNT(a.id) FILTER (WHERE a.answer_text IS NOT NULL OR a.answer_number IS NOT NULL OR a.answer_json IS NOT NULL) as answered_questions,
    f.title as form_title
FROM responses r
JOIN forms f ON f.id = r.form_id
LEFT JOIN answers a ON a.response_id = r.id
GROUP BY r.id, f.title;

-- ============================================
-- COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'User accounts synced with Firebase Authentication';
COMMENT ON TABLE workspaces IS 'Multi-tenant workspaces for team collaboration';
COMMENT ON TABLE forms IS 'Form definitions with all settings and configurations';
COMMENT ON TABLE questions IS 'Individual questions within forms, supports 25+ question types';
COMMENT ON TABLE responses IS 'Form submissions from respondents';
COMMENT ON TABLE answers IS 'Individual answers to questions, polymorphic storage for different data types';
COMMENT ON TABLE templates IS 'Pre-built form templates for quick form creation';
COMMENT ON TABLE integrations IS 'Third-party service integrations (Slack, Notion, etc.)';
COMMENT ON TABLE webhooks IS 'Webhook configurations for real-time event notifications';
COMMENT ON TABLE analytics_events IS 'Granular analytics events for form interactions';
COMMENT ON TABLE subscriptions IS 'User subscription management with Stripe integration';
COMMENT ON TABLE ai_chat_logs IS 'AI assistant conversation history';

COMMENT ON COLUMN questions.options IS 'JSONB array of options for choice-based questions';
COMMENT ON COLUMN questions.validation IS 'JSONB validation rules (min_length, max_length, pattern, etc.)';
COMMENT ON COLUMN questions.logic IS 'JSONB conditional logic rules for show/hide/skip functionality';
COMMENT ON COLUMN questions.settings IS 'JSONB type-specific settings (rating max, scale range, file types, etc.)';
COMMENT ON COLUMN answers.answer_json IS 'JSONB storage for complex answers: arrays, objects, matrix responses';
COMMENT ON COLUMN responses.ai_sentiment IS 'Overall sentiment analysis of text responses';
COMMENT ON COLUMN responses.location IS 'JSONB with city, region, country, coordinates if enabled';
