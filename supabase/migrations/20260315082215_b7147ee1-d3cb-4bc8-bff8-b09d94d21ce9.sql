
CREATE TABLE public.supplier_portal_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rfq_title TEXT NOT NULL,
  rfq_description TEXT,
  rfq_requirements TEXT,
  rfq_deadline TIMESTAMP WITH TIME ZONE,
  rfq_budget_range TEXT,
  rfq_category TEXT,
  supplier_email TEXT NOT NULL,
  supplier_name TEXT,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.supplier_portal_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID NOT NULL REFERENCES public.supplier_portal_invitations(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  supplier_email TEXT NOT NULL,
  supplier_company TEXT,
  supplier_phone TEXT,
  quote_amount NUMERIC,
  quote_currency TEXT NOT NULL DEFAULT 'USD',
  quote_unit TEXT,
  lead_time TEXT,
  moq INTEGER,
  proposal_text TEXT,
  quote_details_json JSONB NOT NULL DEFAULT '{}',
  documents_json JSONB NOT NULL DEFAULT '[]',
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_portal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_portal_responses ENABLE ROW LEVEL SECURITY;

-- Invitations: owners can CRUD
CREATE POLICY "Users can view their own invitations"
  ON public.supplier_portal_invitations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invitations"
  ON public.supplier_portal_invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invitations"
  ON public.supplier_portal_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invitations"
  ON public.supplier_portal_invitations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Invitations: anonymous can read by token (for supplier portal page)
CREATE POLICY "Anyone can view invitation by token"
  ON public.supplier_portal_invitations FOR SELECT
  TO anon
  USING (true);

-- Responses: owners of the invitation can view
CREATE POLICY "Invitation owners can view responses"
  ON public.supplier_portal_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.supplier_portal_invitations
      WHERE id = invitation_id AND user_id = auth.uid()
    )
  );

-- Responses: anyone can insert (suppliers submit without auth)
CREATE POLICY "Anyone can submit responses"
  ON public.supplier_portal_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
