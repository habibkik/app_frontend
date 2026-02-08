-- Create post_engagement table for tracking engagement metrics per post
CREATE TABLE public.post_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  engagement_rate NUMERIC NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_engagement ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own engagement data"
ON public.post_engagement FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own engagement data"
ON public.post_engagement FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own engagement data"
ON public.post_engagement FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own engagement data"
ON public.post_engagement FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_post_engagement_user_post ON public.post_engagement(user_id, post_id);
CREATE INDEX idx_post_engagement_platform ON public.post_engagement(platform);

-- Add engagement summary columns to scheduled_posts for quick access
ALTER TABLE public.scheduled_posts
ADD COLUMN total_impressions INTEGER NOT NULL DEFAULT 0,
ADD COLUMN total_clicks INTEGER NOT NULL DEFAULT 0,
ADD COLUMN total_likes INTEGER NOT NULL DEFAULT 0,
ADD COLUMN total_shares INTEGER NOT NULL DEFAULT 0,
ADD COLUMN total_comments INTEGER NOT NULL DEFAULT 0,
ADD COLUMN engagement_rate NUMERIC NOT NULL DEFAULT 0;

-- Trigger for updated_at
CREATE TRIGGER update_post_engagement_updated_at
BEFORE UPDATE ON public.post_engagement
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();