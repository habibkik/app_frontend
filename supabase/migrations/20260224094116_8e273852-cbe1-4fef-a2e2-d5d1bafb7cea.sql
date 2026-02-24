ALTER TABLE outreach_campaigns
  ADD COLUMN IF NOT EXISTS response_received text,
  ADD COLUMN IF NOT EXISTS response_channel text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;