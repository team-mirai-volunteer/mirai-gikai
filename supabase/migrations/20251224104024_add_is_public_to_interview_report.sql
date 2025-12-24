-- Add is_public column to interview_report table
-- This allows admin to control which reports are visible to users

ALTER TABLE interview_report
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Add index for filtering public reports
CREATE INDEX idx_interview_report_is_public ON interview_report(is_public);

-- Add comment for documentation
COMMENT ON COLUMN interview_report.is_public IS 'レポートの公開状態（true: 公開, false: 非公開）';

