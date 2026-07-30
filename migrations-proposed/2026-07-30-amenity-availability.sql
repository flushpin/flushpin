-- PROPOSAL ONLY — do not apply until approved.
-- Amenity + availability hardening for FlushPin web.
-- Keeps PIN lockdown intact; does not SELECT pin to anon/authenticated clients.

-- 1) Canonical availability status (distinct states — never collapse)
DO $$ BEGIN
  CREATE TYPE public.restroom_availability AS ENUM (
    'public_available',
    'customer_only',
    'no_public_restroom',
    'no_restroom_exists',
    'temporarily_unavailable',
    'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.restroom
  ADD COLUMN IF NOT EXISTS availability_status public.restroom_availability DEFAULT 'unknown';

ALTER TABLE public.restroom
  ADD COLUMN IF NOT EXISTS accessible_confirmed_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS baby_changing_confirmed_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amenities_last_confirmed_at timestamptz;

-- 2) Extend apply_restroom_access so access publish can atomically set amenities
-- NOTE: replace the live function body carefully; keep PIN write rules identical.
CREATE OR REPLACE FUNCTION public.apply_restroom_access(
  p_restroom_id text,
  p_access_type text,
  p_submitted_pin text DEFAULT NULL,
  p_accessible boolean DEFAULT NULL,
  p_has_baby_changing boolean DEFAULT NULL,
  p_pin_gender text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_status text := 'approved';
  v_submission_id bigint;
  v_normalized_pin text;
  v_needs_pin boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_valid_access_type(p_access_type) THEN
    RAISE EXCEPTION 'Invalid access_type: %', p_access_type;
  END IF;

  v_needs_pin := p_access_type = 'keypad_code'
    OR p_access_type = 'customers_only+keypad_code';
  v_normalized_pin := public.normalize_pin(p_submitted_pin);

  IF v_needs_pin AND (v_normalized_pin IS NULL OR v_normalized_pin = '') THEN
    RAISE EXCEPTION 'PIN required for keypad_code';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.restroom WHERE id::text = p_restroom_id) THEN
    RAISE EXCEPTION 'Restroom not found';
  END IF;

  INSERT INTO public.pin_submissions (
    restroom_id, user_id, submitted_pin, access_type, status
  )
  VALUES (
    p_restroom_id, v_user_id, v_normalized_pin, p_access_type, v_status
  )
  RETURNING id INTO v_submission_id;

  UPDATE public.restroom
     SET access_type = p_access_type,
         pin = CASE
           WHEN v_needs_pin THEN v_normalized_pin
           WHEN p_access_type IN ('no_code_needed', 'customers_only+no_code_needed') THEN 'open'
           ELSE pin
         END,
         pin_updated_at = now(),
         status = 'green',
         accessible = COALESCE(p_accessible, accessible),
         has_baby_changing = COALESCE(p_has_baby_changing, has_baby_changing)
   WHERE id::text = p_restroom_id;

  RETURN jsonb_build_object(
    'auto_approved', true,
    'status', v_status,
    'submission_id', v_submission_id,
    'restroom_id', p_restroom_id,
    'access_type', p_access_type
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_restroom_access(text, text, text, boolean, boolean, text)
  TO authenticated;

-- 3) Dedicated amenity RPC (preferred over service-role column updates)
CREATE OR REPLACE FUNCTION public.apply_restroom_amenities(
  p_restroom_id bigint,
  p_accessible boolean DEFAULT NULL,
  p_has_baby_changing boolean DEFAULT NULL,
  p_availability public.restroom_availability DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_accessible boolean;
  v_baby boolean;
  v_availability public.restroom_availability;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_accessible IS NOT NULL THEN
    INSERT INTO public.restroom_reports (restroom_id, report_type, note, created_by)
    VALUES (
      p_restroom_id,
      CASE WHEN p_accessible THEN 'amenity_accessible_yes' ELSE 'amenity_accessible_no' END,
      'Amenity report via apply_restroom_amenities',
      v_user_id
    );
  END IF;

  IF p_has_baby_changing IS NOT NULL THEN
    INSERT INTO public.restroom_reports (restroom_id, report_type, note, created_by)
    VALUES (
      p_restroom_id,
      CASE WHEN p_has_baby_changing THEN 'amenity_baby_yes' ELSE 'amenity_baby_no' END,
      'Amenity report via apply_restroom_amenities',
      v_user_id
    );
  END IF;

  IF p_availability IS NOT NULL THEN
    INSERT INTO public.restroom_reports (restroom_id, report_type, note, created_by)
    VALUES (
      p_restroom_id,
      'availability_' || p_availability::text,
      'Availability report via apply_restroom_amenities',
      v_user_id
    );
  END IF;

  UPDATE public.restroom
     SET accessible = COALESCE(p_accessible, accessible),
         has_baby_changing = COALESCE(p_has_baby_changing, has_baby_changing),
         availability_status = COALESCE(p_availability, availability_status),
         accessible_confirmed_count = accessible_confirmed_count
           + CASE WHEN p_accessible IS TRUE THEN 1 ELSE 0 END,
         baby_changing_confirmed_count = baby_changing_confirmed_count
           + CASE WHEN p_has_baby_changing IS TRUE THEN 1 ELSE 0 END,
         amenities_last_confirmed_at = CASE
           WHEN p_accessible IS NOT NULL OR p_has_baby_changing IS NOT NULL OR p_availability IS NOT NULL
             THEN now()
           ELSE amenities_last_confirmed_at
         END
   WHERE id = p_restroom_id
   RETURNING accessible, has_baby_changing, availability_status
     INTO v_accessible, v_baby, v_availability;

  RETURN jsonb_build_object(
    'restroom_id', p_restroom_id,
    'accessible', v_accessible,
    'has_baby_changing', v_baby,
    'availability_status', v_availability
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_restroom_amenities(bigint, boolean, boolean, public.restroom_availability)
  TO authenticated;

-- 4) Expose availability on restroom_public (recreate/replace view as needed in your process)
-- IMPORTANT: keep pin columns out of restroom_public.
COMMENT ON COLUMN public.restroom.availability_status IS
  'Distinct restroom availability. no_restroom_exists != no_public_restroom != customer_only.';

-- 5) Suggested discovery policy (application layer first; SQL helper optional)
-- Exclude from normal discovery when:
--   availability_status = 'no_restroom_exists' AND confirmed_count >= threshold
--   OR availability_status = 'no_public_restroom' AND confirmed_count >= threshold
-- Do NOT delete the place row.
