-- Remove slug column and related constraints from forms table
-- This migration removes slug-based functionality and relies on UUID only

-- Remove the unique constraint on slug
ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_slug_key;

-- Remove the composite unique constraint
ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_workspace_id_slug_key;

-- Remove the slug index
DROP INDEX IF EXISTS forms_slug_idx;

-- Drop the slug column
ALTER TABLE forms DROP COLUMN IF EXISTS slug;