-- ============================================
-- FormAI Database Schema
-- ============================================
-- Database: PostgreSQL (Supabase)
-- ORM: Prisma
-- Version: 1.0.0
-- Description: Scalable, secure schema for AI-powered form builder SaaS
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query performance monitoring

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_plan AS ENUM ('free', 'pro', 'business', 'enterprise');
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE form_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE response_status AS ENUM ('in_progress', 'completed', 'flagged');
CREATE TYPE question_type AS ENUM (
  'short_text', 'long_text', 'email', 'number', 'phone',
  'multiple_choice', 'checkboxes', 'dropdown', 'star_rating',
  'linear_scale', 'nps', 'emoji_rating', 'date', 'time',
  'datetime', 'file_upload', 'signature', 'matrix', 'ranking',
  'payment', 'location', 'image_choice', 'section_heading',
  'text_content', 'divider'
);
CREATE TYPE sentiment_type AS ENUM ('positive', 'neutral', 'negative', 'mixed');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE integration_service AS ENUM (
  'slack', 'discord', 'notion', 'airtable', 'hubspot', 
  'salesforce', 'zapier', 'make', 'webhook'
);

-- ============================================
-- USERS TABLE
-- ============================================

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
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for users
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- WORKSPACES TABLE
-- ============================================

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan user_plan DEFAULT 'free' NOT NULL,
  custom_domain VARCHAR(255) UNIQUE,
  logo_url TEXT,
  branding JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for workspaces
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_custom_domain ON workspaces(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_workspaces_plan ON workspaces(plan);
CREATE INDEX idx_workspaces_deleted_at ON workspaces(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- WORKSPACE MEMBERS TABLE
-- ============================================

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role workspace_role DEFAULT 'viewer' NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Indexes for workspace_members
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_role ON workspace_members(role);
CREATE UNIQUE INDEX idx_workspace_members_unique ON workspace_members(workspace_id, user_id);

-- ============================================
-- FORMS TABLE
-- ============================================

CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  slug VARCHAR(255) NOT NULL,
  status form_status DEFAULT 'draft' NOT NULL,
  
  -- Appearance
  theme JSONB DEFAULT '{}'::jsonb,
  cover_image TEXT,
  logo TEXT,
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  response_limit INTEGER,
  close_date TIMESTAMPTZ,
  requires_password BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  allow_multiple_responses BOOLEAN DEFAULT FALSE,
  show_progress_bar BOOLEAN DEFAULT TRUE,
  enable_ai_analysis BOOLEAN DEFAULT TRUE,
  collect_email BOOLEAN DEFAULT TRUE,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(workspace_id, slug)
);

-- Indexes for forms
CREATE INDEX idx_forms_workspace_id ON forms(workspace_id);
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_published_at ON forms(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_forms_created_at ON forms(created_at DESC);
CREATE INDEX idx_forms_deleted_at ON forms(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_forms_composite ON forms(workspace_id, status, deleted_at) WHERE deleted_at IS NULL;

-- Full-text search index
CREATE INDEX idx_forms_search ON forms USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- ============================================
-- QUESTIONS TABLE
-- ============================================

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  type question_type NOT NULL,
  title VARCHAR(1000) NOT NULL,
  description TEXT,
  placeholder VARCHAR(500),
  
  -- Configuration
  required BOOLEAN DEFAULT FALSE,
  order_position INTEGER NOT NULL,
  options JSONB, -- For multiple choice, dropdowns, etc.
  validation JSONB, -- Validation rules
  logic JSONB, -- Conditional logic (skip logic, branching)
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- AI Features
  ai_suggestions_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for questions
CREATE INDEX idx_questions_form_id ON questions(form_id);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_order ON questions(form_id, order_position);
CREATE INDEX idx_questions_composite ON questions(form_id, order_position, type);

-- ============================================
-- RESPONSES TABLE
-- ============================================

CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  
  -- Respondent Info
  respondent_email VARCHAR(255),
  respondent_name VARCHAR(255),
  respondent_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status & Quality
  status response_status DEFAULT 'in_progress' NOT NULL,
  quality_score DECIMAL(5,2), -- 0-100
  completion_percentage INTEGER DEFAULT 0,
  
  -- Timing
  time_spent INTEGER, -- seconds
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  submitted_at TIMESTAMPTZ,
  
  -- Device & Location
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_address INET,
  location JSONB, -- {country, city, lat, lng}
  referrer TEXT,
  user_agent TEXT,
  
  -- AI Analysis
  ai_sentiment sentiment_type,
  ai_sentiment_score DECIMAL(5,2),
  ai_summary TEXT,
  ai_insights JSONB,
  
  -- Additional Data
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for responses
CREATE INDEX idx_responses_form_id ON responses(form_id);
CREATE INDEX idx_responses_status ON responses(status);
CREATE INDEX idx_responses_submitted_at ON responses(submitted_at DESC) WHERE submitted_at IS NOT NULL;
CREATE INDEX idx_responses_quality_score ON responses(quality_score DESC) WHERE quality_score IS NOT NULL;
CREATE INDEX idx_responses_email ON responses(respondent_email) WHERE respondent_email IS NOT NULL;
CREATE INDEX idx_responses_composite ON responses(form_id, status, submitted_at DESC);
CREATE INDEX idx_responses_device_type ON responses(device_type) WHERE device_type IS NOT NULL;
CREATE INDEX idx_responses_location ON responses USING GIN (location);

-- ============================================
-- ANSWERS TABLE
-- ============================================

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Answer Data (flexible storage for different types)
  answer_text TEXT,
  answer_number DECIMAL(20,4),
  answer_boolean BOOLEAN,
  answer_date DATE,
  answer_time TIME,
  answer_datetime TIMESTAMPTZ,
  answer_json JSONB, -- For complex answers (checkboxes, matrix, etc.)
  answer_file_url TEXT,
  
  -- AI Analysis
  ai_sentiment sentiment_type,
  ai_sentiment_score DECIMAL(5,2),
  ai_themes TEXT[], -- Array of detected themes
  ai_categories TEXT[], -- Auto-categorization
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(response_id, question_id)
);

-- Indexes for answers
CREATE INDEX idx_answers_response_id ON answers(response_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_sentiment ON answers(ai_sentiment) WHERE ai_sentiment IS NOT NULL;
CREATE INDEX idx_answers_themes ON answers USING GIN (ai_themes);
CREATE INDEX idx_answers_json ON answers USING GIN (answer_json);
CREATE INDEX idx_answers_composite ON answers(question_id, response_id);

-- Full-text search for text answers
CREATE INDEX idx_answers_text_search ON answers USING GIN (
  to_tsvector('english', coalesce(answer_text, ''))
) WHERE answer_text IS NOT NULL;

-- ============================================
-- TEMPLATES TABLE
-- ============================================

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  thumbnail TEXT,
  preview_images TEXT[], -- Array of preview image URLs
  
  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,
  is_official BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Structure
  form_structure JSONB NOT NULL, -- Complete form definition
  
  -- Metadata
  tags TEXT[],
  use_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for templates
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_is_public ON templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_templates_is_featured ON templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_templates_use_count ON templates(use_count DESC);
CREATE INDEX idx_templates_rating ON templates(rating_average DESC);
CREATE INDEX idx_templates_tags ON templates USING GIN (tags);
CREATE INDEX idx_templates_created_at ON templates(created_at DESC);

-- Full-text search for templates
CREATE INDEX idx_templates_search ON templates USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, ''))
);

