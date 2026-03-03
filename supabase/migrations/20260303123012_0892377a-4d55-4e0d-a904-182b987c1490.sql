
-- Create table for persisting AI workflow analysis results
CREATE TABLE public.workflow_ai_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  recommendations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_actions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'approved',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_ai_results ENABLE ROW LEVEL SECURITY;

-- User-scoped policies
CREATE POLICY "Users can view their own workflow results"
  ON public.workflow_ai_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflow results"
  ON public.workflow_ai_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow results"
  ON public.workflow_ai_results FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient date-range queries
CREATE INDEX idx_workflow_ai_results_user_date ON public.workflow_ai_results (user_id, completed_at DESC);
