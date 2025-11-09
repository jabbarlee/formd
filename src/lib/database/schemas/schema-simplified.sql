-- ============================================
-- FormD Database Schema (PostgreSQL) - Simplified
-- ============================================
-- Core tables: Users, Forms, Questions, Responses, Answers
-- Designed for scalability, security, and performance
-- Integrates with Firebase Authentication
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_plan AS ENUM ('free', 'pro', 'business', 'enterprise');
CREATE TYPE form_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE response_status AS ENUM ('in_progress', 'completed', 'flagged');
CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet');

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
    
    -- Preferences and metadata stored as JSONB for flexibility
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Forms Table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    -- Basic info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
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
    deleted_at TIMESTAMPTZ
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
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(response_id, question_id)
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

-- Forms indexes
CREATE INDEX idx_forms_creator ON forms(created_by);
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_published ON forms(published_at DESC);
CREATE INDEX idx_forms_created ON forms(created_at DESC);

-- Questions indexes
CREATE INDEX idx_questions_form ON questions(form_id);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_form_order ON questions(form_id, order_position);

-- Responses indexes
CREATE INDEX idx_responses_form ON responses(form_id);
CREATE INDEX idx_responses_status ON responses(status);
CREATE INDEX idx_responses_submitted ON responses(submitted_at DESC);
CREATE INDEX idx_responses_email ON responses(respondent_email);
CREATE INDEX idx_responses_form_status ON responses(form_id, status, submitted_at DESC);
CREATE INDEX idx_responses_device ON responses(device_type);

-- Answers indexes
CREATE INDEX idx_answers_response ON answers(response_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_question_response ON answers(question_id, response_id);

-- Full-text search on text answers
CREATE INDEX idx_answers_text_search ON answers USING gin(to_tsvector('english', answer_text));

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

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Form statistics with response counts
CREATE OR REPLACE VIEW form_stats AS
SELECT 
    f.id,
    f.created_by,
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
COMMENT ON TABLE forms IS 'Form definitions with all settings and configurations';
COMMENT ON TABLE questions IS 'Individual questions within forms, supports 25+ question types';
COMMENT ON TABLE responses IS 'Form submissions from respondents';
COMMENT ON TABLE answers IS 'Individual answers to questions, polymorphic storage for different data types';

COMMENT ON COLUMN questions.options IS 'JSONB array of options for choice-based questions';
COMMENT ON COLUMN questions.validation IS 'JSONB validation rules (min_length, max_length, pattern, etc.)';
COMMENT ON COLUMN questions.logic IS 'JSONB conditional logic rules for show/hide/skip functionality';
COMMENT ON COLUMN questions.settings IS 'JSONB type-specific settings (rating max, scale range, file types, etc.)';
COMMENT ON COLUMN answers.answer_json IS 'JSONB storage for complex answers: arrays, objects, matrix responses';
COMMENT ON COLUMN responses.location IS 'JSONB with city, region, country, coordinates if enabled';
