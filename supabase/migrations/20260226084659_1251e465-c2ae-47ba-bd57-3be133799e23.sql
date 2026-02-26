
ALTER TABLE public.outreach_campaigns
  ADD COLUMN IF NOT EXISTS sequence_step integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS scheduled_day integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS objective text,
  ADD COLUMN IF NOT EXISTS supplier_tier text;
