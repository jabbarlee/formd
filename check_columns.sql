-- Check if the unified_card_layout column exists in the forms table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'forms'
AND column_name IN ('unified_card_layout', 'has_due_date', 'has_location');
