
-- Create websites table for the Website Builder
CREATE TABLE public.websites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'My Store',
  slug text NOT NULL,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  theme_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_html text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- RLS policies scoped to auth.uid() = user_id
CREATE POLICY "Users can view their own websites"
ON public.websites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own websites"
ON public.websites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites"
ON public.websites FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites"
ON public.websites FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_websites_updated_at
BEFORE UPDATE ON public.websites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