-- ============================================
-- TEMPLATE RATINGS TABLE
-- ============================================

CREATE TABLE template_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(template_id, user_id)
);

-- Indexes for template_ratings
CREATE INDEX idx_template_ratings_template_id ON template_ratings(template_id);
CREATE INDEX idx_template_ratings_user_id ON template_ratings(user_id);
CREATE INDEX idx_template_ratings_rating ON template_ratings(rating);

-- ============================================
-- AI CHAT LOGS TABLE
-- ============================================

CREATE TABLE ai_chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  context_data JSONB,
  tokens_used INTEGER,
  model VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for ai_chat_logs
CREATE INDEX idx_ai_chat_logs_user_id ON ai_chat_logs(user_id);
CREATE INDEX idx_ai_chat_logs_form_id ON ai_chat_logs(form_id) WHERE form_id IS NOT NULL;
CREATE INDEX idx_ai_chat_logs_session_id ON ai_chat_logs(session_id, created_at);
CREATE INDEX idx_ai_chat_logs_created_at ON ai_chat_logs(created_at DESC);

-- ============================================
-- INTEGRATIONS TABLE
-- ============================================

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  service integration_service NOT NULL,
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL, -- Encrypted credentials and configuration
  enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for integrations
CREATE INDEX idx_integrations_workspace_id ON integrations(workspace_id);
CREATE INDEX idx_integrations_form_id ON integrations(form_id) WHERE form_id IS NOT NULL;
CREATE INDEX idx_integrations_service ON integrations(service);
CREATE INDEX idx_integrations_enabled ON integrations(enabled) WHERE enabled = TRUE;

