
-- 1. marketplace_listings
CREATE TABLE public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  compare_at_price numeric,
  currency text NOT NULL DEFAULT 'USD',
  category text,
  subcategory text,
  condition text NOT NULL DEFAULT 'new',
  images_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  variants_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  sku text,
  barcode text,
  stock_quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  shipping_weight numeric,
  shipping_dimensions text,
  free_shipping boolean NOT NULL DEFAULT false,
  shipping_cost numeric,
  tags text[] DEFAULT '{}',
  location text,
  schedule_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own marketplace listings" ON public.marketplace_listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own marketplace listings" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own marketplace listings" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own marketplace listings" ON public.marketplace_listings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. marketplace_connections
CREATE TABLE public.marketplace_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  platform_type text NOT NULL DEFAULT 'global',
  connection_status text NOT NULL DEFAULT 'disconnected',
  credentials_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  platform_config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at timestamptz,
  listings_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own marketplace connections" ON public.marketplace_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own marketplace connections" ON public.marketplace_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own marketplace connections" ON public.marketplace_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own marketplace connections" ON public.marketplace_connections FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_marketplace_connections_updated_at BEFORE UPDATE ON public.marketplace_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. marketplace_published
CREATE TABLE public.marketplace_published (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  external_id text,
  external_url text,
  status text NOT NULL DEFAULT 'draft',
  views integer NOT NULL DEFAULT 0,
  inquiries integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  published_at timestamptz,
  expires_at timestamptz,
  platform_overrides_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_published ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own marketplace published" ON public.marketplace_published FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own marketplace published" ON public.marketplace_published FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own marketplace published" ON public.marketplace_published FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own marketplace published" ON public.marketplace_published FOR DELETE USING (auth.uid() = user_id);

-- 4. marketplace_messages
CREATE TABLE public.marketplace_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  platform_name text NOT NULL,
  customer_name text,
  customer_avatar text,
  message_text text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  is_starred boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own marketplace messages" ON public.marketplace_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own marketplace messages" ON public.marketplace_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own marketplace messages" ON public.marketplace_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own marketplace messages" ON public.marketplace_messages FOR DELETE USING (auth.uid() = user_id);

-- 5. marketplace_automation_rules
CREATE TABLE public.marketplace_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_type text NOT NULL,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own marketplace automation rules" ON public.marketplace_automation_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own marketplace automation rules" ON public.marketplace_automation_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own marketplace automation rules" ON public.marketplace_automation_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own marketplace automation rules" ON public.marketplace_automation_rules FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_marketplace_automation_rules_updated_at BEFORE UPDATE ON public.marketplace_automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace-media', 'marketplace-media', true);

CREATE POLICY "Users can upload marketplace media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace-media' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can view marketplace media" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace-media');
CREATE POLICY "Users can update own marketplace media" ON storage.objects FOR UPDATE USING (bucket_id = 'marketplace-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own marketplace media" ON storage.objects FOR DELETE USING (bucket_id = 'marketplace-media' AND auth.uid()::text = (storage.foldername(name))[1]);
