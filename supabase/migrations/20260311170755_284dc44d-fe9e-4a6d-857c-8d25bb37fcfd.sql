
CREATE TABLE public.brand_kits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  aesthetic text NOT NULL DEFAULT 'minimalist',
  target_audience text NOT NULL DEFAULT '',
  tone_keywords text[] NOT NULL DEFAULT '{}'::text[],
  logo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand kits" ON public.brand_kits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own brand kits" ON public.brand_kits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own brand kits" ON public.brand_kits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own brand kits" ON public.brand_kits FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_brand_kits_updated_at BEFORE UPDATE ON public.brand_kits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
