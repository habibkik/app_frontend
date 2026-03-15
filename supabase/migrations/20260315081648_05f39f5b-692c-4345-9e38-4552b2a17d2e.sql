
CREATE TABLE public.procurement_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'rfq',
  title TEXT NOT NULL,
  content_summary TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata_json JSONB NOT NULL DEFAULT '{}',
  source_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.procurement_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own knowledge"
  ON public.procurement_knowledge FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge"
  ON public.procurement_knowledge FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge"
  ON public.procurement_knowledge FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge"
  ON public.procurement_knowledge FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
