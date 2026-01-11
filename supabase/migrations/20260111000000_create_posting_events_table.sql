-- Create posting_events table for managing posting events via YAML sync
CREATE TABLE IF NOT EXISTS posting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE posting_events ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to manage posting_events
CREATE POLICY "Admin users can do all operations on posting_events"
  ON posting_events
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy for public read access to active posting events
CREATE POLICY "Public can read active posting events"
  ON posting_events
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Add index for slug lookups
CREATE INDEX idx_posting_events_slug ON posting_events (slug);

-- Add index for active events
CREATE INDEX idx_posting_events_active ON posting_events (active);

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_posting_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_posting_events_updated_at
  BEFORE UPDATE ON posting_events
  FOR EACH ROW
  EXECUTE FUNCTION update_posting_events_updated_at();
