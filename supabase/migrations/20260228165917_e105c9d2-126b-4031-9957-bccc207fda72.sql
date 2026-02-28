
-- Create bom_analyses table
CREATE TABLE public.bom_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  product_category TEXT,
  components_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  architecture TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bom_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own BOM analyses"
  ON public.bom_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own BOM analyses"
  ON public.bom_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own BOM analyses"
  ON public.bom_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own BOM analyses"
  ON public.bom_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Create gtm_plans table
CREATE TABLE public.gtm_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  plan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gtm_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own GTM plans"
  ON public.gtm_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GTM plans"
  ON public.gtm_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GTM plans"
  ON public.gtm_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GTM plans"
  ON public.gtm_plans FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_gtm_plans_updated_at
  BEFORE UPDATE ON public.gtm_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
