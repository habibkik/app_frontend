
-- Create outreach_configs table for automated outreach scheduling
CREATE TABLE public.outreach_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  frequency_hours INTEGER NOT NULL DEFAULT 6,
  message_template TEXT DEFAULT 'Hi, I''m interested in {{product_name}}. What''s your best price for bulk orders? Current market range is {{price_range}}.',
  max_contacts_per_run INTEGER NOT NULL DEFAULT 10,
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_run_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outreach_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own outreach configs"
  ON public.outreach_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outreach configs"
  ON public.outreach_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outreach configs"
  ON public.outreach_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outreach configs"
  ON public.outreach_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_outreach_configs_updated_at
  BEFORE UPDATE ON public.outreach_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
