
CREATE TABLE public.landing_page_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  theme_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_page_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own themes" ON public.landing_page_themes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own themes" ON public.landing_page_themes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own themes" ON public.landing_page_themes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own themes" ON public.landing_page_themes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_landing_page_themes_updated_at
  BEFORE UPDATE ON public.landing_page_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
