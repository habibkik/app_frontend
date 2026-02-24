
-- Create outreach_campaigns table
CREATE TABLE public.outreach_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplier_id TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  product_name TEXT,
  channel TEXT NOT NULL DEFAULT 'email',
  message TEXT,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  auto_repeat BOOLEAN NOT NULL DEFAULT false,
  repeat_interval_hours INTEGER NOT NULL DEFAULT 24,
  max_auto_runs INTEGER NOT NULL DEFAULT 1,
  runs_completed INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own outreach campaigns" ON public.outreach_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own outreach campaigns" ON public.outreach_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own outreach campaigns" ON public.outreach_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own outreach campaigns" ON public.outreach_campaigns FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_outreach_campaigns_updated_at
  BEFORE UPDATE ON public.outreach_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create outreach_automation_rules table
CREATE TABLE public.outreach_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  channel TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  max_runs INTEGER NOT NULL DEFAULT 3,
  interval_hours INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.outreach_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automation rules" ON public.outreach_automation_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own automation rules" ON public.outreach_automation_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own automation rules" ON public.outreach_automation_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own automation rules" ON public.outreach_automation_rules FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_outreach_automation_rules_updated_at
  BEFORE UPDATE ON public.outreach_automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
