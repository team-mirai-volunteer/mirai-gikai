-- Remove 'easy' from difficulty_level_enum
-- First, create a new enum without 'easy'
CREATE TYPE difficulty_level_enum_new AS ENUM ('normal', 'hard');

-- Delete existing 'easy' records to avoid conflicts
DELETE FROM bill_contents WHERE difficulty_level = 'easy';

-- Update the column to use the new enum
ALTER TABLE bill_contents
  ALTER COLUMN difficulty_level TYPE difficulty_level_enum_new
  USING difficulty_level::text::difficulty_level_enum_new;

-- Drop the old enum and rename the new one
DROP TYPE difficulty_level_enum;
ALTER TYPE difficulty_level_enum_new RENAME TO difficulty_level_enum;

-- Update table comment
COMMENT ON COLUMN bill_contents.difficulty_level IS '難易度レベル（normal:ふつう, hard:難しい）';