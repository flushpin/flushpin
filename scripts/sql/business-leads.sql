-- Business signup leads from /business/start
-- Run manually in Supabase SQL Editor. Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS public.business_leads (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  business_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('cafe', 'restaurant', 'retail', 'gas', 'other')),
  street_address text NOT NULL,
  city text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  daily_foot_traffic text NOT NULL CHECK (daily_foot_traffic IN ('under_50', '50_150', '150_400', '400_plus')),
  restroom_code_frequency text NOT NULL CHECK (restroom_code_frequency IN ('rarely', 'few_times_daily', 'constantly')),
  plan text NOT NULL CHECK (plan IN ('free', 'starter', 'business', 'multi', 'not_sure')),
  location_count integer CHECK (location_count IS NULL OR location_count >= 2),
  notes text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  source text NOT NULL DEFAULT 'web'
);

CREATE INDEX IF NOT EXISTS idx_business_leads_status_created
  ON public.business_leads (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_leads_plan
  ON public.business_leads (plan, created_at DESC);

COMMENT ON TABLE public.business_leads IS 'Lead capture from /business/start — shop onboarding interest and QR sticker shipping details.';

-- RLS: block anon/authenticated direct access; API inserts via service_role (bypasses RLS).
ALTER TABLE public.business_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_leads_no_public_access" ON public.business_leads;
CREATE POLICY "business_leads_no_public_access"
  ON public.business_leads
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
