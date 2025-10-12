-- Create diet_sessions table
CREATE TABLE diet_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT end_date_after_start_date CHECK (end_date >= start_date)
);

-- Create index for date range queries
CREATE INDEX idx_diet_sessions_date_range ON diet_sessions (start_date, end_date);

-- Enable RLS
ALTER TABLE diet_sessions ENABLE ROW LEVEL SECURITY;

-- SELECT policy: all users can read
CREATE POLICY "diet_sessions_select_policy" ON diet_sessions
  FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE policy: authenticated users only
CREATE POLICY "diet_sessions_write_policy" ON diet_sessions
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Auto-update updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON diet_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
