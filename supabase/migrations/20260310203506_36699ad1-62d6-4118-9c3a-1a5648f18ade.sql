
CREATE TABLE public.generated_pro_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  image_key text NOT NULL,
  label text NOT NULL,
  section text NOT NULL,
  prompt text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  product_name text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, image_key, product_name)
);

ALTER TABLE public.generated_pro_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pro images" ON public.generated_pro_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pro images" ON public.generated_pro_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pro images" ON public.generated_pro_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pro images" ON public.generated_pro_images FOR DELETE USING (auth.uid() = user_id);
