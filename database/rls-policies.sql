-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Database: Supabase (PostgreSQL)
-- Purpose: Secure data access at the row level
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_folder_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's ID from Firebase UID
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE firebase_uid = auth.uid();
$$ LANGUAGE SQL STABLE;

-- Check if user is workspace member
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = auth.user_id()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user has specific role in workspace
CREATE OR REPLACE FUNCTION has_workspace_role(workspace_uuid UUID, required_role workspace_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = auth.user_id()
    AND role::text = required_role::text
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user can edit form
CREATE OR REPLACE FUNCTION can_edit_form(form_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM forms f
    INNER JOIN workspace_members wm ON f.workspace_id = wm.workspace_id
    WHERE f.id = form_uuid
    AND wm.user_id = auth.user_id()
    AND wm.role IN ('owner', 'admin', 'editor')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user can view form
CREATE OR REPLACE FUNCTION can_view_form(form_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM forms f
    INNER JOIN workspace_members wm ON f.workspace_id = wm.workspace_id
    WHERE f.id = form_uuid
    AND wm.user_id = auth.user_id()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.user_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.user_id());

-- Users can insert their own profile (signup)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (firebase_uid = auth.uid());

-- ============================================
-- WORKSPACES POLICIES
-- ============================================

-- Workspace members can view their workspaces
CREATE POLICY "Members can view workspace"
  ON workspaces FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
    )
  );

-- Users can create workspaces
CREATE POLICY "Users can create workspace"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.user_id());

-- Owners and admins can update workspace
CREATE POLICY "Owners/Admins can update workspace"
  ON workspaces FOR UPDATE
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

-- Only owners can delete workspace
CREATE POLICY "Owners can delete workspace"
  ON workspaces FOR DELETE
  USING (owner_id = auth.user_id());

-- ============================================
-- WORKSPACE MEMBERS POLICIES
-- ============================================

-- Members can view workspace members
CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
    )
  );

-- Owners and admins can add members
CREATE POLICY "Owners/Admins can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

-- Owners and admins can update member roles
CREATE POLICY "Owners/Admins can update members"
  ON workspace_members FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

-- Owners and admins can remove members
CREATE POLICY "Owners/Admins can remove members"
  ON workspace_members FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- FORMS POLICIES
-- ============================================

-- Workspace members can view forms
CREATE POLICY "Members can view workspace forms"
  ON forms FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
    )
    OR status = 'published' -- Public forms are viewable by anyone
  );

-- Members with edit permissions can create forms
CREATE POLICY "Editors can create forms"
  ON forms FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin', 'editor')
    )
    AND created_by = auth.user_id()
  );

-- Editors can update forms
CREATE POLICY "Editors can update forms"
  ON forms FOR UPDATE
  USING (can_edit_form(id));

-- Owners and admins can delete forms
CREATE POLICY "Owners/Admins can delete forms"
  ON forms FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- QUESTIONS POLICIES
-- ============================================

-- Anyone can view questions for published forms
CREATE POLICY "Anyone can view questions for published forms"
  ON questions FOR SELECT
  USING (
    form_id IN (
      SELECT id FROM forms WHERE status = 'published'
    )
    OR can_view_form(form_id)
  );

-- Editors can create questions
CREATE POLICY "Editors can create questions"
  ON questions FOR INSERT
  WITH CHECK (can_edit_form(form_id));

-- Editors can update questions
CREATE POLICY "Editors can update questions"
  ON questions FOR UPDATE
  USING (can_edit_form(form_id));

-- Editors can delete questions
CREATE POLICY "Editors can delete questions"
  ON questions FOR DELETE
  USING (can_edit_form(form_id));

-- ============================================
-- RESPONSES POLICIES
-- ============================================

-- Workspace members can view responses to their forms
CREATE POLICY "Members can view form responses"
  ON responses FOR SELECT
  USING (
    form_id IN (
      SELECT f.id FROM forms f
      INNER JOIN workspace_members wm ON f.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.user_id()
    )
    OR respondent_user_id = auth.user_id() -- Users can see their own responses
  );

-- Anyone can create responses to published forms
CREATE POLICY "Anyone can submit responses"
  ON responses FOR INSERT
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE status = 'published'
    )
  );

-- Users can update their own in-progress responses
CREATE POLICY "Users can update own responses"
  ON responses FOR UPDATE
  USING (
    respondent_user_id = auth.user_id()
    AND status = 'in_progress'
  );

-- Editors can update responses (for moderation)
CREATE POLICY "Editors can update responses"
  ON responses FOR UPDATE
  USING (can_edit_form(form_id));

