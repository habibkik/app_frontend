
CREATE TABLE public.content_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  email text NOT NULL,
  address text,
  quantity integer NOT NULL DEFAULT 1,
  product_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.content_orders ENABLE ROW LEVEL SECURITY;

-- Public can insert (order form is public-facing)
CREATE POLICY "Anyone can submit orders"
ON public.content_orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only the content creator can view their orders
CREATE POLICY "Users can view their own orders"
ON public.content_orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only the content creator can delete their orders
CREATE POLICY "Users can delete their own orders"
ON public.content_orders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
