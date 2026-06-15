-- Business claim / update / removal requests from /business/claim
-- Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS public.business_claim_requests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  request_type text NOT NULL CHECK (request_type IN ('claim', 'update', 'removal')),
  business_name text NOT NULL,
  business_address text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
  source text NOT NULL DEFAULT 'web',
  email_trust text,
  admin_notes text
);

CREATE INDEX IF NOT EXISTS idx_business_claim_requests_status_created
  ON public.business_claim_requests (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_claim_requests_type
  ON public.business_claim_requests (request_type, created_at DESC);

COMMENT ON TABLE public.business_claim_requests IS 'Owner requests from /business/claim — claim, update access info, or removal/opt-out.';
