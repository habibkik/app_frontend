
-- Create price_changes table for MiroRL tracking
CREATE TABLE public.price_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  strategy_used TEXT NOT NULL DEFAULT 'manual',
  reason TEXT,
  ai_validation JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.price_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own price changes"
  ON public.price_changes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own price changes"
  ON public.price_changes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price changes"
  ON public.price_changes FOR DELETE
  USING (auth.uid() = user_id);

-- Create sales_performance table
CREATE TABLE public.sales_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  units_sold INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales"
  ON public.sales_performance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
  ON public.sales_performance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
  ON public.sales_performance FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
  ON public.sales_performance FOR DELETE
  USING (auth.uid() = user_id);

-- Index for quick lookups
CREATE INDEX idx_price_changes_user_product ON public.price_changes(user_id, product_id);
CREATE INDEX idx_sales_performance_user_product ON public.sales_performance(user_id, product_id, date);