-- ============================================
-- WEBHOOKS TABLE
-- ============================================

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret VARCHAR(255),
  events TEXT[] NOT NULL, -- ['response.created', 'response.completed', etc.]
  enabled BOOLEAN DEFAULT TRUE,
  retry_count INTEGER DEFAULT 3,
  last_triggered_at TIMESTAMPTZ,
  last_status INTEGER,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for webhooks
CREATE INDEX idx_webhooks_workspace_id ON webhooks(workspace_id);
CREATE INDEX idx_webhooks_form_id ON webhooks(form_id) WHERE form_id IS NOT NULL;
CREATE INDEX idx_webhooks_enabled ON webhooks(enabled) WHERE enabled = TRUE;
CREATE INDEX idx_webhooks_events ON webhooks USING GIN (events);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  response_id UUID REFERENCES responses(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  session_id UUID,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for analytics_events (partitioned by time for performance)
CREATE INDEX idx_analytics_events_form_id ON analytics_events(form_id, timestamp DESC);
CREATE INDEX idx_analytics_events_response_id ON analytics_events(response_id) WHERE response_id IS NOT NULL;
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id, timestamp) WHERE session_id IS NOT NULL;

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  plan user_plan NOT NULL,
  status subscription_status NOT NULL,
  
  -- Billing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  
  -- Usage tracking
  forms_limit INTEGER,
  responses_limit INTEGER,
  storage_limit_mb INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);

-- ============================================
-- PAYMENT TRANSACTIONS TABLE
-- ============================================

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for payment_transactions
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_stripe_id ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- ============================================
-- FORM FOLDERS TABLE (for organization)
-- ============================================

CREATE TABLE form_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  parent_folder_id UUID REFERENCES form_folders(id) ON DELETE CASCADE,
  color VARCHAR(7), -- Hex color
  icon VARCHAR(50),
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for form_folders
CREATE INDEX idx_form_folders_workspace_id ON form_folders(workspace_id);
CREATE INDEX idx_form_folders_parent ON form_folders(parent_folder_id) WHERE parent_folder_id IS NOT NULL;
CREATE INDEX idx_form_folders_order ON form_folders(workspace_id, order_position);

-- ============================================
-- FORM FOLDER ITEMS (Many-to-Many)
-- ============================================

CREATE TABLE form_folder_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID NOT NULL REFERENCES form_folders(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(folder_id, form_id)
);

-- Indexes for form_folder_items
CREATE INDEX idx_form_folder_items_folder_id ON form_folder_items(folder_id);
CREATE INDEX idx_form_folder_items_form_id ON form_folder_items(form_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- ACTIVITY LOGS TABLE (Audit Trail)
-- ============================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for activity_logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_workspace_id ON activity_logs(workspace_id, created_at DESC);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- FILE UPLOADS TABLE
-- ============================================

CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  
  -- File Info
  filename VARCHAR(500) NOT NULL,
  original_filename VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  
  -- Metadata
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- For video/audio
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for file_uploads
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_form_id ON file_uploads(form_id) WHERE form_id IS NOT NULL;
CREATE INDEX idx_file_uploads_response_id ON file_uploads(response_id) WHERE response_id IS NOT NULL;
CREATE INDEX idx_file_uploads_answer_id ON file_uploads(answer_id) WHERE answer_id IS NOT NULL;
CREATE INDEX idx_file_uploads_created_at ON file_uploads(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_template_ratings_updated_at BEFORE UPDATE ON template_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_folders_updated_at BEFORE UPDATE ON form_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'User accounts with authentication via Firebase';
COMMENT ON TABLE workspaces IS 'Team workspaces for collaboration';
COMMENT ON TABLE workspace_members IS 'Workspace membership and roles';
COMMENT ON TABLE forms IS 'Form definitions and configurations';
COMMENT ON TABLE questions IS 'Individual questions within forms';
COMMENT ON TABLE responses IS 'Form submission responses';
COMMENT ON TABLE answers IS 'Individual answers to questions';
COMMENT ON TABLE templates IS 'Reusable form templates';
COMMENT ON TABLE ai_chat_logs IS 'AI assistant conversation history';
COMMENT ON TABLE integrations IS 'Third-party service integrations';
COMMENT ON TABLE webhooks IS 'Webhook configurations for real-time notifications';
COMMENT ON TABLE analytics_events IS 'Form interaction tracking events';
COMMENT ON TABLE subscriptions IS 'User subscription and billing information';
COMMENT ON TABLE payment_transactions IS 'Payment transaction history';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE activity_logs IS 'Audit trail of all system actions';
COMMENT ON TABLE file_uploads IS 'Uploaded files and media';
