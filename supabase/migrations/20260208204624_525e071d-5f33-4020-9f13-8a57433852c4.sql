
-- Competitor price observations table
CREATE TABLE public.competitor_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  competitor_platform TEXT NOT NULL DEFAULT 'Website',
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  location TEXT,
  source TEXT NOT NULL DEFAULT 'miroflow',
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Competitor alerts table
CREATE TABLE public.competitor_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'drop',
  severity TEXT NOT NULL DEFAULT 'medium',
  old_price NUMERIC,
  new_price NUMERIC NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Monitor configurations per user/product
CREATE TABLE public.monitor_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  interval_hours INTEGER NOT NULL DEFAULT 2,
  price_drop_threshold NUMERIC NOT NULL DEFAULT 5,
  price_rise_threshold NUMERIC NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitor_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for competitor_prices
CREATE POLICY "Users can view their own competitor prices" ON public.competitor_prices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own competitor prices" ON public.competitor_prices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own competitor prices" ON public.competitor_prices FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for competitor_alerts
CREATE POLICY "Users can view their own alerts" ON public.competitor_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alerts" ON public.competitor_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.competitor_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.competitor_alerts FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for monitor_configs
CREATE POLICY "Users can view their own configs" ON public.monitor_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own configs" ON public.monitor_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own configs" ON public.monitor_configs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own configs" ON public.monitor_configs FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_competitor_prices_user_product ON public.competitor_prices(user_id, product_id);
CREATE INDEX idx_competitor_prices_collected_at ON public.competitor_prices(collected_at DESC);
CREATE INDEX idx_competitor_alerts_user_status ON public.competitor_alerts(user_id, status);
CREATE INDEX idx_monitor_configs_enabled ON public.monitor_configs(enabled) WHERE enabled = true;

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.competitor_alerts;

-- Trigger for monitor_configs updated_at
CREATE TRIGGER update_monitor_configs_updated_at
BEFORE UPDATE ON public.monitor_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
