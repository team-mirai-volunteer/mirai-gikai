-- Make bills.published_at nullable
ALTER TABLE bills ALTER COLUMN published_at DROP NOT NULL;
