
-- Add batch_id column to scheduled_posts to group posts into campaigns
ALTER TABLE public.scheduled_posts
ADD COLUMN batch_id text DEFAULT NULL;

-- Index for fast campaign lookups
CREATE INDEX idx_scheduled_posts_batch_id ON public.scheduled_posts (batch_id) WHERE batch_id IS NOT NULL;