-- Admins can delete responses
CREATE POLICY "Admins can delete responses"
  ON responses FOR DELETE
  USING (
    form_id IN (
      SELECT f.id FROM forms f
      INNER JOIN workspace_members wm ON f.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.user_id()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- ANSWERS POLICIES
-- ============================================

-- Inherit from responses - can view if can view response
CREATE POLICY "Can view answers if can view response"
  ON answers FOR SELECT
  USING (
    response_id IN (
      SELECT id FROM responses
      WHERE form_id IN (
        SELECT f.id FROM forms f
        INNER JOIN workspace_members wm ON f.workspace_id = wm.workspace_id
        WHERE wm.user_id = auth.user_id()
      )
      OR respondent_user_id = auth.user_id()
    )
  );

-- Anyone can submit answers to published forms
CREATE POLICY "Anyone can submit answers"
  ON answers FOR INSERT
  WITH CHECK (
    response_id IN (
      SELECT r.id FROM responses r
      INNER JOIN forms f ON r.form_id = f.id
      WHERE f.status = 'published'
    )
  );

-- Users can update their own answers in progress
CREATE POLICY "Users can update own answers"
  ON answers FOR UPDATE
  USING (
    response_id IN (
      SELECT id FROM responses
      WHERE respondent_user_id = auth.user_id()
      AND status = 'in_progress'
    )
  );

-- ============================================
-- TEMPLATES POLICIES
-- ============================================

-- Everyone can view public templates
CREATE POLICY "Anyone can view public templates"
  ON templates FOR SELECT
  USING (is_public = TRUE OR created_by = auth.user_id());

-- Authenticated users can create templates
CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (created_by = auth.user_id());

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (created_by = auth.user_id());

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (created_by = auth.user_id());

-- ============================================
-- TEMPLATE RATINGS POLICIES
-- ============================================

-- Anyone can view ratings
CREATE POLICY "Anyone can view template ratings"
  ON template_ratings FOR SELECT
  USING (TRUE);

-- Users can rate templates
CREATE POLICY "Users can rate templates"
  ON template_ratings FOR INSERT
  WITH CHECK (user_id = auth.user_id());

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
  ON template_ratings FOR UPDATE
  USING (user_id = auth.user_id());

-- ============================================
-- AI CHAT LOGS POLICIES
-- ============================================

-- Users can only view their own chat logs
CREATE POLICY "Users can view own chat logs"
  ON ai_chat_logs FOR SELECT
  USING (user_id = auth.user_id());

-- Users can create their own chat logs
CREATE POLICY "Users can create chat logs"
  ON ai_chat_logs FOR INSERT
  WITH CHECK (user_id = auth.user_id());

-- ============================================
-- INTEGRATIONS POLICIES
-- ============================================

-- Workspace members can view integrations
CREATE POLICY "Members can view workspace integrations"
  ON integrations FOR SELECT
  USING (is_workspace_member(workspace_id));

-- Admins can manage integrations
CREATE POLICY "Admins can create integrations"
  ON integrations FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can update integrations"
  ON integrations FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete integrations"
  ON integrations FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- WEBHOOKS POLICIES
-- ============================================

-- Similar to integrations
CREATE POLICY "Members can view webhooks"
  ON webhooks FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Admins can manage webhooks"
  ON webhooks FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- ANALYTICS EVENTS POLICIES
-- ============================================

-- Workspace members can view analytics
CREATE POLICY "Members can view analytics"
  ON analytics_events FOR SELECT
  USING (
    form_id IN (
      SELECT f.id FROM forms f
      INNER JOIN workspace_members wm ON f.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.user_id()
    )
  );

-- System can insert analytics (via service role)
CREATE POLICY "Service can insert analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.user_id());

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.user_id());

-- System can manage subscriptions (via service role)
CREATE POLICY "Service can manage subscriptions"
  ON subscriptions FOR ALL
  USING (TRUE);

-- ============================================
-- PAYMENT TRANSACTIONS POLICIES
-- ============================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (user_id = auth.user_id());

-- System can insert transactions (via service role)
CREATE POLICY "Service can insert transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- FORM FOLDERS POLICIES
-- ============================================

-- Workspace members can view folders
CREATE POLICY "Members can view folders"
  ON form_folders FOR SELECT
  USING (is_workspace_member(workspace_id));

-- Editors can manage folders
CREATE POLICY "Editors can manage folders"
  ON form_folders FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- ============================================
-- FORM FOLDER ITEMS POLICIES
-- ============================================

-- Inherit from folders and forms
CREATE POLICY "Members can view folder items"
  ON form_folder_items FOR SELECT
  USING (
    folder_id IN (
      SELECT ff.id FROM form_folders ff
      WHERE is_workspace_member(ff.workspace_id)
    )
  );

CREATE POLICY "Editors can manage folder items"
  ON form_folder_items FOR ALL
  USING (
    folder_id IN (
      SELECT ff.id FROM form_folders ff
      INNER JOIN workspace_members wm ON ff.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.user_id()
      AND wm.role IN ('owner', 'admin', 'editor')
    )
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can only access their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.user_id());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.user_id());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.user_id());

-- System can create notifications (via service role)
CREATE POLICY "Service can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- ACTIVITY LOGS POLICIES
-- ============================================

-- Workspace admins can view activity logs
CREATE POLICY "Admins can view workspace activity"
  ON activity_logs FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.user_id()
      AND role IN ('owner', 'admin')
    )
  );

-- System can insert activity logs (via service role)
CREATE POLICY "Service can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- FILE UPLOADS POLICIES
-- ============================================

-- Users can view files they uploaded or files in their workspace
CREATE POLICY "Users can view accessible files"
  ON file_uploads FOR SELECT
  USING (
    user_id = auth.user_id()
    OR form_id IN (
      SELECT f.id FROM forms f
      INNER JOIN workspace_members wm ON f.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.user_id()
    )
  );

-- Users can upload files
CREATE POLICY "Users can upload files"
  ON file_uploads FOR INSERT
  WITH CHECK (
    user_id = auth.user_id()
    OR form_id IN (
      SELECT id FROM forms WHERE status = 'published'
    )
  );

-- Admins can delete files
CREATE POLICY "Admins can delete files"
  ON file_uploads FOR DELETE
  USING (
    form_id IN (
      SELECT f.id FROM forms f
      INNER JOIN workspace_members wm ON f.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.user_id()
      AND wm.role IN ('owner', 'admin')
    )
  );
