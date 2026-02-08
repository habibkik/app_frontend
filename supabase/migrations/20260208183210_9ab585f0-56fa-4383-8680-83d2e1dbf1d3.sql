-- Add unique constraint for upsert on post_engagement (post_id + platform)
ALTER TABLE public.post_engagement
ADD CONSTRAINT post_engagement_post_platform_unique UNIQUE (post_id, platform);